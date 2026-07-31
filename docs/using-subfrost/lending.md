---
title: Lending
sidebar_label: Lending
sidebar_position: 7
description: Lend your tokens to earn interest, or borrow against collateral, settled peer-to-peer on Bitcoin L1.
---

# Lending

Lending lets you **lend out your tokens to earn interest** or **borrow tokens against collateral**, directly on Bitcoin L1. It is peer-to-peer: you set your own terms and match with another user. There are no pools, no middlemen, and your funds stay in your wallet until a match happens.

## Lending at a glance

| Property | Value |
| --- | --- |
| Model | Peer to peer, fixed rate, fixed term |
| Settlement | A single Bitcoin transaction |
| Posting an offer | Instant, a small network fee, not settled on chain |
| Who pays to settle | The taker (the person who accepts an offer) |
| Protocol fee | 3,000 sats per loan, paid at settlement |
| Interest | Fixed at creation, computed from APR and duration |
| Term | Measured in blocks |
| Liquidation | None. No margin calls on an active loan |
| Custody | None. There is no custodian and no admin key |

## How it works

Lending has two sides, and you can be either one:

- **Lenders** post a **loan offer**: "I will lend X token at this rate, if you put up Y collateral."
- **Borrowers** post a **loan request**: "I want to borrow X token and I will put up Y collateral."

Whoever publishes the offer is the **maker**. Whoever accepts it is the **taker**. When someone takes the other side of your offer, the loan is created on chain in one transaction and becomes active immediately.

### Posting an offer is instant

When you post an offer, your wallet **signs it, but the loan itself is not settled on the Bitcoin network**. So:

- You pay a **small network fee** to post, and nothing more.
- **Posting does not tie up the rest of your balance.** The small transaction you broadcast at post time sets aside exactly the loan or collateral amount and hands the remainder back to you as normal change. Even if all your tokens sat on a single UTXO, the leftover is immediately spendable.
- **No waiting for a block** before your offer is usable. It shows up in the order book instantly.
- **Your funds stay in your wallet.** A posted offer is a pre-signed instruction that, by design, **cannot be broadcast on its own**. It only becomes a real transaction once a taker accepts and adds their side.

This means **only the taker pays to settle**. As a maker, what you pay is the small network fee on the offer itself.

### Matching settles the loan on chain

When a taker accepts your offer, a single Bitcoin transaction is broadcast that:

1. Hands the borrowed token to the borrower,
2. Locks the borrower's collateral, and
3. Creates the loan.

Once that transaction confirms, the loan is **active** and the clock starts on its term. If any part of it fails, both sides get their tokens back in the same transaction. You cannot end up half-lent.

For the mechanics of how a pre-signed offer stays inert until a taker funds it, see [Lending Protocol](../protocol/lending).

## What a loan costs

| Cost | Who pays | When |
| --- | --- | --- |
| Protocol fee, 3,000 sats | The taker | At settlement, built into the transaction |
| Bitcoin network fee | Taker (settlement), maker (offer post) | At settlement, varies with the fee rate the taker chooses |

## The interest you will pay

Interest is **fixed at creation**, not accrued over time. You know the exact repayment before you agree to anything:

```
interest  = loan amount × APR × (duration in blocks / 52,560)
repayment = loan amount + interest
```

The `52,560` is the number of Bitcoin blocks in a year (144 per day × 365).

**Example.** Borrow 1 DIESEL at 12.5% APR for 1,008 blocks (about a week):

```
interest  = 1 × 0.125 × (1,008 / 52,560) = 0.00239726 DIESEL
repayment = 1.00239726 DIESEL
```

Because the number comes straight from the terms, both sides can compute it up front, and it never changes.

## Collateral limits

Every loan is over-collateralized: the collateral must be worth more than what is owed. The app enforces a **maximum loan-to-value (LTV)** per collateral token, measured in USD:

| Collateral | Maximum LTV | Minimum collateral, relative to what is owed |
| --- | --- | --- |
| frBTC | 80% | about 125% |
| DIESEL | 50% | about 200% |
| Any other token | 30% | about 333% |

Two things about how this is applied:

- **It is measured against the repayment, not the amount borrowed.** Principal plus interest is what has to be covered. Raising the APR or the duration raises the repayment, which raises the collateral required.
- **More collateral than the minimum is always fine. Less is rejected.** The app will not let you post an offer below the minimum, and the check runs again when the offer is submitted.

### Your open offer can be removed if prices move

An offer is created at or under its collateral's maximum LTV, but prices keep moving after you post. If the collateral on an open offer falls far enough to be worth **less than what is owed on it**, the offer is **removed from the order book**.

