# FIRE System — Contract Specification

## Overview

FIRE is a utility token on ALKANES (Bitcoin metaprotocol) that rewards LP stakers.
0% premine, 100% emission via staking (85%) and bonding (15%). Halving synchronized with Bitcoin.

**Architecture:** Stake LP → receive NFT position (FIRE yield) with embedded wLP (LP claim).
Optionally split NFT into NFT + wLP for separate trading. Expiry at halving boundary.

All contracts deployed behind upgradeable proxies (auth-token-controlled upgrades).
Staking epoch clones use beacon pattern for simultaneous upgrade of all epochs.

All `u128` values use 8 decimal places (DECIMAL_FACTOR = 100,000,000). AlkaneId is 2 x u128 (block, tx).

---

## Constants

### Halving & Durations

```
BITCOIN_HALVING    = 210,000 blocks
HALVING_INTERVAL   = 105,000 blocks (Bitcoin halving / 2)

YEAR               = 52,500  (HALVING_INTERVAL / 2)
SIX_MONTHS         = 26,250  (HALVING_INTERVAL / 4)
THREE_MONTHS       = 13,125  (HALVING_INTERVAL / 8)
MONTH              = 4,375   (HALVING_INTERVAL / 24)
WEEK               = 1,050   (HALVING_INTERVAL / 100)
```

All series durations divide evenly into HALVING_INTERVAL.
Epoch boundaries align to a global grid anchored at Bitcoin block 0.
The first FIRE halving coincides with the next Bitcoin halving (block 1,050,000).
Every other FIRE halving thereafter also coincides with a Bitcoin halving.

### Supply & Emission

```
MAX_SUPPLY              = 2,100,000 FIRE (8 decimals)
STAKING_EMISSION_POOL   = 1,785,000 FIRE (85%)
BONDING_EMISSION_POOL   = 315,000 FIRE (15%)

STAKING_EMISSION_RATE   = 850,000,000 units/block (epoch 0)
BONDING_EMISSION_RATE   = 150,000,000 units/block (epoch 0)
```

Rates halve each epoch. `rate × HALVING_INTERVAL = pool per epoch`.
Geometric sum converges to MAX_SUPPLY.

### Lock Multipliers

| Lock Duration | Blocks | Multiplier |
|---------------|--------|------------|
| No lock       | 0      | 1.00x      |
| 1 week        | 1,050  | 1.25x      |
| 1 month       | 4,375  | 1.50x      |
| 3 months      | 13,125 | 2.00x      |
| 6 months      | 26,250 | 2.50x      |
| 1 year        | 52,500 | 3.00x      |

---

## Proxy Architecture

All FIRE contracts are deployed behind upgradeable proxies using standard ALKANES proxy contracts.

### Proxy Types

**fire-upgradeable** (singletons): Stores `/implementation` AlkaneId. All calls → `delegatecall` to implementation. Master auth holder calls `upgrade(new_impl)` opcode 32766 to swap logic. Storage lives on proxy. Forked from `alkanes-std-upgradeable`: init takes existing shared auth AlkaneId instead of minting a fresh per-proxy token.

**fire-upgradeable-beacon** (beacon): Stores implementation AlkaneId. Provides `implementation()` view (opcode 32765). Master auth holder calls `upgrade_to(new_impl)` opcode 32766. Forked from `alkanes-std-upgradeable-beacon` (same shared-auth change).

**alkanes-std-beacon-proxy** (clone template): On each call, `staticcall` beacon → get impl → `delegatecall` to impl. Created per staking epoch and per position NFT via CREATECHILD.

**fire-master-auth** (single shared auth NFT): One contract at fixed slot 4:255 holding the `/implementation = self` self-auth pattern. 1 unit of (4:255) is minted to deployer at init. Every fire-upgradeable proxy / fire-upgradeable-beacon in the system references this single token in its `/auth-token-id` storage. Holder calls `upgrade` on any of them by including the NFT in `incoming_alkanes`. Name and symbol both return `"FIRE-AUTH"`.

