---
title: DIESEL
sidebar_label: DIESEL
sidebar_position: 2
description: DIESEL is SUBFROST's native emission, issued on-chain in step with Bitcoin's own block production.
---

# DIESEL

**DIESEL** is the protocol's native token. Unlike frBTC, which is backed by locked Bitcoin, DIESEL is **emitted on-chain**: it is minted as new blocks are produced, following a schedule tied to Bitcoin itself.

## How DIESEL is issued

Every Bitcoin block emits **the same amount of DIESEL as it emits new bitcoin**. Today that is **3.125 per block**, and it **halves alongside Bitcoin**, on the same 210,000-block schedule. When Bitcoin's subsidy drops to 1.5625, DIESEL's does too.

| | |
| --- | --- |
| Per block | 3.125 DIESEL |
| Per day | about 450 DIESEL |
| Per year | about 164,000 DIESEL |
| Halving | every 210,000 blocks, with Bitcoin |

DIESEL is not printed on demand. There is no faucet and no way to issue it faster: it appears only as Bitcoin blocks appear, which ties the supply side of the SUBFROST economy directly to Bitcoin's own monetary schedule.

### Who receives it

A block's DIESEL is split two ways:

- A share goes to the **protocol**, sized in parity with the miner fees in that block and **capped at half** of the block's DIESEL. A block with heavy fee activity sends more to the protocol, up to that ceiling.
- **The rest is divided among everyone who minted in that block**, evenly.

So your share depends on how many others minted at the same height. This is the part worth internalising before you mint: the block's emission is fixed, so a crowded block pays each participant proportionally less.

## What DIESEL is for

- **It anchors the core AMM pool.** DIESEL pairs with frBTC in the protocol's central liquidity pool, giving SUBFROST a native unit of account. Providing liquidity to that pool is also what earns [FIRE](../using-subfrost/fire-vault).
- **It is earned by participation.** Because DIESEL is distributed as blocks are produced, participants who interact with the protocol can receive a share of the emission.
- **It is used in routing.** DIESEL is a common intermediate hop when a swap has no direct pool (see [Swap](../using-subfrost/swap)).

## Where to go next

- [Tokens & Economics](./overview): how DIESEL fits with frBTC and FIRE.
- [FIRE Vault](../using-subfrost/fire-vault): earn FIRE by providing DIESEL / frBTC liquidity.
- [Alkanes Metaprotocol](../protocol/alkanes): DIESEL is an Alkanes token.
