---
title: Subfrost WalletConnect
sidebar_label: WalletConnect
sidebar_position: 2
description: Pair a webapp with the Subfrost mobile app over an encrypted relay to request PSBT and message signatures.
---

# Subfrost WalletConnect

Subfrost ships a custom WalletConnect-style protocol for letting a
webapp request signatures from the Subfrost mobile app over a relay.
It is **not** WalletConnect v2 (the public WC namespace is
EVM-centric and doesn't fit Bitcoin signing surfaces). Subfrost runs
its own ChaCha20-Poly1305 + X25519 + custom JSON envelopes against a
relay at `wss://wc.subfrost.io/`.

This page documents the protocol from the webapp integrator's
perspective.

## Architecture

```
   ┌─────────────┐       wss://wc.subfrost.io       ┌─────────────────┐
   │   Webapp    │ ──── encrypted envelopes ───→ │   wc-relay      │
   │  (browser)  │ ←──── encrypted envelopes ──── │ (Cloud Run + CF)│
   └─────────────┘                                  └────────┬────────┘
          ▲                                                   │
          │ QR code                       FCM wake-push        │
          │                                                    ▼
          │                                          ┌──────────────────┐
          │   ┌──── pair via QR scan ──────────────► │  Subfrost mobile │
          └──┤                                        │     (Android)    │
              └──── encrypted responses ─────────────►└──────────────────┘
```

Three responsibilities:

1. **Pairing.** A webapp generates an X25519 ephemeral keypair,
   encodes its pubkey into a `subfrost://wc/<topic>?key=...` URI,
   renders it as a QR. The mobile scans, derives the shared symmetric
   key via X25519+HKDF-SHA256, posts an "accept" message to the
   relay, returns.
2. **Encrypted JSON envelopes.** Every request/response goes through
   ChaCha20-Poly1305 with the per-pairing symmetric key. The relay
   sees only `{ciphertext, nonce}` blobs.
3. **Live notifications.** The relay uses Firebase Cloud Messaging
   to wake the mobile when a new request arrives. The mobile fetches
   pending requests via HTTP, decrypts, prompts the user, and posts
   the encrypted response back.

## Quick start (webapp)

Install:

```bash
pnpm add @subfrost/wc
```

Connect:

```typescript
import { connect } from '@subfrost/wc';

const { pairingUri, accepted, cancel } = await connect({
  origin:   window.location.origin,
  // relayUrl defaults to 'wss://wc.subfrost.io/', override for dev:
  // relayUrl: 'wss://wc-staging.subfrost.io/',
});

// Render the pairing URI as a QR for the user to scan.
renderQrCode(pairingUri);
// pairingUri example:
//   subfrost://wc/<topic-uuid>?key=<base64url-x25519-pub>
//     &relay=wss://wc.subfrost.io/&origin=https://app.example.com

// Wait for the mobile to approve.
let session;
try {
  session = await accepted;  // resolves to a WcSession
} catch (err) {
  console.error('pairing rejected:', err);
  return;
}

// Now you can send sign requests.
const addrs = await session.getAccounts();
console.log('paired addresses:', addrs);
```

Sign a PSBT:

```typescript
const signedHex = await session.signPsbt(unsignedPsbtHex, [
  // optional address restriction, only sign for these.
  'bc1q...',
]);
```

Sign an arbitrary message (BIP322 / Bitcoin Signed Message):

```typescript
const sig = await session.signMessage(
  'I authorize this swap at 2026-05-20T12:00:00Z',
  'bc1q...',
);
```

Disconnect (revokes the relay row on both sides):

```typescript
await session.disconnect();
```

## Pairing URI format

```
subfrost://wc/<topic-uuid>?key=<base64url-x25519-pub>&relay=<wss-url>&origin=<https-url>
```

| Component | Required | Notes |
|-----------|----------|--------------------------------------------------------------|
| topic | yes | UUID-v4, unique per pairing |
| key | yes | Webapp X25519 public key (32 bytes, base64url, no padding) |
| relay | no | Defaults to `wss://wc.subfrost.io/` (env-overridable on mobile) |
| origin | no | Webapp origin, displayed on the mobile pairing approval screen |

The mobile decodes `key`, derives the shared symmetric key:

```
priv_mobile = X25519::random()
ecdh        = X25519(priv_mobile, key_webapp)
sym_key     = HKDF-SHA256(ikm=ecdh, salt="subfrost-wc", info=topic, len=32)
```

Both sides MUST produce byte-identical `sym_key`.

## Wire envelope

Every request and response is a `Plaintext` JSON object encrypted with
the pairing's symmetric key:

```typescript
type Plaintext =
  | { type: 'sign_psbt';      psbt_hex: string; addresses: string[]; request_id: string; origin: string }
  | { type: 'sign_message';   message: string;  address: string;     request_id: string; origin: string }
  | { type: 'get_accounts';   request_id: string; origin: string }
  | { type: 'result';         request_id: string; result: string }
  | { type: 'error';          request_id: string; code: 'user_rejected' | 'permission_denied' | 'internal'; message: string }
  | { type: 'accounts';       request_id: string; addresses: string[] };
```

The on-the-wire envelope:

```json
{
  "ciphertext": "<base64url ChaCha20-Poly1305 output>",
  "nonce":      "<base64url 12-byte nonce>",
  "origin":     "https://app.example.com",
  "request_id": "<uuid v4>"
}
```

`ciphertext` is the AEAD output (includes 16-byte auth tag).
`nonce` is per-message and MUST NOT be reused with the same key.

## Relay HTTP endpoints

The webapp client primarily uses HTTP POSTs and a WSS stream for
push delivery. Endpoints below are documented for the curious,
the client wraps them.

| Endpoint | Method | Description |
|-------------------------------------------|--------|------------------------------------------|
| `/v1/sessions/<topic>/accept` | POST | Mobile commits the pairing |
| `/v1/sessions/<topic>/req` | POST | Webapp sends an encrypted request |
| `/v1/sessions/<topic>/pending` | GET | Mobile fetches queued requests |
| `/v1/sessions/<topic>/resp` | POST | Mobile posts encrypted response |
| `/v1/sessions/<topic>` | DELETE | Either side revokes the pairing |
| `/v1/sessions/<topic>/ws` | WSS | Webapp WebSocket for live response delivery |

All endpoints accept the encrypted envelope shape above; the relay
never inspects the plaintext.

## Security model

- **Relay is untrusted.** It sees ciphertext, nonces, origins, and
  request ids. It cannot read or forge plaintext requests.
- **Per-pairing keys.** Every QR pairing mints a fresh X25519
  ephemeral keypair. The keypair lives only in the browser's memory
  on the webapp side and the mobile's secure storage on the mobile
  side. Refresh the browser tab and the keypair is gone, the session ends.
- **No persistent session on the webapp.** The webapp MUST re-pair
  if it loses its in-memory state. The mobile remembers paired
  origins and can re-issue sessions, but never auto-grants requests.
- **Per-request mobile approval.** Every `sign_psbt` /
  `sign_message` request shows a confirmation screen on the phone.
  No batch approval, no "remember this site" auto-sign.

## Differences from WalletConnect v2

| Aspect | WC v2 | Subfrost-WC |
|---------------------|-----------------------------|-----------------------------------------------|
| Namespace | CAIP-2 (EVM-centric) | Bitcoin native (`sign_psbt`, `sign_message`) |
| Pairing URI | `wc://...@2?...` | `subfrost://wc/<topic>?key=...` |
| Crypto | TweetNaCl box | X25519 + HKDF-SHA256 + ChaCha20-Poly1305 |
| Relay | `relay.walletconnect.org` | `wc.subfrost.io` (self-hosted) |
| Multi-method | yes (JSON-RPC envelope) | yes (typed Plaintext enum) |
| Push notifications | optional | required (FCM-only on Android) |
