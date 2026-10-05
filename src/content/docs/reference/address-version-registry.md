---
title: Address Version Registry
description: The A2AL address version byte space — its assigned values, its policies, and how to request a new assignment.
audience: developer
stage: dev
---

> **Status: draft.** This page records the A2AL address version byte space, the values currently registered, and the process for requesting a new assignment; the policy and the values may still change.

## Address structure

An A2AL `Address` is a fixed **21 bytes**:

```
[ version byte (1 byte) ][ hash (20 bytes) ]
```

The version byte encodes **the key algorithm and the derivation of the 20-byte hash**. It does not identify a blockchain: chains that share the same key algorithm and derivation map to the same version byte.

The DHT `NodeID` is derived from the address:

```
NodeID = SHA-256(version byte ‖ 20-byte hash)
```

## Version byte space

The version byte space is `0xA0`–`0xAF` (16 values).

| Range | Status | Policy |
| --- | --- | --- |
| `0xA0`–`0xA7` | Formal | Requires expert review (see below) |
| `0xA8`–`0xAD` | Reserved | Frozen; for a future standards process only |
| `0xAE` | Experimental | No registration; uniqueness not guaranteed |
| `0xAF` | Private | No registration; uniqueness not guaranteed |

## Current assignments

| Version byte | Name | Key algorithm | 20-byte derivation | Typical use |
| --- | --- | --- | --- | --- |
| <span class="nowrap">`0xA0`</span> | `Ed25519` | Ed25519 | `SHA-256(pubkey)[0:20]` | A2AL native identity |
| <span class="nowrap">`0xA1`</span> | `P256` | P-256 (NIST) | `SHA-256(pubkey)[0:20]` | A2AL native P-256 identity |
| <span class="nowrap">`0xA2`</span> | `Paralism` | secp256k1 | `RIPEMD160(SHA-256(pubkey))` | Paralism, Bitcoin P2PKH, Cosmos SDK, Litecoin |
| <span class="nowrap">`0xA3`</span> | `Ethereum` | secp256k1 | `Keccak-256(pubkey)[12:32]` | Ethereum and all EVM-compatible chains |
| `0xA4`–`0xA7` | — | — | — | Unassigned |

> **About `0xA2` (Paralism):** it names the "secp256k1 + HASH160" derivation family. Any chain that uses the same key algorithm and derivation is compatible with this version byte; the name comes from the first chain formally integrated, and implies no exclusivity.

## Request process

To request an unassigned version byte (`0xA4`–`0xA7`), open a GitHub issue using the **Address Version Request** template, including:

1. **Name** — a short identifier for the version byte (usually a chain or algorithm name);
2. **Key algorithm** — such as Ed25519, secp256k1, P-256, or Sr25519;
3. **20-byte derivation** — the exact function that maps a public key to 20 bytes, with a reference to its specification;
4. **Signature verification** — how to verify a signature over arbitrary bytes with this key type;
5. **Rationale** — why the existing version bytes cannot cover the use case;
6. **Representative chain or implementation** — at least one concrete user.

The A2AL maintainers review requests under an **expert review** policy. Approval criteria:

- the key algorithm and derivation are not already covered by an existing assignment;
- the derivation is deterministic and yields exactly 20 bytes;
- a normative public specification of the key algorithm exists;
- the request is neither duplicative nor speculative.

Once approved, the assignment is merged into this page and synced to the code constants.

## Experimental and private use

- **`0xAE` (experimental):** free to use for prototypes and tests. Uniqueness across implementations is not guaranteed. Do not use in production.
- **`0xAF` (private):** for closed or internal deployments that do not require global uniqueness; implementations may allocate as they see fit.

## Reserved range

`0xA8`–`0xAD` is frozen and will only be allocated once a future standards process begins and the formal pool (`0xA0`–`0xA7`) approaches exhaustion. Requests pointing at this range are not accepted under the current policy.

## Relationship to chain identity

A version byte identifies a **cryptographic scheme**, not a chain. Two chains that share the same key algorithm and derivation (say, Paralism and the Bitcoin SDK) map the same public key to the same A2AL address. Chain-specific context belongs in the endpoint record or the application layer, not in the address itself.

## Related pages

| For | Page |
| --- | --- |
| Where addresses and records sit in the protocol | [Protocol Specification](/docs/spec/protocol) |
| Identity and delegation in the implementation | [Go Packages](/docs/reference/go-packages) |
| How to submit a request | [Contributing](/docs/spec/contributing) |
