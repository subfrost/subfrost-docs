---
title: FIRE Vault
sidebar_label: FIRE Vault
sidebar_position: 5
description: Stake liquidity to earn FIRE, or buy FIRE at a discount through bonds.
---

# FIRE Vault

**FIRE** is the Alkanes governance & rewards token. It rewards the people who provide liquidity to the [DIESEL / frBTC pool](./pools-liquidity), and it is earned two ways: by **staking** your liquidity, or by **bonding**.

There is no premine. Every FIRE that exists was emitted by the protocol, and the only way FIRE leaves circulation is redemption against the treasury.

## FIRE at a glance

| Metric | Value |
| --- | --- |
| Maximum supply | 2,100,000 FIRE |
| Decimals | 8 (same as Bitcoin) |
| Premine | 0% |
| Staking pool | 85% (1,785,000 FIRE) |
| Bonding pool | 15% (315,000 FIRE) |
| Halving interval | 105,000 blocks (about 2 years) |
| Activation block | 950,420 |
| First halving | Block 1,050,000 |
| Epoch 0 length | 99,580 blocks (activation to the first halving) |

FIRE emission halves every 105,000 blocks, which is half of Bitcoin's own halving interval. Every second FIRE halving therefore lands on a Bitcoin halving.

Epoch boundaries sit on a fixed grid anchored at block 0, so they do not move to accommodate the activation block. FIRE went live at 950,420, partway through the grid epoch that ends at 1,050,000, which makes epoch 0 shorter than a full interval. Every epoch after it runs the full 105,000 blocks.

## How the vault pays you

The vault accepts **DIESEL / frBTC LP tokens**. It pays out FIRE with a reward accumulator (the standard Synthetix staking model): every block, a fixed amount of FIRE is divided pro-rata across all weighted stake. Your share of a block's emission is your weighted stake divided by the total weighted stake in the vault, so rewards accrue continuously rather than in discrete payouts.

Per-block emission in epoch 0:

| Pool | FIRE per block | Per day | Per year |
| --- | --- | --- | --- |
| Staking (85%) | 8.5 | ~1,224 FIRE | ~446,250 FIRE |
| Bonding (15%) | 1.5 | ~216 FIRE | ~78,750 FIRE |
| **Total** | **10** | **~1,440 FIRE** | **~525,000 FIRE** |

Day and year figures assume Bitcoin's average of 144 blocks per day and 52,500 blocks per year.

## The emission schedule

Every 105,000 blocks the per-block rate halves. Epoch boundaries align to a global grid anchored at block 0, not to the activation block, which is why epoch 0 below is short, and every second FIRE halving coincides with a Bitcoin halving. The 85 / 15 split between the staking pool and the bonding pool holds in every epoch.

| Epoch | Length | Total per day | Cumulative supply at epoch end |
| --- | --- | --- | --- |
| 0 | 99,580 blocks | ~1,440 FIRE | 995,800 FIRE |
| 1 | 105,000 blocks | ~720 FIRE | 1,520,800 FIRE |
| 2 | 105,000 blocks | ~360 FIRE | 1,783,300 FIRE |
| 3 | 105,000 blocks | ~180 FIRE | 1,914,550 FIRE |
| ... | ... | ... | approaches 2,045,800 FIRE |

The cumulative column is a ceiling on what the schedule releases, not a forecast of circulating supply. Emission accrues to whoever is staked at the time, so any emission in blocks where nothing was staked is simply never awarded, and it is not paid out retroactively later.

### Why the cap needs no premine

Each epoch emits exactly half of the one before it, so the total emission is an infinite geometric series bounded by the supply cap:

```
total = grid_epoch_emission x sum(1/2^i) for i = 0..infinity
      = grid_epoch_emission x 2
      = 1,050,000 x 2
      = 2,100,000 FIRE
```

That is the bound the contract is written against, and it is the maximum supply listed at the top of this page. Because FIRE activated partway through epoch 0 rather than on a grid boundary, that epoch released 995,800 FIRE instead of a full 1,050,000, and the series converges to about 2,045,800 instead. The cap stays where it is; emission simply approaches a point below it.

The schedule itself is what enforces the cap. Nothing needs to be held back at genesis to make the numbers work, which is why the premine is 0%.

## Lock multipliers

You can begin earning FIRE by locking your LP for a flexible period, earning the base rate. Lock your stake for longer to earn more (up to 1 year for a 3x multiplier). A longer lock applies a higher reward multiplier to the same amount of LP. Locks cannot extend past the current epoch's expiry.

| Lock period | Blocks | Reward multiplier |
| --- | --- | --- |
| No lock | 0 | 1.0x |
| 1 week | 1,050 | 1.25x |
| 1 month | 4,375 | 1.5x |
| 3 months | 13,125 | 2.0x |
| 6 months | 26,250 | 2.5x |
| 1 year | 52,500 | 3.0x |

The longer you commit, the larger your share of the staking emissions.

## Staking your LP

