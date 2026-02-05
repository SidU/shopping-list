import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

interface PlaceResult {
  name: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity?: string;
}

interface PlacesResponse {
  results: PlaceResult[];
  status: string;
  error_message?: string;
}

/**
 * Search for nearby places matching a store name
 * GET /api/places/nearby?name=Costco&lat=47.6&lng=-122.3&radius=5000
 */
export async function GET(request: NextRequest) {
  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json(
      { error: 'Google Places API not configured' },
      { status: 503 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const name = searchParams.get('name');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000'; // Default 5km

  if (!name || !lat || !lng) {
    return NextResponse.json(
      { error: 'Missing required parameters: name, lat, lng' },
      { status: 400 }
    );
  }

  try {
    // Use Text Search to find places by name near location
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', name);
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', radius);
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY);

    const response = await fetch(url.toString());
    const data: PlacesResponse = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      console.error('Google Places API error:', data.error_message);
      return NextResponse.json(
        { error: 'Places API request denied' },
        { status: 503 }
      );
    }

    if (data.status === 'ZERO_RESULTS' || !data.results?.length) {
      return NextResponse.json({ places: [] });
    }

    // Return simplified place data
    const places = data.results.map((place) => ({
      name: place.name,
      placeId: place.place_id,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      address: place.vicinity,
    }));

    return NextResponse.json({ places });
  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby places' },
      { status: 500 }
    );
  }
}
