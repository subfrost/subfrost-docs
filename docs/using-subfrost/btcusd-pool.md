---
title: BTCUSD Pool
sidebar_label: BTCUSD Pool
sidebar_position: 5
description: The frUSD/frBTC pool, where BTC trades against the dollar without leaving Bitcoin.
---

# BTCUSD Pool

The BTCUSD pool is the frUSD/frBTC market: the place where **Bitcoin trades against the dollar, settled on Bitcoin L1**.

Trading BTC against a dollar has always meant leaving the Bitcoin blockchain, until now. We brought this pair directly to Bitcoin with [frUSD](../tokens/frUSD-overview) and [frBTC](../tokens/frBTC-overview), but the user doesn't have to have either one first... just BTC or USDT/USDC.

## What trades in it

| Side | Asset | What it is |
| --- | --- | --- |
| USD | `frUSD` | The dollar on Bitcoin, fully reserved, and redeemable back out to Ethereum once the exit is screened and signed ([details](../tokens/frUSD-overview)) |
| BTC | `frBTC` | Your BTC on Bitcoin, fully reserved, and redeemable back to native BTC after 3 to 7 block confirmations ([details](../tokens/frBTC-overview)) |

You do not have to hold either one first. Swapping from BTC wraps it for you on the way in, and bridging USDT or USDC from Ethereum mints frUSD on arrival.

## Make a trade

Trading the pool is an ordinary swap. On the [Swap](./swap) page, pick what you are paying with and what you want to receive, and the app routes it through this pool for you.

Two things worth reading before you confirm:

- **Read the amount you receive, at the size you actually intend to trade.** Once you enter an amount, the rate on the screen is derived from that quote, so it already carries your size and the fee.
- **Check the minimum received.** That is your floor if the price moves between signing and confirmation, and it is what your slippage tolerance sets.

## A different kind of pool

Most SUBFROST pools are standard constant-product AMMs. This one is a **CryptoSwap pool** (the Curve V2 design), which changes two things you can feel.

**Liquidity is concentrated rather than spread evenly.** A constant-product pool spreads its depth across every price from zero to infinity. A CryptoSwap pool holds most of its depth around a reference price it maintains internally, and moves that reference as the market moves.

**The fee moves instead of being fixed.** It is currently **0.2% to 0.8%**, set by how balanced the pool is left after your trade. A trade that leaves the two sides closer to even pays the low end; one that pushes them apart pays the high end. The trade that restores balance is the cheaper one, and the quote you are shown already has the pool's fee in it.

## Providing liquidity

You can supply both sides of the pool and earn a share of what it charges. The flow is the same as any other pool and lives on the [Liquidity](./pools-liquidity) tab of the swap page.

:::info This pool splits its fee differently

Half of what this pool charges accrues to the protocol, so liquidity providers keep roughly **0.1% to 0.4%** of the volume, unlike the 0.8% a standard SUBFROST pool pays. [Pools & Liquidity](./pools-liquidity) has the details and is the page to read before you deposit.

:::

Your position is represented by an **LP token**, which is the pool contract itself (`4:1778`). It carries 18 decimals.

## Getting money in and out from Ethereum

The pool is on Bitcoin, but you can fund it from an Ethereum wallet and take value back the same way.

- **In:** deposit USDC or USDT through the frUSD bridge and receive frUSD on Bitcoin. You can ask for part of the deposit to arrive as native BTC, which is especially helpful if your wallet is empty and wouldn't be able to pay network fees.
- **Out:** burn frUSD back to a stablecoin on Ethereum, optionally taking part of it as ETH so a fresh address has gas to move with. If the network cannot execute the ETH part, it pays the whole redemption as the stablecoin instead.

Both directions charge a flat fee plus a small percentage, and there is a minimum size, so one larger trip costs less than several small ones. [frUSD Overview](../tokens/frUSD-overview) has the current numbers.

:::note Asking for a lot of BTC for USDT or USDC? You may get frUSD instead

If the BTC you want to swap for exceeds 10% of the pool's frUSD, the whole deposit arrives as frUSD instead. Nothing is lost and the deposit still goes through. To get BTC, ask for a smaller BTC part, or bridge first and swap afterwards.

:::

## Pool details

| | |
| --- | --- |
| Pool | `4:1778`, which is also the LP token, 18 decimals |
| frUSD | `4:1776`, 8 decimals |
| frBTC | `32:0`, 8 decimals |
| Design | CryptoSwap (Curve V2) |
| Swap fee | Currently 0.2% to 0.8%, by resulting balance. Not an invariant: read it from the [pool API](../api-reference/json-rpc/btcusd) |

Reading the pool, quoting a trade at a given size, or preparing a bridge deposit from the command line is covered in [BTC/USD Commands](../api-reference/cli-sdk/btcusd).

## Next steps

- [Swap](./swap): the trading flow itself, and how routes are chosen.
- [Pools & Liquidity](./pools-liquidity): what providing liquidity to this pool pays.
- [frUSD Overview](../tokens/frUSD-overview): the dollar on the USD side of the pair.
- [frBTC Overview](../tokens/frBTC-overview): the Bitcoin on the BTC side.
- [BTC/USD Commands](../api-reference/cli-sdk/btcusd): the same pool from the command line.
- [BTC/USD Pool API](../api-reference/json-rpc/btcusd): live pool state over JSON-RPC.
