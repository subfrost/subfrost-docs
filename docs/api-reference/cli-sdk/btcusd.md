---
title: BTC/USD Commands
sidebar_label: BTC/USD Commands
sidebar_position: 9
description: Trade BTC against USD with alkanes-cli - the frUSD/frBTC pool, both bridge arms, and the mempool reads.
---

# BTC/USD Commands

The `btcusd` namespace trades BTC against USD on SUBFROST: the frUSD/frBTC CryptoSwap pool on alkanes, plus the two EVM bridge arms (USDC/USDT in, USDC/ETH out). Use it to read market data, quote a swap, prepare a bridge deposit or a burn, and read what is pending in the mempool.

:::danger There is no testnet for this

This pool and this vault exist on mainnet only. Every failure mode flagged below is one where the system succeeds while doing the wrong thing: no error is raised on either chain, and the money is gone. Read the warnings as operational instructions, not as style.

:::

## The read rule

Read chain state with `metashrew_view`, never with an `alkanes_*` JSON-RPC method. The `alkanes_*` wrappers are a different code path from the one production reads, and they diverge. The CLI already speaks the correct surface everywhere. Also: use the `/v4` endpoints for Bitcoin data, not mempool.space.

## Endpoints

Every `btcusd` subcommand routes to one of these. `{apikey}` is your SUBFROST key, passed as `--subfrost-api-key` or `SUBFROST_API_KEY`.

| Endpoint | Serves |
| --- | --- |
| `/v4/{apikey}` | Main JSON-RPC: `metashrew_view`, `metashrew_height`, `esplora_*`, `btc_*` |
| `/v4/{apikey}/btcusd` | Dedicated BTCUSD index, protobuf in both directions (package `alspo.cryptoswap`) |
| `/v4/{apikey}/espo` | Espo-shaped `<module>.<suffix>` routes, for example `ammdata.get_btc_usd_price` |
| `/v4/{apikey}/mempool` | Mempool JSON-RPC and websocket change stream |
| `/v4/{apikey}/ethereum-builder` | Private submission for the Ethereum leg, keeping the deposit out of the public mempool |

:::warning With no key you fall back, loudly

