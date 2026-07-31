---
title: Get Started in 5 Minutes
sidebar_label: Get Started in 5 Minutes
sidebar_position: 2
description: Pick a wallet, add Bitcoin, and make your first swap on SUBFROST.
---

# Get Started in 5 Minutes

This guide takes you from zero to your first swap. You will pick how to access SUBFROST, set up a wallet, and swap some Bitcoin.

## Step 1: Open SUBFROST

The easiest way to start today is the **web app**. Native clients are on the way:

- **<a href="https://app.subfrost.io" target="_blank" rel="noopener noreferrer">Web app</a>.** Available now, and the recommended way to get started right now.
- **Android.** Coming soon.
- **iOS.** Coming soon (in App Store review).
- **Chrome Browser extension.** Coming soon.

For this guide we will use the web app. See [Wallets](../using-subfrost/wallets) for details on each option.

## Step 2: Set up a wallet

You have two paths. Either works.

### Create a new SUBFROST wallet (recommended for newcomers)

1. Open the Connect Wallet menu and choose **Create New Wallet**.
2. Set a strong password (at least 8 characters).
3. **Write down your 12-word recovery phrase** and store it somewhere safe and offline. This phrase is the only way to recover your funds.
4. Optionally, back up to Google Drive for convenience.

### Or connect a wallet you already have

SUBFROST connects to popular Bitcoin wallets, including **OKX, Unisat, and Xverse**. Open **Connect Wallet**, pick your provider, and approve the connection.

:::caution[Burn risk: use a separate wallet for Ordinals, Runes and BRC-20]
SUBFROST does not index `ord` at this time. You must transfer Ordinals, Runes and BRC-20 assets to a different wallet before interacting with our apps. Those assets live on a specific coin (a UTXO) that SUBFROST cannot see, so if it gets spent in the course of ordinary activity, the asset on it is gone. See [Safety](../using-subfrost/safety).
:::

## Step 3: Add Bitcoin

You do not have to manually wrap your BTC. When you swap from BTC, the app atomically wraps your Bitcoin into frBTC and performs the swap in a single step. The wrapping is completely abstracted away.

If you just want frBTC directly, wrapping is a 1:1 conversion.

## Step 4: Make your first swap

1. **Select your tokens.** Choose what you are swapping **from** (You Send) and what you want to receive (You Receive).
2. **Enter an amount.** Type it in, or use the quick buttons: 25%, 50%, 75%, or Max of your balance.
3. **Review the details.** Before confirming you will see the exchange rate, the swap route, the minimum you will receive, the deadline (in blocks), your slippage tolerance, and the miner fee rate.
4. **Confirm and sign.** Tap Swap, then approve the transaction with your connected wallet.

:::tip[Start small]
If you are new to the platform, do a small swap first to get comfortable with the flow before moving larger amounts.
:::

:::info[Swapping back to BTC takes a few blocks]
When you swap into native BTC, the protocol waits **3 to 7 block confirmations** before sending it. That wait protects the Bitcoin reserve against a chain reorg. See [Wrap & Unwrap](../using-subfrost/wrap-unwrap-frbtc) for why.
:::

## Where to go next

- **[Key Concepts](./key-concepts):** understand frBTC, DIESEL, FIRE, and the rest.
- Explore pools, the FIRE vault, and more in the **[Using SUBFROST](../using-subfrost/wallets)** guides.
