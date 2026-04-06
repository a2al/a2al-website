---
title: Go Packages
description: Complete API reference for the github.com/a2al/a2al Go module.
---

Module: `github.com/a2al/a2al`

## Integration levels

| Level | Package / binary | Use when |
|-------|-----------------|----------|
| **Node runtime** | `github.com/a2al/a2al/host` | DHT + QUIC on one or two UDP ports, mutual TLS, publish/resolve/connect. Recommended for most applications. |
| **DHT only** | `github.com/a2al/a2al/dht` | You provide transport and only need routing, bootstrap, and iterative `FIND_VALUE` / `STORE`. |
| **Daemon** | `a2ald` (`cmd/a2ald`) | Local REST + Web UI + MCP + DHT debug JSON. Non-Go integrations only. |

Lower-level packages (`transport`, `routing`, UDP mux internals) are building blocks; most applications should depend on `host`, `dht`, or the daemon only.

---

## `host` — `Host`

A `Host` runs a DHT `Node`, optional UDP demux for DHT+QUIC on a single port, a QUIC listener, and NAT/reflection hints via `natsense.Sense`.

### Configuration (`host.Config`)

| Field | Meaning |
|-------|---------|
| `KeyStore` | Required. Must list exactly one `Address`. |
| `ListenAddr` | DHT UDP bind, e.g. `":4121"` (default). Currently `udp4`. |
| `QUICListenAddr` | If non-empty, QUIC binds separately from DHT. If empty, QUIC shares the DHT UDP socket (mux). |
| `PrivateKey` | Ed25519 key for QUIC/TLS. If nil, `EncryptedKeyStore.Ed25519PrivateKey` is used; otherwise set explicitly. |
| `MinObservedPeers` | Minimum peers reporting the same reflected address before `Sense` trusts it (default 3). |
| `FallbackHost` | Optional advertised host when bind address and reflection data are ambiguous (e.g. `0.0.0.0`). |
| `DisableUPnP` | Skip IGD UDP port mapping for the QUIC listen port. |
| `ICESignalURL` | WebSocket base URL for ICE trickle signaling. `ConnectFromRecord` uses ICE as fallback when direct QUIC fails. |
| `ICESTUNURLs` | `stun:` URIs for ICE gathering. Empty means default public STUN when no TURN is configured. |
| `ICETURNURLs` | `turn:` URIs used locally for ICE relay. Not published to the DHT. |
| `ICEPublishTurns` | Credential-free `turn:` hints stored in `EndpointPayload.Turns` for remote peers. |
| `Logger` | `*slog.Logger`. If nil, `slog.Default()` is used. |

### Lifecycle

1. `host.New(cfg)` — starts the DHT receive loop and QUIC listener.
2. `h.Node().BootstrapAddrs(ctx, []net.Addr{...})` — join the network.
3. Optionally `h.ObserveFromPeers(ctx, seeds)` — seed observed-address sampling.
4. `h.PublishEndpoint`, `h.Resolve`, `h.Connect` / `h.ConnectFromRecord`, `h.Accept` as needed.
5. `h.Close()` — removes any UPnP mapping and shuts down.

### Primary methods

