# FIRE Token System - Comprehensive Tokenomics

## Executive Summary

FIRE is a utility token that meters production based on timelocked LP positions in the DIESEL/frBTC pool on oyl-amm. The system creates sustainable value through multiple interconnected mechanisms:

1. **LP Staking with Timelocks** - Earn FIRE by staking DIESEL/frBTC LP tokens
2. **Bonding** - Purchase FIRE at a discount with LP tokens (protocol-owned liquidity)
3. **Redemption Floor** - Burn FIRE for treasury backing (price floor guarantee)

---

## Token Supply

| Metric | Value |
|--------|-------|
| **Maximum Supply** | 2,100,000 FIRE |
| **Decimals** | 8 (like Bitcoin) |
| **Premine** | 0% |
| **Emission** | 100% (staking + bonding) |

### Supply Distribution

```
Total Max Supply: 2,100,000 FIRE
├── Staking Emission Pool (85%): 1,785,000 FIRE
└── Bonding Emission Pool (15%):   315,000 FIRE
```

No FIRE exists at genesis. All tokens enter circulation through staking rewards and bonding.

---

## FIRE Pricing Model — No AMM

**Important: FIRE has no secondary market or AMM swap.** The token only flows through three protocol mechanisms:

- **Staking** — earn FIRE as emission rewards (over time)
- **Bonding** — receive FIRE upfront in exchange for LP (with vesting)
- **Redemption** — burn FIRE for proportional treasury backing

There is no FIRE/BTC pool, no DEX listing, no swap path. The closest analog to a "price" comes from the staking-based oracle:

```
oracle_price (LP per FIRE) = effective_staked_LP / annual_staking_emission
                           = max(total_locked_LP, MIN_REF) / 446,250 FIRE/year
```

Where `total_locked_LP` counts **only LP staked with lock ≥ 6 months** (raw amount, multiplier-independent). Stakes with shorter locks (no-lock, week, month, 3-month) do not affect the oracle price.

This represents the **opportunity cost of long-term staking**: how much LP a 6+ month staker would need to lock for one year to earn 1 FIRE at the current emission rate. Short-term flippers do not influence pricing — only "skin-in-the-game" stakers do.

### Pricing examples

| Total LP staked (TVL) | Oracle price (LP per FIRE) | Interpretation |
|-----------------------|----------------------------|----------------|
| 1 LP (bootstrap min)  | **224**                    | 224 LP staked 1yr → 1 FIRE (cheap) |
| 1,000 LP              | ~22,409                    | 22.4K LP/yr to earn 1 FIRE |
| 10,000 LP             | ~224,089                   | 224K LP/yr to earn 1 FIRE |
| 100,000 LP            | ~2,240,896                 | 2.24M LP/yr to earn 1 FIRE |

**More stakers → higher oracle price → FIRE becomes more expensive to bond.**

### Two reference prices

1. **Oracle (staking-derived)** — what stakers earn over a year
2. **Floor (treasury-derived)** — what redeemers get when they burn FIRE
   ```
   floor_price = total_treasury_LP / total_FIRE_supply
   ```

Both prices co-exist, and bonding uses `max(oracle × (1 − discount), floor)` to prevent profitable bond-redeem arbitrage.

### Why this matters for bonders

When a UI says "10% discount" or "0% bonus", it must specify **vs what**:
- vs oracle (staking opportunity cost): typically ~10% discount
- vs floor (treasury redemption value): typically ~0% (by design — no arbitrage)
- vs "market": **there is no market** — comparison is meaningless without context

A bond is essentially "I give the protocol LP forever, in exchange for FIRE at a 10% discount to the year-equivalent staking yield, vested over 7 days."

---

## Emission Schedule

FIRE halving occurs every 105,000 blocks, synchronized with Bitcoin block heights.
Epoch boundaries align to a global grid anchored at block 0 (multiples of 105,000).
The first FIRE halving coincides with the next Bitcoin halving (block 1,050,000).
Every other FIRE halving thereafter also coincides with a Bitcoin halving (every 210,000 blocks).

