---
title: Key Concepts
sidebar_label: Key Concepts
sidebar_position: 3
description: A quick glossary of SUBFROST covering frBTC, DIESEL, FIRE, FUEL, dxBTC, the AMM, and the tech underneath.
---

# Key Concepts

A short glossary to get you oriented. Each item links to a deeper page where one exists. The assets are grouped into what is **Live** today and what is **Planned**.

## The assets

### Live

- **frBTC.** Your Bitcoin, made programmable. frBTC is BTC atomically wrapped 1:1 into a token that works with on-chain apps and settles natively on Bitcoin.

- **DIESEL.** The protocol's native emission. Every Bitcoin block emits the same amount of DIESEL as new bitcoin (3.125 today) on the same halving schedule. See [DIESEL](../tokens-economics/diesel) for the numbers and who receives it.

- **FIRE.** The Alkanes governance token, rewarding people who provide liquidity to the DIESEL/frBTC pool, and powered by staking and bonding. It is how active participants earn a share of the protocol and, over time, help govern it.

- **frUSD.** The ultimate Bitcoin-native stablecoin: a stable US-dollar coin that settles on Bitcoin with no ability for any entity to shut it off or censor it. It trades against frBTC in a pool on mainnet, and can be minted by bridging USDC or USDT in from Ethereum.

### Planned

- **dxBTC.** Yield-bearing Bitcoin. You stake BTC and receive dxBTC; behind the scenes your Bitcoin is put to work in market-neutral yield strategies without ever leaving the Bitcoin blockchain.

- **FUEL.** The governance token for the subfrost protocol's treasury and parameters (for example, mint/redeem fees and protocol upgrades). Its tokenomics are not yet public.

:::note[Note]
Capitalization is what separates the two "fuels" you will meet in these docs: **FUEL** in uppercase is always this token, while lowercase **fuel** is the compute budget an Alkanes contract call is allowed to spend, the equivalent of gas elsewhere.

The comparison to gas stops at "budget for computation". Unlike gas, **fuel is free**: you do not buy it, you cannot top it up, and no fee is charged against it. Each block shares a fixed fuel budget among its transactions by size. The only thing you pay to transact is the ordinary Bitcoin miner fee, in **native BTC**, exactly as you would for a transaction that ran no contract at all. See [Alkanes](../protocol/alkanes) for the detail.
:::

## How you trade assets

- **The AMM (automated market maker).** A swap works against a shared liquidity pool instead of matching you with another trader. This efficiency always provides you with a counterparty, and the price adjusts with supply and demand. This is what powers swaps in the app.

The two fees worth knowing, both current rates rather than permanent guarantees:

| Action | Fee | Where it goes |
| --- | --- | --- |
| Swapping | 1% by default | 0.8% to liquidity providers, 0.2% permanently to the AMM protocol |
| Wrapping or unwrapping BTC | 0.1% | SUBFROST protocol |

The swap row describes a standard AMM pool. The frUSD/frBTC pool charges differently, and its liquidity providers earn differently; see [Pools & Liquidity](../using-subfrost/pools-liquidity).

See [Swap](../using-subfrost/swap), [Pools & Liquidity](../using-subfrost/pools-liquidity) and [Wrap & Unwrap](../using-subfrost/wrap-unwrap-frbtc).

- **PSBT marketplaces (partially signed Bitcoin transactions).** Across Alkanes there are several PSBT marketplaces where buyers and sellers choose to fill each other's orders. SUBFROST does not currently host one of these.

## What it all runs on

- **Alkanes.** The smart-contract protocol that these tokens live on. Alkanes lets developers run programmable contracts directly on Bitcoin (contracts are written in Rust and compiled to WebAssembly), inheriting Bitcoin's security instead of relying on a separate chain. frBTC, DIESEL, and FIRE are all Alkanes tokens. See the [Technical Overview](../protocol/alkanes) section for the full model.

- **Metashrew indexer.** Bitcoin blocks do not "run" contracts on their own. An indexer reads each new block and executes the contract code embedded in the block (specifically in the OP_RETURN). When you see your Alkanes balances, it comes from the Metashrew indexer.

:::note[One level deeper]
This section keeps things simple on purpose. Terms like protostone, cellpack, and the exact contract model are covered in the [Technical Overview](../protocol/alkanes) section, and the developer tooling (CLI, SDK, JSON-RPC) is in [Build on SUBFROST](../build/overview) and the [API & SDK Docs](../api-reference/getting-started/overview).
:::

## What is live today

Being honest about status matters. A quick snapshot:

- **Live:** Atomic wrapping of frBTC and unwrapping back to BTC, swapping in AMM pools between Bitcoin assets and BTC, providing liquidity to these AMM pools to earn a yield, and staking and bonding within the advanced DeFi "FIRE" vault.
- **Planned:** a yield-bearing Bitcoin vault token (dxBTC), the FUEL governance token, and the fully permissionless signer network.

## Where to go next

- **[Get Started in 5 Minutes](./get-started):** if you have not made your first swap yet.
- **[Tokens & Economics](../tokens-economics/overview):** the full story on frBTC, DIESEL, FIRE, dxBTC, and FUEL.
- **[Technical Overview](../protocol/alkanes):** how the custody, signing, and Alkanes model actually work.
