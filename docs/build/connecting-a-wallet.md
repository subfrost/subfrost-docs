---
title: Connecting a wallet
sidebar_label: Connecting a wallet
sidebar_position: 6
description: Let a web app request signatures from a SUBFROST wallet, through the injected provider or remote signing.
---

# Connecting a wallet

A web app never holds the user's keys. To do anything that costs money or moves assets, it asks a wallet to sign. On SUBFROST there are two ways to reach that wallet, depending on where the user is.

## Two connection paths

- **Injected provider.** When the user has the SUBFROST browser extension installed, it injects a provider object that your page can call directly. This is the smoothest path when it is available.
- **Remote signing.** When the user is on a desktop browser with no wallet present, the app pairs with the wallet on the user's phone through the SUBFROST pair bridge, with end-to-end encryption. The app shows a QR code, the phone scans it, and from then on the app sends sign requests to the phone, which prompts the user for each one. This is documented in full on the [WalletConnect](../api-reference/guides/walletconnect) reference page.

Both paths expose the same two operations that matter: **sign a PSBT** (to authorize a Bitcoin transaction) and **sign a message** (to prove control of an address). The app builds the transaction or message, the wallet approves and signs, the app broadcasts.

## The injected provider

When the SUBFROST browser extension is installed, it defines `window.subfrost` on every page. The object is read-only, and its shape follows the same convention as other Bitcoin wallet providers, so if you have integrated a Bitcoin wallet before, the method names will look familiar.

### Detecting the wallet

The extension injects the provider as the page loads, so a script that runs very early can execute before `window.subfrost` exists. Handle both cases: check for the object, and also listen for the `subfrost:initialized` event the extension fires once the provider is ready.

```javascript
function getProvider() {
  return typeof window !== 'undefined' ? window.subfrost : undefined;
}

// Already injected, the common case
let subfrost = getProvider();

// Injected later, for scripts that run before the extension
window.addEventListener('subfrost:initialized', (event) => {
  subfrost = getProvider();
  // event.detail: { id: 'subfrost', name: 'Subfrost', icon: '/icons/icon-128.png' }
});

if (!subfrost) {
  // No extension in this context. Fall back to remote signing (QR pairing).
}
```

### Connecting and reading account state

`requestAccounts` is the connect call. The first request from a site the user has not connected yet, whichever method it is, opens a connect prompt in the wallet; the request continues if the user approves and fails if they decline. `getAccounts` sends exactly the same request as `requestAccounts`, so it also prompts on a site that is not connected yet.

Both resolve with an array holding one address: the address currently selected in the wallet (the active account and address type). While the wallet is locked, the request waits for the user to unlock rather than failing, and the page's own 60-second timeout applies.

```javascript
// Prompts the user to connect, returns the selected address
const accounts = await subfrost.requestAccounts();

// The network the wallet is on. The extension currently always answers 'mainnet'.
const network = await subfrost.getNetwork();

// Taproot x-only public key of the active account, 64 hex characters
const pubkey = await subfrost.getPublicKey();
```

`getPublicKey` accepts an address argument but ignores it: it always returns the x-only taproot public key of the active account. It needs an unlocked wallet and waits for an unlock like `getAccounts`.

### Signing

```javascript
// Sign one PSBT (hex). The user approves it in the wallet.
const signedPsbtHex = await subfrost.signPsbt(unsignedPsbtHex);

// Keep the signed PSBT unfinalized, for example when another party still has to sign
const partial = await subfrost.signPsbt(unsignedPsbtHex, { autoFinalized: false });

// Request a sighash type for a specific input (0x83 = SIGHASH_SINGLE | ANYONECANPAY)
const listing = await subfrost.signPsbt(unsignedPsbtHex, {
  autoFinalized: false,
  toSignInputs: [{ index: 0, sighashTypes: [0x83] }],
});

// Prove control of an address
const signature = await subfrost.signMessage('Authorize this action', accounts[0]);
```

`signPsbt(psbtHex, options?)` options:

| Option | Effect |
| --- | --- |
| `autoFinalized` | When omitted, the wallet finalizes the inputs it signs. Pass `false` to get a signed but unfinalized PSBT back. |
| `toSignInputs` | Array of `{ index, sighashTypes? }` entries that request a sighash type for an input. It does not choose which inputs get signed. |

`signMessage(message, address)` signs with the format that fits the address: BIP-322 for taproot addresses, BIP-137 (legacy Bitcoin Signed Message) for the others.

### Building PSBTs for the extension