### Emission Rate by Epoch

| Epoch | Blocks | Staking/day | Bonding/day | Total/day | Cumulative |
|-------|--------|-------------|-------------|-----------|------------|
| 0 | 0-104,999 | ~1,224 FIRE | ~216 FIRE | ~1,440 FIRE | 1,050,000 |
| 1 | 105,000-209,999 | ~576 FIRE | ~144 FIRE | ~720 FIRE | 1,575,000 |
| 2 | 210,000-314,999 | ~216 FIRE | ~72 FIRE | ~360 FIRE | 1,837,500 |
| 3 | 315,000-419,999 | ~144 FIRE | ~36 FIRE | ~180 FIRE | 1,968,750 |
| ... | ... | ... | ... | ... | 2,100,000 (cap) |

### Per-Block Emission Rates

| Pool | Rate (base units/block) | Daily (FIRE) | Annual (FIRE) |
|------|-------------------------|--------------|---------------|
| Staking (85%) | 850,000,000 | ~1,224 | ~446,250 |
| Bonding (15%) | 150,000,000 | ~216 | ~78,750 |
| **Total** | **1,000,000,000** | **~1,440** | **~525,000** |

### Geometric Convergence

Each epoch emits half the previous. The geometric sum converges:

```
total = epoch_0_emission x sum(1/2^i) for i=0..inf
      = epoch_0_emission x 2
      = 1,050,000 x 2
      = 2,100,000 FIRE = MAX_SUPPLY
```

---

## Lock Multipliers

Users who lock their LP tokens for longer periods earn higher emission rates:

| Lock Duration | Blocks | Multiplier | Effective Rate |
|---------------|--------|------------|----------------|
| No lock | 0 | 1.0x | base_rate |
| 1 week | 1,050 | 1.25x | 1.25 x base |
| 1 month | 4,375 | 1.5x | 1.5 x base |
| 3 months | 13,125 | 2.0x | 2.0 x base |
| 6 months | 26,250 | 2.5x | 2.5 x base |
| 1 year | 52,500 | 3.0x | 3.0 x base |

Lock durations derived from HALVING_INTERVAL (105,000 blocks).
Lock cannot exceed epoch expiry.

### Weighted Stake Formula (Synthetix accumulator)

```
reward_per_token += emission_rate x blocks x PRECISION / total_weighted_stake
user_fire_earned = weighted_amount x (reward_per_token - user_checkpoint) / PRECISION
```

### wLP (Wrapped LP)

Staking produces an NFT position (FIRE yield rights) with embedded wLP (LP claim).
Users can optionally Split the NFT to extract wLP as a fungible token:

```
Stake(LP) → NFT (full position)
Split(NFT) → NFT (FIRE only) + wLP (LP claim, fungible)
Merge(NFT + wLP) → NFT (full position)
```

wLP enables LP liquidity while maintaining staking position.
After epoch expiry, wLP redeems LP directly without NFT.

---

## Contract Architecture

### 1. fire-token (4:256)
The base FIRE token contract with capped supply and dual emission pools.

**Key Features:**
- Maximum supply of 2.1M FIRE enforced at contract level
- Two independent emission pools: staking (85%) and bonding (15%)
- Staking contract mints via opcode 77 (MintFromStakingPool)
- Bonding contract mints via opcode 78 (MintFromBondingPool)
- No mint at initialization — total_supply starts at 0
- Burn functionality for redemption mechanism

**Opcodes:**
| Opcode | Function | Description |
|--------|----------|-------------|
| 0 | Initialize | Set staking and bonding contracts as authorized minters |
| 77 | MintFromStakingPool | Mint FIRE from staking pool (staking contract only) |
| 78 | MintFromBondingPool | Mint FIRE from bonding pool (bonding contract only) |
| 88 | Burn | Burn FIRE tokens |
| 99-104 | View Functions | Name, Symbol, Supply, Pool remaining |

### 2. fire-staking (4:257)
Timelocked LP staking gauge for FIRE emissions.

