# Subfrost Integration Guide for oyl-sdk

This document outlines the key files and code sections related to subfrost integration within the oyl-sdk. It is intended to be used by developers and LLMs to understand how to interact with subfrost functionalities.

## Core Logic

The primary logic for subfrost is located in src/amm/subfrost.ts. This file is responsible for fetching the subfrost signer and generating the wrap address.

### src/amm/subfrost.ts

- `fetchSigner(provider)`: Fetches the signer's public key from the metashrew endpoint.
   // src/amm/subfrost.ts:8-39
  export const fetchSigner = async (provider) => {
    const url = metashrew.get() || provider.alkanes.alkanesUrl;
    const payload = encodeSimulateRequest({
      alkanes: [],
      height: 880000n,
      vout: 0,
      txindex: 0,
      target: {
        block: 32n,
        tx: 0n
      },
      inputs: [103n],
      pointer: 0,
      refundPointer: 0,
      block: '0x',
      transaction: '0x'
    });
    const responseText = await (await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify({
        method: 'metashrew_view',
        params: ["simulate", payload, "latest"],
        id: id++,
        jsonrpc: "2.0"
      })
    })).text();
    const response = JSON.parse(responseText);
    return Buffer.from(stripHexPrefix(decodeSimulateResponse(response.result).execution.data), 'hex');
  };
  
- `getWrapAddress(provider)`: Converts the fetched public key into a taproot address. This is the primary function to be used for getting the wrap address.
   // src/amm/subfrost.ts:40-42
  export const getWrapAddress = async (provider) => {
      return internalPubKeyToTaprootAddress(await fetchSigner(provider), provider.network)
  }
  
## Module Export

The subfrost module is exported through src/amm/index.ts, making it available to the rest of the SDK.

### src/amm/index.ts
// src/amm/index.ts:3
export * as subfrost from './subfrost'

## Usage in Alkanes Module

The subfrost functionality is used within the alkanes module for wrapping and unwrapping BTC.

### src/alkanes/alkanes.ts

- Import: getWrapAddress is imported from subfrost.
   // src/alkanes/alkanes.ts:13
  import { getWrapAddress } from '../amm/subfrost'
  
- `createWrapBtcPsbt`: Uses getWrapAddress to set the output for the wrapped BTC.
   // src/alkanes/alkanes.ts:211
  const wrapAddress = await getWrapAddress(provider)
  // src/alkanes/alkanes.ts:269
  psbt.addOutput({ address: wrapAddress, value: wrapAmount })
  
- `createUnwrapBtcPsbt`: Uses getWrapAddress to set an output when unwrapping frBTC.
   // src/alkanes/alkanes.ts:340
  const subfrostAddress = await getWrapAddress(provider);
  // src/alkanes/alkanes.ts:352
  psbt.addOutput({ address: subfrostAddress, value: 546 })
  
## CLI Commands

The SDK exposes subfrost functionality through CLI commands.

### src/cli/alkane.ts

- Import: getWrapAddress is imported.
   // src/cli/alkane.ts:23
  import { getWrapAddress } from '../amm/subfrost'
  
- `subfrostWrapAddress` command: A dedicated CLI command to fetch and display the subfrost wrap address.
   // src/cli/alkane.ts:1302-1345
  /*
    Simulates an operation to get wrap address for subfrost frBtc
    First input is the opcode
  */
  export const subfrostWrapAddress = new AlkanesCommand('wrap-address')
    .requiredOption(
      '-target, --target <target>',
      'target block:tx for simulation',
      (value) => {
        const [block, tx] = value.split(':').map((part) => part.trim())
        return { block: block.toString(), tx: tx.toString() }
      }
    )
    .requiredOption(
      '-inputs, --inputs <inputs>',
      'inputs for simulation (comma-separated)',
      (value) => value.split(',').map((item) => item.trim())
    )
    .option(
      '-p, --provider <provider>',
      'Network provider type (regtest, bitcoin)'
    )
    .action(async (options) => {
      const wallet: Wallet = new Wallet(options)

      const request = {
        alkanes: [],
        transaction: '0x',
        block: '0x',wrapAmount,
  }: {
    alkanesUtxos?: FormattedUtxo[]
    utxos: FormattedUtxo[]
    account: Account
    protostone: Buffer
    provider: Provider
    feeRate?: number
    signer: Signer
    wrapAmount: number
  }) => {
    const { fee } = await actualWrapBtcFee({
      alkanesUtxos,
      utxos,
      account,
      protostone,
      provider,
      feeRate,
      wrapAmount,
    })

    const { psbt: finalPsbt } = await createWrapBtcPsbt({
      alkanesUtxos,
      utxos,
      account,
      protostone,
      provider,
      feeRate,
      fee,
      wrapAmount,
    })

    const { signedPsbt } = await signer.signAllInputs({
      rawPsbt: finalPsbt,
      finalize: true,
    })

    const pushResult = await provider.pushPsbt({
      psbtBase64: signedPsbt,
    })

    return pushResult
  }
  
- `unwrapBtc` function: Constructs and broadcasts the transaction for unwrapping frBTC.
   // src/alkanes/alkanes.ts:492-538
  export const unwrapBtc = async ({
    utxos,
    account,
    provider,
    feeRate,
    signer,
    unwrapAmount,
    alkaneUtxos,
  }: {
    utxos: FormattedUtxo[]
    account: Account
    provider: Provider
    feeRate?: number
    signer: Signer
    unwrapAmount: bigint
    alkaneUtxos: FormattedUtxo[]
  }) => {
    const { fee } = await actualUnwrapBtcFee({
      utxos,
      account,
      provider,
      feeRate,
      unwrapAmount,
      alkaneUtxos,
    })

    const { psbt: finalPsbt } = await createUnwrapBtcPsbt({
      utxos,
      account,
      provider,
      feeRate,
      fee,
      unwrapAmount,
      alkaneUtxos,
    })

    const { signedPsbt } = await signer.signAllInputs({
      rawPsbt: finalPsbt,
      finalize: true,
    })

    const pushResult = await provider.pushPsbt({
      psbtBase64: signedPsbt,
    })

    return pushResult
  }

The methods for how to wrap BTC and unwrap frBTC using the oyl-cli can be found in oyl-sdk/src/cli/alkane.ts Bear in mind, the wallet mnemonic must be stored as an environment variable in order to use the CLI. 

An example of how to use the wrap command is:

`oyl alkane wrap-btc --amount 0.003 --provider bitcoin --feeRate 3`

An example for how to unwrap your frBTC back to BTC is:

`oyl alkane unwrap-btc --amount 0.003 --provider bitcoin --feeRate 4`

