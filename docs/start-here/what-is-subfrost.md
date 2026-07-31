---
title: What is SUBFROST
sidebar_label: What is SUBFROST
sidebar_position: 1
description: SUBFROST in plain terms. Put your Bitcoin to work in DeFi without handing it to a company and without leaving Bitcoin.
---

# What is SUBFROST

SUBFROST is a way to use Bitcoin in decentralized finance (DeFi) without handing it to a company or leaving the Bitcoin blockchain.

Today, if you want to trade Bitcoin, earn yield on it, or use it the way people use Ethereum or Solana, you have to send it somewhere else. That means a centralized exchange, or a "wrapped BTC" bridge run by a single custodian. In both cases you are trusting one party not to lose your coins, freeze them, or misuse them.

## The problem

Bitcoin is the largest and most secure network in crypto. But its base layer was never designed to run applications. Native BTC does not plug directly into the tools people use elsewhere in DeFi: automated market makers (for swapping), lending markets, or privacy tools.

So two poor options exist for anyone wanting to do more than just hold their Bitcoin:

1. **Send it to a centralized exchange.** Now a company holds your coins.
2. **Bridge it to another chain as "wrapped BTC".** Now a bridge operator, often a small custodian, holds the real Bitcoin while you hold an IOU on a different network.

Both options mean giving up custody and trusting someone else. **Without a trust-minimized custodian, "Bitcoin DeFi" ends up relying on trust-dependent cross-chain alternatives, which is not really Bitcoin DeFi at all.**

## The core idea

A group of independent signers collectively holds the Bitcoin that backs the system. They use a method called **threshold signing**, where the key that controls the funds is split across the whole group. No single signer ever holds the full key, so no single party can move the funds on their own. If one signer is compromised, the funds stay safe.

In one sentence: **SUBFROST is a decentralized custodian for Bitcoin.** It runs as a lightweight layer-0 that watches the Bitcoin blockchain and coordinates a ring of signers who lock up native BTC and release it again when you ask.

## How you actually use it

When you put Bitcoin into SUBFROST, you receive **frBTC**, a token that is backed 1:1 by your BTC and settled natively on Bitcoin. **The best part? This can happen atomically within the same transaction as other activities.** In this way, for the first time ever, a user can swap native BTC with a Bitcoin token like DIESEL or FIRE, without ever knowing they interacted with the frBTC contract.

- **Minting (wrapping)** your BTC into frBTC is instant.
- **Redeeming (unwrapping)** frBTC back into native BTC is authorized by the distributed group of signers, not by any single person.

With frBTC, you can perform activities with native BTC such as swapping into other Bitcoin assets, providing liquidity into AMMs, lending, and earning yield in other ways, without data ever leaving Bitcoin L1. Data doesn't just settle on the base layer, it never leaves.

## What makes it different

- **You stay on Bitcoin.** SUBFROST is not a separate blockchain or a sidechain. Data always remains on Bitcoin L1 and you never lose visibility of those sats.
- **No single custodian.** The Bitcoin that backs frBTC is held by a growing number of signers together, not by one company. Currently, there are 9 signers with the ability to scale to 255.
- **Keep your exposure.** The idea is simple in spirit: never send your Bitcoin to another blockchain to use it, or be forced to trade it.

### Where the signer set stands today

Custody is currently held by **nine signers**, and they are not yet publicly identified. That is the starting point, not the destination. Three steps are planned from here:

1. The keys move as needed so that **at least six of the nine signers are publicly identifiable (doxxed)**.
2. The **signer set expands** beyond today's nine.
3. The signer set transitions into a **permissionless staking network** with up to 255 signers, where nobody can stop you from participating.

So when you read that no single custodian holds your Bitcoin, that is true today. The larger, open network is planned, and worth judging on its own timeline. See [frBTC Peg & Custody](../protocol/frbtc-peg-and-custody) for how the signing itself works.

## Where to go next

- **[Get Started in 5 Minutes](./get-started):** pick a wallet, add Bitcoin, make your first swap.
- **[Key Concepts](./key-concepts):** a quick glossary of frBTC, DIESEL, FIRE, and more.