1. **Get DIESEL / frBTC LP.** Provide liquidity to the [DIESEL / frBTC pool](./pools-liquidity) first. The vault accepts that LP token and nothing else.
2. **Choose a lock duration.** Anything from no lock to one year. A higher multiplier earns proportionally more FIRE for the same LP, but your position is locked until expiry.
3. **Stake and receive an NFT position.** The NFT carries two things at once: your **FIRE yield rights** (the emissions you can claim) and your **LP claim** (the liquidity you get back at expiry).
4. **Earn every block.** Rewards accrue per block. Claim or compound whenever you want.

```
Stake(LP, lock, amount) -> NFT position (FIRE yield + LP claim)
```

## Getting your LP back

There are three exit paths, depending on how much flexibility you want.

### Unstake

Wait for the lock to expire, then unstake the NFT. You get your LP back plus all accrued FIRE.

```
Unstake(NFT) -> LP + FIRE
```

Once the lock has expired, claiming your rewards does this for you: on a position you have not split, a claim after expiry returns the FIRE **and** the LP and closes the position out. You do not need to unstake separately.

### Split into FIRE-PT

Split the NFT position into its two halves. The **NFT** keeps the FIRE yield rights. A fungible **FIRE-PT** token (**FIRE-PT-0** in the current epoch) carries the LP claim, and you can transfer or sell it on its own. Merging puts the position back together.

```
Split(NFT)           -> NFT (FIRE yield only) + FIRE-PT (fungible LP claim)
Merge(NFT + FIRE-PT) -> NFT (full position restored)
```

This is how you move the LP liquidity out without giving up the FIRE yield stream.

FIRE-PT tokens are fungible regardless of the lock type. This also implies that any FIRE-PT can be recombined with any FIRE NFT that has the corresponding amount. As a result, a bare FIRE NFT represents not only the right to earn FIRE yield, but also the right to unlock the corresponding amount of FIRE-PT before the end of the epoch.

### Redeem expired FIRE-PT

Once the epoch has expired, anyone holding FIRE-PT can redeem it straight for LP. No NFT required.

```
RedeemExpired(FIRE-PT) -> LP
```

## Bonding

Bonding is for people who want FIRE **now** instead of earning it over time. You hand the protocol LP tokens permanently, and you get FIRE at a **10% discount from market price**, vested over about **7 days** (1,050 blocks). The discount is a setting the protocol can adjust, so treat 10% as the current rate rather than a fixed rule.

Bond LP goes directly to the treasury and stays there. It is not returned, and it permanently backs the redemption floor.

In plain language, a bond is this trade: you give the protocol LP forever, and in exchange you get FIRE at a 10% discount from market price, vested over 7 days.

### The floor guard

A bond is never priced below the redemption floor. That guard exists to stop a free round-trip.

Once the treasury holds LP and FIRE has been minted, the floor price is real money. Without the guard, you could bond below the floor and immediately redeem for more LP than you put in. Because the bond price can never fall under the floor, bonding can never be cheaper than redemption:

```
Bond at floor_price    -> mint X FIRE  (LP goes into treasury)
Redeem X FIRE at floor -> burn for LP  (LP comes out of treasury)
                       = same LP back  (zero net change)
```

A bonder who redeems immediately nets zero. The 7-day vest means a bonder is betting on price appreciation, not extracting value from the protocol.

### Bonding capacity builds up over time

Bonding is metered rather than unlimited. Capacity accrues block by block from the moment the contract goes live, so shortly after launch there is little of it and a large bond may not fit. If a bond is rejected for capacity, it is not broken: wait and try again, or bond a smaller amount.

## Redemption and the price floor

Any FIRE holder can burn FIRE for a proportional share of the treasury's LP backing:

```
floor_price = total_treasury_LP / total_FIRE_supply
```

**Redeeming charges a 1% fee**, which is not paid to anyone: it stays in the treasury. So you receive about 99% of your proportional share, and the LP you leave behind raises the floor slightly for everyone still holding FIRE.

This is a hard floor, and it scales with the treasury. Every bond deposits LP that never leaves, so the floor only moves in one direction over time as bonding activity grows.

## The two reference prices

Alongside what FIRE trades at, two other numbers answer different questions.

| Price | Where it comes from | What it means |
| --- | --- | --- |
| **Oracle** | An on-chain price feed | The reference the protocol reads when it prices a bond |
| **Floor** | `treasury_LP / total_supply` | What a redeemer gets for burning FIRE |

The bond discount is measured against the **market price** of FIRE, not against the floor.

:::info[The oracle no longer depends on how much LP is staked]
It used to: the reference was derived from locked LP over annual emission, so a larger stake moved the number. That link is gone. The oracle is now a posted feed.
:::

## The flywheel

Staking, bonding, and redemption are not three separate features. They feed each other in a closed loop.

