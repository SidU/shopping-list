'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export function LoginButton() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User'}
              className="w-8 h-8 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-8 h-8 p-1 rounded-full bg-muted" />
          )}
          <span className="hidden sm:inline">{user.name}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut()}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={() => signIn()} variant="outline">
      Sign In
    </Button>
  );
}
