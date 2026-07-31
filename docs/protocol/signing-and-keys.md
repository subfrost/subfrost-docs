---
title: Signing and Keys
sidebar_label: Signing and Keys
sidebar_position: 4
description: The cryptography behind SUBFROST custody, Schnorr signatures, threshold signing, distributed key generation, and how keys are protected on your device.
---

# Signing and Keys

SUBFROST custody rests on a few pieces of well understood cryptography. This page explains them in one place: the Schnorr signatures that Bitcoin already uses, the threshold schemes that let a group sign together, the ceremony that generates the shared key, and how your keys are protected on your device.

For how these secure the frBTC peg specifically, see [frBTC Peg & Custody](./frbtc-peg-and-custody).

## Schnorr signatures

A **Schnorr signature** is the digital signature scheme that Bitcoin adopted in the Taproot upgrade (BIP-340). It works over **secp256k1**, the same elliptic curve Bitcoin has always used, so a Schnorr signature is a native, first-class Bitcoin signature. This matters for SUBFROST: the group has to produce signatures that spend real BTC, so the signing scheme has to speak Bitcoin's own language.

Schnorr has three properties that make it the right building block here:

- **Linearity.** Signatures and keys add together cleanly. Several signers can each produce a partial signature and those partials combine into one valid signature. This is the property that makes threshold signing possible, and it is exactly what older ECDSA signatures lack.
- **Fixed, compact size.** A Schnorr signature is 64 bytes.
- **Provable security.** The scheme is secure under standard assumptions, as long as the discrete logarithm problem stays hard.

Because the combined signature is an ordinary Schnorr signature, what lands on Bitcoin is indistinguishable from a single-key spend. The chain does not see a multisig; it sees one signature.

## Threshold signing with FROST and ROAST

SUBFROST does not give any one party the key that controls custody. Instead the key is shared across the signer set using two threshold schemes, FROST & ROAST. You can read about these in [frBTC Peg & Custody](./frbtc-peg-and-custody).

FROST and ROAST together let a group of `n` signers produce a signature only when a threshold `t` of them cooperate, without any single signer ever holding the whole private key.

Signing happens in two phases:

1. **Pre-computation.** Each participant generates nonce material ahead of time and shares the public part. This can be done before any specific signature is needed.
2. **Online signing.** When a signature is required for a specific message, such as a Bitcoin withdrawal transaction, each participant uses their secret share and a pre-computed nonce to produce a **partial signature**. A coordinator, which can be any participant, aggregates the partials into one valid signature.

ROAST is the piece that makes this robust in the real world: it keeps the signing session moving even when some participants are slow or drop offline, so a single unresponsive signer cannot stall a withdrawal.

The signer set is not fixed forever. Participants can join or leave through a **reshare**, which redistributes the shares to a new group while keeping the same group public key, so the custody address does not change and no funds move.

## Distributed key generation

Before the group can sign anything, it has to agree on a shared key. It does this through **distributed key generation (DKG)**, an interactive ceremony where the participants jointly produce a single group public key while each one ends up holding only a secret **share** of the matching private key.

The important property is that the full private key is never assembled anywhere, not on any one machine and not even by a colluding subset below the threshold. There is no moment where the complete key exists to be stolen. This is the foundation the whole custody model stands on.

## Keys on your device

As a user, you also hold keys: the secret behind your own wallet, and, if you take part in signing, your share of a group key. These live in a **keystore** on your device.

A keystore never holds secrets in plaintext. When you set it up, you choose a passphrase, and:

1. The passphrase is stretched through a **key-derivation function** with a random salt. This is deliberately slow, so guessing the passphrase offline is expensive even if someone copies the file.
2. The derived key encrypts your secrets with **AES-256-GCM**, an authenticated cipher that protects both confidentiality (the data is unreadable) and integrity (tampering is detected).

On mobile, this is backed by the device's secure hardware where available, using **StrongBox** on Android and the **Secure Enclave** on iOS, so the protecting key can be bound to the device and never exposed to the app or the operating system.

## Where to go next

- [frBTC Peg & Custody](./frbtc-peg-and-custody): how this signing secures the BTC behind frBTC.
- [What is SUBFROST](../start-here/what-is-subfrost): the big picture.
