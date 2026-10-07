---
title: Services on subtun0
sidebar_label: Services on subtun0
sidebar_position: 11
description: Every public SUBFROST service reached by a .peer name - the peg-in service, the DIESEL fee broker, the Fractal gateway service and the SIGIL DAO - with what each serves and its API.
---

# Services on subtun0

These SUBFROST services are reached by a `.peer` name on subtun0. To connect to one, see [Connecting over subtun0](./subtun0). Each name is derived from the service's own key, so nobody else can answer under it.

| Service | `.peer` name | Speaks | Through an HTTPS gateway |
|---|---|---|---|
| [Peg-in service (pegd)](#peg-in-service-pegd) | `fr173rdd4ld26sequ3ps6jrwaemxxzrsrnaaua9z6vh58y04guckmtqd23s4r.peer` | HTTP, port 80 | Yes |
| [DIESEL fee broker](#diesel-fee-broker) | `fr12quta238kx3l4mfd2jnqv6sgsfa87gskm7avzegg66kdcwjqsh5scqqm58.peer` | HTTP, port 80 | Yes |
| [Fractal gateway service](#fractal-gateway-service) | `fr1kq3hutys4xp0gvukkpr68nyzrjt2tnrwlafnqxuuv8agh2l720tqlxjywg.peer` | its own framing (FBG1) | No |
| [SIGIL DAO](#sigil-dao) | `fr1rvrz4mzz0m0sw0uvm2py5mn2grlrjk8mhu995w2revrh4cdkxgesj7vye2.peer` | HTTP, port 80 | Yes |

In the examples below, `$PEGD` and similar stand for a base URL that reaches the service: `http://<name>.peer` through a subtun0 client, or `https://<name without .peer>.subdns.to` through the gateway.

## Peg-in service (pegd)

`fr173rdd4ld26sequ3ps6jrwaemxxzrsrnaaua9z6vh58y04guckmtqd23s4r.peer`

pegd turns a signed deposit intent into a watched deposit. It derives the Ethereum deposit address for the intent independently, compares it with the one you derived, stores the intent, watches for the funds and follows them through settlement into the frUSD vault. It is the service behind [frUSD deposits from other chains](./frusd-cross-chain-deposits); the encodings it accepts are in [Encoding Pegs and Swaps](../developer-guide/encoding-pegs-and-swaps).

| Request | Does |
|---|---|
| `POST /v1/multichain` | Register an intent funded from BNB Chain, Polygon or Base. Body: the intent, its preimage, your own derivation, and a `source` block naming the source chain, forwarder, lane and signatures |
| `POST /v1/gateways` | Register an intent for a deposit address on Ethereum itself (a plain ERC-20 transfer to the address) |
| `POST /v1/permit` | Register a gasless intent for funds already on Ethereum. **Not usable yet**: the Ethereum `Permit2Gateway` it needs is not deployed |
| `GET /v1/gateways` | List registrations. Query `status`, `kind` (`deposit_address`, `multichain`, `permit`), `chainId`, `limit` (max 1000), `offset` |
| `GET /v1/gateways/:id` | One registration, by deposit address or by intent hash, with its recent events |
| `GET /v1/gateways/:id/events` | Its full event log (`limit` max 5000, `offset`) |
| `GET /v1/health` | Service status, and the derivation constants it checks against |
| `POST /v1/gasdrops` | **Coming.** Registers a gas drop for a peg-out. Not served yet; see [the gas drop](../developer-guide/encoding-pegs-and-swaps#optional-gas-drop-coming) |

- **Reads are open.** Writes (`POST`) are authenticated, with an `x-api-key` header or `Authorization: Bearer`.
- **Every registration is public once made.** `GET /v1/gateways` lists the intents, the source-chain owner address, and the transactions. Don't put anything in an intent that you would not publish.
- **A registration is a record, not a promise of custody.** pegd never holds funds. The deposit address is fixed by the intent hash on the `GatewayFactory`, and anyone can call `register` and `settle` there.

### Derivation check

pegd refuses to register an address it can't reproduce. Send your own derivation in `expected` (at least `depositAddress`). If pegd's derivation differs, it answers `409` with the first field that disagrees (`factory_mismatch`, `type_hash_mismatch`, `struct_hash_mismatch`, `domain_separator_mismatch`, `intent_hash_mismatch`, `deposit_address_mismatch`, …) and its own values in `details.nodeDerivation`. Stop there: one of you has the intent or the constants wrong.

`GET /v1/health` publishes the constants it uses, so you can compare before you sign:

```json
{
  "status": "ok",
  "service": "subfrost-pegd",
  "chainId": 1,
  "derivation": {
    "factory": "0xaf4c39a0da304ef39d56783d785ea52bb8431362",
    "initCodeHash": "0xae78bd81aa686ad972e9cf69b3b526123eae9615a544c18a6b64819d63072968",
    "domainName": "SUBFROST frUSD Gateway",
    "domainVersion": "1",
    "typeHash": "0xd0ba66893952bd61d59c1120e0819129666508130451c7f40bba1c37f5d730c5",
    "requireClientDerivation": true
  },
  "gateways": { "Watching": 0, "Seen": 0, "Confirming": 1, "Swept": 0, "Relayed": 0, "Complete": 0, "Expired": 0, "Refunded": 0, "Failed": 0 }
}
```

### Status

A registration moves through `Watching → Seen → Confirming → Swept → Relayed → Complete`. It can also end in `Expired`, `Refunded` or `Failed`. Its event log records `created`, `deposit_seen`, `confirmed`, `swept`, `relayed`, `minted`, `refunded`, `expired`, `balance_decrease` and `error`.

Errors share one shape: `{"error": {"code": "...", "message": "...", "details": {...}}}`.

## DIESEL fee broker

`fr12quta238kx3l4mfd2jnqv6sgsfa87gskm7avzegg66kdcwjqsh5scqqm58.peer`

The broker is the front door to the relayers that let a wallet [pay its Bitcoin network fee in DIESEL](./diesel-fees). It tracks the relayer fleet, picks one that can cover a fee, and passes quotes and funding requests to it.

| Request | Does |
|---|---|
| `GET /v1/tokens` | The tokens fees can be paid in, with terms: margin, the largest fee one quote can cover, the minimum fee rate, the treasury that is repaid, and an indicative price. Also a summary of the healthy relayers and their capacity |
| `POST /v1/quote` `{"fee_target_sats": n}` | A signed quote (a *ticket*) from a relayer that can cover `n` sats of fee. `503` when none can |
| `POST /v1/fund` `{"signed_ticket": {...}, "tx_hex": "..."}` | Hand the relayer your transaction, built with the ticket's funding input, to sign and fund |
| `POST /v1/abandon` | Release a ticket you will not use |
| `GET /healthz` | Liveness, and how many relayers are known and healthy |

An answer from `GET /v1/tokens`, abbreviated:

```json
{
  "tokens": [{
    "id": {"block": "2", "tx": "0"},
    "symbol": "DIESEL",
    "decimals": 8,
    "treasury": {"block": "2", "tx": "96782"},
    "margin_bps": 200,
    "max_fee_sats": 20000,
    "min_fee_rate_sat_vb": 1,
    "indicative_price": {"sats_num": "44114", "sats_den": "100000000", "struck_at_height": 970368, "source": "pool:2:77087:med12g12@970368"}
  }],
  "fleet": {"relayers_healthy": 3, "capacity_sats": 600000, "relayers": ["…"]},
  "tip_height": 970374
}
```

Every `u128` on this wire, alkane id parts and price numerators included, is a decimal **string**. The indicative price is DIESEL's price in sats, taken from the DIESEL/frBTC pool `2:77087`; the price you actually pay is fixed in the signed ticket.

**Check a ticket's signature against the broker's directory, not against the key that came with it.** The ticket carries the relayer's public key for convenience, but anything that could swap the signature could swap that key too. Compare it with the `ticket_pubkey` that `GET /v1/tokens` publishes for that relayer.

## Fractal gateway service

`fr1kq3hutys4xp0gvukkpr68nyzrjt2tnrwlafnqxuuv8agh2l720tqlxjywg.peer`

The Fractal gateway service derives and registers [gateway addresses](../fractal/gateway-addresses) for FB deposits, and sweeps them into the fb-vault. Its requests are `POST /v1/gateway`, `GET /v1/gateway/:address`, `GET /v1/vault` and `GET /healthz`; the [Fractal Developer Guide](../fractal/developer-guide#asking-the-gateway-service-to-sweep-it) documents them.

It is not an HTTP server. It speaks its own request framing (FBG1) directly to its `.peer` name, so neither an HTTPS gateway nor `curl` over a subtun0 stream reaches it. Use its own client, `fb-gatewayd client`, which connects to its home relays (`wss://wss-2.asilos.ltd/ws`, then `wss-1` and `wss-3`; override with `--relays`).

## SIGIL DAO

`fr1rvrz4mzz0m0sw0uvm2py5mn2grlrjk8mhu995w2revrh4cdkxgesj7vye2.peer`

The SIGIL DAO web app, served directly over subtun0: the app itself at `/`, plus `/dao`, `/proposals`, `/identities`, `/profiles` and `/health`.

## Where to go next

- [Connecting over subtun0](./subtun0): entry relays, the bootstrap, and client examples.
- [Encoding Pegs and Swaps](../developer-guide/encoding-pegs-and-swaps): what to send pegd, byte for byte.
- [Signer Groups and Contracts](./signer-groups-and-contracts): who signs what, and every contract these services touch.
