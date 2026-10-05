---
title: Protocol Specification
description: AID format, DHT record structures, the CBOR wire format, and how connections are established — written for third-party implementers.
audience: developer
---

This document is for third-party protocol implementers, and for developers who need to understand the wire format, the data structures, and network behavior. If you are building an application, start with [Getting Started](/docs/user/getting-started), or begin from the [Architecture Overview](/docs/integration/overview) and the [Go Packages](/docs/reference/go-packages) reference.

## Address format (AID)

An A2AL `Address` is a fixed **21 bytes**:

```
[ version byte (1 byte) ][ hash (20 bytes) ]
```

The version byte encodes the key algorithm and the hash derivation method.

### Current assignments

| Version byte | Name | Key algorithm | 20-byte derivation | Use |
| --- | --- | --- | --- | --- |
| `0xA0` | Ed25519 | Ed25519 | `SHA-256(pubkey)[0:20]` | A2AL native identity |
| `0xA1` | P256 | P-256 (NIST) | `SHA-256(pubkey)[0:20]` | A2AL native P-256 identity |
| `0xA2` | Paralism | secp256k1 | `RIPEMD160(SHA-256(pubkey))` | Paralism, Bitcoin P2PKH, Cosmos SDK |
| `0xA3` | Ethereum | secp256k1 | `Keccak-256(pubkey)[12:32]` | Ethereum and EVM-compatible chains |

### Version byte space

| Range | Status | Policy |
| --- | --- | --- |
| `0xA0`–`0xA7` | Formal | Requires expert review |
| `0xA8`–`0xAD` | Reserved | Frozen; for a future standards process only |
| `0xAE` | Experimental | No registration; uniqueness not guaranteed |
| `0xAF` | Private | No registration; uniqueness not guaranteed |

The full assignment table and the request process are in the [Address Version Registry](/docs/reference/address-version-registry).

### Display encoding

- `0xA0` (Ed25519) and `0xA1` (P256): a **42-character hexadecimal string**, with case serving as a checksum computed over SHA-256;
- `0xA2` (Paralism) and `0xA3` (Ethereum): hexadecimal with a `0x` prefix.

Parsing detects the format automatically. In code, always use the string the daemon returns; do not re-case it yourself.

### DHT NodeID

The DHT routing key is derived deterministically from the `Address`:

```
NodeID = SHA-256(version byte ‖ 20-byte hash)   = 32 bytes
```

`NodeID` is used only for XOR-distance routing inside the DHT and is not exposed at the application layer. This separation lets the routing scheme evolve independently of the identity scheme.

## Wire format data structures (CBOR)

Every record is CBOR-encoded and wrapped in a `SignedRecord` container.

### `SignedRecord`

| Field | Type | Notes |
| --- | --- | --- |
| `RecType` | `uint8` | `0x01` endpoint, `0x10` topic, `0x80` mailbox, `0x02`–`0x0f` custom |
| `Address` | 21 bytes | Publisher AID |
| `Pubkey` | bytes | Signing public key (may be an operational key) |
| `Payload` | bytes | CBOR-encoded type payload |
| `Seq` | `uint64` | Monotonic sequence number |
| `Timestamp` | `uint64` | Unix seconds |
| `TTL` | `uint32` | Validity window in seconds |
| `Signature` | bytes | Ed25519 or secp256k1 signature over the canonical fields |
| `Delegation` | bytes | Optional CBOR `DelegationProof` (carried when an operational key signs on behalf of an address derived from a master key) |

Records are validated on write and on read: signature integrity, `timestamp + TTL` covering the current time, and **signing authority** — the signing key must either derive this `Address` directly or carry a valid delegation issued by the master key.

### `EndpointPayload` (RecType `0x01`)

| Field | Type | Notes |
| --- | --- | --- |
| `Endpoints` | `[]string` | Endpoint URLs, e.g. `quic://1.2.3.4:4122`, `quic://[2001:db8::1]:4122` |
| `NatType` | `uint8` | `0` unknown, `1` full cone, `2` restricted, `3` port-restricted, `4` symmetric |
| `Signal` | `string` | Optional ICE trickle signaling base URL (for older peers) |
| `Signals` | `[]string` | Multiple signaling addresses; takes precedence over `Signal` when non-empty |
| `Turns` | `[]string` | Decoded from old records only; **new nodes no longer write** `turn://` hints, and relay credentials stay local |