### Deploy Mechanics

Shared bytecode uploaded ONCE and cloned via `CREATECHILD`:
1. `fire_upgradeable.wasm` at 4:530 — CREATECHILD source for the 6 singleton proxies
2. `fire_upgradeable_beacon.wasm` at 4:531 — CREATECHILD source for both beacons
3. `alkanes_std_beacon_proxy.wasm` at 4:520 — shared by staking clones AND position NFTs

The 6 singleton proxies and 2 beacons get dynamic `2:N` AlkaneIds assigned by the
runtime at deploy time and exported to `.deploy-ids.env`. Impl, template, and
immutable-token slots are pinned.

### Contract ID Map

| Contract | Public ID | Implementation | Pattern |
|---|---|---|---|
| **fire-master-auth (FIRE-AUTH)** | **4:255** | — | single shared auth NFT |
| fire-token | dynamic 2:N | 4:512 | upgradeable proxy |
| fire-staking-factory | dynamic 2:N | 4:513 | upgradeable proxy |
| fire-treasury | dynamic 2:N | 4:514 | upgradeable proxy |
| fire-bonding | dynamic 2:N | 4:515 | upgradeable proxy |
| fire-redemption | dynamic 2:N | 4:516 | upgradeable proxy |
| fire-price-oracle | dynamic 2:N | 4:517 | upgradeable proxy |
| fire-staking (per epoch) | 2:N | 4:518 | beacon-proxy clones |
| staking beacon | dynamic 2:N | — | beacon (master-auth controlled) |
| fire-position-token (per stake) | 2:M | 4:521 | beacon-proxy clones |
| position beacon | dynamic 2:N | — | beacon (master-auth controlled) |
| beacon-proxy template | 4:520 | — | shared by staking + position clones |
| fire-upgradeable template | 4:530 | — | CREATECHILD source for 6 proxies |
| fire-upgradeable-beacon template | 4:531 | — | CREATECHILD source for both beacons |
| bond-token | 4:263 | — | direct (immutable) |
| series-token (wLP) | 4:264 | — | direct (immutable) |

Examples below show proxy IDs as `4:X` placeholders for readability — substitute the
actual `2:N` from `.deploy-ids.env` when executing.

### Upgrade Flow

```bash
# 1. Deploy new logic implementation
[3, NEW_IMPL_ID, 99]:v0:v0 --envelope new_contract.wasm

# 2a. Upgrade singleton (e.g., bonding at 4:259)
[4, 259, 32766, 4, NEW_IMPL_ID]:v0:v0 --inputs AUTH_TOKEN_ID:1

# 2b. Upgrade all staking clones via beacon
[4, 519, 32766, 4, NEW_STAKING_IMPL]:v0:v0 --inputs AUTH_TOKEN_ID:1
```

---

## Contracts

### 1. fire-staking

Main staking contract. One instance per halving epoch (created as beacon-proxy clone).

**State:**
```
/lp_token           → AlkaneId (accepted LP token)
/fire_token         → AlkaneId (FIRE token for minting)
/position_template  → u128 (NFT template for factory clone)
/wlp_token          → AlkaneId (fungible wLP token, created at init)
/expiry             → u128 (halving boundary block)
/start_height       → u64
/current_epoch      → u128
/total_weighted_stake → u128 (sum of all position weights)
/total_locked_lp    → u128 (raw LP locked ≥ 6 months, for oracle)
/total_raw_stake    → u128 (raw LP across all positions, no filter)
/reward_per_token_stored → u128 (Synthetix accumulator)
/last_update_height → u64
/position_count     → u128
/child_reg/{id}     → u128 (1 = registered position)
/split/{id}         → u128 (1 = position has been split)
```

**Opcodes:**

