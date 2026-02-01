# Shopping List Skill

Add items to shopping lists via API. Multi-store support with section-based organization.

**API Base:** `https://shopping.uppal.zone/api`
**Auth:** Bearer token (API key from Settings)

---

## TL;DR - Add an Item

```bash
POST /api/stores/{storeId}/items
Authorization: Bearer sk_...
Content-Type: application/json

{"name": "milk", "sectionId": "dairy-section-id"}
```

That's it. Item added.

---

## Authentication

1. User generates API key in **Settings → API Access**
2. Include in all requests: `Authorization: Bearer sk_...`
3. Keys are user-scoped (can only access your stores)

---

## Endpoints

### List Stores
```
GET /api/stores
```
Returns all stores you own or have access to.

**Response:**
```json
{
  "success": true,
  "data": {
    "stores": [
      {"id": "abc123", "name": "Costco", "isOwner": true, "sectionsCount": 8},
      {"id": "def456", "name": "Trader Joe's", "isOwner": true, "sectionsCount": 8}
    ]
  }
}
```

### Create Store
```
POST /api/stores
Content-Type: application/json

{"name": "Home Depot"}
```
Creates a new store with default sections.

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "xyz789",
      "name": "Home Depot",
      "isOwner": true,
      "sections": [...]
    }
  }
}
```

**Limits:**
- Max 20 stores per user
- Store names must be unique (per user)
- Name max 100 characters

### Get Store Details
```
GET /api/stores/{storeId}
```
Returns store with sections.

**Response:**
```json
{
  "success": true,
  "data": {
    "store": {
      "id": "abc123",
      "name": "Costco",
      "sections": [
        {"id": "sec1", "name": "Produce", "order": 0},
        {"id": "sec2", "name": "Dairy", "order": 1},
        {"id": "sec3", "name": "Meat & Seafood", "order": 2},
        {"id": "sec4", "name": "Bakery", "order": 3},
        {"id": "sec5", "name": "Pantry", "order": 4},
        {"id": "sec6", "name": "Frozen", "order": 5},
        {"id": "sec7", "name": "Snacks & Beverages", "order": 6},
        {"id": "sec8", "name": "Household", "order": 7}
      ]
    }
  }
}
```

### List Items
```
GET /api/stores/{storeId}/items
```

### Add Item(s)
```
POST /api/stores/{storeId}/items

# Single item
{"name": "milk", "sectionId": "sec2"}

# Multiple items
{"items": [
  {"name": "milk", "sectionId": "sec2"},
  {"name": "eggs", "sectionId": "sec2"},
  {"name": "bread", "sectionId": "sec4"}
]}
```

### Update Item
```
PATCH /api/stores/{storeId}/items/{itemId}

{"checked": true}           # Mark as bought
{"sectionId": "sec3"}       # Move to different section
{"name": "organic milk"}    # Rename
```

### Delete Item
```
DELETE /api/stores/{storeId}/items/{itemId}
```

### Clear Items
```
POST /api/stores/{storeId}/items/clear

{"mode": "checked"}   # Remove only checked items (default)
{"mode": "all"}       # Remove all items
```

---

## Store Selection Logic

When user says "add milk", figure out which store:

1. **Explicit store** — "add milk to Costco" → use Costco
2. **Item history** — Check where this item was added before
3. **Category inference:**
   - Groceries (milk, bread, eggs) → grocery store
   - Hardware (drill bits, screws) → hardware store
   - Toiletries (shampoo, soap) → Target/pharmacy
4. **Default store** — User's primary grocery store

---

## Section Assignment

Default sections (most stores have these):
- **Produce** — fruits, vegetables
- **Dairy** — milk, cheese, yogurt, eggs
- **Meat & Seafood** — chicken, beef, fish
- **Bakery** — bread, bagels, pastries
- **Pantry** — canned goods, pasta, rice, oil
- **Frozen** — ice cream, frozen meals, frozen veggies
- **Snacks & Beverages** — chips, soda, coffee, tea
- **Household** — cleaning supplies, paper goods, toiletries

If unsure, check the store's sections first and pick the best match.

---

## Error Responses

```json
{"success": false, "error": {"message": "Store not found or access denied"}}
```

Common errors:
- `401` — Invalid or missing API key
- `404` — Store/item not found or no access
- `400` — Invalid request body

---

## Example: Voice Assistant Integration

When user says: "Add milk and bread"

```javascript
// 1. Parse items
const items = ["milk", "bread"];

// 2. Get stores, pick grocery store
const stores = await fetch('/api/stores', {headers}).then(r => r.json());
const grocery = stores.data.stores.find(s => s.name.toLowerCase().includes('costco'));

// 3. Get sections for mapping
const store = await fetch(`/api/stores/${grocery.id}`, {headers}).then(r => r.json());
const dairy = store.data.store.sections.find(s => s.name === 'Dairy');
const bakery = store.data.store.sections.find(s => s.name === 'Bakery');

// 4. Add items
await fetch(`/api/stores/${grocery.id}/items`, {
  method: 'POST',
  headers: {...headers, 'Content-Type': 'application/json'},
  body: JSON.stringify({
    items: [
      {name: 'milk', sectionId: dairy.id},
      {name: 'bread', sectionId: bakery.id}
    ]
  })
});
```

---

## Rate Limits

- **100 requests per minute** per user
- Headers included in every response:
  - `X-RateLimit-Limit`: Max requests per window
  - `X-RateLimit-Remaining`: Requests left
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
- `429 Too Many Requests` if exceeded
