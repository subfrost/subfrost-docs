---
title: SUBFROST WalletConnect
sidebar_label: WalletConnect
sidebar_position: 2
description: Pair a web app with the SUBFROST mobile wallet over the pair bridge and request PSBT and message signatures. Full wire protocol for dapp and wallet implementers.
---

# SUBFROST WalletConnect

SUBFROST WalletConnect lets a web app (the dapp) request Bitcoin signatures from the SUBFROST wallet on the user's phone. It is **not** WalletConnect v2. The two sides meet on a WebSocket rendezvous service, the pair bridge, at `wss://pair.subfrost.io/v1/pair`. The bridge forwards bytes between them. Everything after the key exchange is encrypted with ChaCha20-Poly1305 under a key the bridge cannot derive.

This page is written as a protocol specification. The reference client is not on the public npm registry yet, so everything an implementer has to put on the wire is described here: the pairing URI, the bridge frames, the key derivation, the framing, the envelope and the messages.

## Roles

- **Dapp: LISTEN.** The dapp creates the pairing. It generates an ephemeral X25519 keypair, a peer name and a pairing code, builds the pairing URI, registers its peer name on the bridge with a `listen` frame, and shows the URI as a QR code (or hands it over as a deep link). Once the wallet is connected, the dapp sends requests.
- **Wallet: DIAL.** The wallet reads the URI, connects to the bridge named in it, dials the dapp's peer name with a `dial` frame, sends its own X25519 public key, and answers requests after the user approves them.

```
  Dapp (browser)                  Pair bridge                  Wallet (phone)
  LISTEN                 wss://pair.subfrost.io/v1/pair                   DIAL
     |                                 |                                   |
     |--- {"op":"listen",...} -------->|                                   |
     |<-------- {"event":"ready"} -----|                                   |
     |                                 |                                   |
     |   QR / deep link: subfrost://wc/<peer>?key=...&code=...&mode=cli    |
     |.................... out of band, never via the bridge ............>|
     |                                 |<------ {"op":"dial",...} ---------|
     |                                 |------- {"event":"dialed",...} --->|
     |<-- {"event":"incoming",...} ----|                                   |
     |                                 |                                   |
     |<========== binary frames, forwarded verbatim by the bridge ========>|
     |    1. wallet X25519 public key (first binary frame, from wallet)    |
     |    2. encrypted request and response envelopes                      |
```

## Pairing

### Sequence