| Opcode | Function | Input | Output |
|--------|----------|-------|--------|
| 0 | Initialize | lp_token, fire_token, pos_tmpl, wlp_tmpl, start, expiry, halving_epoch | — |
| 1 | Stake | lock_duration, amount; LP as incoming | NFT position token + LP change |
| 2 | Unstake | target_position: AlkaneId; NFT as incoming (+ wLP if split) | LP + FIRE |
| 3 | ClaimRewards | target_position: AlkaneId; NFT as incoming | NFT + FIRE |
| 4 | Split | target_position: AlkaneId; NFT as incoming | NFT + wLP |
| 5 | Merge | target_position: AlkaneId; NFT + wLP as incoming | NFT |
| 7 | UpdateEpoch | — | — |
| 8 | RedeemExpired | wLP as incoming (after expiry) | LP |
| 12 | GetTotalStaked | — | u128 (weighted) |
| 14 | GetCurrentEpoch | — | u128 |
| 15 | GetCurrentEmissionRate | — | u128 |
| 16 | GetExpiry | — | u128 |
| 17 | GetWlpToken | — | AlkaneId (32 bytes) |
| 18 | PreviewClaim | position_token: AlkaneId | u128 (claimable FIRE) |
| 30 | GetPositionTemplate | — | u128 |
| 31 | GetPositionCount | — | u128 |
| 33 | GetTotalLockedLp | — | u128 (raw LP, ≥6mo locks only) |
| 34 | GetTotalRawStake | — | u128 (raw LP, all positions) |
| 36 | IsRegisteredChild | child: AlkaneId | u128 (0 or 1) |
| 37 | GetPositionSplitStatus | position: AlkaneId | u128 (0 or 1) |
| 99 | GetName | — | string |

**target_position parameter:** Unstake, ClaimRewards, Split, Merge accept `target_position: AlkaneId`. If `{0,0}`, selects first registered NFT in incoming. Otherwise matches exact ID. Enables selection when multiple NFTs are in same UTXO.

**Reward Math (Synthetix accumulator):**
```
reward_per_token += emission_rate × delta_blocks × PRECISION / total_weighted_stake
earned = weighted_amount × (reward_per_token - checkpoint) / PRECISION + pending
```

Global accumulator capped at expiry via `effective_reward_height()`.

**Expiry Behavior:**
- Auto expiry = `(absolute_epoch + 1) × HALVING_INTERVAL - 1` (last block before halving)
- This ensures emission rate never changes within a contract's lifetime
- Stake blocked after expiry
- Lock duration cannot exceed expiry
- FIRE accrual stops at expiry for all positions
- ClaimRewards after expiry (non-split): auto-unstake — FIRE + LP returned, NFT consumed
- ClaimRewards after expiry (split): FIRE only — NFT consumed, LP stays for wLP holder
- RedeemExpired: wLP → LP (no NFT required)

**Split/Merge:**
- Stake returns NFT only (wLP embedded, not minted)
- Split: extracts wLP from NFT (mints wLP, marks position as split)
- Merge: returns wLP to NFT (burns wLP, marks position as not split)
- Unstake non-split: NFT alone sufficient
- Unstake split: requires NFT + matching wLP
- Double split rejected ("already split")

### 2. fire-position-token (NFT)

One instance per staking position, created via block 6 factory clone.

**State (immutable after creation):**
```
/vault_id         → AlkaneId (fire-staking contract)
/position_id      → u128
/deposit_amount   → u128 (LP deposited)
/weighted_amount  → u128 (LP × multiplier / 100)
/lock_end         → u128 (block when lock expires)
/lock_duration    → u128
/multiplier       → u128 (100 = 1x, 300 = 3x)
/deposit_token    → AlkaneId (exact LP token)
```

**State (mutable, only by vault):**
```
/reward_checkpoint → u128 (reward_per_token at last claim)
/pending_rewards   → u128 (unclaimed FIRE accumulator)
```

