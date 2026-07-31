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
- **Remote signing.** When the user is on a desktop browser with no wallet present, the app pairs with the wallet on the user's phone over an encrypted relay. The app shows a QR code, the phone scans it, and from then on the app sends sign requests to the phone, which prompts the user for each one. This is documented in full on the [WalletConnect](../api-reference/guides/walletconnect) reference page.

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

`requestAccounts` is the connect call: it prompts the user to approve your site, and resolves with the addresses they chose to share. `getAccounts` returns the addresses for a site that is already connected.

```javascript
// Prompts the user to connect, returns the approved addresses
const accounts = await subfrost.requestAccounts();

// The network the wallet is currently on
const network = await subfrost.getNetwork();

// Public key for an address (defaults to the active account)
const pubkey = await subfrost.getPublicKey(accounts[0]);
```

### Signing

```javascript
// Sign one PSBT. The user approves it in the wallet.
const signedPsbtHex = await subfrost.signPsbt(unsignedPsbtHex);

// Optionally let the wallet finalize the PSBT for you
const finalized = await subfrost.signPsbt(unsignedPsbtHex, { autoFinalized: true });

// Prove control of an address
const signature = await subfrost.signMessage('Authorize this action', accounts[0]);
```

`signMessage` takes an optional third argument that selects the signature format:

| `protocol` | Signature produced |
| --- | --- |
| `'bip322'` or `'bip322-simple'` | BIP-322 witness signature, for segwit and taproot addresses |
| omitted, `'bsm'`, or `'ecdsa'` | Legacy BIP-137 Bitcoin Signed Message |

### Signing several PSBTs

Two calls take an array of PSBTs, and they differ in how many times the user is asked to approve:

- **`signPsbts(psbts, options?)`** queues one approval per PSBT. The user steps through them one at a time.
- **`signPsbtBundle(psbts, options?)`** sends the whole array as a single envelope. When the wallet recognizes the bundle as a known operation, it renders one approval covering every transaction, so the user approves once. When it does not recognize the bundle, it falls back to the same one-approval-per-PSBT flow as `signPsbts`.

Both resolve with the signed PSBTs in the same order as the input. If the user rejects any single PSBT, the whole call rejects and nothing is returned, so re-submit the unsigned remainder rather than expecting a partial result.

```javascript
// One approval per PSBT
const signed = await subfrost.signPsbts([psbtA, psbtB, psbtC]);

// One approval for the whole bundle, when the wallet recognizes it
const signedBundle = await subfrost.signPsbtBundle([psbtA, psbtB, psbtC]);
```

### Reacting to wallet changes

The provider is an event emitter. Subscribe with `on`, unsubscribe with `off`.

| Event | Fires when |
| --- | --- |
| `accountsChanged` | The wallet locks or unlocks, so the visible accounts change |
| `disconnect` | The user revokes your site under Connected Sites |

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

Two codes reach the page today:

| Code | Meaning |
| --- | --- |
| `REQUEST_TIMEOUT` | 60 seconds passed with no answer from the wallet. The user most likely never saw the prompt. |
| `UNKNOWN_ERROR` | Everything else, including the user rejecting the request. |

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

When there is no injected provider, pair with the mobile wallet over the relay. The app renders a pairing QR, the phone scans it, and a session is established. Requests and responses are end-to-end encrypted; the relay only forwards ciphertext, and every request is approved on the phone.

The client library and the full protocol (pairing URI, envelope format, security model) are on the [WalletConnect](../api-reference/guides/walletconnect) page.

## Where to go next

- [WalletConnect](../api-reference/guides/walletconnect): the remote-signing protocol in detail.
- [Wrapping frBTC](./wrapping-frbtc): a first transaction to sign.
- [Safety](../using-subfrost/safety): the fresh-wallet habit for Alkanes.
