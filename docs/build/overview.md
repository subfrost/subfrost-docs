---
title: Build on SUBFROST
sidebar_label: Get Started as a Developer
sidebar_position: 1
description: What you can build on SUBFROST and Alkanes, the tools you will use, and where to start.
---

# Build on SUBFROST

SUBFROST is built on **Alkanes**, a smart-contract metaprotocol that runs on Bitcoin (see [Alkanes Metaprotocol](../protocol/alkanes)). If you can write a contract or a web app, you can build on it: tokens, AMMs, vaults, and anything that reads or moves Bitcoin-backed value like frBTC.

This section is the developer track. It gets you from an empty machine to a deployed contract and a working integration.

## The toolchain

You will use a small set of tools, all of them public:

- **`alkanes-cli`** for wallets, deployment, and calling contracts from the command line. It is built from source (see [Quickstart](./quickstart)).
- **`@alkanes/ts-sdk`** for talking to the chain from TypeScript, in a web app or a backend.
- **A hosted JSON-RPC endpoint**, so you do not have to run your own indexer to get started. Requests go to `https://mainnet.subfrost.io/v4/jsonrpc` (see the [JSON-RPC Overview](../api-reference/json-rpc/overview) for the full method catalog). If you want to run the indexer yourself, see [Indexing with metashrew](./indexing-with-metashrew).

The full command and SDK reference lives in [API & SDK Docs](../api-reference/cli-sdk/overview). This track is the guided path; that section is the lookup table.

## What is here

- **[Quickstart](./quickstart):** install the toolchain and deploy your first contract.
- **[Interacting via the CLI](./interacting-via-cli):** wallets, balances, executing and querying contracts.
- **[Wrapping frBTC](./wrapping-frbtc):** wrap and unwrap Bitcoin-backed frBTC from the CLI and the SDK.
- **[BRC2.0 Integration](./brc20-integration):** deploying EVM-style contracts on Bitcoin.
- **[Connecting a wallet](./connecting-a-wallet):** the injected provider and remote signing for web apps.
- **[Indexing with metashrew](./indexing-with-metashrew):** run the indexer and query chain state yourself.

## Before you start

Alkanes uses a fresh wallet model. Do not reuse a wallet that holds ordinals or inscriptions for contract work: use a dedicated Alkanes wallet, as covered in [Safety](../using-subfrost/safety). On testnet and regtest this does not matter, but the habit is worth building early.

## Where to go next

- [Quickstart](./quickstart): deploy your first contract.
- [Alkanes Metaprotocol](../protocol/alkanes): the model your contracts run on.