This applies only to **open offers that nobody has taken yet**. An **active loan is never touched**: once a loan exists, its terms are fixed and enforced exactly as agreed. See below.

Prices are not the only reason an open offer can disappear. Posting sets aside a specific piece of your funds for the offer, and nothing stops you from spending it in another transaction afterwards. If you do, the offer can never settle, so it is removed from the order book rather than left for a taker to trip on.

:::info[When prices are unavailable, the limits stand down]
The LTV check needs a USD price for both tokens. If either one has no price the app can resolve, the check cannot be applied, and the app will let you set any values while warning you that you are on your own. Take that warning seriously: it means nothing is checking your collateral for you.
:::

## Choosing your collateral

Collateral terms are **fixed when the loan is created** and **enforced exactly as agreed**. Beyond the collateral minimum above, there are **no margin calls and no automatic liquidations**. That has an important consequence:

> **If you are lending, you must be comfortable receiving *exactly* the agreed collateral, even if its price moves so much that it is worth less than the loan you made.** If a borrower defaults and the collateral has dropped in value, claiming it is your only recourse. The protocol will not top you up.

The LTV ceiling limits your downside, it does not remove it. It is checked when the offer is created, against prices at that moment, and once the loan is active nothing re-checks it. So ask for the level where you would be **genuinely fine** ending up with that collateral instead of being repaid:

- **Higher collateral** protects you better if prices move against you, but it makes your offer **less attractive**, and a borrower may never take it.
- **Lower collateral** is easier to fill and friendlier to borrowers, but leaves you **more exposed** if the collateral's value falls.

Borrowers face the mirror image: the more collateral you post, the more you have at risk if you cannot repay, but offers asking for less collateral may be scarce.

## How to lend

1. Open the **Lend / Borrow** page and pick the token you want to **lend** and the token you will accept as **collateral**.
2. Switch the form to **Lend**.
3. Enter the amount to lend, the collateral you require, the **APR**, and the **duration** in blocks.
4. Click **Lend** and approve the signature in your wallet.

Your offer is now live in the order book. Nothing settles on chain until a taker accepts it.

## How to borrow

1. Pick the token you want to **borrow** and the token you will post as **collateral**.
2. Browse the order book for an offer you like (sorted by APY), **or** switch the form to **Borrow** and post your own loan request.
3. To take an existing offer, click **Borrow**. You will see a summary: what you provide, what you receive, the APY, the total repayment, and the deadline.
4. Confirm and pay the network fee to settle.

## The life of a loan

Once a loan is active, here is what can happen.

### It gets repaid, the normal path

- The borrower repays the **principal plus interest** before the deadline. One click (**Repay & reclaim**) repays the loan and returns their collateral in the same transaction.
- The lender then **claims the repayment**.
- The loan is fully closed. Both sides got what they expected.

### It defaults, the borrower did not repay in time

- If the deadline passes without repayment, the loan is **defaulted**.
- The lender can **claim the collateral**. One click does the default and the claim together.
- The borrower keeps the tokens they borrowed but **forfeits the collateral**.

A loan cannot be repaid after it defaults. Once the deadline passes, the lender's path is to claim the collateral.

:::info[The app shows a loan as defaulted the moment its deadline passes]
On chain, a loan only becomes `DEFAULTED` when someone actually triggers it. The app is stricter: it shows an overdue loan as **Defaulted** as soon as the deadline is behind the current block, and withdraws the borrower's repay button.
:::

You can always see your loans and their status (**Active Loans**, **Closed Loans**, and your open **My Offers**) at the bottom of the Lending page.

## Managing your offers

Your open offers appear under **My Offers**. From there you can:

- **Edit** an offer. This re-signs a fresh offer, sets the funds aside again in a new small transaction (the same small network fee as posting), and cancels the old one.
- **Delete** an offer, removing it from the order book. Deleting is off-chain and free.

Neither one settles the loan on chain, just like posting.

## Tips

- **Start small** to get a feel for the flow before posting larger offers.
- **Think about default before you lend.** Price the collateral and the rate for the scenario where you are repaid in collateral, not in the token you lent.
- **Right-size your collateral ask.** Too high and nobody takes it, too low and you carry more risk. The collateral minimum is a floor, not a recommendation.
- **Watch the deadline** if you are borrowing. There is no grace period, and after it passes you cannot repay.

## Next steps

- [Lending Protocol](../protocol/lending): the contract, the escrow, and the settlement mechanics.
- [Swap](./swap): trade between Bitcoin assets against a shared liquidity pool.
- [Wallets](./wallets): set up the wallet you will sign with.
