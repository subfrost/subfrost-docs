---
title: The Oracle
sidebar_label: The Oracle
sidebar_position: 5
description: How SUBFROST brings outside data on-chain in a decentralized way.
---

# The Oracle

Some parts of the protocol need information that does not live on Bitcoin, most importantly **prices**. For example, FIRE bond pricing needs a reference price to work. SUBFROST provides this through a decentralized **oracle**.

## How it works

Rather than trusting a single server to report a value, the oracle runs as a small **distributed group**. Each participant independently reads the relevant external source and the current chain state, and the group must reach agreement before a value is committed on-chain. A single participant cannot dictate the result on its own.

Because the value is agreed by a threshold of the group and posted on-chain, contracts that depend on it (such as the [FIRE](../using-subfrost/fire-vault) bond mechanism) can read a price that is resistant to any one party manipulating it.

## Where it is used

- **FIRE bonds.** The bond price is anchored to an oracle-reported reference, with a floor tied to the protocol treasury, so bonds cannot be sold below the value backing them.
- **Perpetual futures (unreleased).** Details will be released when ready.

## Where to go next

- [FIRE Vault](../using-subfrost/fire-vault): where the oracle price is used.
- [What is SUBFROST](../start-here/what-is-subfrost): the big picture.