Without a key the CLI uses the shared `/v4/jsonrpc` endpoint and prints a warning on every call. That endpoint is rate limited and shared with everyone: requests are throttled rather than failed, which is the right shape for this work, because a half-executed trade sequence is the worst available outcome. But an unattended agent that never surfaces the fallback looks like it is running normally right up until it is throttled mid-trade. Get a key at [api.subfrost.io](https://api.subfrost.io).

:::

## Command surface

What you can use today. Commands that are not built yet are listed separately at the end, under "Not built yet": they exist in `--help` and refuse on purpose rather than emitting a transaction that looks right and is not.

| Command | Status | What it does |
| --- | --- | --- |
| `btcusd price` | reads | Executed, marginal and oracle USD/BTC from the dedicated index |
| `btcusd pool` | reads | Reserves, LP supply, virtual price, marginal price, bridge conversion cap |
| `btcusd candles` | raw | OHLC candles. Buckets 3600 and 86400 only. Prints the protobuf answer as hex today |
| `btcusd quote` | reads | Expected output, effective execution price, and the size as bps of the incoming leg |
| `btcusd signers` | raw | The frBTC/frUSD signing group. Prints the protobuf answer as hex today |
| `btcusd mempool` | reads | `info`, `template` and `entry`. The `watch` subcommand refuses: the websocket stream needs its reconnect state machine |
| `btcusd deposit` | prepares | Prints the approve and `depositAndBridge` calls for USDC/USDT in. Local signing is not built |
| `btcusd burn` | prepares | Builds the `burnData` payload for frUSD out to USDC/ETH. Broadcast is not built |

## The pool

Identities and decimals. These are safe to hardcode.

| | |
| --- | --- |
| Address callers use | `4:1778`, an `Upgradeable` **proxy**, and also the frBTCUSD LP token |
| Implementation | `4:1786`, the CryptoSwap (Curve V2) math |
| token0 | frUSD `4:1776` (itself a proxy), 8 decimals |
| token1 | frBTC `32:0`, 8 decimals |
| LP token | `4:1778`, 18 decimals |

### Curve parameters, as deployed

These are not invariants. `A` and `gamma` can ramp, fees are init parameters an admin can re-commit, and the whole thing sits behind an upgradeable proxy. Read them rather than hardcoding them, and re-read whenever `pool` reports the curve as ramping.

| | |
| --- | --- |
| A | 400000 |
| gamma | 1.45e14 |
| Precision | 1e10 on both legs |
| Fees | 0.2% mid, 0.8% out, depending on how unbalanced the trade leaves the pool |
| admin_fee | 50%, so a material share of the fee accrues to the protocol rather than to liquidity providers |

### Opcodes

The implementation opcodes this page relies on, as deployed. The implementation may expose more than these. The proxy keeps its own in a high range so they cannot collide: `initialize = 32767`, `initialize_with_auth = 32764`, `upgrade = 32766`, `forward = 36863`. Everything else falls through to the implementation by delegatecall.

```
0   init_pool                 100  get_virtual_price
1   add_liquidity             101  get_balances
2   remove_liquidity          102  get_A
3   remove_liquidity_one_coin 103  get_gamma
5   exchange                  104  price_oracle
                              105  price_scale
                              106  lp_price
                              107  get_dy
                              108  calc_token_amount
```

## How this pool gets read wrong

### Opcode 102 is `get_A`, not `get_decimals`

`4:1778` does not implement the token ABI. Opcode 99 (`get_name`) reverts, opcode 100 returns `virtual_price` as a 1e18 number rather than a symbol, and opcode 102 returns 400000, the amplification coefficient `A`. Anything that treats 102 as `get_decimals` renders every LP balance at 1e400000. Identify a CryptoSwap pool by `lp_price` (106) answering, which reverts on ordinary tokens.

### LP is 18 decimals, and the supply is past u64

18 is a property of the math, not a declaration: LP is minted in units of the invariant D, which lives in 1e18-normalised space. Amounts come back as decimal **strings** and must stay strings. A u64 or double parse silently corrupts them. This is not hypothetical: a u64 parse is what froze 23.0137 LP as unspendable.

### Prices are token1 per token0, so USD/BTC is the reciprocal

The index quotes frBTC per frUSD. USD/BTC is `price_q_scale / price_q`. Getting it backwards yields a number near zero, which reads as "no price" rather than as an error. The CLI's `price` and `pool` subcommands already decode this for you.

### `indexheight` is a tautology, not a liveness signal

`/index_height` is rewritten every block with that block's height, so a view read at height H always returns H, including for a block that does not exist. Use `metashrew_height` to tell fresh from stalled.

Note also that the height stamped on a pool read is the last block that **changed** the pool, so it legitimately trails the chain tip when nobody has traded. The discriminator: call `metashrew_height` on the `/btcusd` endpoint itself. If that is at the tip while the pool stamp trails, the index is fine and nothing has traded.

### `getbytecode` takes a wrapper, and answers empty rather than erroring

It expects a `BytecodeRequest` that **wraps** an `AlkaneId`. Passing a bare `AlkaneId` returns an empty result, not an error, which reads as "this contract has no code" rather than as a malformed request.

## Measured state

Read off mainnet on 2026-08-15. Pool state height 962,472; chain tip at the time of reading 962,510. **Everything in this section moves.** Re-run the commands rather than trusting the numbers.

```bash
export SUBFROST_API_KEY=your_key
alkanes-cli btcusd pool
alkanes-cli btcusd price
```

| | |
| --- | --- |
| frUSD reserve | 1881214389078 base units (18,812.14389078) |
| frBTC reserve | 29521902 base units (0.29521902) |
| LP supply | 74516779814608897626 (74.516779814608897626, 18 decimals) |
| Virtual price | 1.000089524433596945 |
| Marginal price | 64,083.94 USD/BTC |
| Bridge conversion cap | 188121438907 base units (1,881.21 frUSD), 1000bps of the frUSD reserve |
| Market reference | 63,572.03 USD/BTC, so the pool's marginal price sat about 0.8% above market |

The market reference comes from the espo index, which answers a scaled decimal string. At the reading above it answered `"635720265865300000000"`, which is 63,572.03 USD/BTC:

```bash
curl -s https://mainnet.subfrost.io/v4/$SUBFROST_API_KEY/espo \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"ammdata.get_btc_usd_price","params":[{}]}'
```

## What size actually costs

The marginal price is not the price you get. This pool is shallow, so price impact is material and grows fast with size: in the ladders below, buying is already 0.9% off the marginal price at $500 and 8.8% off at $5,000, and selling 0.03 BTC clears about 8.5% below market. Whether a small trade starts out slightly for or against you depends on which side of the market the pool's marginal price is sitting on that day, and it moves; it was about 0.8% above market at this reading and has been below it since. That side is the one thing here you must re-measure rather than read: the ladders show impact, which is a property of the curve, but the starting point is not. Quote at the size you intend to trade, not at a smaller one.

**Buying frBTC with frUSD**

| Size in | bps of incoming leg | frBTC out (base) | Effective USD/BTC |
| --- | --- | --- | --- |
| $100 | 53 | 155712 | 64,221 |
| $500 | 265 | 769370 | 64,988 |
| $1,000 | 531 | 1500719 | 66,635 |
| $1,881 | 999 | 2698741 | 69,707 |
| $5,000 | 2657 | 6211872 | 80,491 |

**Selling frBTC for frUSD**

| Size in | bps of incoming leg | frUSD out (base) | Effective USD/BTC |
| --- | --- | --- | --- |
| 0.001 BTC | 33 | 6385565367 | 63,856 |
| 0.03 BTC | 1016 | 174596643829 | 58,199 |

:::warning The 1000bps cap is a bridge rule, not a swap rule

`MAX_POOL_SHARE_BPS = 1000` governs **bridge conversions**: when a deposit asks to convert more than 10% of the frUSD reserve into BTC, the coordinator refuses the swap and pays out plain frUSD instead. The deposit still succeeds and neither chain raises an error, so a caller who does not check gets a stablecoin where they asked for BTC. The CLI clamps `convert_bps` down to the cap and tells you when it does, so a deposit prepared here does not hit that refusal blind, but anything building the calldata itself has to check.

A **direct** swap on the pool has no such cap: it executes at whatever the curve gives. That is why `quote` reports your size as bps of the incoming leg and calls it price impact rather than a limit. Set your own `min_dy`.

:::

## Reading market data

Amounts are in the source token's **base units**, as decimal strings. Both frUSD and frBTC are 8 decimals here, so $100 is `10000000000` and 0.001 BTC is `100000`.

```bash
# $100 of frUSD into frBTC
alkanes-cli btcusd quote --from frusd --amount 10000000000

size: 53bps of the pool's incoming leg. That is PRICE IMPACT, not a limit.
in : 10000000000 frUSD (base units)
out: 155712 frBTC (base units)
implied: 64221 USD/BTC  (EFFECTIVE, not the pool's marginal price)

# 0.001 BTC the other way
alkanes-cli btcusd quote --from frbtc --amount 100000
```

`pool` also reports whether the curve is ramping and whether the pool is killed. Check both before quoting: a ramping curve moves between blocks, so a quote taken now may not hold, and `is_killed` means refuse to trade at all.

```bash
alkanes-cli btcusd pool

pool 4:1778 at height 962472
  frUSD reserve         1881214389078  (18812.14389078)
  frBTC reserve              29521902  (0.29521902)
  LP supply      74516779814608897626  (74.516779814608897626, 18 decimals)
  virtual price   1000089524433596945  (1.000089524433596945)
  marginal             15604533105145  (64083.94 USD/BTC)
  depth cap              188121438907  (1881.21438907 frUSD - 1000bps of the reserve)

# OHLC. Buckets 3600 and 86400 only; the CLI refuses any other value
# before it sends anything.
alkanes-cli btcusd candles --bucket 86400 --limit 30
```

## Arm A: direct swap, frUSD and frBTC

Both assets are already on alkanes, so this is a single call to `exchange` (opcode 5) on `4:1778`. The CLI can quote it today but cannot send it: `swap`, `add-liquidity` and `remove-liquidity` all refuse, because the Bitcoin transaction construction they need (UTXO selection, protostone assembly, signing) is not yet reused from the `frbtc-wrap` path in the same crate. Until it is, execute swaps through the SUBFROST app and use the CLI to quote and to verify.

1. Quote with `get_dy` (107). Do not compute the curve yourself.
2. Read the size as bps of the incoming leg and decide if you accept that impact.
3. Set a slippage bound. The pool's fee band is 0.2% to 0.8% depending on the resulting balance, so a quote taken at one balance and executed at another must tolerate the difference.
4. Build the protostone, sign, broadcast.

## Arm B: EVM to BTC (deposit)

The caller holds USDC or USDT on Ethereum and wants frUSD on Bitcoin, optionally converting a share to native BTC on arrival. The vault is `0x95779e7e1c943042255b8a78273fe6de4823cf06` (ERC1967 proxy, L1), with `assets(0) = USDC` and `assets(1) = USDT`, both 6 decimals. It takes two calls, in order, and the approve must confirm first.

```bash
alkanes-cli btcusd deposit \
  --stable usdc \
  --amount 500000000 \
  --recipient bc1q... \
  --convert-bps 5000 \
  --btc-destination bc1q...

deposit  500000000 base units of USDC (assetId 0)
recipient (frUSD)  bc1q...
convert            5000bps to BTC -> bc1q...
max slippage       0bps (honoured downwards only)
approve            exactly 500000000 - NOT an unlimited allowance
bridgeData         0x1216...

1) approve - send to the TOKEN, not the vault
   to    0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
   data  0x095ea7b3...

2) depositAndBridge - send to the VAULT
   to    0x95779e7e1c943042255b8a78273fe6de4823cf06
   data  0xbedb65ee...

No Ethereum key supplied. The two calls above are what you sign, in that
order, and the approve must confirm first.
```

With no key flags the CLI prints the two calls for the user's own wallet, which is the right default for an interactive user. Local signing is deliberately not built: the key flags exist but refuse rather than sign. When it lands, it will submit through `/v4/{apikey}/ethereum-builder` to keep the transaction out of the public mempool, which matters on this specific trade because the calldata carries the BTC destination and the conversion split, and the Bitcoin leg's `min_dy` sits in an `OP_RETURN` until it confirms. A public broadcast hands a searcher advance notice of a swap against a shallow pool.

### bridgeData

`bridgeData` is a protobuf (`frusd.bridge.BridgeData`). Dispatch is by **field presence**, not by the `action` value.

| Field | Name | Value |
| --- | --- | --- |
| 1 | `action` | 0 (`DIRECT_TRANSFER`), always |
| 2 | `recipient_script` | The BTC scriptPubKey the frUSD settles at |
| 3 | `recipient_protostone` | Optional. **Mutually exclusive** with field 4 |
| 4 | `btc_conversion` | Optional. `convert_bps` (0 to 10000), `btc_destination` (required when `convert_bps > 0`), `max_slippage_bps` (honoured downwards only) |

### Every failure on this path is silent

**A malformed `bridgeData` still succeeds on Ethereum.** The vault stores the bytes verbatim, and the coordinator then pays the operator's fallback recipient instead of the depositor. Validate before signing, because nothing downstream will.

**`btc_destination` is the most dangerous field in the system.** frBTC's `burn()` validates the unwrap pointer's index but never the script at it. It copies the script into the payment record and burns the frBTC immediately: no escrow, no expiry, no reclaim. A non-standard destination destroys supply against an address that can never be paid, and the contract will not stop it. Accept only P2PKH, P2SH, or witness v0 to v16, with v0 restricted to the 20 and 32 byte programs. Refuse anything else, do not clean it up.

**The destination may be someone else's address, and that is supported.** Paying a third party straight out of an EVM balance, or seeding a fresh BTC identity, is a real flow. Both `--recipient` and `--btc-destination` are validated for payability, never for ownership, because ownership is not knowable. Note also that the two can differ: `--recipient` takes the frUSD residue and `--btc-destination` takes the converted BTC, so one deposit can seed two identities in two assets. There is no recovery from a wrong but payable address.

**`convert_bps` out of range is refused, never clamped.** Somebody who wrote 20000 meant something, and it was not 100%.

**Approve exactly the deposit amount.** Not `uint256::MAX`. A standing infinite allowance on a proxy the user does not control outlives the single transaction it was granted for.

**Use addresses at the user boundary, and require mainnet.** A person can recognise `bc1p...` and cannot proofread 34 bytes of script hex. A testnet address parses fine and yields a well-formed script that mainnet pays into a hole.

### Loading an Ethereum key

Never ask anyone to paste a private key into a chat. In order of preference: hand off to their wallet with the calldata above, unlock a keystore file locally, or use an environment variable for unattended runs while saying clearly that the key is in the process environment. The `--eth-private-key` flag is refused unless you also pass `--i-know-this-lands-in-shell-history`, because it does.

## Arm C: BTC to EVM (burn)

`burn` goes the other way: frUSD on Bitcoin out to USDC on Ethereum, optionally swapping a share onward into ETH through Uniswap V2. Splitting matters more than it looks: a burner can land most of it as a stablecoin and take enough ETH to pay gas, otherwise a fresh EVM identity receives tokens it cannot move.

```bash
alkanes-cli btcusd burn \
  --amount 10000000000 \
  --eth-address 0x... \
  --to-eth-bps 2000 \
  --min-out <your floor> \
  --dry-run

burn 10000000000 frUSD -> 2000bps to ETH via Uniswap V2, rest USDC, to 0x...
min out            <your floor> (YOURS - the coordinator has none here)
burnData           0x0101...
```

### burnData is NOT protobuf

It is a raw byte encoding:

| Encoding | Means |
| --- | --- |
| empty, or `[0x01, 0x00]` | Plain transfer |
| `[0x01, 0x01, <20-byte target>, <calldata...>]` | Call |

**`amountOutMin` is yours to set.** There is no coordinator-side slippage floor on this leg. Passing 0 is an unbounded-loss instruction. The CLI requires `--min-out` whenever `--to-eth-bps > 0` for exactly this reason.

**One allowlisted target only.** Uniswap V2 Router02 at `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`, calldata `swapExactTokensForETH(amountIn, amountOutMin, path, to, deadline)` with `path = [USDC, WETH]`. Anything else degrades to a plain payout. V2 and not V3 deliberately: one `target.call`, no multicall.

**The route is live; this command does not broadcast it yet.** A burn has settled end to end on mainnet, so `BurnAndBridge` itself works: reference transaction `8aa2d9412897dcb25fd91155a910848e8481d72318cc5724dfaac20d58cc576e`, block 961,294, which burned frUSD and paid USDT out on Ethereum. What this command produces is the `burnData` payload, which is authoritative, matched to the coordinator's own parser and unit tested. The frUSD `BurnAndBridge` cellpack packing around that payload still needs checking against the integration tests before anything is signed, so the CLI prints and refuses. Guessing that packing is exactly how a burn silently degrades to a plain payout.

## Watching both chains

A bridge trade is not done when the Bitcoin side settles. Track the frBTC/frUSD signing group's taproot addresses to see rollups land, and check the Ethereum side too. Persist what you submitted (txids, intents, expected outcomes) so a resumed session reconciles rather than re-submits: duplicate submission on a bridge path is a real loss, not an inconvenience.

What the CLI gives you today is the mempool read surface plus `signers`. Address polling is not wired yet: `watch`, `simulate` and `simulate-block` all refuse, and so does `mempool watch`. Poll `mempool template` in the meantime.

```bash
# what is pending, and the blocks a miner would build next
alkanes-cli btcusd mempool info
alkanes-cli btcusd mempool template

# one transaction, including the block it is projected into
alkanes-cli btcusd mempool entry <txid>

# the signing group, to see rollups land
alkanes-cli btcusd signers
```

:::warning `protorunesbyaddress` is slow

`protorunesbyaddress`, which address watching will use once it is wired, is slow and marginal: measured at about 10.5s against a 15s pool timeout on a busy address, and it has already caused an outage. Budget for it, cache it, and do not guess a poll interval. This is why the command refuses rather than shipping a default that takes the indexer down.

:::

:::note The mempool routes are live now

The CLI's own help text still says they are not deployed, which was true when it was written and is not true now: `/v4/{apikey}/mempool` answered 200 with a full snapshot, while the same request against a nonexistent path on the same key answered 404, so the route is real and not a fall-through. Verify before building on it rather than trusting either statement.

:::

`simulate-block` will be the MEV lens once its candidate-block assembly is built. The view itself already exists on the node: it drives every transaction through the same per-tx path the indexer uses, with one shared sandbox carrying writes across transaction boundaries, so it reproduces the intra-block atomicity that decides who wins a contended swap. The questions it will answer: does my transaction still get the quote I expect if it lands after the pending set, and what fee gets me ahead of the trade that would move the price against me.

## Before you execute anything

1. For a bridge conversion: is it inside the 1000bps cap? If not, say what will actually happen (frUSD, not BTC).
2. For a direct swap: have you quoted the **effective** execution price at your size, not the pool's marginal price?
3. Is `btc_destination` a standard, payable, mainnet script?
4. Is the approve exactly the amount, not unlimited?
5. Are amounts still strings, not floats?
6. Did you say out loud that you are on the shared `/v4/jsonrpc` endpoint, if you are?
7. Did you say clearly that you are not signing the Ethereum side, because they are?

If you cannot answer all seven, do not broadcast. Explain what is missing.

## Not built yet

Listed so nobody builds a workflow on top of a command that refuses.

- `swap`, `add-liquidity` and `remove-liquidity`: need Bitcoin transaction construction, and refuse rather than emit something that looks right.
- `watch` and `simulate`: need the monitor plumbing. Both refuse.
- `simulate-block`: the node-side view exists, assembling the candidate block to feed it does not. It refuses.
- `mempool watch`: the websocket stream needs its reconnect state machine, because a changed `instance` invalidates every sequence number. It refuses. `mempool info`, `template` and `entry` all work.
- `deposit` local signing: the key flags refuse. The supported path is printing the two calls and signing in your own wallet, which is what the web app does.
- `burn` broadcast: the payload is built and printed, the cellpack packing around it is unverified. The on-chain route itself is live.
- `candles` and `signers`: they answer, but print the raw protobuf hex instead of a decoded table.

## Next steps

- [Pools & Liquidity](../../using-subfrost/pools-liquidity): what providing liquidity to this pool pays.
- [frUSD Overview](../../tokens/frUSD-overview): the asset on the USD side of the pair.
- [Alkanes Commands](./alkanes): contract execution, traces, and the general AMM surface.
