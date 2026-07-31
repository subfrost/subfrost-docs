---
title: Authentication
sidebar_label: Authentication
sidebar_position: 3
description: API keys, headers, CORS, and alias routes for authenticating with the SUBFROST API.
---

# Authentication

SUBFROST supports multiple authentication methods to suit different use cases.

## Authentication methods

### 1. API key in path

The simplest method. Include your API key directly in the URL path:

```
https://mainnet.subfrost.io/v4/YOUR_API_KEY
```

Example:

```bash
curl -X POST https://mainnet.subfrost.io/v4/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"btc_getblockcount","params":[],"id":1}'
```

### 2. API key header

Use the `x-subfrost-api-key` header for cleaner URLs:

```bash
curl -X POST https://mainnet.subfrost.io/v4/jsonrpc \
  -H "Content-Type: application/json" \
  -H "x-subfrost-api-key: YOUR_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"btc_getblockcount","params":[],"id":1}'
```

### 3. CORS-based authentication

For browser-based applications, register your domain in the dashboard and make requests directly:

```javascript
// From your registered domain (e.g., https://yourapp.com)
const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'btc_getblockcount',
    params: [],
    id: 1
  })
});
```

The API verifies the `Origin` header against your registered domains.

### 4. Alias routes

Create custom endpoint aliases for your applications:

```
https://api.subfrost.io/v4/YOUR_ALIAS
```

Aliases are configured in your dashboard and can be associated with specific rate limits and permissions.

## Endpoint paths

- **`/v4/<apikey>`**: authenticate with API key in path.
- **`/v4/jsonrpc`**: use with header authentication.
- **`/v4/api`**: use with CORS authentication.
- **`/v4/<alias>`**: use with a custom alias.

## Getting an API key

1. Sign up or log in at [api.subfrost.io](https://api.subfrost.io/).
2. Navigate to your Dashboard.
3. Click "Create API Key".
4. Copy and securely store your key.

:::warning Security note
API keys grant access to your account's resources. Never expose them in client-side code or public repositories.
:::

## Managing CORS domains

1. Go to the Domains page in your dashboard.
2. Add your application's domain (e.g., `https://myapp.com`).
3. Verify domain ownership if required.
4. Once verified, requests from that origin are authenticated automatically.

## Best practices

### Server-side applications

- Store API keys in environment variables.
- Use the header method for cleaner logs.
- Rotate keys periodically.

```javascript
// Node.js example
const API_KEY = process.env.SUBFROST_API_KEY;

const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-subfrost-api-key': API_KEY
  },
  body: JSON.stringify({ /* ... */ })
});
```

### Client-side applications

- Use CORS authentication instead of embedding API keys.
- Register only your production domains.
- Consider using a backend proxy for additional security.

### Rate limiting

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699123456
```

See [Rate Limits](../platform/rate-limits) for the full details on plans and quotas.

## Next steps

- [API Platform Overview](../platform/overview): manage your account.
- [JSON-RPC Methods](../json-rpc/overview): start making requests.