<figure class="fire-flywheel">
<svg viewBox="0 0 760 430" role="img" aria-labelledby="fire-flywheel-title fire-flywheel-desc" style="width:100%;height:auto;max-width:760px;display:block;margin:0 auto">
  <title id="fire-flywheel-title">The FIRE flywheel</title>
  <desc id="fire-flywheel-desc">A closed loop of four steps. Stakers lock DIESEL/frBTC LP, and locked LP earns the 85 percent share of each block's emission. The remaining 15 percent funds the bonding pool. Bonders pay LP for FIRE at a discount to the market price. The treasury keeps that LP permanently, which raises the floor price, and a higher floor protects holders and makes committing liquidity safer.</desc>
  <defs>
    <marker id="fire-flywheel-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0 1 L9 5 L0 9 z" fill="#EC4521"/>
    </marker>
  </defs>
  <!-- the four stages, drawn clockwise from the top -->
  <g fill="none" stroke="currentColor" stroke-width="1.25" opacity="0.4">
    <rect x="250" y="14" width="260" height="58" rx="8"/>
    <rect x="498" y="186" width="250" height="58" rx="8"/>
    <rect x="230" y="358" width="300" height="58" rx="8"/>
    <rect x="12" y="186" width="250" height="58" rx="8"/>
  </g>
  <g fill="currentColor" text-anchor="middle" font-size="13.5" font-weight="600">
    <text x="380" y="38">Stakers lock DIESEL / frBTC LP</text>
    <text x="623" y="210">FIRE is emitted each block</text>
    <text x="380" y="382">Bonders pay LP for FIRE</text>
    <text x="137" y="210">The treasury keeps that LP</text>
  </g>
  <g fill="currentColor" text-anchor="middle" font-size="11.5" opacity="0.75">
    <text x="380" y="57">the longer the lock, the more FIRE</text>
    <text x="623" y="229">85% to staking, 15% to bonds</text>
    <text x="380" y="401">at a discount to the market price</text>
    <text x="137" y="229">so the floor price rises</text>
  </g>
  <!-- the loop itself: each arrow is the consequence, not just a connector -->
  <g fill="none" stroke="#EC4521" stroke-width="1.75" marker-end="url(#fire-flywheel-arrow)">
    <path d="M508 66 Q 592 74 614 180"/>
    <path d="M622 248 Q 614 344 538 378"/>
    <path d="M228 388 Q 150 380 137 250"/>
    <path d="M134 182 Q 150 70 246 54"/>
  </g>
  <g fill="#EC4521" text-anchor="middle" font-size="11.5" font-weight="500">
    <text x="664" y="128">locked LP earns 85%</text>
    <text x="656" y="332">the 15% funds bonds</text>
    <text x="104" y="332">the LP never leaves</text>
    <text x="106" y="124">the floor protects</text>
  </g>
  <g text-anchor="middle" fill="currentColor">
    <text x="380" y="208" font-size="30" font-weight="700" letter-spacing="1">FIRE</text>
    <text x="380" y="232" font-size="11.5" opacity="0.7">fixed emission, a floor that only rises</text>
  </g>
</svg>
</figure>

| Who | Does | Which causes |
| --- | --- | --- |
| LP providers | Stake DIESEL / frBTC LP, locking longer for more FIRE | A longer lock takes a larger share of the 85% |
| Bonders | Pay LP for FIRE at a discount from market price | More bonding fills the treasury faster |
| Treasury | Keeps every bonded LP permanently | A bigger treasury raises the floor price |
| Redeemers | Burn FIRE for a proportional slice of treasury LP | The floor guard kicks in, so bonding cheaply gets harder |

Read it as a loop: locked LP earns the 85% share of each block's emission, and the remaining 15% is what bonds are paid out of; bonders hand over LP for FIRE at a discount to the market price; that LP never leaves the treasury, so the floor rises; and a higher floor both protects FIRE holders and makes committing liquidity safer, which brings the loop back to the top. The emission itself is fixed by the schedule. What the loop moves is the **floor**, in one direction only.

## Risks

| Risk | What it means for you |
| --- | --- |
| **A trusted oracle, for now** | The bond reference is posted on chain by a single signer. Federating that across signers is the intent, but it has not happened yet |
| **Empty treasury at the start** | The floor price begins at 0 and only rises as bonders deposit LP |
| **Lock illiquidity** | Locked LP cannot be withdrawn before expiry. Split into FIRE-PT if you need partial flexibility |
| **Block time variance** | Every duration here assumes Bitcoin's roughly 10-minute average block. Real elapsed time drifts |

## Tips

- **Match your lock to your conviction.** Longer locks earn proportionally more, but you cannot unwind early.
- **Use Split if you need the liquidity back.** Keep the FIRE yield on the NFT and trade the FIRE-PT.
- **Bonding is not staking.** Bonding gives you FIRE upfront and your LP is gone for good. Staking returns your LP plus rewards.
- **Watch the halving.** Emission halves every 105,000 blocks, so early epochs pay the most.
- **Treasury growth is floor growth.** The more LP that arrives through bonding, the stronger the redemption floor.

## Next steps

- [Pools & Liquidity](./pools-liquidity): get the DIESEL / frBTC liquidity you stake here.
- [Tokens & Economics](../start-here/key-concepts): where FIRE fits with frBTC and DIESEL.
