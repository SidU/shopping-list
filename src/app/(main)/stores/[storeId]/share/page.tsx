'use client';

import { use, useState, useEffect } from 'react';
import { useStore } from '@/lib/hooks/useStore';
import { Header } from '@/components/shared/Header';
import { FullPageLoading } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, X, Crown, User, Clock, Mail } from 'lucide-react';
import { getUser } from '@/lib/firebase/firestore';
import { User as UserType } from '@/lib/types';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

export default function ShareStorePage({ params }: PageProps) {
  const { storeId } = use(params);
  const { store, loading, isOwner, share, unshare, cancelPendingShare } = useStore(storeId);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<UserType[]>([]);
  const [owner, setOwner] = useState<UserType | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      if (!store) return;

      // Load owner
      const ownerData = await getUser(store.ownerId);
      setOwner(ownerData);

      // Load shared users
      const users = await Promise.all(
        store.sharedWith.map((userId) => getUser(userId))
      );
      setSharedUsers(users.filter((u): u is UserType => u !== null));
    };

    loadUsers();
  }, [store]);

  if (loading) {
    return <FullPageLoading />;
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !isOwner) return;

    try {
      setSharing(true);
      setError(null);
      setSuccess(null);
      await share(email.trim());

      // Check if it was a pending share (user doesn't exist yet)
      const normalizedEmail = email.trim().toLowerCase();
      const isPending = store.pendingShares?.includes(normalizedEmail) === false;

      setSuccess(isPending
        ? `Invite sent to ${email}. They'll get access when they sign up.`
        : `Shared with ${email}`
      );
      setEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSharing(false);
    }
  };

  const handleUnshare = async (userId: string) => {
    try {
      await unshare(userId);
    } catch (err) {
      console.error('Failed to unshare:', err);
    }
  };

  const handleCancelPending = async (pendingEmail: string) => {
    try {
      await cancelPendingShare(pendingEmail);
    } catch (err) {
      console.error('Failed to cancel pending share:', err);
    }
  };

  const pendingShares = store.pendingShares || [];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Share Store" showBack backHref={`/stores/${storeId}`} />

      <main className="container px-4 py-6 max-w-lg mx-auto space-y-6">
        {isOwner && (
          <form onSubmit={handleShare} className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email to share with..."
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
            {success && <p className="text-sm text-green-600">{success}</p>}
            <p className="text-xs text-muted-foreground">
              If the person hasn't signed up yet, they'll get access when they create an account.
            </p>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            People with access
          </h2>

          <div className="space-y-2">
            {/* Owner */}
            {owner && (
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {owner.image ? (
                      <img
                        src={owner.image}
                        alt={owner.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{owner.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {owner.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Crown className="w-4 h-4" />
                      Owner
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shared users */}
            {sharedUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {isOwner && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleUnshare(user.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pending shares */}
            {pendingShares.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-muted-foreground pt-4">
                  Pending invites
                </h3>
                {pendingShares.map((pendingEmail) => (
                  <Card key={pendingEmail} className="border-dashed">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{pendingEmail}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Waiting for signup
                          </p>
                        </div>
                        {isOwner && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancelPending(pendingEmail)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}

            {sharedUsers.length === 0 && pendingShares.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No one else has access to this store yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