- **Inputs.** The wallet signs every input it owns and leaves the rest alone. It recognizes its inputs by the `witness_utxo` script, so set `witness_utxo` on every input. For p2wpkh inputs, also set `bip32_derivation` with the wallet's public key.
- **Other parties' inputs.** By default the wallet finalizes the PSBT, and it refuses if any input is left unsigned. When the PSBT has inputs that someone else signs, pass `autoFinalized: false`.
- **Coin selection is yours.** The wallet does not pick inputs for your PSBT. Choose the inputs yourself and leave out UTXOs that carry Alkanes, or those assets move with the transaction.
- **Fee.** If your PSBT pays less than the wallet's current fee rate, the wallet can raise the fee before signing, by lowering your change output or adding an input and change output of its own. Read the transaction back from the returned PSBT.
- **Broadcast.** The provider has no broadcast method. Your app broadcasts the signed transaction.

### Signing several PSBTs

Two calls take an array of PSBT hex strings, and they differ in how many times the user is asked to approve:

- **`signPsbts(psbts, options?)`** sends one request per PSBT, each with the same `options` as `signPsbt`. The user approves them one at a time.
- **`signPsbtBundle(psbts, options?)`** sends the whole array as a single request, and the user approves the bundle once. The approval shows every transaction in the bundle; when the wallet recognizes the bundle as a known operation, it also labels the approval with that operation. `options` is accepted but not applied: every PSBT in a bundle is signed with the defaults (finalized, default sighash).

Both resolve with the signed PSBTs in the same order as the input, and both resolve with an empty array when given one. If the user rejects, the whole call rejects and nothing is returned, so re-submit the unsigned remainder rather than expecting a partial result.

```javascript
// One approval per PSBT
const signed = await subfrost.signPsbts([psbtA, psbtB, psbtC]);

// One approval for the whole bundle
const signedBundle = await subfrost.signPsbtBundle([psbtA, psbtB, psbtC]);
```

### Reacting to wallet changes

The provider is an event emitter. Subscribe with `on`, unsubscribe with `off`.

| Event | Handler arguments | Fires when |
| --- | --- | --- |
| `accountsChanged` | `(accounts)`, an array with the newly selected address, or empty | The wallet is unlocked, or the user switches wallet, account or address type, or adds or removes an account. An empty array means the wallet was locked. |
| `disconnect` | none | The user revokes your site under Connected Sites |

```javascript
const onAccountsChanged = (accounts) => {
  // Re-read state, or treat an empty list as "locked"
};

subfrost.on('accountsChanged', onAccountsChanged);
subfrost.on('disconnect', () => {
  // Drop the session and show your connect button again
});

// Later, when your component unmounts
subfrost.off('accountsChanged', onAccountsChanged);
```

There is no network-changed event. Read `getNetwork()` when you need the current network.

### Errors and timeouts

Every method rejects with an `Error` whose message is prefixed with a code in square brackets, followed by a human-readable message:

```
[REQUEST_TIMEOUT] subfrost: request timed out
```

Two codes matter to your app:

| Code | Meaning |
| --- | --- |
| `REQUEST_TIMEOUT` | 60 seconds passed with no answer from the wallet. The user most likely never saw the prompt, or the wallet stayed locked. |
| `UNKNOWN_ERROR` | The request did not go through, including the user rejecting it or declining the connect prompt. |

Treat any other code as a failure to reach the extension.

A request that goes unanswered rejects after 60 seconds. Treat that as "no answer" rather than as a refusal, and invite the user to open the wallet and retry.

:::warning[A user rejection is not distinguishable from other failures today]
When the user rejects a prompt, the wallet replies with a message but no code, so it reaches your page as `UNKNOWN_ERROR`. The accompanying message is localized, which means it changes with the user's language and is not safe to match on. Until a dedicated rejection code exists, treat any `UNKNOWN_ERROR` from a signing call as "the request did not go through", and let the user retry rather than showing a rejection-specific error.
:::

```javascript
try {
  const signed = await subfrost.signPsbt(psbtHex);
} catch (err) {
  if (err.message.startsWith('[REQUEST_TIMEOUT]')) {
    // No answer. Ask the user to open the wallet and try again.
  } else {
    // The user rejected, or the wallet reported an error. Let them retry.
  }
}
```

## Remote signing (QR pairing)

When there is no injected provider, pair with the mobile wallet over the SUBFROST pair bridge. The app renders a pairing QR code, the phone scans it and connects to the app through the bridge, and a session is established. Requests and responses are end-to-end encrypted: the bridge never sees the pairing code or the app's public key, so it cannot read or change a request, and every signing request is approved on the phone.

The full protocol (pairing URI, bridge frames, key derivation, framing, message format, security model) and the reference client are on the [WalletConnect](../api-reference/guides/walletconnect) page.

## Where to go next

- [WalletConnect](../api-reference/guides/walletconnect): the remote-signing protocol in detail.
- [Wrapping frBTC](./wrapping-frbtc): a first transaction to sign.
- [Safety](../using-subfrost/safety): the fresh-wallet habit for Alkanes.