**Key Features:**
- Accept DIESEL/frBTC LP tokens
- Enforce timelocks with multiplier boosts
- Synthetix-style reward accumulation (per block)
- Position token architecture (NFT receipts)
- Block-height based reward math

**Opcodes:**
| Opcode | Function | Description |
|--------|----------|-------------|
| 0 | Initialize | Setup with LP token, FIRE token, position template |
| 1 | Stake | Stake LP with optional lock duration (in blocks) |
| 2 | Unstake | Withdraw LP (after lock expires) |
| 3 | ClaimRewards | Claim pending FIRE rewards |
| 5 | UpdateEpoch | Trigger halving check |
| 12-36 | View Functions | Staked amounts, epoch, emission rate, position info |

### 3. fire-treasury (4:258)
Minimal passive treasury. Holds LP backing for redemption floor.

**Key Features:**
- Only holds diesel LP tokens as backing
- Only function is redemption backing release
- No admin withdrawal, no allocations, no vesting
- Fills organically via bonding LP deposits
- Trustless — only authorized contracts can interact

**Opcodes:**
| Opcode | Function | Description |
|--------|----------|-------------|
| 0 | Initialize | Setup with FIRE token and diesel LP token |
| — | (immutable: bonding/redemption set at init) | — |
| 10 | Deposit | Accept LP/tokens into treasury |
| 11 | RedeemBacking | Release backing (redemption contract only) |
| 23 | GetRedemptionRate | LP per FIRE, scaled by 1e8 |
| 24 | GetTotalBacking | Total LP held |

### 4. fire-bonding (4:259)
Bond LP tokens for discounted FIRE with vesting. Mints directly from bonding emission pool.

**Key Features:**
- Pricing via staking-based oracle (LP locked ≥ 6mo / annual emission)
- Default vesting: 1,050 blocks (~7 days), WEEK = HALVING_INTERVAL / 100
- LP goes to treasury (protocol-owned liquidity)
- Mints FIRE directly from bonding emission pool (opcode 78)
- Price floor guard: bond_price = max(oracle_discounted, floor)
- Queries treasury GetRedemptionRate for floor price

**Opcodes:**
| Opcode | Function | Description |
|--------|----------|-------------|
| 0 | Initialize | Setup with token addresses, oracle, bond template |
| 1 | Bond | Bond LP for discounted FIRE |
| 2 | ClaimVested | Claim vested FIRE from bond position |
| 4 | SetDiscount | Admin: adjust discount rate |
| 5 | SetVestingPeriod | Admin: adjust vesting period (blocks) |
| 6 | SetPaused | Admin: pause/unpause bonding |
| 7 | SetPriceOracle | Admin: replace the price oracle contract |
| 23-31 | View Functions | Discount, price, bond info |

### 5. fire-price-oracle (4:261)
Staking-based bond pricing. Fully on-chain, no admin tuning.

**Key Features:**
- Price = `max(total_locked_lp, 1 LP) × DECIMAL / annual_staking_emission`
- Uses halving-adjusted emission rate from active epoch
- Reads factory → active staking clone → total_locked_lp (only ≥6 month locks count)
- Fail-closed: reverts on factory/staking errors instead of returning fallback price
- RecordPurchase = no-op (staking-based, no virtual reserves)
- Immutable after init (no admin opcodes)

### 6. fire-redemption (4:260)
Burn FIRE for treasury backing (price floor). No cooldown.

**Key Features:**
- 1% default redemption fee (max 10%)
- No cooldown — redemption is self-limiting via fee
- Proportional share of treasury diesel LP tokens
- Creates hard price floor
- Treasury call before burn (prevents share inflation exploit)

**Opcodes:**
| Opcode | Function | Description |
|--------|----------|-------------|
| 0 | Initialize | Setup with FIRE token and treasury |
| 1 | Redeem | Burn FIRE for backing |
| 2 | SetFee | Admin: adjust fee (max 10%) |
| — | (immutable: fee, min redemption set at init) | — |
| 20-24 | View Functions | Rates, fees, previews |

