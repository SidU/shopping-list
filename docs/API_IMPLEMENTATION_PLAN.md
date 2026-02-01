# API Implementation Plan

> **Goal:** Add REST API endpoints so external tools (like Sid Alto) can manage shopping lists programmatically.

## Overview

The shopping list app currently uses direct Firebase client SDK calls. We're adding a REST API layer that:

1. Uses Firebase Admin SDK (server-side)
2. Authenticates via user-generated API keys
3. Maintains existing access control (owner/shared stores only)

## Architecture

```
┌─────────────────┐     ┌───────────────────┐     ┌──────────────┐
│  External Tool  │────▶│   Next.js API     │────▶│   Firebase   │
│  (Sid Alto)     │     │   Routes          │     │   Firestore  │
└─────────────────┘     └───────────────────┘     └──────────────┘
        │                       │
   Bearer token           Firebase Admin SDK
   (API key)              (service account)
```

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/key` | POST | Generate new API key |
| `/api/auth/key` | DELETE | Revoke current API key |

### Stores
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stores` | GET | List all accessible stores |
| `/api/stores/:id` | GET | Get store details with sections |

### Items
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stores/:id/items` | GET | List items in store |
| `/api/stores/:id/items` | POST | Add item(s) to store |
| `/api/stores/:id/items/:itemId` | PATCH | Update item (check, move section) |
| `/api/stores/:id/items/:itemId` | DELETE | Remove item |
| `/api/stores/:id/items/clear` | POST | Clear checked items |

## Implementation Steps

### Phase 1: Foundation
- [x] Create implementation plan
- [x] Set up Firebase Admin SDK (`src/lib/firebase/admin.ts`)
- [x] Add API key fields to User type
- [x] Create API auth middleware (`src/lib/api/auth.ts`)

### Phase 2: Core Endpoints
- [x] `GET /api/stores` - List stores
- [x] `GET /api/stores/:id` - Get store with sections
- [x] `POST /api/stores/:id/items` - Add item
- [x] `GET /api/stores/:id/items` - List items
- [x] `PATCH /api/stores/:id/items/:itemId` - Update item
- [x] `DELETE /api/stores/:id/items/:itemId` - Delete item
- [x] `POST /api/stores/:id/items/clear` - Clear checked/all items

### Phase 3: Key Management
- [x] `POST /api/user/apikey` - Generate key (requires session auth)
- [x] `DELETE /api/user/apikey` - Revoke key
- [x] `GET /api/user/apikey` - Check key status
- [x] UI component for key management in settings (`ApiKeyCard`)

### Phase 4: Polish
- [x] Rate limiting (Upstash Redis, 100 req/min per user)
- [ ] API documentation (OpenAPI/Swagger)
- [x] Error handling standardization

## Security Model

### API Key Flow
1. User logs in via normal auth (Google)
2. User clicks "Generate API Key" in settings
3. App generates 32-byte random key
4. Hash stored in Firestore: `users/{uid}/apiKeyHash`
5. Raw key shown once to user (they copy it)
6. External tool uses key in `Authorization: Bearer <key>` header

### Request Validation
```typescript
async function validateRequest(req: NextRequest) {
  // 1. Extract key from header
  const key = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!key) return { error: 'Missing API key', status: 401 };
  
  // 2. Hash and lookup
  const hash = sha256(key);
  const user = await findUserByApiKeyHash(hash);
  if (!user) return { error: 'Invalid API key', status: 401 };
  
  // 3. Return user context
  return { userId: user.id, user };
}
```

### Store Access Control
```typescript
function canAccessStore(userId: string, store: Store): boolean {
  return store.ownerId === userId || 
         store.sharedWith?.includes(userId);
}
```

## Data Model Changes

### User (add fields)
```typescript
interface User {
  // ... existing fields
  apiKeyHash?: string;      // SHA-256 hash of API key
  apiKeyCreatedAt?: Timestamp;
  apiKeyLastUsed?: Timestamp;
}
```

## Environment Variables

Add to `.env.local` and Vercel:
```
# Firebase Admin SDK (service account)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

## API Response Format

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "STORE_NOT_FOUND",
    "message": "Store not found"
  }
}
```

## Example Usage

### Add item to store
```bash
curl -X POST https://shopping-list.vercel.app/api/stores/abc123/items \
  -H "Authorization: Bearer sk_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"name": "milk", "sectionId": "dairy-section-id"}'
```

### List stores
```bash
curl https://shopping-list.vercel.app/api/stores \
  -H "Authorization: Bearer sk_live_xxx"
```

## Testing

- [ ] Unit tests for auth middleware
- [ ] Integration tests for each endpoint
- [ ] Test access control (can't access other users' stores)
- [ ] Test rate limiting

## Rollout

1. Deploy to preview branch
2. Generate test API key
3. Verify endpoints work
4. Merge to main
5. Update Sid Alto with API key and store IDs
