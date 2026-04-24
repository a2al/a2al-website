---
title: Protocol Specification
description: AID format, DHT operations, data structures, and connection establishment for third-party implementers.
---

This document is intended for third-party protocol implementers and developers who need to understand A2AL's wire format, data structures, and network behavior. Application developers should start with the [Getting Started guide](/docs/user/getting-started) or, for a deeper look at the stack, the [Architecture Overview](/docs/integration/overview) or the [Go Packages reference](/docs/reference/go-packages).

---

## Address Format (AID)

An A2AL `Address` is a fixed **21-byte** value:

```
[ version_byte (1 byte) ] [ hash (20 bytes) ]
```

The version byte encodes the cryptographic key algorithm and hash derivation method.

### Current assignments

| Version Byte | Name | Key Algorithm | 20-byte Derivation | Uses |
|-------------|------|--------------|-------------------|------|
| `0xA0` | Ed25519 | Ed25519 | `SHA-256(pubkey)[0:20]` | A2AL native identity |
| `0xA1` | P256 | P-256 (NIST) | `SHA-256(pubkey)[0:20]` | A2AL native P-256 identity |
| `0xA2` | Paralism | secp256k1 | `RIPEMD160(SHA-256(pubkey))` | Paralism, Bitcoin P2PKH, Cosmos SDK |
| `0xA3` | Ethereum | secp256k1 | `Keccak-256(pubkey)[12:32]` | Ethereum and EVM-compatible chains |

### Version byte space

| Range | Status | Policy |
|-------|--------|--------|
| `0xA0`–`0xA7` | Official | Expert Review required |
| `0xA8`–`0xAD` | Reserved | Frozen; future standards use only |
| `0xAE` | Experimental | No registration required; no uniqueness guarantee |
| `0xAF` | Private Use | No registration required; no uniqueness guarantee |

### Display encoding

- `0xA0` (Ed25519) and `0xA1` (P256): displayed as a ~44-character base58-like string
- `0xA2` (Paralism) and `0xA3` (Ethereum): displayed as `0x`-prefixed hex

Parsing is automatic based on format.

### DHT NodeID

The DHT routing key is derived deterministically from an `Address`:

```
NodeID = SHA-256(version_byte || hash_20bytes)   = 32 bytes
```

`NodeID` is used only inside the DHT for XOR-distance routing and is never exposed at the application layer. This separation allows the routing scheme to evolve independently of the identity scheme.

---

## On-Wire Data Structures (CBOR)

All records are encoded as CBOR and wrapped in a `SignedRecord` container.

### `SignedRecord`

| Field | Type | Description |
|-------|------|-------------|
| `RecType` | `uint8` | `0x01` endpoint, `0x10` topic, `0x80` mailbox, `0x02–0x0f` custom |
| `Address` | 21 bytes | AID of the publishing agent |
| `Pubkey` | bytes | Signing public key (may be an operational key) |
| `Payload` | bytes | CBOR-encoded type-specific payload |
| `Seq` | `uint64` | Monotone sequence number |
| `Timestamp` | `uint64` | Unix seconds |
| `TTL` | `uint32` | Validity window in seconds |
| `Signature` | bytes | Ed25519 or secp256k1 signature over canonical fields |
| `Delegation` | bytes | Optional CBOR `DelegationProof` (present when an operational key signs for a master-derived AID) |

Records are verified before storage and on retrieval: signature integrity, timestamp + TTL coverage of "now", and authority — the signing key must either derive the record's `Address` directly, or carry a valid `Delegation` from the master key.

### `EndpointPayload` (RecType `0x01`)

| Field | Type | Description |
|-------|------|-------------|
| `Endpoints` | `[]string` | Network endpoints as URLs, e.g. `quic://1.2.3.4:4122` |
| `NatType` | `uint8` | `0` unknown, `1` full cone, `2` restricted, `3` port-restricted, `4` symmetric |
| `Signal` | `string` | Optional WebSocket base URL for ICE trickle signaling |
| `Turns` | `[]string` | Optional credential-free `turn://` relay hints for remote peers |

