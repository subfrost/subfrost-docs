---
title: Wrapping frBTC
sidebar_label: Wrapping frBTC
sidebar_position: 4
description: Wrap BTC into frBTC and unwrap it back, from the CLI and from TypeScript.
---

# Wrapping frBTC

**frBTC** is Bitcoin-backed value inside Alkanes, held 1:1 against real BTC (see [frBTC Peg & Custody](../protocol/frbtc-peg-and-custody)). This page shows how to wrap and unwrap it programmatically. The frBTC contract lives at the Alkane ID `[32, 0]`.

## How it works

**Wrapping** sends BTC to the signer address and mints an equal amount of frBTC (minus a small premium):

1. You send BTC to the signer's Taproot address.
2. You call **wrap** (opcode 77) on the frBTC contract.
3. The contract verifies the BTC arrived and mints frBTC to you.

**Unwrapping** burns frBTC and asks the signer group to release BTC:

1. You call **unwrap** (opcode 78) with the frBTC you want to redeem.
2. The contract burns it and records a payment for the signer group.
3. The signers release the BTC in a later transaction.

Wrapping is instant. Unwrapping settles once the signer group processes the payment.

## Wrapping from the CLI

The CLI wraps the whole flow in one command:

```bash
# Wrap 1 BTC (100,000,000 sats) to frBTC
alkanes-cli -p regtest \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes wrap-btc \
  100000000 \
  --to p2tr:0 \
  --from p2tr:0 \
  --change p2tr:0 \
  --mine \
  -y

# Check your frBTC balance
alkanes-cli -p regtest \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes getbalance
```

`wrap-btc` builds the transaction that sends BTC to the signer, attaches the wrap call on `[32, 0]`, and returns frBTC to your address. On regtest, `--mine` mines the block immediately. See [Alkanes Commands](../api-reference/cli-sdk/alkanes) for the full `wrap-btc` flag reference.

## Unwrapping from the CLI

Unwrapping is a direct contract call, so you use `execute` with a cellpack:

```bash
# Unwrap 0.5 BTC worth of frBTC (opcode 78)
alkanes-cli -p regtest \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  alkanes execute "[32,0,78,0,50000000]:v0:v0" \
  --inputs "32:0:50000000" \
  --from p2tr:0 \
  --fee-rate 1 \
  --mine \
  -y
```

The cellpack `[32,0,78,0,50000000]` calls opcode 78 on `[32,0]` with a vout index of `0` and an amount of `50000000` sats. The `--inputs "32:0:50000000"` sends that frBTC into the contract to be burned. The BTC itself is released by the signer group afterward, not in this transaction.

## Querying frBTC state

Read-only opcodes are free through `simulate`:

```bash
# Total supply (opcode 105)
alkanes-cli -p regtest alkanes simulate "32:0:105"

# Signer public key (opcode 103)
alkanes-cli -p regtest alkanes simulate "32:0:103"

# Current premium (opcode 104)
alkanes-cli -p regtest alkanes simulate "32:0:104"
```

## The premium

Wrapping charges a small premium, measured in parts per 100,000,000 (that is, sats per BTC). The default is `100000`, which is 0.1%. Wrapping 1 BTC at 0.1% mints 99,900,000 sats of frBTC.

## frBTC opcodes

| Opcode | Name | Description |
|--------|------|-------------|
| 77 | Wrap | Mint frBTC for BTC sent to the signer |
| 78 | Unwrap | Burn frBTC and record a payment |
| 99 | GetName | Returns `frBTC` |
| 100 | GetSymbol | Returns `frBTC` |
| 101 | GetPendingPayments | Pending payment records |
| 103 | GetSigner | Signer public key |
| 104 | GetPremium | Current premium |
| 105 | GetTotalSupply | Total supply |

You do not have to keep this table memorized: any deployed alkane exposes its own names and opcodes through its `__meta` export. See [Reading Alkane Metadata](../api-reference/guides/alkane-metadata) for how to query it directly.

## From TypeScript

The SDK exposes a typed wrap so you do not build the cellpack by hand:

```typescript
import { AlkanesProvider } from '@alkanes/ts-sdk';

const provider = new AlkanesProvider({
  network: 'mainnet',   // or 'regtest' for local development
  rpcUrl: 'https://mainnet.subfrost.io/v4/jsonrpc',
});
await provider.initialize();

// Load a wallet to sign transactions
provider.walletLoadMnemonic('your twelve word mnemonic ...');
const [{ address }] = provider.walletGetAddresses('p2tr', 0, 1);

// Wrap 1 BTC to frBTC
const wrap = await provider.frbtcWrapTyped({
  amount: BigInt(100000000),
  toAddress: address,
  fromAddress: address,
  feeRate: 1,
  mineEnabled: true,    // auto-mine on regtest
  autoConfirm: true,
});
console.log('Wrap TXID:', wrap.reveal_txid);

// Read your frBTC balance
const balances = await provider.alkanes.getBalance(address);
const frbtc = balances.find(b => b.alkane_id?.block === 32 && b.alkane_id?.tx === 0);
console.log('frBTC balance:', frbtc?.balance);
```

## Where to go next

- [frBTC Peg & Custody](../protocol/frbtc-peg-and-custody): how the backing is secured.
- [Interacting via the CLI](./interacting-via-cli): the rest of the command surface.
- [CLI & SDK Reference](../api-reference/cli-sdk/overview): full SDK methods.
