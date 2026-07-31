---
title: frBTC Peg & Custody
sidebar_label: frBTC Peg & Custody
sidebar_position: 3
description: How frBTC stays backed 1:1 by real BTC, secured by threshold signing.
---

# frBTC Peg & Custody

**frBTC** is backed 1:1 by real Bitcoin. This page explains how that backing is held and how the peg stays honest without a single custodian.

## The 1:1 peg

Every frBTC in circulation corresponds to one BTC locked in custody.

- **Minting frBTC (wrapping BTC) is instant.** When you lock BTC, the metaprotocol mints an equal amount of frBTC to you, 1:1.
- **Redeeming BTC (unwrapping frBTC) goes through the signer group.** When you burn frBTC to redeem, the signers read the contract state directly to see who burned synthetics and should receive Bitcoin, then collectively sign the payout. No single party can move the funds alone.

Because the Alkanes contract records every wrap and burn (see [Alkanes Metaprotocol](./alkanes)), the amount of frBTC and the amount of BTC held always track each other.

## Distributed custody with FROST and ROAST

The BTC that backs frBTC is held at a single Bitcoin address, but no single party controls that address. The key is shared across a group of signers using two threshold-signature schemes:

- **FROST** (Flexible Round-Optimized Schnorr Threshold)
- **ROAST** (Robust Asynchronous Schnorr Threshold)

These let a large, dynamic set of signers collectively produce a single Schnorr signature, without any individual signer ever holding the full private key. The key is generated through a **distributed key generation (DKG)** process, so the full key is never assembled in one place, even by a colluding minority below the threshold.

To authorize an unwrap, a **threshold** of signers must cooperate. Below that threshold, nothing moves.

**No single point of failure:** because the full key never exists in one place, a single compromised signer (or a minority group) cannot move the funds. This is a meaningful improvement over traditional federated or centralized peg mechanisms.

The signers coordinate over a peer-to-peer network built on QUIC and libp2p.

## Current phase vs. the plan

Custody is currently held by **nine signers**, and they are not yet publicly identified. That is the starting point, not the destination. Three steps are planned from here:

1. The keys move as needed so that **at least six of the nine signers are publicly identifiable (doxxed)**.
2. The **signer set expands** beyond today's nine.
3. The signer set transitions into a **permissionless staking network** with up to 255 signers, where nobody can stop you from participating.

The schemes underneath support signing groups of up to 255 participants, so the ceiling is far above the current nine. But nine is what is live. The larger permissionless network is planned, and nothing here should be read as saying it already exists.

## Why it stays on Bitcoin

Because the Alkanes metaprotocol already tracks balances and transfers on Bitcoin, SUBFROST needs no separate blockchain and no heavy external consensus engine to know who owns what. Signers simply run the Alkanes indexer and the SUBFROST software. There is no separate chain to bridge to and no external validator set to trust: the coordination model exists as an extension of the Bitcoin protocol itself. Everything, the synthetic assets and the custody, settles on Bitcoin L1.

This is what makes it different from the usual "wrapped BTC" approach, where a single custodian or a small federation holds the real coins on another chain. Here, custody is distributed across the signer set, and the accounting lives on Bitcoin.

## Where to go next

- [What is SUBFROST](../start-here/what-is-subfrost): the big picture.
- [The Oracle](./the-oracle): how the protocol reads outside data.
