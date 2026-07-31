---
title: API Keys
sidebar_label: API Keys
sidebar_position: 2
description: Create, use, and manage SUBFROST API keys, including security best practices and environment variable setup.
---

# API Keys

API keys are the primary method for authenticating with the Subfrost API. Each key is unique to your account and can be used to track usage and apply rate limits.

## Creating an API Key

1. Navigate to your [Dashboard](https://api.subfrost.io/dashboard)
2. Click the "Create API Key" button
3. Enter a descriptive name (e.g., "Production Server", "Development")
4. Copy the generated key immediately, it won't be shown again

```
YOUR_API_KEY
```

API keys are 32-character hexadecimal strings.

:::warning Important
Store your API key securely. If compromised, revoke it immediately and create a new one.
:::

## Using API Keys

### In the URL path

```bash
curl -X POST "https://mainnet.subfrost.io/v4/YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"btc_getblockcount","params":[],"id":1}'
```

### In the request header

```bash
curl -X POST "https://mainnet.subfrost.io/v4/jsonrpc" \
  -H "Content-Type: application/json" \
  -H "x-subfrost-api-key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"btc_getblockcount","params":[],"id":1}'
```

## Key management

### Viewing keys

Your dashboard shows all active keys with:

- Key name
- Creation date
- Last used timestamp
- Request count

### Revoking keys

1. Go to Dashboard
2. Find the key you want to revoke
3. Click the delete/revoke button
4. Confirm the action

Revoked keys stop working immediately.

### Key naming best practices

Use descriptive names that indicate:

- Environment (Production, Staging, Development)
- Application (Web App, Mobile App, Backend Service)
- Purpose (Testing, Analytics, Main API)

Examples:

- `production-backend`
- `staging-webapp`
- `dev-local-testing`

## Security best practices

### Do's

- Store keys in environment variables
- Use different keys for different environments
- Rotate keys periodically
- Monitor key usage for anomalies
- Revoke unused keys

### Don'ts

- Never commit keys to version control
- Don't embed keys in client-side JavaScript
- Don't share keys between applications
- Don't use production keys for testing

## Environment variables

### Node.js

```javascript
// .env file
SUBFROST_API_KEY=YOUR_API_KEY

// Usage
const apiKey = process.env.SUBFROST_API_KEY;
```

### Python

```python
import os

api_key = os.environ.get('SUBFROST_API_KEY')
```

### Shell

```bash
export SUBFROST_API_KEY="YOUR_API_KEY"

curl -X POST "https://mainnet.subfrost.io/v4/jsonrpc" \
  -H "x-subfrost-api-key: $SUBFROST_API_KEY" \
  ...
```

## Rate limits by key

Each API key has its own rate limit counter. This means:

- Multiple keys mean multiple rate limit buckets
- Useful for isolating applications
- Business plans can set per-key limits

## Programmatic key management

Business customers can manage keys via API:

```json
{
  "jsonrpc": "2.0",
  "method": "admin_createApiKey",
  "params": { "name": "New Key" },
  "id": 1
}
```

Contact support for API management access.
