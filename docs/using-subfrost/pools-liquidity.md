---
title: Pools & Liquidity
sidebar_label: Pools & Liquidity
sidebar_position: 4
description: Provide liquidity to SUBFROST pools and earn a share of swap fees.
---

# Pools & Liquidity

Every swap on SUBFROST trades against a **liquidity pool**: a shared reserve of two tokens that anyone can contribute to. When you provide liquidity to a pool, you deposit a pair of tokens and earn a share of the fees that the pool generates (from people swapping through it).

## How it works

- A pool holds two assets (for example DIESEL and frBTC). The price adjusts automatically as people trade, so you always have a counterparty.
- When you add liquidity, you receive an **LP position** representing your share of the pool.
- As swaps happen, they pay a fee that accrues to the pool, so your position grows over time.
- You can withdraw your liquidity (plus accrued fees) at any time by redeeming your LP position.

## The swap fee, and what you earn

A swap pays **1% by default**, split two ways:

| Share | Rate | Goes to |
| --- | --- | --- |
| Liquidity providers | 0.8% | the pool, so it accrues to your position |
| Protocol | 0.2% | permanently to the AMM protocol |

So **as a liquidity provider you earn 0.8% of the volume that trades through your pool**, in proportion to your share of it.

## Providing liquidity

1. Click **"Liquidity"** on the swap page to add positions to a pool.
2. On the **Add** tab, choose the pair you want to provide.
3. Deposit the two tokens in the pool's ratio. The app fills in the paired amount for you and shows the **Minimum Deposit**.
4. Confirm and sign. You now hold an LP position and start earning a share of that pool's swap fees.

## Removing liquidity

1. Click **"Liquidity"** on the swap page and switch to the **Remove** tab.
2. Choose the **LP position** you want to remove.
3. Set the **Amount to Remove**. The app shows the **Minimum Received** for each of the two tokens, quoted against current reserves.
4. Confirm and sign. Your share of the pool, plus the fees it accrued, returns to your wallet.

## Next steps

- [FIRE Vault](./fire-vault): stake your LP and earn FIRE, or buy FIRE through bonds.
- [Swap](./swap): the other side of the pool.
