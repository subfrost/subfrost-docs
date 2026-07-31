---
title: Wallet Commands
sidebar_label: Wallet Commands
sidebar_position: 3
description: HD wallet management, address derivation, transaction signing, and balance queries with alkanes-cli.
---

# Wallet Commands

The `wallet` namespace provides HD wallet management, address derivation, transaction signing, and balance queries.

## Commands Overview

- **`create`**: Create a new wallet or restore from mnemonic
- **`addresses`**: Display wallet addresses
- **`utxos`**: List UTXOs in the wallet
- **`balance`**: Get wallet balance
- **`send`**: Send a transaction
- **`sign`**: Sign a PSBT
- **`create-tx`**: Create an unsigned transaction
- **`sign-tx`**: Sign a transaction
- **`decode-tx`**: Decode a transaction
- **`broadcast-tx`**: Broadcast a transaction
- **`fee-rates`**: Get current fee rates
- **`history`**: Get transaction history
- **`mnemonic`**: Display wallet mnemonic
- **`freeze` / `unfreeze`**: Freeze/unfreeze UTXOs
- **`backup`**: Backup the wallet
- **`sync`**: Sync wallet with blockchain

## wallet create

Create a new HD wallet or restore from a mnemonic.

```bash
# Create new wallet with random mnemonic
alkanes-cli wallet create --passphrase "your-secure-passphrase"

# Restore from existing mnemonic
alkanes-cli wallet create "word1 word2 word3 ... word12" \
  --passphrase "your-passphrase"

# Specify output file
alkanes-cli wallet create --passphrase "your-passphrase" \
  --output /custom/path/wallet.json
```

**Options:**

- `--passphrase`: Encryption passphrase (required)
- `-o, --output`: Output file path (default: `~/.alkanes/wallet.json`)

**TypeScript SDK:**

```typescript
import { createKeystore, unlockKeystore, createWallet } from '@alkanes/ts-sdk';

// Create new wallet
const { keystore, mnemonic } = await createKeystore('password123', {
  network: 'mainnet'
});

console.log('Mnemonic:', mnemonic);

// Restore from mnemonic
import { createWalletFromMnemonic } from '@alkanes/ts-sdk';
const wallet = createWalletFromMnemonic(mnemonic, 'mainnet');
```

## wallet addresses

Display all derived addresses from the wallet.

```bash
alkanes-cli -p mainnet \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet addresses
```

**Output shows:**

- P2TR (Taproot) addresses: `bc1p...` or `bcrt1p...`
- P2WPKH (Native SegWit): `bc1q...` or `bcrt1q...`
- P2SH (SegWit-compatible): `3...` or `2...`
- P2PKH (Legacy): `1...` or `m/n...`

**TypeScript SDK:**

```typescript
import { createWallet, AddressType } from '@alkanes/ts-sdk';

const wallet = createWallet(keystore);

// Get Taproot receiving address
const p2tr = wallet.getReceivingAddress(0);

// Get specific address type
const p2wpkh = wallet.deriveAddress(AddressType.P2WPKH, 0);

// Get multiple addresses
const addresses = wallet.getAddresses(0, 20); // 20 addresses starting from index 0
```

## wallet balance

Get the BTC balance of the wallet.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet balance
```

**Output:**

```
Confirmed: 0.00150000
Pending:   0.00000000
```

**TypeScript SDK:**

```typescript
const provider = createProvider({
  url: 'https://mainnet.subfrost.io/v4/jsonrpc',
  networkType: 'mainnet',
});

const balance = await provider.getBalance(address);
console.log('Balance:', balance);
```

## wallet utxos

List all unspent transaction outputs (UTXOs) in the wallet.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet utxos
```

## wallet send

Send BTC to an address.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet send <ADDRESS> <AMOUNT_SATS> \
  --fee-rate 10 \
  -y  # Auto-confirm
```

**Arguments:**

- `<ADDRESS>`: Recipient Bitcoin address
- `<AMOUNT_SATS>`: Amount in satoshis

**Options:**

- `--fee-rate <RATE>`: Fee rate in sat/vB
- `-y, --auto-confirm`: Skip confirmation prompt

## wallet fee-rates

Get current network fee rate estimates.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  wallet fee-rates
```

**Output:**