Each record publishes several endpoint candidates. The connecting side dials all of them concurrently (Happy Eyeballs) and keeps the first to succeed.

### `TopicPayload` (RecType `0x10`)

Stored at `SHA-256("topic:" + capability name)` rather than at the agent's own `NodeID`; the DHT aggregates multiple publishers under the same capability name.

| Field | Type | Notes |
| --- | --- | --- |
| `Name` | `string` | Human-readable agent name |
| `Protocols` | `[]string` | Supported protocols, e.g. `"mcp"`, `"http"`, `"a2a"` |
| `Tags` | `[]string` | Tags used for filtering |
| `Brief` | `string` | Short description (≤ 140 characters) |
| `Meta` | map | Optional extended metadata |

The whole CBOR encoding of a `TopicPayload` is capped at **512 bytes**.

### `DelegationProof`

An authorization statement binding an operational key to a master AID:

| Field | Notes |
| --- | --- |
| `MasterAID` | The permanent AID being delegated |
| `OperationalPubkey` | The public key authorized to publish on behalf of `MasterAID` |
| `Scope` | Permission scope (currently network operations) |
| `IssuedAt` / `ExpiresAt` | Validity window (Unix seconds) |
| `Signature` | The master key's signature over the canonical fields above |

The master key is needed only to generate the `DelegationProof`; afterwards `a2ald` holds just the operational key and the CBOR-encoded proof. Rotating credentials means re-issuing a proof, and the **AID does not change**.

### Mailbox (RecType `0x80`)

Stored at `NodeID(recipient)`. The outer `SignedRecord.Address` identifies the sender; the payload is encrypted with X25519 + HKDF + AES-256-GCM, so only a party holding the recipient's private key can decrypt it.

## DHT operations

A2AL uses a Kademlia-style DHT that iteratively performs `FIND_NODE`, `FIND_VALUE`, and `STORE`.

Record storage enforces `RecordAuth`: a written record must be self-signed for its own `Address`, or carry a valid `DelegationProof` issued by the master key that derives that `Address`.

Bootstrap nodes are public nodes used to join the network on first start. Once joined, `a2ald` builds its own routing table and no longer depends on them.

## Connection establishment

### Direct connection (primary path)

`ConnectFromRecord` dials every `Endpoints` entry in the target endpoint record concurrently, and the first QUIC handshake to succeed wins. Each side authenticates with a certificate derived from its Ed25519 key, so authentication happens inside **mutual TLS** — no CA, domain name, or certificate distribution is involved. Wildcard listeners are dual-stack by default, and IPv6 candidates are preferred when present.

### ICE (fallback path)

When every direct attempt fails and the record carries a signaling address, both sides connect to the signaling service under a room ID derived deterministically from the two AIDs, exchange ICE candidates over WebSocket trickle, establish a point-to-point UDP path, and run QUIC on top of it. Optional external TURN can supply relay candidates at this stage; **A2AL runs no relays**, and credentials stay local and are never published to the DHT.

### agent-route framing

After the TLS handshake, the client sends **`a2r2` + the 21-byte target AID** (a 4-byte magic followed by the address), then performs one short control exchange; data flows on subsequent streams. This lets several AIDs that share one QUIC listener be addressed individually. Inbound still accepts the older `a2r1` (the 25-byte frame only).

## Application-layer boundary

The protocol handles addressing and connections only. The following belong to the daemon (`a2ald`) rather than the protocol: notes, chats, rooms, file objects, and **access control** — ACLs apply only to a given AID's inbound HTTP and object downloads, not to the DHT, notes, or chat envelopes.

## Requesting an address version

To request an unassigned version byte among `0xA4`–`0xA7`, open a GitHub issue using the **Address Version Request** template, covering the name, key algorithm, 20-byte derivation, signature verification, rationale, and a representative implementation. The review criteria and the full process are in the [Address Version Registry](/docs/reference/address-version-registry).

## Related pages

| For | Page |
| --- | --- |
| Assigning and requesting version bytes | [Address Version Registry](/docs/reference/address-version-registry) |
| Layering and implementation structure | [Architecture Overview](/docs/integration/overview) |
| Contributing implementations and docs | [Contributing](/docs/spec/contributing) |
