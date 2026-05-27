# FIRE Token System

FIRE is a utility token built on [Alkanes](https://github.com/kungfuflex/alkanes-rs) that rewards LP stakers on Bitcoin. 0% premine, 100% emission. Halving synchronized with Bitcoin.

## Overview

- **LP Staking** — Earn FIRE by staking DIESEL/frBTC LP tokens with lock multipliers (1x–3x)
- **wLP** — Wrapped LP: fungible receipt for staked LP, extractable via Split/Merge
- **Bonding** — Purchase FIRE at a discount with LP tokens (protocol-owned liquidity)
- **Redemption Floor** — Burn FIRE for treasury backing (guaranteed price floor)
- **Upgradeable** — All contracts behind upgradeable proxies with auth-token-controlled upgrades

> **Note: FIRE has no AMM swap market.** "Price" is derived from the staking-based
> oracle — see [Pricing Model](docs/TOKENOMICS.md#fire-pricing-model--no-amm) for
> the formula and examples. UIs that show a "discount vs market" should explicitly
> state which reference price they use (oracle / floor / off-platform).

## Token Economics

| Metric | Value |
|--------|-------|
| Maximum Supply | 2,100,000 FIRE |
| Decimals | 8 |
| Premine | 0% |
| Staking Pool | 85% (1,785,000 FIRE) |
| Bonding Pool | 15% (315,000 FIRE) |
| Halving | Every 105,000 blocks (~2 years) |
| Activation | Block 950,420 (staking + bonding start) |
| First Halving | Block 1,050,000 (Bitcoin halving #5) |

See [docs/TOKENOMICS.md](docs/TOKENOMICS.md) for complete tokenomics.

## Architecture

All contracts deployed behind upgradeable proxies (OYL AMM pattern). Staking clones and position NFTs use beacon-proxy pattern for atomic upgrades across all existing instances.

```
User → Proxy 2:N         → delegatecall → Implementation (4:512-517)
User → Epoch Clone 2:N   → staticcall Staking-Beacon  → delegatecall → Impl 4:518
User → Position NFT 2:M  → staticcall Position-Beacon → delegatecall → Impl 4:521
```

Shared bytecode (`fire_upgradeable.wasm`, `fire_upgradeable_beacon.wasm`,
`alkanes_std_beacon_proxy.wasm`) is uploaded once and cloned via `CREATECHILD`.
The 6 singleton proxy IDs and 2 beacon IDs are assigned by the runtime at deploy
time and exported to `.deploy-ids.env`.

**Master auth (FIRE-AUTH at 4:666)** — a single shared NFT controls every upgradeable
proxy and beacon in the system. One key, one source of truth. Holding ≥1 unit of 4:666
authorises calling `upgrade` (opcode 32766) on any of:

- 6 fire-upgradeable proxies (token / staking-factory / treasury / bonding / redemption / oracle)
- staking beacon — affects all epoch clones
- position-token beacon — affects all existing position NFTs

Bond NFTs and wLP series tokens are deployed as immutable templates (no beacon).
See [deploy-proxied.sh](./scripts/deploy-proxied.sh) for the exact deploy order.

## Mainnet Deployment

Deployed and verified on 2026-05-26 (blocks 951043–951088). All contracts
verified live via `alkanes-cli alkanes simulate` against canonical metashrew
state.

| Slot | Contract | Alkane ID | Impl | Createchild TXID |
|------|----------|-----------|------|------------------|
| Master auth | FIRE-AUTH | `4:666` | — | — |
| Beacon | staking beacon | `2:77621` | → `4:518` | `5b0bb37a…` |
| Beacon | position beacon | `2:77622` | → `4:521` | `5ef8aaf1…` |
| Singleton proxy | fire-token | `2:77623` | `4:512` | `0be7104a…` |
| Singleton proxy | fire-staking-factory | `2:77624` | `4:513` | `4cd5606a…` |
| Singleton proxy | fire-redemption | `2:77625` | `4:516` | `fea76afc…` |
| Singleton proxy | fire-price-oracle | `2:77626` | `4:517` | `ea8a5d49…` |
| Singleton proxy | fire-bonding | `2:77627` | `4:515` | `1e9052c4…` |
| Singleton proxy | fire-treasury | `2:77628` | `4:514` | `a508ea90…` |
| Epoch-0 clone | staking (block 950420 → 1055420) | `2:77631` | beacon `2:77621` | `5a1e25ef…` |
| Epoch-0 wLP | wrapped-LP series token "FIRE-PT-0" | `2:77632` | — | `5a1e25ef…` |
| Reference | DIESEL/frBTC LP token | `2:77087` | — | — |

Init TXIDs (Phase 7, sequential with auth NFT forward):
- fire-token init: `9a6c2500…` (block 951075)
- treasury init: `aba951b0…` (block 951077)
- redemption init: `135a9e6f…`
- bonding init: `7de0574e…` (block 951082)
- factory init: `59238485…` (block 951083)
- oracle init: `d50d635c…` (block 951085)
- Phase 8 create_next_epoch: `5a1e25ef…` (block 951088)

> **Note:** An earlier deploy attempt on 2026-05-24 (blocks 950864-950902)
> used wrong AlkaneIds due to espo indexer off-by-one shift. Those Phase 7
> init txs landed on the wrong canonical contracts (`2:77607-2:77614`
> range) and are documented in `.deploy-ids.env` under `DEPRECATED_*`. They
> cannot mint FIRE (auth checks block any extraction) but should not be
> used for any integration.

## Staking Flow

```
Stake(LP, lock, amount) → NFT position (FIRE yield + LP claim)

Simple:     Unstake(NFT) → LP + FIRE
Advanced:   Split(NFT) → NFT + wLP → trade wLP separately
            Merge(NFT + wLP) → NFT → Unstake → LP + FIRE
After expiry: RedeemExpired(wLP) → LP (no NFT needed)
```

## Contracts

| Contract | Description |
|----------|-------------|
| `fire-staking` | LP staking with wLP, NFT positions, Synthetix accumulator |
| `fire-token` | FIRE token with capped supply and dual emission pools |
| `fire-position-token` | NFT template for staking positions (factory clone) |
| `fire-series-token` | Fungible token template for wLP / FIRE-PT-N (factory clone) |
| `fire-treasury` | Passive treasury for redemption floor backing |
| `fire-bonding` | Bond LP for discounted FIRE with vesting |
| `fire-redemption` | Burn FIRE for proportional treasury backing |
| `fire-price-oracle` | Staking-based bond pricing (fail-closed, via factory) |
| `fire-staking-factory` | Epoch manager (creates beacon-proxy staking clones per halving) |
| `fire-bond-token` | NFT template for bond positions |
| `fire-support` | Shared math utilities |
| `fire-constants` | System constants, template IDs, proxy opcodes |

## Project Structure

```
fire/
├── alkanes/                        # Contract source (compiled to WASM)
│   ├── fire-token/                 # FIRE token — impl 4:512 (proxy 2:N)
│   ├── fire-staking/               # LP staking — beacon impl 4:518, epoch clones 2:N
│   ├── fire-staking-factory/       # Epoch manager — impl 4:513 (proxy 2:N)
│   ├── fire-treasury/              # Redemption floor — impl 4:514 (proxy 2:N)
│   ├── fire-bonding/               # LP bonding — impl 4:515 (proxy 2:N)
│   ├── fire-redemption/            # FIRE → LP — impl 4:516 (proxy 2:N)
│   ├── fire-price-oracle/          # Bond pricing — impl 4:517 (proxy 2:N)
│   ├── fire-position-token/        # Staking NFT impl 4:521 (position-beacon 2:N)
│   ├── fire-bond-token/            # Bond NFT template (immutable, 4:263)
│   ├── fire-series-token/          # wLP / FIRE-PT template (immutable, 4:264)
│   ├── fire-master-auth/           # FIRE-AUTH single shared auth NFT (mainnet 4:666)
│   ├── fire-upgradeable/           # Singleton proxy (shared-auth variant)
│   └── fire-upgradeable-beacon/    # Beacon (shared-auth variant)
├── crates/
│   ├── fire-support/               # Math: multipliers, epochs, pricing
│   └── fire-constants/             # Constants, IDs, proxy opcodes
├── src/tests/                      # WASM integration tests
├── docs/
│   ├── SPEC.md                     # Contract specification
│   ├── TOKENOMICS.md               # Tokenomics
│   └── TEST_LIST.md                # Test checklist (180+ items)
└── scripts/
    ├── deploy-proxied.sh           # Regtest deploy
    ├── deploy-mainnet.sh           # Mainnet deploy (preflight + revert detection)
    ├── test-upgrade.sh             # Upgrade-roundtrip check for all 8 upgradeables
    ├── test-state.sh               # State preservation check after upgrade
    └── build-wasms.sh              # Build + copy WASMs

Proxy infrastructure:
  fire-upgradeable                  # Singleton proxy (delegatecall → impl, shared auth)
  fire-upgradeable-beacon           # Beacon (stores impl, upgrade_to, shared auth)
  fire-master-auth                  # FIRE-AUTH single shared auth NFT (mainnet 4:666)
  alkanes-std-beacon-proxy          # Clone template (queries beacon → delegatecall)

Deployed topology:
  4:666      FIRE-AUTH master auth (mainnet — 1 unit, controls every upgradeable below)
  4:512-518  Logic implementations (behind proxies)
  4:521      Position-token implementation
  4:520      Beacon-proxy template (shared by staking clones AND position NFTs)
  4:530      fire-upgradeable template (CREATECHILD source for 6 proxies)
  4:531      fire-upgradeable-beacon template (CREATECHILD source for both beacons)
  4:263-264  Bond-token / wLP series-token templates (immutable, no beacon)
  2:N        Dynamic: 6 proxies + staking-beacon + position-beacon
             + epoch staking clones + position NFTs
             (all 8 upgradeable singletons exported to .deploy-ids.env
              at deploy time)
```

## Building

```bash
# Prerequisites
rustup target add wasm32-unknown-unknown
cargo install -f wasm-bindgen-cli --version 0.2.100

# Build all WASMs (mainnet)
./scripts/build-wasms.sh

# Build with HALVING_INTERVAL=200 for regtest end-to-end epoch testing
./scripts/build-wasms.sh --devnet

# Unit tests (native)
cargo test -p fire-support -p fire-constants

# Integration tests (WASM, needs CC=clang on macOS)
CC="/opt/homebrew/opt/llvm/bin/clang" cargo test --target wasm32-unknown-unknown

# Deploy (regtest)
./scripts/deploy-proxied.sh                      # mainnet params
DEVNET=1 ./scripts/deploy-proxied.sh             # devnet params (activation = current+5)
./scripts/test-upgrade.sh                        # verify all 8 upgradeables roundtrip
./scripts/test-state.sh                          # verify state preserved through upgrade

# Deploy (mainnet)
DEPLOY_PASSWORD=$(security find-generic-password -s fire-deploy -w) \
  FEE_RATE=10 LP_BLOCK=2 LP_TX=77087 \
  ./scripts/deploy-mainnet.sh

# Upgrade any contract (mainnet master auth = 4:666, proxy/beacon IDs in .deploy-ids.env):
# 1. Deploy new logic: [3,NEW_ID,99]:v0:v0 --envelope new.wasm
# 2. Upgrade proxy:    [PROXY_BLOCK,PROXY_TX,32766,4,NEW_ID]:v0:v0 --inputs 4:666:1
# 3. Upgrade beacon:   [BEACON_BLOCK,BEACON_TX,32766,4,NEW_ID]:v0:v0 --inputs 4:666:1
```

## License

See repository root.