| Method | Role |
|--------|------|
| `PublishEndpoint(ctx, seq, ttl)` | Builds multi-candidate `quic://` payload (reflection, public bind, fallback, optional UPnP), signs with the node identity, stores on the DHT. |
| `PublishEndpointForAgent(ctx, agentAddr, seq, ttl)` | Same for a registered delegated agent. |
| `Resolve(ctx, target Address)` | Iterative lookup; returns `*protocol.EndpointRecord`. |
| `Connect(ctx, expectRemote Address, udpAddr)` | QUIC dial to one UDP address with mutual TLS + agent-route frame. |
| `ConnectFromRecord(ctx, expectRemote Address, er)` | Happy Eyeballs over all endpoints in the record; ICE fallback if all fail and `er.Signal` is set. |
| `ConnectFromRecordFor(ctx, localAgent, expectRemote, er)` | Same, using TLS credentials for `localAgent` (must be registered on this host). |
| `Accept(ctx)` | Blocks for inbound QUIC; returns `*AgentConn`. |
| `FirstQUICAddr(er)` | First `quic://` or legacy `udp://` entry as `*net.UDPAddr`. |
| `QUICDialTargets(er)` | Ordered, deduplicated `[]*net.UDPAddr` from an `EndpointRecord`. |
| `BuildEndpointPayload(ctx)` | Same candidate list as publish; does not sign or store. |
| `SymmetricNATReachabilityHint()` | Non-empty note when inferred NAT is symmetric. |
| `RegisterAgent(addr, priv)` | Add an extra agent identity on the same QUIC listener. |
| `RegisterDelegatedAgent(addr, opPriv, delegationCBOR)` | Register an agent published under a master-derived AID. |
| `UnregisterAgent(addr)` / `RegisteredAgents()` | Remove or list extra agents. |
| `Address`, `DHTLocalAddr`, `QUICLocalAddr` | Introspection. |
| `Node()`, `Sense()` | Access underlying DHT node or NAT/reflection state. |
| `ObserveFromPeers` | Triggers ping-style contact to collect `observed_addr` for `Sense`. |
| `SendMailbox` / `PollMailbox` | DHT mailbox for the default host identity. |
| `SendMailboxForAgent` / `PollMailboxForAgent` | Same for a registered agent. |
| `RegisterTopic` / `RegisterTopics` | Topic rendezvous: publish `RecType 0x10` at `SHA-256("topic:"+string)`. |
| `RegisterTopicForAgent` / `RegisterTopicsForAgent` | Same for a registered agent. |
| `SearchTopic` / `SearchTopics` | `AggregateRecords` on topic key. `SearchTopics` returns AIDs present in all listed topics. |
| `StartDebugHTTP(addr)` / `DebugHTTPHandler()` | Read-only JSON debug endpoints. |
| `Close()` | Shuts down QUIC, mux, and DHT. |

### `AgentConn`

Embeds `quic.Connection`. Fields:

- `Local` — agent `Address` selected for this connection (agent-route frame, else SNI, else default)
- `Remote` — peer `Address` from the mutual TLS peer certificate (inbound)

### QUIC agent-route frame

After the TLS handshake, the client **must** open a stream and write **25 bytes**: prefix `a2r1` (ASCII) followed by the 21-byte binary `Address` of the intended server agent. The server uses this for routing when multiple agents share one listener.

---

## `dht` — `Node`

Use when you implement your own stack and only need Kademlia-style RPCs and storage.

### Configuration (`dht.Config`)

| Field | Meaning |
|-------|---------|
| `Transport` | Required. DHT UDP (or mux) transport. |
| `Keystore` | Required. Exactly one identity. |
| `OnObservedAddr` | Optional callback when responses carry `observed_addr`. |
| `RecordAuth` | Optional. After signature verification passes, called before accepting a `STORE`; enforce whether `Pubkey` may publish for the record `Address`. If nil, no authority check. |

### Lifecycle

1. `dht.NewNode(dht.Config{...})`
2. `Start()`
3. `BootstrapAddrs` / `Bootstrap` / `StartWithBootstrap`
4. `PublishEndpointRecord` or `NewQuery(n).Resolve` / `FindNode`
5. `Close()`

### Common methods

| Method | Role |
|--------|------|
| `BootstrapAddrs(ctx, []net.Addr)` | Bootstrap: only `ip:port` required; identity learned from PONG. |
| `PingIdentity(ctx, addr)` | Returns `PeerIdentity{Address, NodeID}`. |
| `PublishEndpointRecord(ctx, rec)` | STORE signed record to closest peers. |
| `PublishMailboxRecord(ctx, storeKey, rec)` | STORE mailbox record at recipient `NodeID`. |
| `PublishTopicRecord(ctx, storeKey, rec)` | STORE topic record at `TopicNodeID`. |
| `NewQuery(n).Resolve(ctx, NodeID)` | Iterative endpoint fetch. |
| `NewQuery(n).FindNode(ctx, NodeID)` | Iterative `FIND_NODE`. |

---

## Identity and signing

