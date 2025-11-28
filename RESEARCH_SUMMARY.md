# SUBFROST Documentation Research Summary

## Overview
Complete restructuring of SUBFROST documentation based on ~/docs-redo.txt requirements and available reference materials.

## Available Reference Materials

### 1. **alkanes-rs** (`/reference/alkanes-rs/`)
- Main README with comprehensive overview
- Complete ALKANES metaprotocol implementation
- **Key docs**:
  - `README.md` - Overview, building, testing, CLI usage
  - `docs/` - Architecture, CLI usage, features
  - `crates/alkanes-jsonrpc/` - RPC_METHODS.md, LUA_SCRIPTING_README.md
  - Protorunes specification embedded in docs-redo.txt

### 2. **subfrost** (`/reference/subfrost/`)
- Layer-0 consensus framework
- **Key docs**:
  - `README.md` - Complete architecture, all components
  - `consensus/rng/README.md` - Example WASI-P2 consensus program
  - `crates/subtun/README.md` - VPN tunnel documentation
  - `crates/subrelay/README.md` - Circuit relay setup
  - `docs/` - Multiple status/implementation docs

### 3. **subfrost-alkanes** (`/reference/subfrost-alkanes/`)
- Yield-optimizing vaults and DeFi contracts
- **Key docs**:
  - `README.md` - Vault overview, architecture
  - `docs/vault-overview.md` - Detailed vault mechanics
  - `alkanes/` - 29 contract implementations including:
    - `fr-btc/` - Synthetic Bitcoin (frBTC) [32:0]
    - `ftr-btc/` - Future Bitcoin [31:0]
    - `dx-btc/` - dxBTC vault
    - `frost-token/` - FROST protocol token
    - Templates: `ve-token-vault-template`, `yve-token-nft-template`, `vx-token-gauge-template`

### 4. **subfrost-brc20** (`/reference/subfrost-brc20/`)
- BRC2.0 implementation
- `alkanes/fr-brc20-vault/` - FrBTC BRC2.0 vault

### 5. **API Documentation** (alkanes-jsonrpc)
- Complete RPC method listing (166 methods)
- Lua scripting capabilities
- All API routes map to: esplora, ord, btc_rpc, metashrew, alkanes, lua methods

## Documentation Structure Plan

Based on ~/docs-redo.txt requirements:

### 1. Introduction
- **SUBFROST Overview** - High-level intro to the ecosystem
- **Technical Overview** - Architecture, Layer-0 concept, multi-chain

### 2. SUBFROST Native Assets (Alkanes Metaprotocol)
- **What is the Alkanes metaprotocol?**
  - Permissionless programmable asset layer
  - Built on protorunes (runes subprotocol)
  - WASM smart contracts on Bitcoin L1
  - Full alkanes-rs wiki content from docs-redo.txt
- **Metaprotocol Concepts**
  - What is a metaprotocol?
  - Ordinals, Runes, BRC20 examples
  - Protorunes architecture
  - Protoburns, protomessages, predicates
- **ALKANES Technical Details**
  - WASM execution environment
  - Host functions and ABI
  - Fuel system and limits
  - Deployment process

### 3. Tokens
- **frBTC** [32:0] - Synthetic Bitcoin wrapper
- **ftrBTC** [31:0] - Future Bitcoin options
- **yvfrBTC** [use scripts/deploy-regtest.sh for addresses]
- **dxnormBTC** - Normal pool variant
- **FROST** - Protocol token
- **FrBTC (BRC2.0)** - Reference ./reference/subfrost-brc20

### 4. SUBFROST Templates
- **ve-token-vault-template** - Vote-escrowed vault template
- **yve-token-nft-template** - Yearn-style ve NFT template
- **vx-token-gauge-template** - Gauge/rewards template

### 5. SUBFROST P2P
- **What is subp2p?**
  - WebTransport + libp2p-webtransport-sys
  - Native and browser compatibility
  - Reference ./reference/subfrost README
- **subp2p Components**:
  - **subrelay** - Circuit relay v2 server (https://p2p.subfrost.io)
  - **subtun** - VPN gateway to subfrost runtime, L3 routing

### 6. SUBFROST Runtime
- **How subfrost-consensus works**
  - Signal-based reactive consensus
  - Parallel gossip evaluation
- **subfrost programs are wasip2**
  - WASI-P2 interface
  - Virtual filesystem I/O
- **subfrost FROST messages**
  - Threshold signatures
  - CGGMP21 mode for ECDSA (ZEC, ETH, etc.)
- **Example subfrost programs**
  - ./reference/subfrost/consensus/rng - Random number generator
- **Using subfrost-cli**
  - Running wasip2 programs
  - Multisignature custody channels

### 7. SUBFROST API
- **API Overview**
  - https://{network}.subfrost.io/v4/jsonrpc
  - https://{network}.subfrost.io/v4/api
  - Rate limiting and free tier
- **Reference Guide** with interactive playground:
  - All jsonrpc and API routes
  - Maps: esplora_{method}, ord_{method}, {btc_rpc_method}, metashrew_{method}, lua_{method}
  - Examples using alkanes-cli
  - LUA equivalents from ./reference/alkanes-rs/crates/alkanes-jsonrpc
  - Interactive playground calling https://mainnet.subfrost.io/v4/subfrost

## Key Content Sources

1. **Alkanes Wiki Content** - Embedded in ~/docs-redo.txt (lines 9-300+)
2. **subfrost README** - Complete Layer-0 architecture
3. **alkanes-rs README** - Protocol implementation
4. **RPC_METHODS.md** - All 166 API methods documented
5. **LUA_SCRIPTING_README.md** - Lua integration and examples
6. **Token contracts** - Source code in subfrost-alkanes/alkanes/
7. **Consensus examples** - rng program in subfrost/consensus/
8. **P2P docs** - subtun, subrelay READMEs

## Token Address Information

Per docs-redo.txt:
- frBTC: [32:0]
- ftrBTC: [31:0]
- yvfrBTC, dxnormBTC, FROST: Use `scripts/deploy-regtest.sh` for default addresses [4:n]

## API Playground Requirement

Create interactive playground section where users can:
- Call https://mainnet.subfrost.io/v4/subfrost API route
- See sample responses for each method
- View LUA equivalent for each API call
- Test different networks (mainnet, testnet, signet)

## Next Steps

1. Create Introduction section (2 docs)
2. Create SUBFROST Native Assets section (extract from docs-redo.txt)
3. Create Tokens section (6 token docs)
4. Create Templates section (3 template docs)
5. Create P2P section (3 component docs)
6. Create Runtime section (5 technical docs)
7. Create API section (comprehensive reference)
8. Update sidebars.ts with new structure
9. Verify all cross-references work
10. Add diagrams where needed (reuse from old/ if available)
