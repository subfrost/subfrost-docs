---
title: Wallets
sidebar_label: Wallets
sidebar_position: 1
description: Create or connect a Bitcoin wallet for SUBFROST, manage your balances and UTXOs, and send and receive BTC.
---

# Wallets

To use SUBFROST you need a Bitcoin wallet. Today the **web app** is the way in, with mobile apps and a browser extension arriving soon.

Your wallet is where you view your assets, interact with smart contracts, manage UTXOs, track transactions, and send and receive BTC.

## Create a new wallet

To create a new wallet, view Step 2 in **[Get Started in 5 Minutes](../start-here/get-started)**.

## Restore an existing wallet

Choose **Restore Wallet** from the **Connect Wallet** menu. You can restore three ways:

- Your **12-word seed phrase**.
- A **keystore file** you exported earlier.
- A **Google Drive backup**, if you made one.

You then set a new password, and your wallet comes back with all of its addresses.

## Keeping your wallet secure

The browser wallet is encrypted with your password, and that password is required to unlock it each session. For backups you have three options:

- Export an **encrypted backup file**.
- **Reveal your seed phrase** (your password is required to do this).
- Back up to **Google Drive**.

:::warning[Keep your seed phrase safe]
Your 12-word seed phrase is the master key to your wallet. Anyone who gets it can take your funds. Never share it, never store it digitally, and never enter it on any website other than SUBFROST.
:::

## Your two addresses

SUBFROST gives you two address types, because different assets and different apps expect different formats.

| Address type | Format | What it is for |
|---|---|---|
| **Taproot** | `bc1p...` | Alkanes, Runes, BRC20s, Ordinals |
| **Native SegWit** | `bc1q...` | Sending and receiving BTC |

Both appear in the wallet header with copy buttons. Some exchanges and apps accept only one of the two formats, so having both means you can always receive funds.

## Your Portfolio

The wallet page is titled **Your Portfolio**. A summary card at the top shows your **Est. Total Value** in BTC with the approximate US-dollar equivalent underneath, and the **Send** and **Receive** buttons.

:::note[What the total does and does not include]
Est. Total Value is the cumulative estimated value of all your assets **excluding orbitals**. If you hold orbitals, the figure on this card is lower than everything you actually own.
:::

Everything you hold is then split across tabs:

| Tab | What it shows |
|---|---|
| **Tokens** | Your fungible balances: BTC and Alkanes tokens such as frBTC and DIESEL |
| **Positions** | LP tokens and staked positions |
| **NFTs** | Your Alkanes NFTs |
| **Activity** | Your transaction history |
| **UTXOs** | The individual coins behind your balance, and the tools to manage them |

An empty tab says so rather than showing nothing, so "No positions found" means you hold none, not that something failed to load.

A sixth tab, **FUEL**, appears only when your address is eligible for a FUEL allocation. If you do not see it, you are not eligible.

### Tokens

Each row is one asset, with four columns:

- **Token.** The name, and for Alkanes tokens the id underneath (for example `frBTC · 32:0` or `DIESEL · 2:0`).
- **Balance.** What you hold, with the US-dollar value underneath.
- **Available.** The part you can spend right now. Anything tied up in an unconfirmed transaction is shown below it as **Mempool**.
- **Unit price.** The current price of one unit.

Token and Balance are sortable.

## UTXO management

Bitcoin does not work like a bank balance. Your funds are a set of individual coins called UTXOs (Unspent Transaction Outputs), and this tab lets you control exactly which ones you spend.

You can filter your UTXOs by address type (Native SegWit or Taproot) or by asset type (Runes, tokens, or inscriptions), and act on them:

| Action | What it does |
|---|---|
| **Freeze** | Marks a UTXO as off limits so it is never spent by accident |
| **Unfreeze** | Makes a frozen UTXO spendable again |
| **Split** | Separates Alkanes assets from the BTC attached to them, so you can spend the BTC and keep the Alkanes |

:::tip[Protect your valuables]
If you are using your Taproot address for collectibles, freeze the UTXOs holding rare inscriptions so you never spend them as transaction fees. See [Safety](./safety) for the fuller picture.
:::

## Activity

Every transaction from your wallet, with:

- **Status.** Confirmed or pending.
- **Transaction ID.** Links out to a block explorer for the full record.
- **Date and block confirmation.**
- **Fee paid.**
- **Expandable details.** All inputs and outputs of the transaction.

## Settings

- **Network.** Your wallet points at Bitcoin Mainnet.
- **HD wallet derivation.** View your active addresses and configure how they are derived.
- **Security and backup.** Export backups and manage your seed phrase.

## Sending Bitcoin

To send BTC you provide:

1. **The recipient address.** All Bitcoin address formats are supported.
2. **The amount**, in BTC.
3. **The fee rate**: Slow, Medium, Fast, or Custom.

Review the details, then confirm. Your wallet signs the transaction and broadcasts it.

:::warning[Check unusually high fees]
The app warns you when your fee looks unusually high. Always double-check before confirming a large transaction.
:::

## Receiving Bitcoin or Alkanes

The receive screen gives you a **QR code** to scan with any mobile wallet and your **full address** with a copy button.

:::warning[Before you share your address]
Send only Bitcoin or Alkanes tokens to this address. Verify the address is correct before sending anything to it.
:::

## Mobile and browser extension (coming soon)

SUBFROST is built mobile-first, and native clients are on the way.

- **Android.** Coming soon.
- **iOS.** In review for the App Store.
- **Chrome browser extension.** In active development, working toward feature parity with the mobile app.

We will publish full setup guides for each of these when they launch officially. Until then, use the web app above.

## Next steps

- [Wrap and Unwrap BTC](./wrap-unwrap-frbtc): turn your Bitcoin into frBTC.
- [Swap](./swap): trade Bitcoin assets.
- [Safety](./safety): keep your Ordinals safe.
