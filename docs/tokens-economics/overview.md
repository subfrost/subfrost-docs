---
title: Overview
sidebar_label: Overview
sidebar_position: 1
description: The assets that make up the SUBFROST economy and how they fit together.
---

# Tokens & Economics

The SUBFROST economy is built on a few native assets that reinforce each other. This page is the map; each asset has its own page or guide with the details.

## The assets

- **frBTC** is the base. It is your Bitcoin wrapped 1:1 into a programmable, on-chain form. Everything else is denominated against it. See [Wrap & Unwrap BTC](../using-subfrost/wrap-unwrap-frbtc) and [frBTC Peg & Custody](../protocol/frbtc-peg-and-custody).
- **DIESEL** is the protocol's native emission, issued on-chain in step with real Bitcoin block production. See [DIESEL](./diesel).
- **FIRE** is the rewards and governance token. It rewards the people who provide liquidity to the DIESEL / frBTC pool, through staking and bonds. See [FIRE Vault](../using-subfrost/fire-vault).
- **dxBTC** (planned) is a yield-bearing form of Bitcoin.
- **FUEL** (planned) is the protocol's governance token.

## How they fit together

The core of the economy is the **DIESEL / frBTC** liquidity pool:

- **frBTC** brings real Bitcoin into the system, backed 1:1.
- **DIESEL** is minted on-chain and pairs with frBTC in that pool, so the two trade against each other and give the protocol a native unit of account.
- **FIRE** points incentives at exactly that pool: providers of DIESEL / frBTC liquidity earn FIRE, which keeps the pool deep and the market liquid.

Because DIESEL's issuance is anchored to Bitcoin's own block production (see [DIESEL](./diesel)), the supply side of the economy is tied to Bitcoin rather than to arbitrary inflation.

## Live vs. planned

- **Live:** frBTC (wrap/unwrap, swaps), DIESEL (on-chain emission), FIRE (staking and bonds), frUSD (the Bitcoin-native stablecoin, trading against frBTC).
- **Planned:** dxBTC (yield vaults), FUEL (governance token).

## Where to go next

- [DIESEL](./diesel): the native emission.
- [FIRE Vault](../using-subfrost/fire-vault): earn FIRE.
- [frBTC Peg & Custody](../protocol/frbtc-peg-and-custody): the mechanism underneath.
