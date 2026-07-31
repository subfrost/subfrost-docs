---
title: CORS Authentication
sidebar_label: CORS
sidebar_position: 3
description: Register a domain for browser-based access to the SUBFROST API without exposing API keys client-side.
---

# CORS Authentication

CORS (Cross-Origin Resource Sharing) authentication allows browser-based applications to access the Subfrost API without exposing API keys in client-side code.

## How it works

1. You register your domain in the Subfrost dashboard
2. When requests come from your domain, the `Origin` header is verified
3. If the origin matches a verified domain, the request is authenticated
4. CORS headers are added to allow browser access

## Setting up CORS

### Step 1: add your domain

1. Go to the [Domains page](https://api.subfrost.io/domains) in your dashboard
2. Click "Add Domain"
3. Enter your domain (e.g., `https://myapp.com`)

### Step 2: verify ownership

For security, you may need to verify domain ownership:

**DNS verification:**
Add a TXT record to your domain's DNS:

```
_subfrost.yourdomain.com TXT "subfrost-verify=abc123xyz"
```

**File verification:**
Host a verification file at:

```
https://yourdomain.com/.well-known/subfrost-verify.txt
```

### Step 3: make requests

Once verified, make requests from your domain:

```javascript
// From https://myapp.com
const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'btc_getblockcount',
    params: [],
    id: 1
  })
});
```

## Supported patterns

### Exact domain match

```
https://myapp.com
```

### Subdomain wildcard

```
https://*.myapp.com
```

Matches:

- `https://www.myapp.com`
- `https://api.myapp.com`
- `https://staging.myapp.com`

### Development domains

For local development, you can add:

```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
```

:::note
Localhost domains don't require verification but should be removed before production.
:::

## CORS headers

The API returns appropriate CORS headers:

```
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

## Preflight requests

The API handles OPTIONS preflight requests automatically:

```javascript
// Browser automatically sends OPTIONS first
OPTIONS /v4/api HTTP/1.1
Origin: https://myapp.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

// API responds with CORS headers
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Security considerations

### Advantages of CORS auth

- No API keys in browser code
- Origin header can't be spoofed by browsers
- Domain verification prevents unauthorized access
- Works with CSP (Content Security Policy)

### Limitations

- Only works from browsers
- Server-side requests need API keys
- Doesn't work from browser extensions

### Best practices

1. Only register production domains
2. Remove localhost entries before production
3. Use exact matches when possible
4. Monitor domain usage in analytics

## Troubleshooting

### "CORS Error" in browser

Check that:

1. Your domain is registered and verified
2. You're using the correct endpoint (`/v4/api`)
3. The Origin header matches exactly

### Request works in Postman but not browser

Postman doesn't enforce CORS. Add your domain to the dashboard.

### Preflight failing

Ensure you're not sending custom headers that require preflight approval.

## Combining with API keys

You can use both CORS and API keys:

```javascript
// CORS for origin verification + API key for rate limit bucket
const response = await fetch('https://mainnet.subfrost.io/v4/jsonrpc', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-subfrost-api-key': 'YOUR_API_KEY'  // Optional
  },
  body: JSON.stringify({ /* ... */ })
});
```
