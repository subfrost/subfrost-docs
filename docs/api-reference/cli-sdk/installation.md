---
title: Installation
sidebar_label: Installation
sidebar_position: 2
description: Install alkanes-cli from source and set up the @alkanes/ts-sdk TypeScript library.
---

# Installation

This guide covers installing `alkanes-cli` from source and setting up the `@alkanes/ts-sdk` TypeScript library.

## Installing alkanes-cli

### Prerequisites

- **Rust** (1.70+): Install via [rustup](https://rustup.rs/)
- **Git**: For cloning the repository
- **Build tools**: `gcc`, `make`, etc.

### Clone and Build

```bash
# Clone the repository (develop branch)
git clone https://github.com/kungfuflex/alkanes-rs.git -b develop
cd alkanes-rs

# Build the CLI in release mode
cargo build --release -p alkanes-cli

# The binary is at target/release/alkanes-cli
./target/release/alkanes-cli --version
```

### Add to PATH

```bash
# Option 1: Copy to system path
sudo cp target/release/alkanes-cli /usr/local/bin/

# Option 2: Add to your shell profile
echo 'export PATH="$HOME/alkanes-rs/target/release:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Verify Installation

```bash
alkanes-cli --version
alkanes-cli --help
```

## Creating a Wallet

Before using most commands, you need a wallet:

```bash
# Create a new wallet with a random mnemonic
alkanes-cli wallet create --passphrase "your-secure-passphrase"

# Or restore from an existing mnemonic
alkanes-cli wallet create "your twelve word mnemonic phrase here" \
  --passphrase "your-secure-passphrase"
```

The wallet is saved to `~/.alkanes/wallet.json` by default. You can specify a different path with `--output`:

```bash
alkanes-cli wallet create --passphrase "your-passphrase" \
  --output /path/to/wallet.json
```

### View Your Addresses

```bash
alkanes-cli --wallet-file ~/.alkanes/wallet.json \
  --passphrase "your-passphrase" \
  wallet addresses
```

This shows addresses for all supported types:

- **P2TR** (Taproot): Recommended for Alkanes
- **P2WPKH** (Native SegWit)
- **P2SH** (SegWit-compatible)
- **P2PKH** (Legacy)

## Installing @alkanes/ts-sdk

### From npm (when published)

```bash
npm install @alkanes/ts-sdk
# or
yarn add @alkanes/ts-sdk
# or
pnpm add @alkanes/ts-sdk
```

### From Source

```bash
# Clone the repository
git clone https://github.com/kungfuflex/alkanes-rs.git -b develop
cd alkanes-rs/ts-sdk

# Install dependencies
npm install

# Build the SDK (includes WASM)
npm run build
```

### Link for Local Development

```bash
cd alkanes-rs/ts-sdk
npm link

# In your project
npm link @alkanes/ts-sdk
```

## TypeScript SDK Usage

### Basic Setup

```typescript
import {
  createKeystore,
  unlockKeystore,
  createWallet,
  createProvider
} from '@alkanes/ts-sdk';

// Create a new wallet
const { keystore, mnemonic } = await createKeystore('your-password', {
  network: 'mainnet'
});

console.log('Save this mnemonic:', mnemonic);

// Later, unlock the wallet
const unlockedKeystore = await unlockKeystore(keystore, 'your-password');
const wallet = createWallet(unlockedKeystore);

// Get addresses
const taprootAddress = wallet.getReceivingAddress(0);
console.log('Taproot address:', taprootAddress);
```

### Create a Provider

```typescript
import { createProvider } from '@alkanes/ts-sdk';
import * as bitcoin from 'bitcoinjs-lib';

const provider = createProvider({
  url: 'https://mainnet.subfrost.io/v4/jsonrpc',
  network: bitcoin.networks.bitcoin,
  networkType: 'mainnet',
});

// Get balance
const balance = await provider.getBalance(address);
console.log('Balance:', balance);
```

### With WASM (for Alkanes features)

```typescript
import init, * as wasm from '@alkanes/ts-sdk/wasm';
import { createProvider, KeystoreManager } from '@alkanes/ts-sdk';

// Initialize WASM (call once at app startup)
await init();

// Create provider with WASM
const provider = createProvider({
  url: 'https://mainnet.subfrost.io/v4/jsonrpc',
  networkType: 'mainnet',
}, wasm);

// Use WASM-powered features
const keystoreManager = new KeystoreManager(wasm);
```

## Configuration

### Environment Variables

Set these to avoid passing them as flags:

```bash
# SUBFROST API key
export SUBFROST_API_KEY="your-api-key"

# Default network
export ALKANES_NETWORK="mainnet"
```

### Regtest Configuration

For local development with regtest:

```bash
alkanes-cli -p regtest \
  --jsonrpc-url https://regtest.subfrost.io/v4/jsonrpc \
  --data-api https://regtest.subfrost.io/v4/api \
  metashrew height
```

### Mainnet Configuration

For production use:

```bash
alkanes-cli -p mainnet \
  --jsonrpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY \
  --data-api https://mainnet.subfrost.io/v4/YOUR_API_KEY \
  metashrew height
```

## Building WASM Module

If you need to rebuild the WASM module:

```bash
# Install wasm-pack
cargo install wasm-pack

# Build the WASM module
cd alkanes-rs/ts-sdk
npm run build:wasm
```

## Troubleshooting

### Build Errors

**Missing OpenSSL:**

```bash
# Ubuntu/Debian
sudo apt-get install libssl-dev pkg-config

# macOS
brew install openssl
```

**wasm-pack not found:**

```bash
cargo install wasm-pack
```

### Connection Errors

**Rate limiting:**
Use your API key for higher limits:

```bash
--jsonrpc-url https://mainnet.subfrost.io/v4/YOUR_API_KEY
```

**Network mismatch:**
Ensure `-p` matches your endpoint network.

## Next Steps

- [Wallet Commands](./wallet): Manage wallets and sign transactions
- [Alkanes Commands](./alkanes): Protocol operations
- [Quickstart](../getting-started/quickstart): API quickstart guide