| Package | Items |
|---------|-------|
| `github.com/a2al/a2al` | `Address`, `NodeID`, `ParseAddress`, `NodeIDFromAddress` |
| `github.com/a2al/a2al/crypto` | `KeyStore`, `EncryptedKeyStore` (optional `Ed25519PrivateKey` for QUIC), `AddressFromPublicKey`, `GenerateEd25519`, sign/verify helpers |
| `github.com/a2al/a2al/identity` | `ScopeNetworkOps`, `SignDelegation`, `EncodeDelegationProof`, `ParseDelegationProof`, `VerifyDelegation`, `(DelegationProof).AgentAID()` |

---

## Endpoint records (`protocol`)

| Item | Role |
|------|------|
| `SignedRecord` | On-wire CBOR container; optional `Delegation` bytes for operational-key publishes. |
| `EndpointPayload` | `Endpoints []string` (use `quic://host:port`), `NatType uint8`, `Signal string`, `Turns []string` |
| `EndpointRecord` | Decoded view after verify: `Address`, `Endpoints`, `NatType`, `Signal`, `Turns`, `Seq`, `Timestamp`, `TTL` |
| `SignEndpointRecord(priv, addr, payload, seq, timestamp, ttl)` | Build `SignedRecord` when the signing key is the AID's master key. |
| `SignEndpointRecordDelegated(opPriv, delegationCBOR, addr, payload, seq, timestamp, ttl)` | Build `SignedRecord` when an operational key publishes for a master-derived `addr`. |
| `ParseEndpointRecord(sr)` | Verify and decode to `EndpointRecord`. |
| `VerifySignedRecord(sr, now)` | Cryptographic integrity + expiry check; does **not** enforce pubkey↔address authority. |
| NAT constants | `NATUnknown`, `NATFullCone`, `NATRestricted`, `NATPortRestricted`, `NATSymmetric` |

### Mailbox

| Item | Role |
|------|------|
| `RecTypeMailbox` (`0x80`) | Stored at `NodeID(recipient)`; outer `SignedRecord.Address` = sender AID. |
| `EncodeMailboxPayload`, `OpenMailboxRecord` | X25519 + HKDF + AES-256-GCM wire helpers. |
| `MailboxMessage` | Decrypted view: `Sender`, `MsgType`, `Body`. |

### Topic rendezvous

| Item | Role |
|------|------|
| `TopicNodeID(topic)` | `SHA-256("topic:" \|\| UTF-8 topic)` as DHT key. |
| `RecTypeTopic` (`0x10`) | `TopicPayload` CBOR in `SignedRecord.payload` (≤512 B); `Address` = registrant AID. |
| `TopicEntry` | Decoded listing: AID, `TopicPayload` fields, `Seq` / `Timestamp` / `TTL`. |
| `DiscoverFilter`, `FilterTopicEntries` | Optional `protocols` / `tags` AND-style client filter. |

---

## `config` — daemon TOML

| Function / method | Role |
|------------------|------|
| `Default()` | Spec default field values. |
| `(*Config) Validate()` | Required fields and enums. |
| `LoadFile(path)` / `Save(path, c)` | TOML read/write. |
| `ApplyEnv(c)` | Overlay `A2AL_*` environment variables. |
| `(*Config) KeyDirOrDefault(dataDir)` | Resolve key directory. |

---

## Debug HTTP

`dht.DebugHTTPAddr` (`127.0.0.1:2634`) is the suggested default for library-only `Host` or `Node`.

| Path | Provided by |
|------|-------------|
| `/debug/identity`, `/debug/routing`, `/debug/store`, `/debug/stats` | `dht.Node` (and `Host` via combined handler) |
| `/debug/host` | `Host` only — QUIC bind, registered agents, NAT/reflection summary |

All responses are read-only JSON.

---

## `natsense`

When using `Host`, `Sense()` exposes consensus over reflected UDP endpoints:

- `MinAgreeing` / `SetMinAgreeing` — lower to `1` for small test networks
- `TrustedUDP` / `TrustedWire` / `InferNATType` — read trusted reflection and coarse NAT classification

---

## Not yet implemented

- **TURN relay** — config fields exist; `pion/turn` server-side relay not yet integrated for symmetric-NAT fallback
- **IPv6 dual-stack `Host` listener** — wire format supports IPv6; `New()` currently uses `udp4` only

---

## Tests

```bash
go test -vet=off -count=1 ./...
```

Example programs under `examples/` use separate `go.mod` files and import the parent module via `replace`.