---

## Price Mechanisms

### Market Price Arbitrage

The FIRE price on open market relates to staking yields through arbitrage:

```
If market_price < staking_yield_value:
    -> Buy FIRE on market (cheaper than earning it)
    -> Reduced staking activity
    -> Lower dilution
    -> Price increases

If market_price > staking_yield_value:
    -> Stake LP to earn FIRE
    -> Sell FIRE on market
    -> Price decreases toward equilibrium
```

### Price Floor (Redemption)

```
floor_price = treasury_backing / total_fire_supply

Example:
- Treasury: 100,000 LP tokens
- FIRE Supply: 1,000,000
- Floor: 0.1 LP per FIRE

If market price drops below floor:
    -> Arbitrageurs buy FIRE
    -> Redeem for LP backing
    -> Profit = backing_value - market_price
```

### Bonding Price (Staking-Based Oracle)

```
oracle_price    = max(total_locked_lp, 1 LP) × DECIMAL / annual_staking_emission
effective_price = oracle_price × (10000 - discount_bps) / 10000   // 10% off oracle
bond_price      = max(effective_price, floor_price)                // floor guard

FIRE_out = LP_in × DECIMAL / bond_price

Users bond LP when:
    -> bond_price < expected 1yr staking return (at base rate)
    -> Willing to accept vesting for 10% discount vs oracle
```

The oracle price scales linearly with locked LP. More long-term stakers → higher FIRE price → less FIRE per LP bonded → treasury accumulates more LP per unit of emission. Bonding is equivalent to 1 year of base-rate staking with a 10% bonus, but LP goes to treasury permanently.

#### Live example (mainnet 2026-05-26, first bond)

Bonder sent **818 base LP** when oracle = 224, discount = 10%, floor = 0:
- effective = 224 × 0.9 = **201.6** (LP per FIRE)
- bond_price = max(201.6, 0) = 201.6
- FIRE_out = 818 × 10⁸ / 201.6 = **406,965,174 base** = **4.07 FIRE**

By comparison: 818 LP staked at full year-lock (3× multiplier) over 1 year would earn ~3.65 FIRE. The bond gives 4.07 FIRE upfront (after 7-day vest) — that's the 10% bonus the discount provides.

#### Why floor guard exists

After the first bonds, treasury has LP and FIRE is minted → `floor_price = treasury_LP / total_FIRE` becomes meaningful. The guard `max(effective, floor)` ensures bonding can never be cheaper than redemption, preventing arbitrage:

```
Bond at 201.6 → mint 4.07 FIRE   (LP into treasury)
Redeem 4.07 FIRE → burn for floor LP  (LP out of treasury)
                = 4.07 × floor = same LP back (zero net change)
```

A bonder who immediately redeems gets neutral outcome — the system locks them into the 7-day vest where they bet on future price appreciation.

---

## Security Features

### Access Control
- Auth token-based admin functions
- Authorized contract lists for cross-contract calls
- Only-owner modifiers for sensitive operations

### Anti-Gaming
- Minimum redemption amounts
- Vesting on bonded FIRE (1,050 blocks default)
- Lock enforcement on staked positions
- Bond price floor guard (accretive-only bonding)
- Redemption fee (1% default) makes spam unprofitable

### Supply Protection
- Hard cap at 2.1M FIRE enforced in token contract
- Dual emission pool tracking prevents over-minting
- Burn mechanism for redemption
- Treasury call before burn prevents share inflation exploit

---

## Deployment Order (Proxied)

All contracts deployed behind upgradeable proxies. See `scripts/deploy-proxied.sh`
(regtest) and `scripts/deploy-mainnet.sh` (mainnet, production-hardened).

1. **FIRE master auth** (4:255) — `fire-master-auth` mints 1 unit of FIRE-AUTH to deployer
2. **Logic implementations** (4:512-518, 4:521) — bare WASM bytecodes
3. **Immutable templates** — bond-token (4:263), wLP series-token (4:264)
4. **Shared CREATECHILD templates** — beacon-proxy (4:520, shared by staking + position),
   fire-upgradeable (4:530), fire-upgradeable-beacon (4:531)
