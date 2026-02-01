'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Key, Copy, Check, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';

interface ApiKeyInfo {
  hasKey: boolean;
  createdAt: string | null;
  lastUsed: string | null;
}

export function ApiKeyCard() {
  const [keyInfo, setKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current key status
  useEffect(() => {
    fetchKeyInfo();
  }, []);

  const fetchKeyInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/apikey');
      if (res.ok) {
        const data = await res.json();
        setKeyInfo(data.data);
      }
    } catch {
      // Ignore errors on initial load
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    try {
      setGenerating(true);
      setError(null);
      setNewKey(null);

      const res = await fetch('/api/user/apikey', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to generate key');
      }

      setNewKey(data.data.apiKey);
      setKeyInfo({ hasKey: true, createdAt: new Date().toISOString(), lastUsed: null });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const revokeKey = async () => {
    if (!confirm('Are you sure you want to revoke your API key? Any integrations using it will stop working.')) {
      return;
    }

    try {
      setRevoking(true);
      setError(null);

      const res = await fetch('/api/user/apikey', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to revoke key');
      }

      setKeyInfo({ hasKey: false, createdAt: null, lastUsed: null });
      setNewKey(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRevoking(false);
    }
  };

  const copyKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-20 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="w-5 h-5" />
          API Access
        </CardTitle>
        <CardDescription>
          Connect external tools to manage your shopping lists
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Show newly generated key */}
        {newKey && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium text-accent mb-2">
                🔑 Your new API key (save it now!)
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background p-2 rounded font-mono break-all">
                  {newKey}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyKey}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-accent" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This key will only be shown once. Store it securely.
              </p>
            </div>
          </div>
        )}

        {/* Key status */}
        {keyInfo?.hasKey && !newKey && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(keyInfo.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last used</span>
              <span>{formatDate(keyInfo.lastUsed)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {keyInfo?.hasKey ? (
            <>
              <Button
                variant="outline"
                onClick={generateKey}
                disabled={generating || revoking}
                className="flex-1 gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
              <Button
                variant="outline"
                onClick={revokeKey}
                disabled={generating || revoking}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Revoke
              </Button>
            </>
          ) : (
            <Button
              onClick={generateKey}
              disabled={generating}
              className="w-full gap-2"
            >
              <Key className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} />
              {generating ? 'Generating...' : 'Generate API Key'}
            </Button>
          )}
        </div>

        {/* Help text */}
        {!keyInfo?.hasKey && !newKey && (
          <p className="text-xs text-muted-foreground">
            Generate a key to allow external apps (like voice assistants) to add items to your lists.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
