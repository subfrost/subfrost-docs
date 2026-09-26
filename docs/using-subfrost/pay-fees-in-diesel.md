---
title: Pay Fees in DIESEL
sidebar_label: Pay Fees in DIESEL
sidebar_position: 10
description: Pay the Bitcoin network fee with DIESEL instead of BTC in the SUBFROST wallets.
---

# Pay Fees in DIESEL

Every Bitcoin transaction pays a network fee to the miner, and that fee is always paid in BTC. If you hold DIESEL but little or no BTC, that can leave you stuck.

The SUBFROST Chrome extension and Android app let you pay that fee **in DIESEL** instead. A relayer adds its own BTC to your transaction to pay the miner, and you pay for it in DIESEL inside **the same transaction**. You do not need to hold BTC for the fee.

Want to know how it works under the hood? See [How DIESEL Fees Work](../protocol/diesel-fees).

## Where to find it

When an action supports it, you will see a **Network fee** row with two options: **BTC** and **DIESEL**.

On both the <a href="https://chromewebstore.google.com/detail/subfrost/pcmlnnfmcdmaifmleedbhomhaeldkeen" target="_blank" rel="noopener noreferrer">Chrome extension</a> and <a href="https://subfrost.io/download/android" target="_blank" rel="noopener noreferrer">Android app</a>, the row is on the **Send** screen and **Swap** screen.

BTC is the default. If you do not have enough BTC to pay the fee, the wallet switches to DIESEL for you and says so: *"Not enough BTC for the fee. DIESEL is selected."*

## Reviewing the fee

When you pick DIESEL and continue, the review shows the fee as **up to X DIESEL**. In the extension it reads *"Paid in DIESEL, up to X DIESEL"*.

That number is a **cap**, not a fixed price:

- The wallet estimates the fee from the current DIESEL price, then adds a small margin on top. That is the "up to" figure you see on the review.
- The actual charge is set by the fee quote, and it can be lower than the cap.
- If the quote comes back **higher** than the cap you approved, the wallet stops and nothing is sent. You will see *"The DIESEL price moved above what you approved. Nothing was sent."*

:::note[Keep your DIESEL in your taproot address]
The fee is paid from the DIESEL in your taproot address. If there is not enough there, you will see *"Not enough DIESEL in your taproot address for this fee."*
:::

While the wallet works, it shows its progress with messages such as *Reading your coins…*, *Connecting to the fee network…*, *Reading the DIESEL price…*, *Getting a fee quote…*, *Signing…* and *Adding the fee…* (the Android app shows fewer of these).

## What you can pay for in DIESEL

In both the Chrome extension and the Android app:

- **Send BTC** to one recipient.
- **Send a token** to one recipient.
- **Swap** one token for another.
- **Wrap** BTC to frBTC.
- **Unwrap** frBTC to BTC.

The Android app also supports it when you trade frBTC and frUSD in the [BTCUSD Pool](./btcusd-pool).

When you unwrap with a DIESEL fee, the review adds a line: *"You receive X BTC, minus the payout transaction's fee."* The payout of your BTC is a separate transaction, and its own fee comes out of the amount you unwrap.

## What is not supported

The DIESEL option is greyed out, with a short reason under it, in these cases:

- **Sending to more than one recipient.** *"DIESEL fee works with one recipient."*
- **Swaps with BTC on one side**, other than a plain wrap or unwrap. *"DIESEL fee is not available for swaps with BTC."* Swap from frBTC instead, or pay this one in BTC.
- **Hardware wallets** in the Android app. *"DIESEL fee is not available for hardware wallets."*
- **Networks other than mainnet.** *"DIESEL fee works on mainnet only."*

**Transactions a dApp asks you to sign** always pay their fee the normal way, in BTC. The DIESEL fee is only for actions you start inside the wallet.

## When DIESEL is unavailable

The fee is paid with the help of a network of relayers. When the wallet opens a Send or Swap screen, it quietly checks whether that network can take a DIESEL payment right now.

If it cannot, the wallet tells you and leaves BTC selected:

- *"DIESEL fee unavailable right now. BTC only for now."*
- *"The fee network is busy right now. Pay the fee in BTC or try again in a minute."*
- If you are also short of BTC: *"Not enough BTC for the fee, and paying in DIESEL is unavailable right now."* In that case add a little BTC, or try again later.

## If something goes wrong midway

Most problems happen before anything is sent, and the wallet says so plainly. Messages that end in **"Nothing was sent."** mean your coins did not move. You can try again, or pay in BTC.

For example, a fee quote is only valid for a short time. If it runs out first, you will see *"The fee quote expired before it could be used. Nothing was sent. Try again."*

There is one case to handle with care. If you already signed and the fee network then did not answer, you will see:

> *"The fee network did not answer after you signed. Check transaction … in the explorer before sending again."*

Your transaction may still go through. **Look up that transaction in the explorer before you try again.** If it confirmed, you are done. In this case the wallet does not switch you to a BTC fee on its own. Do not resend until you have checked, or you may pay twice.

## FAQ

**Do I need any BTC at all?**
Not for the fee. For **Send BTC** and **Wrap**, you still need the BTC you are sending or wrapping.

**Is the price fixed when I approve?**
The cap is. You approve "up to X DIESEL", and the wallet will not go above it. The final charge can be lower.

**Why does it say "up to" instead of an exact number?**
The exact amount comes from a fresh quote a moment after you approve. The cap protects you if the price moves in between.

**Is this a separate transaction or a loan?**
Neither. The relayer's BTC and your DIESEL payment are in the same Bitcoin transaction. See [How DIESEL Fees Work](../protocol/diesel-fees).

**Can I use it with a dApp?**
No. Requests from dApps pay their fee in BTC.

**Where does my DIESEL go?**
It is paid into a protocol treasury on-chain. [How DIESEL Fees Work](../protocol/diesel-fees) explains the details.

## Next steps

- [How DIESEL Fees Work](../protocol/diesel-fees): the design behind this feature.
- [DIESEL](../tokens-economics/diesel): what DIESEL is and how it is issued.
- [Wallets](./wallets): sending, receiving and managing your balances.