5. **Beacons** — staking and position, CREATECHILD-spawned at dynamic `2:N`
6. **Upgradeable proxies** — 6 singletons (token / factory / treasury / bonding /
   redemption / oracle), CREATECHILD-spawned at dynamic `2:N`, all bound to master auth.
   IDs recorded in `.deploy-ids.env`.
6. **Initialize** all contracts through their proxy addresses (master auth in incoming)
7. **CreateNextEpoch** — epoch 0 via beacon-proxy clone

A **single master auth NFT** (4:255, 1 unit) controls upgrades on every proxy and
beacon. Holder calls opcode 32766 (`upgrade`/`upgrade_to`) with the NFT in
incoming_alkanes to swap implementation. Treasury authorization is set at init
(bonding + redemption); no post-deploy setup needed.

---

## Key Constants

```rust
// Halving (synchronized with Bitcoin)
BITCOIN_HALVING: 210,000 blocks
HALVING_INTERVAL: 105,000 blocks (Bitcoin / 2)

// Block durations (derived from HALVING_INTERVAL)
WEEK: 1,050 blocks
MONTH: 4,375 blocks
THREE_MONTHS: 13,125 blocks
SIX_MONTHS: 26,250 blocks
YEAR: 52,500 blocks

// Supply (with 8 decimals)
MAX_SUPPLY: 210,000,000,000,000 units (2.1M FIRE)
STAKING_EMISSION_POOL: 178,500,000,000,000 units (1.785M FIRE — 85%)
BONDING_EMISSION_POOL: 31,500,000,000,000 units (315K FIRE — 15%)

// Rates (per block, epoch 0)
STAKING_EMISSION_RATE: 850,000,000 units/block (~1,224 FIRE/day)
BONDING_EMISSION_RATE: 150,000,000 units/block (~216 FIRE/day)

// Bonding
DEFAULT_DISCOUNT_BPS: 1000 (10%)
DEFAULT_VESTING_PERIOD: 1,050 blocks (~7 days)
// Vesting period immutable at deploy (no admin change)

// Redemption
DEFAULT_REDEMPTION_FEE_BPS: 100 (1%)
MAX_FEE_BPS: 1000 (10%)
MIN_REDEMPTION: 100,000,000 (1 FIRE)
```

---

## Economic Flywheel

```
                    +------------------+
                    |  LP Providers    |
                    | (DIESEL/frBTC)   |
                    +--------+---------+
                             |
                    Stake LP | Earn FIRE
                             v
+---------------+     +----------------+     +---------------+
|   Bonding     |---->|  FIRE Supply   |<----|  Staking      |
|  (Discount)   |     |  (85/15 split) |     |  Emission     |
+-------+-------+     +-------+--------+     +---------------+
        |                      |
        |                      | Price
        |                      v
        |              +----------------+
        |              |  FIRE Market   |
        |              |   (FIRE/BTC)   |
        |              +-------+--------+
        |                      |
        v                      | If below floor
+---------------+              v
|  Treasury     |<-----+----------------+
|   (POL)       |      |  Redemption    |
|               |----->|  (Price Floor) |
+---------------+      +----------------+
```

---

## Risk Considerations

1. **Pricing Model Risk** - Bonding price is derived from staking oracle (locked LP / annual emission); bootstrap period with low locked LP gives very cheap FIRE until significant long-term staking commitment
2. **Empty Treasury Start** - With 0% premine, treasury starts empty; floor price is 0 until bonding deposits LP
3. **Lock Illiquidity** - Timelocked LP cannot respond to market conditions
4. **Block Time Variance** - Bitcoin block times vary; emission rates assume 10-min average

---

## Future Considerations

- Governance token functionality
- Additional LP pair support
- Dynamic emission adjustments
- DAO-controlled treasury parameters
- Permanent lock mechanism (veFIRE)
