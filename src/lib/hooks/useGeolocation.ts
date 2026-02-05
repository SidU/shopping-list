'use client';

import { useState, useCallback } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache location for 1 minute
      }
    );
  }, []);

  return { ...state, getLocation };
}

/**
 * Calculate distance between two points using Haversine formula
 * @returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export interface NearbyPlace {
  name: string;
  placeId: string;
  lat: number;
  lng: number;
  address?: string;
}

/**
 * Find nearby places matching a store name using Google Places API
 */
export async function findNearbyPlace(
  storeName: string,
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
): Promise<NearbyPlace | null> {
  try {
    const params = new URLSearchParams({
      name: storeName,
      lat: userLat.toString(),
      lng: userLng.toString(),
      radius: radiusMeters.toString(),
    });

    const response = await fetch(`/api/places/nearby?${params}`);
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (!data.places?.length) {
      return null;
    }

    // Return the closest matching place
    // Google already sorts by relevance, but let's also factor in distance
    let closest: NearbyPlace | null = null;
    let closestDistance = Infinity;

    for (const place of data.places) {
      const distance = calculateDistance(userLat, userLng, place.lat, place.lng);
      if (distance < closestDistance) {
        closest = place;
        closestDistance = distance;
      }
    }

    return closest;
  } catch (error) {
    console.error('Error finding nearby place:', error);
    return null;
  }
}

export interface NearbyStoreMatch {
  storeId: string;
  storeName: string;
  place: NearbyPlace;
  distance: number;
}

/**
 * Find the nearest store from a list by checking Google Places for each
 */
export async function findNearestStoreByPlaces(
  stores: Array<{ id: string; name: string }>,
  userLat: number,
  userLng: number,
  maxDistanceKm: number = 5
): Promise<NearbyStoreMatch | null> {
  const matches: NearbyStoreMatch[] = [];

  // Check each store in parallel
  const results = await Promise.all(
    stores.map(async (store) => {
      const place = await findNearbyPlace(store.name, userLat, userLng);
      if (place) {
        const distance = calculateDistance(userLat, userLng, place.lat, place.lng);
        if (distance <= maxDistanceKm) {
          return {
            storeId: store.id,
            storeName: store.name,
            place,
            distance,
          };
        }
      }
      return null;
    })
  );

  // Filter out nulls and find the closest
  for (const result of results) {
    if (result) {
      matches.push(result);
    }
  }

  if (matches.length === 0) {
    return null;
  }

  // Sort by distance and return closest
  matches.sort((a, b) => a.distance - b.distance);
  return matches[0];
}
