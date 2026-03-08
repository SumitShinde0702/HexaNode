# HexaNode Infra

**Create agents in minutes.** Register via API, run one command, get a working CRE workflow.

---

## Create Your First Agent (3 Steps)

### Step 1: Start the Infra API

```bash
cd infra
npm install
npm start
```

The API runs on `http://localhost:3002`.

### Step 2: Register an Agent

**Buyer** (procurement agent with inventory):

```bash
curl -X POST http://localhost:3002/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "type": "buyer",
    "name": "My Supermarket",
    "inventory": [
      {
        "product": "milk",
        "quantity": 12,
        "unit": "gallons",
        "threshold": 20,
        "reorderQuantity": 50
      }
    ]
  }'
```

Response: `{ "id": "agent-xyz...", "type": "buyer", ... }` — save the `id`.

**Seller** (supply agent with catalog):

```bash
curl -X POST http://localhost:3002/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "type": "seller",
    "name": "Fresh Dairy Co",
    "catalog": [
      { "product": "milk", "pricePerUnit": 3.5, "minOrder": 10, "tags": ["dairy"] }
    ]
  }'
```

### Step 3: Configure & Run

From the **HexaNode repo root**:

```bash
node infra/cli/index.js <agent-id>
```

Example:
```bash
node infra/cli/index.js agent-m123abc-xyz789
```

Then:
```bash
cd provider && bun run start   # Terminal 1
cre workflow simulate hexanode-workflow --target staging-settings   # Terminal 2
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1/agents` | Register buyer or seller |
| GET | `/v1/agents` | List all agents |
| GET | `/v1/agents/:id` | Get agent details |
| GET | `/v1/agents/:id/bundle` | Get runnable CRE config |

---

## Schema

**Buyer registration:**
```json
{
  "type": "buyer",
  "name": "Optional name",
  "inventory": [
    { "product": "milk", "quantity": 12, "unit": "gallons", "threshold": 20, "reorderQuantity": 50 }
  ]
}
```

**Seller registration:**
```json
{
  "type": "seller",
  "name": "Company name",
  "catalog": [
    { "product": "milk", "pricePerUnit": 3.5, "minOrder": 10, "slaHours": 24, "tags": ["dairy"] }
  ]
}
```

---

## Environment

- `PORT` — Infra API port (default: 3002)
- `HEXANODE_API_URL` — For CLI: API base URL (default: http://localhost:3002)
- `HEXANODE_ROOT` — For CLI: HexaNode repo path (default: current dir)