Multiple endpoint candidates are published per record. The connecting peer dials all candidates concurrently (Happy Eyeballs) and uses whichever succeeds first.

### `TopicPayload` (RecType `0x10`)

Stored at `SHA-256("topic:" + service_name)` in the DHT, not at the agent's own `NodeID`. Multiple agents publishing the same service name are aggregated by the DHT.

| Field | Type | Description |
|-------|------|-------------|
| `Name` | `string` | Human-readable agent name |
| `Protocols` | `[]string` | Supported protocols (e.g. `"mcp"`, `"http"`, `"a2a"`) |
| `Tags` | `[]string` | Capability tags for filtering |
| `Brief` | `string` | Short description (≤ 256 bytes) |
| `Meta` | map | Optional extended metadata |

### `DelegationProof`

An authorization statement binding an operational key to a master AID:

| Field | Description |
|-------|-------------|
| `MasterAID` | The permanent AID being delegated for |
| `OperationalPubkey` | The Ed25519 public key authorized to publish on behalf of `MasterAID` |
| `Scope` | Permission scope (currently: network operations) |
| `IssuedAt` / `ExpiresAt` | Validity window (Unix seconds) |
| `Signature` | Master private key signature over the canonical fields |

The master private key is only needed to produce a `DelegationProof`. After that, `a2ald` holds only the operational key and the CBOR-encoded proof. Rotating credentials means issuing a new proof; the AID is unchanged.

### Mailbox (RecType `0x80`)

Stored at `NodeID(recipient)`. The outer `SignedRecord.Address` identifies the sender. The payload is encrypted with X25519 + HKDF + AES-256-GCM — only the holder of the recipient's private key can decrypt it.

---

## DHT Operations

A2AL uses a Kademlia-style DHT with iterative `FIND_NODE`, `FIND_VALUE`, and `STORE` RPCs.

Record storage enforces `RecordAuth` — stored records must be either self-signed for their `Address` or carry a valid `DelegationProof` from the master key that derives the `Address`.

Bootstrap nodes are pre-configured public nodes used to join the network on first start. Once joined, `a2ald` builds its own routing table and no longer depends on bootstrap nodes.

---

## Connection Establishment

### Direct path (primary)

`ConnectFromRecord` dials all `Endpoints` from the target's endpoint record concurrently. The first successful QUIC handshake wins. Both sides perform mutual TLS with certificates derived from their Ed25519 keys — identity is verified as part of the handshake.

### ICE path (fallback)

When all direct dials fail and the endpoint record carries a `Signal` URL, both peers connect to the signaling server using a deterministic room ID (derived from both AIDs) and exchange ICE candidates via WebSocket trickle. A peer-to-peer UDP path is established through ICE; QUIC then runs over that path.

### Agent-route frame

After the TLS handshake, the client sends a 25-byte **agent-route frame**: prefix `a2r1` (ASCII, 4 bytes) followed by the 21-byte binary `Address` of the intended server agent. This allows multiple agents sharing one QUIC listener to be addressed independently via TLS SNI routing.

---

## Address Version Registry

To request assignment of an unassigned version byte (`0xA4`–`0xA7`), open a GitHub Issue using the **Address Version Request** template. The request must include:

1. **Name** — short identifier (typically the primary chain or algorithm name)
2. **Key algorithm** — e.g. Ed25519, secp256k1, P-256, Sr25519
3. **20-byte derivation** — exact function with a normative reference
4. **Signature verification** — how a signature over arbitrary bytes is verified
5. **Rationale** — why an existing version byte does not cover this use case
6. **Representative chain or implementation** — at least one concrete user

Approval criteria: the key algorithm and derivation are not already covered; the derivation is deterministic and produces exactly 20 bytes; a normative public specification exists.
