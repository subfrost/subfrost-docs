---
title: How DIESEL Fees Work
sidebar_label: How DIESEL Fees Work
sidebar_position: 9
description: How SUBFROST wallets let you pay the Bitcoin miner fee in DIESEL, inside a single transaction.
---

# How DIESEL Fees Work

The SUBFROST Chrome extension and Android app can pay a transaction's network fee in **DIESEL** instead of BTC. This page explains how that works and why it is safe. For the step-by-step in the wallet, see [Pay Fees in DIESEL](../using-subfrost/pay-fees-in-diesel).

## The problem

Bitcoin miners are paid in BTC, and only in BTC. The fee is whatever the inputs of a transaction are worth minus whatever its outputs are worth. So a wallet that holds DIESEL, frBTC or other Alkanes tokens, but no spare BTC, cannot get a transaction mined on its own.

## One transaction, two contributions

The fix is to let someone who does hold BTC add it to your transaction, and to pay them back **in the same transaction**.

That someone is a **relayer**. When you choose DIESEL as the fee, your wallet builds one Bitcoin transaction that contains:

**Inputs**

- Your own coins, the ones your action needs (for example the token you are sending).
- Your DIESEL.
- One BTC coin from a relayer. Its BTC is what pays the miner.

**Outputs**

- Whatever your action does: the payment, the swap, the wrap or the unwrap.
- Your change, back to your own address.
- The relayer's change: the part of its coin that did not go to the miner.
- An [Alkanes](./alkanes) instruction that pays your DIESEL into a protocol treasury.

So you spend DIESEL, the miner is paid in BTC, and no one takes custody of your coins in between. The fee payment needs no second transaction (an unwrap's BTC payout is still its own transaction, as always).

## Why it is safe

**It is one transaction.** Bitcoin confirms a transaction as a whole or not at all. If it does not confirm, neither the relayer's BTC nor your DIESEL moves. The Alkanes steps inside it (your action and the DIESEL payment) run in the block where it confirms. Before signing, the relayer runs those steps against the current chain and refuses to fund a transaction in which any of them fails. If a step still fails when the block is mined, for example because a swap price moved, the transaction still confirms and the tokens that step carried come back to your own address.

**Your signature covers everything.** When your wallet signs, the signature commits to every input and every output of the transaction, including the exact DIESEL amount. Nobody can change the amount, add an output or redirect a payment afterwards without breaking your signature.

**The relayer signs only its own coin.** The relayer first checks, against the current state of the chain, that the transaction repays it. Then it signs its single input. Its signature also commits to the whole transaction. Your wallet then checks that the only thing the relayer added was that signature, and that the transaction is otherwise exactly the one you signed. If anything else changed, the wallet refuses it.

**You set a cap.** Before anything is signed, the wallet shows you the fee as "up to X DIESEL". If the relayer's quote asks for more than that, the wallet stops and nothing is sent.

## How the price is set

The relayer's cost is in satoshis, and you repay it in DIESEL, so there has to be a DIESEL/BTC price.

- **The source** is the DIESEL/frBTC pool on SUBFROST. frBTC is 1:1 with BTC, so that pool prices DIESEL in satoshis directly.
- **It is a median, not a snapshot.** The price is the median of several readings of the pool taken over recent blocks, so one moment of unusual pool activity does not set it.
- **It is fixed when you get a quote.** The relayer signs the price into the quote it gives your wallet, so it does not change while your transaction is built.
- **Quotes are short-lived.** A quote is only valid for a short time. If it runs out before it is used, the wallet tells you nothing was sent and you can simply try again.

Your wallet also works out its own estimate from the same pool before asking for a quote. That estimate, plus a small margin, is the "up to" cap you approve.

## Where the DIESEL goes

Your DIESEL is paid into a **treasury contract** on-chain, whose only job is to hold the DIESEL it receives. It is pooled rather than paid to one relayer, because the repayment is owed to the relayer network as a whole.

Turning that DIESEL back into BTC is designed to happen later and separately, in the protocol's own transactions, to top up the BTC the relayers put in. None of that is part of your transaction.

## What the relayers are

Relayers are services in the SUBFROST fee network that hold small BTC coins ready to fund transactions like yours. For each quote, a relayer puts one of those coins into your transaction, gets its change back in the same transaction, and is repaid in DIESEL through the treasury. A relayer never holds your coins.

When the network is busy or has no capacity at that moment, the wallet says so and you can pay the fee in BTC as usual.

## For developers

If you build a wallet or app on Bitcoin and would like to let your users pay fees in DIESEL, integration support exists. Contact the SUBFROST team to talk about it.

## Where to go next

- [Pay Fees in DIESEL](../using-subfrost/pay-fees-in-diesel): how to use it in the wallet.
- [DIESEL](../tokens-economics/diesel): the token itself.
- [Alkanes Metaprotocol](./alkanes): how the DIESEL payment is carried in a Bitcoin transaction.