```
Fast: 15 sat/vB
Medium: 8 sat/vB
Slow: 3 sat/vB
```

## wallet create-tx

Create an unsigned transaction without broadcasting.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-address <SOURCE_ADDRESS> \
  wallet create-tx <DEST_ADDRESS> <AMOUNT_SATS> \
  --fee-rate 10
```

## wallet sign-tx

Sign a transaction from a hex file.

```bash
alkanes-cli -p mainnet \
  --wallet-key-file /path/to/private-key.hex \
  wallet sign-tx \
  --from-file /path/to/unsigned_tx.hex \
  --truncate-excess-vsize  # Optional: truncate if over 1MB
```

**Options:**

- `--from-file <PATH>`: Path to unsigned transaction hex
- `--truncate-excess-vsize`: Truncate inputs if transaction exceeds size limit

## wallet decode-tx

Decode and display transaction details.

```bash
alkanes-cli wallet decode-tx --file /path/to/tx.hex
```

**Output shows:**

- TXID
- Number of inputs/outputs
- Virtual size
- Fee rate

## wallet broadcast-tx

Broadcast a signed transaction to the network.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  wallet broadcast-tx --file /path/to/signed_tx.hex
```

## wallet sign

Sign a PSBT (Partially Signed Bitcoin Transaction).

```bash
alkanes-cli -p mainnet \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet sign --psbt <PSBT_BASE64>
```

**TypeScript SDK:**

```typescript
const wallet = createWallet(keystore);

// Sign PSBT
const signedPsbt = wallet.signPsbt(psbtBase64);

// Extract raw transaction
const txHex = wallet.extractTransaction(signedPsbt);
```

## wallet mnemonic

Display the wallet's mnemonic phrase (use with caution!).

```bash
alkanes-cli \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet mnemonic
```

## wallet freeze / unfreeze

Freeze or unfreeze specific UTXOs to prevent them from being spent.

```bash
# Freeze a UTXO
alkanes-cli wallet freeze <TXID>:<VOUT>

# Unfreeze a UTXO
alkanes-cli wallet unfreeze <TXID>:<VOUT>
```

## wallet backup

Create a backup of the wallet file.

```bash
alkanes-cli \
  --wallet-file ~/.alkanes/wallet.json \
  wallet backup --output /path/to/backup.json
```

## wallet history

Get transaction history for the wallet.

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/jsonrpc \
  --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet history
```

## Complete TypeScript Example

```typescript
import {
  createKeystore,
  unlockKeystore,
  createWallet,
  createProvider,
  AddressType
} from '@alkanes/ts-sdk';
import * as bitcoin from 'bitcoinjs-lib';

async function main() {
  // Create wallet
  const { keystore, mnemonic } = await createKeystore('password123', {
    network: 'mainnet'
  });

  console.log('Mnemonic (save securely!):', mnemonic);

  // Unlock and use
  const unlocked = await unlockKeystore(keystore, 'password123');
  const wallet = createWallet(unlocked);

  // Get addresses
  const taprootAddr = wallet.getReceivingAddress(0);
  const segwitAddr = wallet.deriveAddress(AddressType.P2WPKH, 0);

  console.log('Taproot:', taprootAddr);
  console.log('SegWit:', segwitAddr);

  // Create provider
  const provider = createProvider({
    url: 'https://mainnet.subfrost.io/v4/jsonrpc',
    network: bitcoin.networks.bitcoin,
    networkType: 'mainnet',
  });

  // Check balance
  const balance = await provider.getBalance(taprootAddr);
  console.log('Balance:', balance);

  // Create and sign PSBT
  const psbt = await wallet.createPsbt({
    inputs: [{ txid: '...', vout: 0, value: 10000, address: taprootAddr }],
    outputs: [{ address: 'bc1q...', value: 5000 }],
    feeRate: 10,
  });

  const signedPsbt = wallet.signPsbt(psbt);
  const txHex = wallet.extractTransaction(signedPsbt);

  // Broadcast
  const result = await provider.pushPsbt({ psbtBase64: signedPsbt });
  console.log('TXID:', result.txId);
}
```

## Next Steps

- [Alkanes Commands](./alkanes): Protocol operations
- [Esplora Commands](./esplora): Block explorer queries
- [DataAPI Commands](./dataapi): High-level data queries