**Supply:** Exactly 1 unit per instance.

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | Initialize | factory create only (accepts epoch_id for name) |
| 1 | SetRewardCheckpoint | vault only |
| 10-16 | View getters (pos_id, deposit_amount, weighted_amount, lock_end, lock_duration, multiplier, reward_checkpoint) | public |
| 19 | GetDepositToken | public |
| 23 | GetAllDetails (144 bytes) | public |
| 99 | GetName | public (e.g., "FIRE-POS-0-3" for epoch 0 stake #3) |
| 100 | GetSymbol | public (same as name) |

### 3. fire-series-token (wLP template)

Fungible PT (wLP) token template. One instance per staking epoch, cloned by
fire-staking on init. Direct template — not upgradeable (immutable receipt).

**State:**
```
/vault     → AlkaneId (fire-staking contract that minted this clone)
/series_id → u128 (= halving_epoch, drives "FIRE-PT-{N}" name)
/total     → u128 (total supply)
```

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | Initialize { vault_block, vault_tx, series_id } | factory create only |
| 10 | Mint | vault only |
| 11 | Burn | vault only |
| 41 | GetTotalSupply | public |
| 43 | GetSeriesId | public |
| 44 | GetVault | public |
| 50 | ForwardIncoming | public |
| 99 | GetName | public (e.g., "FIRE-PT-0") |
| 100 | GetSymbol | public (same as name) |

### 4. fire-token

FIRE token with capped supply and dual emission pools.

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | Initialize(staking_authority, bonding_contract) | once |
| 77 | MintFromStakingPool(amount) | authorized stakers only |
| 78 | MintFromBondingPool(amount) | bonding contract only |
| 79 | RegisterStaker(staker_id) | staking authority (factory) |
| 88 | Burn | anyone (burns incoming FIRE) |
| 99 | GetName | public |
| 100 | GetSymbol | public |
| 101 | GetTotalSupply | public |
| 102 | GetMaxSupply | public |
| 103 | GetStakingPoolRemaining | public |
| 104 | GetBondingPoolRemaining | public |

RegisterStaker: factory registers each epoch clone as authorized minter.
Staking authority (set at init) can add stakers to the authorized set.

---

## User Flows

### Simple Staker (v1 behavior)
```
Stake(LP, lock=0, amount=0) → NFT
ClaimRewards(NFT, target={0,0}) → NFT + FIRE  (repeat anytime)
Unstake(NFT, target={0,0}) → LP + FIRE
```

### Locked Staker (higher multiplier)
```
Stake(LP, lock=1yr, amount=0) → NFT (3x weight)
ClaimRewards(NFT, target={0,0}) → NFT + FIRE  (anytime, lock doesn't affect claim)
[wait for lock_end]
Unstake(NFT, target={0,0}) → LP + FIRE
```

### Advanced (LP liquidity via wLP)
```
Stake(LP) → NFT
Split(NFT, target={0,0}) → NFT + wLP
[sell wLP on market — LP claim transferred]
ClaimRewards(NFT) → NFT + FIRE  (keep earning)
[buy wLP back when needed]
Merge(NFT + wLP, target={0,0}) → NFT
Unstake(NFT) → LP + FIRE
```

### After Expiry
```
[expiry reached — FIRE stops accruing]
ClaimRewards(NFT) → final FIRE (NFT consumed)
RedeemExpired(wLP) → LP (no NFT needed)
[re-stake into new epoch contract]
```

### Bonding
```
Bond(LP, lp_to_bond=amount, min_fire_out=0) → Bond NFT + LP change
[wait for vesting: ~1,050 blocks]
ClaimVested(Bond NFT, target={0,0}) → Bond NFT + vested FIRE
[repeat until fully vested]
```

### Redemption
```
Redeem(FIRE, amount=0) → LP backing - 1% fee
```

---

## Security Properties

| # | Property | Mechanism | Verified |
|---|----------|-----------|----------|
| I1 | No retroactive dilution | Per-position checkpoint in NFT | regtest ✓ |
| I2 | Flash stake safe | Same-block claim = 0 (checkpoint = current rpt) | by design ✓ |
| I3 | wLP supply ≤ LP held | Mint only via Split, burn via Merge/Unstake/Redeem | regtest ✓ |
| I4 | No post-expiry inflation | Global accumulator capped at expiry | regtest ✓ |
| I5 | No cross-epoch rate change | Expiry = boundary - 1, epoch constant within contract | by design ✓ |
| I6 | Fake token rejection | authenticate_position checks /child_reg storage | regtest ✓ |
| I7 | wLP auth | only_vault: only staking contract can mint/burn | code ✓ |
| I8 | Overflow protection | U256 for intermediate reward calculations | code ✓ |
| I9 | Lock enforcement | lock_end checked on unstake, not on claim | regtest ✓ |
| I10 | Expiry enforcement | Stake blocked, lock capped, accrual capped | regtest ✓ |
| I11 | LP accounting exact | staked + change = incoming (no LP lost or created) | regtest ✓ |
| I12 | No LP loss at expiry | Non-split: auto-unstake returns LP. Split: wLP redeems | regtest ✓ |
| I13 | No double-spend | Consumed NFT cannot claim/unstake again | regtest ✓ |
| I14 | Deposit amount + change | Explicit amount staked, excess LP returned | regtest ✓ |
| I15 | Multiplier ratios | 1x/1.25x/1.5x/2x/2.5x/3x verified within 5% | regtest ✓ |
| I16 | Emission rate constant | 850M/block verified via simulate | regtest ✓ |
| I17 | Token return safety | All handlers return non-target tokens to caller | audit ✓ |
| I18 | No token stuck | Treasury deposit returns non-LP; internal handlers use exact parcels | audit ✓ |
| I19 | Proxy upgrade auth | Only auth token holder can upgrade via opcode 32766 | by design ✓ |
| I20 | Beacon upgrade atomic | Single beacon upgrade affects all staking clones | by design ✓ |

---

## Deployment (Proxied)

### deploy-proxied.sh

1. **FIRE master auth** (4:255) — `fire-master-auth` mints 1 unit FIRE-AUTH NFT to deployer
2. **Logic implementations** (opcode 99 = GetName): 4:512-518, 4:521 (position-impl)
3. **Templates**:
   - 4:262 — beacon-proxy template for position NFT (alkanes_std_beacon_proxy)
   - 4:263 — fire-bond-token (direct, immutable)
   - 4:264 — fire-series-token / wLP (direct, immutable)
4. **Beacons** (each bound to master auth 4:255):
   - 4:519 — staking beacon → impl 4:518; epoch beacon-proxy template at 4:520
   - 4:522 — position beacon → impl 4:521
5. **Upgradeable proxies** for singletons: 4:256-261 → impl 4:512-517, all bound to master auth
6. **Initialize** through proxies (delegatecall to logic, master auth NFT in incoming)
7. **CreateNextEpoch** (epoch 0 via beacon-proxy clone)
8. **Mine DIESEL**

### 5. fire-staking-factory

Permanent epoch manager. Creates staking contract clones per halving period.
Deployed behind upgradeable proxy (4:257 → 4:513).

**State:**
```
/lp               → AlkaneId
/ft               → AlkaneId (FIRE token)
/st               → u128 (staking template / beacon-proxy template)
/pt               → u128 (position token template)
/wt               → u128 (wLP token template)
/ed               → u128 (epoch duration)
/ec               → u128 (epoch count)
/bi               → AlkaneId (beacon ID, {0,0} = no beacon)
/e/{index}        → AlkaneId (epoch contract)
/ea/{abs_epoch}   → u128 (1 = exists)
/eai/{index}      → u128 (absolute epoch number)
```

**Opcodes:**

| Opcode | Function | Input | Output |
|--------|----------|-------|--------|
| 0 | Initialize | lp, fire, staking_tmpl, pos_tmpl, wlp_tmpl, epoch_duration, beacon_id | — |
| 1 | CreateNextEpoch | — (permissionless) | — |
| 10 | GetEpochCount | — | u128 |
| 11 | GetEpochContract | epoch_index | AlkaneId (32 bytes) |
| 12 | GetCurrentEpochIndex | — | u128 |
| 13 | GetLpToken | — | AlkaneId (32 bytes) |
| 14 | GetFireToken | — | AlkaneId (32 bytes) |
| 99 | GetName | — | string |

**Epoch Creation (beacon mode):**
1. CREATECHILD from beacon-proxy template (opcode 36863 = forward, safe pre-init)
2. Initialize beacon proxy: `[32767, beacon.block, beacon.tx]` — sets `/beacon` storage
3. Initialize staking logic (via delegatecall through beacon): opcode 0 with full params
4. Register epoch contract as authorized staker on fire-token (opcode 79)

### 6. fire-treasury

Central treasury. Holds protocol-owned LP from bonding. Provides redemption backing.
Deployed behind upgradeable proxy (4:258 → 4:514).

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | Initialize(fire_token, diesel_lp, bonding, redemption) | once |
| 10 | Deposit | anyone (returns non-LP tokens) |
| 11 | RedeemBacking(fire_amount) | redemption contract only |
| 23 | GetRedemptionRate | public |
| 24 | GetTotalBacking | public |
| 99 | GetName | public |

Bonding and redemption addresses set at deploy, no admin.

### 7. fire-bonding

Single permanent contract. Auto-halves via internal check_epoch().
Rate-limited: capacity unlocks linearly at bonding_emission_rate per block.
Deployed behind upgradeable proxy (4:259 → 4:515).

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | Initialize(fire, lp, treasury, oracle, bond_tmpl, genesis_height) | once |
| 1 | Bond(lp_to_bond, min_fire_out) | anyone + LP incoming |
| 2 | ClaimVested(target_position) | bond position token incoming |
| 4 | SetDiscount(discount_bps) | owner |
| 6 | SetPaused(0/1) | owner |
| 7 | SetPriceOracle(oracle) | owner |
| 20-24 | Views (discount, price, capacity, bonded, halving epoch) | public |
| 30-33 | Views (template, count, rate, total_claimed_fire) | public |
| 99 | GetName | public |

**Bond parameters:** `lp_to_bond` = exact LP to bond from UTXO (0 = all incoming). `min_fire_out` = slippage protection (0 = no check). LP change returned to caller.

**epoch_start:** Set to `current_height` at deploy (not epoch_boundary). Prevents instant capacity unlock when genesis_height is in the past.

**Total claimed fire (opcode 33):** Tracks FIRE released from vesting escrow. For circulating supply: `circulating = total_supply - (total_bonded_fire - total_claimed_fire)`.

### 8. fire-price-oracle

Staking-based bond pricing via factory. No admin tuning needed.
Deployed behind upgradeable proxy (4:261 → 4:517).

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | GetPrice | public (staticcall) |
| 1 | RecordPurchase(amount) | no-op |
| 2 | Initialize(factory) | once |
| 99 | GetName | public |

**Price formula:** `price = max(total_locked_lp, 1 LP) × DECIMAL / annual_staking_emission`.
Uses halving-adjusted emission rate from active epoch index.

### 9. fire-redemption

Burn FIRE for proportional treasury LP minus 1% fee.
Deployed behind upgradeable proxy (4:260 → 4:516).

**Opcodes:**

| Opcode | Function | Auth |
|--------|----------|------|
| 0 | Initialize(fire_token, treasury) | once |
| 1 | Redeem(amount) | anyone + FIRE incoming |
| 20-24 | Views (rate, fee, preview, total redeemed) | public |
| 99 | GetName | public |

**Fee:** 1% of LP returned stays in treasury (sent back via Deposit). Strengthens floor.
**Order:** Treasury releases LP first, then FIRE burned. Prevents burn-order exploit.
