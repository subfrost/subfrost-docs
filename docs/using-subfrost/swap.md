---
title: Swap
sidebar_label: Swap
sidebar_position: 3
description: Trade Bitcoin assets on SUBFROST, settled natively on Bitcoin.
---

# Swap

Swapping lets you trade between Bitcoin assets (BTC, frBTC, and other Alkanes tokens) against a shared liquidity pool, all settled on Bitcoin L1.

## Make a swap

1. **Select your tokens.** Choose what you are swapping **from** (You Send) and what you want to receive (You Receive).
2. **Enter an amount.** Type it in, or use the quick buttons: 25%, 50%, 75%, or Max of your balance.
3. **Review the details.** Before confirming you will see the exchange rate, the swap route, the minimum you will receive, the deadline (in blocks), your slippage tolerance, and the miner fee rate.
4. **Confirm and sign.** Tap **Swap**, then approve the transaction with your connected wallet.

## Tips

- **Start small.** If you are new to the platform, do a small swap first to get comfortable with the flow before moving larger amounts.
- **Watch price impact on larger trades.** Splitting a large swap into several smaller ones can sometimes get a better rate than one big swap all at once.

## Swap routes

- **Direct.** Both tokens share a pool, so the swap is a single hop.
- **Multi-hop.** No direct pool exists, so the swap routes through an intermediate token (for example through frBTC or DIESEL) for the best price.

## What you can swap

Today you can swap **between BTC and Bitcoin-native Alkanes assets**.

Bitcoin-native swaps are live, and so is the Bitcoin-native stablecoin (frUSD). BTC against USD trades against the frUSD/frBTC pool, which is live on mainnet. Cross-chain, through your Ethereum wallet, you can bring **USDT or USDC in**, and take the value back **out as USDC or ETH**. From there, SUBFROST will consider adding support to other high-volume cross-chain assets such as SOL and ADA.

The frUSD/frBTC pool is young and therefore shallow, so **a trade size that would be unremarkable on another pair can move the price noticeably on this one**. Read the quote you are actually given rather than the displayed exchange rate, and see [BTC/USD Commands](../api-reference/cli-sdk/btcusd) if you want to measure the pool yourself before trading.

## Next steps

- [Wrap & Unwrap](./wrap-unwrap-frbtc): how wrapping and unwrapping BTC works under the hood.
- [Pools & Liquidity](./pools-liquidity): earn fees by providing liquidity.
- [FIRE Vault](./fire-vault): stake and earn.