1. The dapp generates a fresh X25519 keypair (32 random bytes as the private key), a peer name (see [Peer name](#peer-name)) and a 6-character pairing code.
2. The dapp opens a WebSocket to the bridge, sends a `listen` frame for its peer name, and waits for `{"event":"ready"}`. The bridge can route a dial to the dapp only after the listen is registered, which `ready` confirms.
3. The dapp shows the pairing URI as a QR code, with the pairing code next to it.
4. The wallet parses the URI, opens a WebSocket to the `bridge` URL from the URI, and sends a `dial` frame for the dapp's peer name.
5. The bridge sends `{"event":"incoming",...}` to the dapp. From here on the socket carries binary frames only.
6. The wallet's first binary frame is its X25519 public key. Both sides derive the symmetric key (see [Key agreement](#key-agreement)).
7. The dapp sends encrypted requests. The wallet sends one encrypted response per request.

### Pairing URI

```
subfrost://wc/<peer>?key=<key>&code=<code>&bridge=<bridge>&origin=<origin>&mode=cli
```

The reference client emits the parameters in this order.

| Component | Value | Encoding |
| --- | --- | --- |
| `<peer>` (path) | The dapp's peer name, `fr1<...>.peer`, including the `.peer` suffix. | Verbatim. Do not case-fold it, strip the suffix, or percent-encode it: the exact string is also part of the key derivation, and both sides must hash the same bytes. |
| `key` | The dapp's X25519 public key, 32 bytes. | base64url without padding (43 characters). |
| `code` | The 6-character pairing code. | Verbatim. Every character in the alphabet is URL-safe. |
| `bridge` | The WebSocket URL of the bridge the dapp is listening on. The default is `wss://pair.subfrost.io/v1/pair`. | Percent-encoded (`encodeURIComponent`). |
| `origin` | The dapp's origin, for example `https://app.example.com`. The reference client defaults to `window.location.origin`. | Percent-encoded (`encodeURIComponent`). |
| `mode` | Always the literal `cli`. It marks a pair-bridge link. Links from the deprecated relay carried `relay=` and no `mode` parameter. | Literal. |

Example:

```
subfrost://wc/fr1dpc7mpp8ae8g364ssg82p0xz2pq8ke0zd6sgmlxs3r2a8l9wkt7qz4kznt.peer?key=WXmajmshySK07ZrZr-X3o1FPATQZWKF5z9CcGF1TLSM&code=K7QX2M&bridge=wss%3A%2F%2Fpair.subfrost.io%2Fv1%2Fpair&origin=https%3A%2F%2Fapp.example.com&mode=cli
```

### Peer name

A peer name is the routing label the bridge uses to match a dialer with a listener. Both the dapp (for `listen`) and the wallet (for `self_peer` in `dial`) need one. It is derived from 32 random bytes:

1. `secret` = 32 bytes from a CSPRNG.
2. `fp` = BLAKE3(`secret`), the default 32-byte digest.
3. `name` = Bech32m encoding of `fp` with human-readable part `fr` (the 32 bytes are converted to 5-bit words as usual for Bech32). This yields 61 characters starting with `fr1`.
4. `peer` = `name` + `.peer` (66 characters in total).

The secret is never sent anywhere. Only the derived name goes on the wire, and it is the same string in the URI path, in the `listen` frame, and in the key derivation.

Test vectors (secret shown as base64url):

| Secret | Peer name |
| --- | --- |
| 32 bytes of `0x55` (`VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU`) | `fr1dpc7mpp8ae8g364ssg82p0xz2pq8ke0zd6sgmlxs3r2a8l9wkt7qz4kznt.peer` |
| 32 bytes of `0x00` (`AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`) | `fr19tdg8svpnffh9khpyw8urhk3y0ypqn7659vx92hwd9pg5xpqlndqh0x68c.peer` |
| bytes `0x00` to `0x1f` (`AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8`) | `fr1u55wj4ucqd7lgyz58k0nrcukanw5trt3k9tavq2rnzawxta4d3js03clqq.peer` |

### Pairing code

- **Format.** 6 characters drawn from the 31-character alphabet `ABCDEFGHJKMNPQRSTUVWXYZ23456789`, which leaves out the ambiguous glyphs `O`, `I`, `L`, `0` and `1`.
- **Generation.** The dapp generates it with a CSPRNG, one random byte per character, rejecting bytes that would bias the result (bytes at or above the largest multiple of 31 that fits in 256).
- **Who shows it, who types it.** The code travels to the wallet inside the URI (`code=`), so nobody has to type it in the reference flow. The dapp should also display it next to the QR code so the user can confirm it visually.
- **What it gates.** The code is mixed into the key derivation. A wallet that has the wrong code, or none, derives a different key, and the first encrypted frame fails its authentication tag. The code never passes through the bridge.

## Bridge control frames

The bridge speaks WebSocket over TLS. There are two kinds of WebSocket messages:

- **Text messages** carry control frames: one JSON object per message, no trailing newline. They are used only during the handshake.
- **Binary messages** carry application data after the handshake. The bridge forwards each one verbatim. One binary WebSocket message is one frame; the bridge adds no length prefix of its own and preserves message boundaries.

After the handshake, ignore any text message.

### Client frames

Client frames use the key `op` as the discriminator.

| Frame | JSON | Sent by |
| --- | --- | --- |
| listen | `{"op":"listen","peer":"<own peer name>"}` | Dapp |
| dial | `{"op":"dial","peer":"<dapp peer name>","self_peer":"<own peer name>"}` | Wallet |

`self_peer` is snake_case on the wire. Every peer name includes the `.peer` suffix.

### Server frames

Server frames use the key `event` as the discriminator (not `op`).

| Event | JSON | Meaning |
| --- | --- | --- |
| `ready` | `{"event":"ready"}` | Sent to a listener: the listen is registered. |
| `dialed` | `{"event":"dialed","peer":"..."}` | Sent to a dialer: the dial reached a listener. |
| `incoming` | `{"event":"incoming","peer":"..."}` | Sent to a listener: a peer dialed in. `peer` names the dialer. |
| `error` | `{"event":"error","code":"...","msg":"..."}` | The request failed. `msg` is human-readable. Treat it as the end of that pairing and ask the user to scan a fresh QR code. |

The wallet's first binary frame can arrive immediately after `incoming`. A listener should buffer binary messages from the moment the socket opens, so that frame is not lost while it switches from handshake handling to the data phase.

## Key agreement

The dapp's public key travels in the URI (`key=`). The wallet's public key is the payload of the wallet's first binary frame, as 43 ASCII characters of base64url without padding (32 bytes when decoded). The reference client trims surrounding whitespace before decoding and rejects any key that does not decode to exactly 32 bytes.

Constants, verbatim from the reference client:

```ts
export const KEY_LEN = 32;
export const NONCE_LEN = 12;
const HKDF_SALT = new TextEncoder().encode('subfrost-wc-v1');
```

Derivation:

```
shared  = X25519(own_private_key, other_side_public_key)      // 32 bytes
info    = UTF-8 bytes of  <dapp peer name> + ":" + <pairing code>
sym_key = HKDF-SHA256(ikm = shared, salt = "subfrost-wc-v1", info = info, length = 32)
```

- The dapp computes `X25519(dapp_private, wallet_public)`. The wallet computes `X25519(wallet_private, dapp_public)`. Both give the same shared secret.
- The peer name in `info` is the dapp's peer name, character for character as it appears in the URI path, with the `.peer` suffix. For the first test vector above and code `K7QX2M`, `info` is `fr1dpc7mpp8ae8g364ssg82p0xz2pq8ke0zd6sgmlxs3r2a8l9wkt7qz4kznt.peer:K7QX2M`.
- The keypairs are ephemeral: new for every pairing, held in memory only.

## Framing after the handshake

The wallet always sends first (its public key), and the dapp does not send any binary frame before it receives that one. The dapp reads the wire mode from the first byte of the wallet's first binary frame, then uses the same mode for everything it sends. The three modes have disjoint first bytes, so there is no negotiation:

| First byte | Mode |
| --- | --- |
| `0x01`, `0x02`, `0x03` | Typed frames (DATA, PING, PONG). This is what the shipped SUBFROST wallet sends. |
| `0x10`, `0x11`, `0x12` | Reserved for a reconnect-capable codec. New implementations should use typed frames. |
| anything else | Bare frames with no header, from older wallets. |

The reference client only settles on typed mode if the first frame also decodes cleanly as a typed frame. A first frame that decodes as neither a typed frame nor a reserved-range frame is treated as bare.

### Typed frames (DATA, PING, PONG)

```
offset  size  field
0       1     type     0x01 DATA, 0x02 PING, 0x03 PONG
1       4     length   payload length, unsigned 32-bit, big-endian
5       n     payload  exactly `length` bytes
```

- **One frame per binary WebSocket message.** The message must be exactly `5 + length` bytes. A message that is shorter than 5 bytes, has an unknown type byte, or whose length field disagrees with its size is malformed. The reference client drops malformed frames without closing the stream.
- **DATA (`0x01`)** carries one application payload: first the wallet's public key, then the JSON envelopes. The receiver strips the 5-byte header.
- **PING (`0x02`)** is a reachability probe. The receiver answers with a PONG carrying the same payload.
- **PONG (`0x03`)** answers a PING. A PONG echoes the PING payload, so the sender can match it by payload.

Example: the wallet's first frame, a DATA frame whose payload is its 43-character public key:

```
01 00 00 00 2b  57 58 6d 61 ...   // 0x01 DATA, length 0x2b = 43, then "WXma..."
```

### Bare frames

A bare frame is the application payload with no header. It exists for compatibility with older wallets. New implementations should use typed frames.

## Encrypted envelope

Every request and every response is one application payload (a DATA payload in typed mode): the UTF-8 bytes of this JSON object.

```json
{
  "ciphertextB64": "<base64url, no padding>",
  "nonceB64":      "<base64url, no padding>"
}
```

- `ciphertextB64` is the ChaCha20-Poly1305 output under `sym_key`: the ciphertext with the 16-byte Poly1305 tag appended.
- `nonceB64` is the 12-byte nonce. Each message gets a fresh random nonce from a CSPRNG. Never reuse a nonce with the same key.
- No associated data (AAD) is used.
- The plaintext is the UTF-8 bytes of one JSON message from the next section.

The key names are camelCase (`ciphertextB64`, `nonceB64`). The deprecated relay used `ciphertext` and `nonce`; those names are not accepted on the pair bridge path.

While waiting for a response, the reference client skips any frame that does not parse as an envelope, does not decrypt, or does not carry the `request_id` it is waiting for.

## Plaintext messages

Every plaintext is a JSON object tagged by `type` (snake_case). Requests go from dapp to wallet, responses from wallet to dapp.

```ts
type Plaintext =
  // requests (dapp to wallet)
  | { type: 'get_accounts'; request_id: string; origin: string }
  | { type: 'sign_message'; message: string; address: string; request_id: string; origin: string;
      protocol?: string }
  | { type: 'sign_psbt';    psbt_hex: string; addresses: string[]; request_id: string; origin: string }
  // responses (wallet to dapp)
  | { type: 'accounts';     request_id: string; addresses: string[] }
  | { type: 'result';       request_id: string; result: string }
  | { type: 'error';        request_id: string;
      code: 'user_rejected' | 'permission_denied' | 'internal' | string; message: string };
```

### Common fields

| Field | Type | Notes |
| --- | --- | --- |
| `request_id` | string | Chosen by the dapp; the reference client uses a random UUID v4 (`crypto.randomUUID()`). The response carries the same value. |
| `origin` | string | The dapp's origin, repeated in every request. |

### `get_accounts`

Asks for the wallet's addresses. Success response: `accounts`, with `addresses: string[]`.

```json
{"type":"get_accounts","request_id":"6f1c0a52-3c1e-4f0e-9d7a-2b5e8c1d4a90","origin":"https://app.example.com"}
{"type":"accounts","request_id":"6f1c0a52-3c1e-4f0e-9d7a-2b5e8c1d4a90","addresses":["bc1p..."]}
```

### `sign_message`

| Field | Type | Notes |
| --- | --- | --- |
| `message` | string | The message to sign. |
| `address` | string | The address to sign with. |
| `protocol` | string, optional | The signature shape, for example `bip322-simple` or `bip137`. When the key is absent, the wallet applies its own default. A dapp that derives keys or identities from the signature bytes should pin it rather than inherit the default. The reference client leaves the key out entirely when no protocol is given (it does not send `null`). |

Success response: `result`, where `result` is the signature string.

```json
{"type":"sign_message","message":"vote:42","address":"bc1p...","protocol":"bip322-simple","request_id":"...","origin":"https://app.example.com"}
{"type":"result","request_id":"...","result":"<signature>"}
```

### `sign_psbt`

| Field | Type | Notes |
| --- | --- | --- |
| `psbt_hex` | string | The unsigned PSBT as hex. The reference client strips a leading `0x` before sending. |
| `addresses` | string[] | Sent as an empty array unless the caller supplies addresses. |

Success response: `result`, a string holding the signed PSBT as the wallet returns it. The reference client passes it through without decoding it.

### `error`

Any request can be answered with `error` instead of a success response.

The defined `code` values are `user_rejected` (the user declined on the phone), `permission_denied` and `internal`. The field is an open string, so treat any other value as a generic failure. `message` is human-readable.

### One request at a time

The channel has no multiplexing. The reference client sends one request, waits up to 5 minutes for the matching response (the user may be approving on the phone), and only then sends the next. A response whose `request_id` does not match, for example a late answer to a request that already timed out, is dropped.

## Liveness and reconnect

### Idle sockets

The bridge drops a socket that stays idle for about two minutes. Once paired, send a PING (type `0x02`) at least every 60 seconds to keep the session open; the other side answers with a PONG. The reference client does not send PINGs; it relies on the reconnect below instead.

While the dapp is still waiting for the wallet to dial, there is no peer to ping. If the listen socket closes in that phase, the reference client opens a new one and sends the same `listen` frame under the same peer name, so the QR code on screen stays valid. It keeps doing so until the dial timeout expires (5 minutes by default) or the pairing is cancelled.

### Reconnect after pairing

When the socket drops after pairing, the reference client keeps the pairing (keypair, symmetric key, peer name, pairing code) and reconnects:

- **Re-attach.** Open a new socket, send the identical `listen` frame, and wait only for `ready`. An `incoming` may not be sent again on a re-attach, and the data phase ignores text frames.
- **Backoff.** Retry with exponential backoff and jitter, and give up after a few minutes of continuous disconnection. In a browser, retry right away when the page becomes visible again or the network comes back.
- **Resend.** Send again any frame that could not be written while the socket was down. A request sent across a drop can be lost, so a request that gets no answer should be retried by the user.

Nothing is persisted on the dapp side. Closing the tab or process ends the pairing, and the user pairs again.

## Reference client

:::note
The reference client `@subfrost/wc` is not published to npm yet. Until it is, implement the protocol on this page, or ask the SUBFROST team for the package.
:::

The reference client implements the dapp (LISTEN) side in TypeScript. It depends on the `@noble` crypto libraries and `@scure/base`, plus vendored WebAssembly modules (so the bundler must handle `.wasm` imports), and it runs in the browser, in Node (with a `WebSocket` global) and in React Native.

```ts
import { connect } from '@subfrost/wc';

const { pairingUri, pairingCode, accepted, cancel } = connect({
  origin: window.location.origin,
  // bridgeUrl: 'wss://pair.subfrost.io/v1/pair',   // default
  // incomingTimeoutMs: 5 * 60_000,                  // how long to wait for the dial
  // onTransportState: (state, detail) => { ... },   // 'open' | 'retrying' | 'closed'
});

// Render pairingUri as a QR code and show pairingCode next to it.
// cancel() aborts the pairing and closes the socket.

const session = await accepted;          // wallet dialed in, key derived
const [addr] = await session.getAccounts();

// BIP-322 signature, with the shape pinned instead of left to the wallet default
const sig = await session.signMessage('vote:42', addr, 'bip322-simple');

// Sign a PSBT given as hex; the second argument (addresses) is optional
const signed = await session.signPsbt(unsignedPsbtHex, [addr]);

await session.disconnect();
```

When the wallet answers with an `error` message, the session methods reject with an `Error` whose message is `wc:<code> <message>`, for example `wc:user_rejected ...`. A request that gets no answer within 5 minutes, or whose connection gives up reconnecting, rejects with an `Error` that is not a wallet `error` message; do not parse its text. Match `wc:user_rejected` for a refusal and treat any other rejection as a generic failure.

## Security model

**What the bridge sees.** Peer names (from `listen` and `dial`), connection timing and frame sizes, the wallet's X25519 public key (the first binary frame is not encrypted), and the encrypted envelopes.

**What the bridge does not see.** The pairing URI travels by QR code or deep link, never through the bridge, so the bridge never learns the dapp's public key, the pairing code or the origin. It holds neither private key, so it cannot compute the shared secret, and it cannot read requests or responses or alter an envelope without failing the Poly1305 tag. Substituting its own public key for the wallet's does not help either: the dapp would derive a key from it, but reproducing that key needs the dapp's public key and the pairing code, which the bridge never sees.

**Treat the pairing URI as a secret.** Anyone who holds the URI can dial the listening dapp and play the wallet. Show the QR code only to the user, and do not log or share the deep link.

**Origin.** The dapp names its origin in the URI, and every request repeats it inside the encrypted payload, so the bridge cannot change it in transit. It tells the wallet which site is asking. It is asserted by whoever built the URI, though: the protocol does not verify it against the real web origin, so a malicious page can claim any origin in a URI it builds itself. A wallet should present it as the site's claim, not as a verified identity.

**Pairing code.** The code is part of the key derivation, so only a wallet that read it from the URI can decrypt anything. The dapp shows it next to the QR code so the user can confirm it visually.

**Approval on the phone.** Signing requests wait for the user to approve them on the phone. A refusal comes back as an `error` with code `user_rejected`. The reference client gives each request 5 minutes before it gives up.

**Ephemeral keys.** Every pairing uses a fresh X25519 keypair and a fresh peer name. On the dapp side they live in memory only.

## Changes from the previous protocol

The classic relay at `wss://wc.subfrost.io`, with its HTTP session endpoints and FCM wake pushes to the phone, is deprecated. It stays up only for older wallet builds; current SUBFROST wallet builds pair through the pair bridge and do not use it. Integrations built on the relay must move to the pair bridge described on this page.

| | Deprecated relay | Pair bridge |
| --- | --- | --- |
| Pairing URI | `subfrost://wc/<topic>?key=&relay=&origin=` | `subfrost://wc/<peer>?key=&code=&bridge=&origin=&mode=cli` |
| Rendezvous | Random UUID topic on the relay | `fr1<...>.peer` name, dapp LISTENs and wallet DIALs |
| HKDF info | The topic | `<peer name>:<pairing code>` |
| HKDF salt | `subfrost-wc-v1` | `subfrost-wc-v1` (unchanged) |
| Envelope keys | `ciphertext`, `nonce` | `ciphertextB64`, `nonceB64` |
| Transport | Relay HTTP endpoints and WebSocket, push wake-up | One WebSocket per side through the bridge, framed binary messages |

The plaintext message types (`get_accounts`, `sign_message`, `sign_psbt`, `accounts`, `result`, `error`) are the same on both carriers.
