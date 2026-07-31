---
title: Rate Limits
sidebar_label: Rate Limits
sidebar_position: 4
description: SUBFROST API rate limit plans, response headers, error handling, and usage optimization strategies.
---

# Rate Limits

Rate limits protect the API from abuse and ensure fair usage for all customers.

## Limits by plan

- **Free**: 60 requests/minute, 1,000/day, burst limit 10
- **Pro**: 600 requests/minute, 50,000/day, burst limit 100
- **Business**: custom limits

## Rate limit headers

Every response includes rate limit information:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1699123456
X-RateLimit-Daily-Limit: 1000
X-RateLimit-Daily-Remaining: 850
```

- **`X-RateLimit-Limit`**: requests allowed per minute
- **`X-RateLimit-Remaining`**: requests remaining this minute
- **`X-RateLimit-Reset`**: Unix timestamp when limit resets
- **`X-RateLimit-Daily-Limit`**: requests allowed per day
- **`X-RateLimit-Daily-Remaining`**: requests remaining today

## Rate limit exceeded

When you exceed the rate limit:

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32000,
    "message": "Rate limit exceeded. Try again in 45 seconds."
  },
  "id": 1
}
```

HTTP Status: `429 Too Many Requests`

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 45
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699123456
```

## Handling rate limits

### Exponential backoff

```javascript
async function fetchWithRetry(request, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-subfrost-api-key': API_KEY
      },
      body: JSON.stringify(request)
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 60;
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    return response.json();
  }
  throw new Error('Max retries exceeded');
}
```

### Check before request

```javascript
// Track remaining requests from headers
let remaining = 60;

async function makeRequest(request) {
  if (remaining <= 0) {
    throw new Error('Rate limit reached, please wait');
  }

  const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
    /* ... */
  });

  remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');
  return response.json();
}
```

## Optimizing API usage

### Use batch requests

Instead of multiple individual requests:

```javascript
// Bad: 3 requests
await rpc('btc_getblockcount', []);
await rpc('btc_getbestblockhash', []);
await rpc('btc_getblockchaininfo', []);

// Good: 1 request
await rpc([
  { jsonrpc: '2.0', method: 'btc_getblockcount', params: [], id: 1 },
  { jsonrpc: '2.0', method: 'btc_getbestblockhash', params: [], id: 2 },
  { jsonrpc: '2.0', method: 'btc_getblockchaininfo', params: [], id: 3 }
]);
```

### Use Lua scripts

Combine multiple operations server-side:

```json
{
  "jsonrpc": "2.0",
  "method": "lua_evalscript",
  "params": [
    "local height = _RPC.btc_getblockcount()\nlocal hash = _RPC.btc_getblockhash(height)\nlocal block = _RPC.btc_getblock(hash)\nreturn block",
    []
  ],
  "id": 1
}
```

One API call, but executes 3 RPC methods internally.

### Cache responses

Many blockchain data points don't change frequently:

```javascript
const cache = new Map();
const CACHE_TTL = 10000; // 10 seconds

async function cachedRpc(method, params) {
  const key = JSON.stringify({ method, params });
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await rpc(method, params);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

## Per-key rate limits

Each API key has its own rate limit bucket:

- Key A: 60/min independent of Key B
- Useful for isolating applications
- Track usage per-key in dashboard

Business customers can configure per-key limits.

## WebSocket connections

For real-time data, consider WebSocket subscriptions (Business):

- Lower rate limit impact
- Push-based updates
- Efficient for high-frequency data

## Requesting higher limits

If you need higher limits:

1. **Pro Plan**: 10x free tier limits ($45-$55/mo)
2. **Business**: custom limits, SLA, dedicated support ($90-$120/mo)

Contact [sales@subfrost.io](mailto:sales@subfrost.io) for Business pricing.
