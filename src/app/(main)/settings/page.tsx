'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStores } from '@/lib/hooks/useStore';
import { useTheme, Theme } from '@/lib/contexts/ThemeContext';
import { useSoundContext } from '@/lib/contexts/SoundContext';
import { Header } from '@/components/shared/Header';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, UserPlus, User, Palette, Monitor, Zap, Volume2, VolumeX } from 'lucide-react';
import { getUserByEmail, shareStore, addPendingShare } from '@/lib/firebase/firestore';
import { ApiKeyCard } from '@/components/settings/ApiKeyCard';

const themes: { id: Theme; name: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean and minimal',
    icon: <Monitor className="w-5 h-5" />,
  },
  {
    id: 'retro',
    name: 'Retro Futuristic',
    description: 'Neon cyberpunk vibes',
    icon: <Zap className="w-5 h-5" />,
  },
];

export default function SettingsPage() {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const { stores, loading: storesLoading } = useStores();
  const { theme, setTheme } = useTheme();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled, play } = useSoundContext();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  if (authLoading || storesLoading) {
    return <FullPageLoading />;
  }

  // Get only stores owned by the current user
  const ownedStores = stores.filter((store) => store.ownerId === user?.id);

  const handleShareAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !user?.id) return;

    const normalizedEmail = email.toLowerCase().trim();

    if (user?.email?.toLowerCase() === normalizedEmail) {
      setError('Cannot share with yourself');
      return;
    }

    try {
      setSharing(true);
      setError(null);
      setSuccess(null);

      // Check if user exists
      const targetUser = await getUserByEmail(normalizedEmail);

      let sharedCount = 0;
      for (const store of ownedStores) {
        // Skip if already shared
        if (targetUser && store.sharedWith.includes(targetUser.id)) {
          continue;
        }
        if (!targetUser && store.pendingShares?.includes(normalizedEmail)) {
          continue;
        }

        if (targetUser) {
          await shareStore(store.id, targetUser.id);
        } else {
          await addPendingShare(store.id, normalizedEmail);
        }
        sharedCount++;
      }

      if (sharedCount === 0) {
        setSuccess('All stores are already shared with this person');
      } else if (targetUser) {
        setSuccess(`Shared ${sharedCount} store${sharedCount > 1 ? 's' : ''} with ${email}`);
      } else {
        setSuccess(`Invited ${email} to ${sharedCount} store${sharedCount > 1 ? 's' : ''}. They'll get access when they sign up.`);
      }
      setEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <Header title="Settings" showBack backHref="/" />

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Theme Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Theme
            </CardTitle>
            <CardDescription>
              Choose your visual style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    play(t.id === 'retro' ? 'powerUp' : 'powerDown');
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    theme === t.id
                      ? 'border-primary bg-primary/10 glow-box-subtle'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={theme === t.id ? 'text-primary' : 'text-muted-foreground'}>
                      {t.icon}
                    </span>
                    <span className="font-medium">{t.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sound Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              Sound & Haptics
            </CardTitle>
            <CardDescription>
              Audio feedback and vibration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => {
                const newValue = !soundEnabled;
                setSoundEnabled(newValue);
                if (newValue) {
                  play('success');
                }
              }}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                soundEnabled
                  ? 'border-primary bg-primary/10 glow-box-subtle'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={soundEnabled ? 'text-primary' : 'text-muted-foreground'}>
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </span>
                <div>
                  <div className="font-medium">{soundEnabled ? 'Enabled' : 'Disabled'}</div>
                  <p className="text-xs text-muted-foreground">
                    {soundEnabled ? 'Sounds and vibration on' : 'Silent mode'}
                  </p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${
                soundEnabled ? 'bg-primary' : 'bg-muted'
              } relative`}>
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
            </button>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => signOut()} className="w-full gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* API Key Section */}
        <ApiKeyCard />

        {/* Share All Stores Section */}
        {ownedStores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Share All Stores</CardTitle>
              <CardDescription>
                Share all {ownedStores.length} of your stores with someone at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleShareAll} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email..."
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                      setSuccess(null);
                    }}
                    disabled={sharing}
                  />
                  <Button type="submit" disabled={sharing || !email.trim()}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-accent">{success}</p>}
              </form>
            </CardContent>
          </Card>
        )}

        {/* Stores Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Stores</CardTitle>
            <CardDescription>
              {ownedStores.length} owned, {stores.length - ownedStores.length} shared with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {stores.map((store) => (
                <div key={store.id} className="flex items-center justify-between py-1">
                  <span>{store.name}</span>
                  <span className="text-muted-foreground">
                    {store.ownerId === user?.id ? 'Owner' : 'Shared'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
