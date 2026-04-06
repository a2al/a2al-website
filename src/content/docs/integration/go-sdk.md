---
title: Go SDK
description: Embed A2AL directly into your Go program using the host and dht packages.
---

Import the module:

```
github.com/a2al/a2al
```

The primary entry point for most Go applications is `github.com/a2al/a2al/host`. Lower-level packages (`dht`, `protocol`, `identity`, `crypto`) are available when you need finer control.

## Integration levels

| Level | Package | Use when |
|-------|---------|----------|
| **Node runtime** | `github.com/a2al/a2al/host` | DHT + QUIC on one or two UDP ports, mutual TLS between agents, publish/resolve/connect helpers. Recommended for most applications. |
| **DHT only** | `github.com/a2al/a2al/dht` | You provide transport and only need routing, bootstrap, and iterative `FIND_VALUE` / `STORE`. |
| **Daemon** | `a2ald` (`cmd/a2ald`) | Non-Go integrations; local REST + MCP + Web UI. |

---

## `host.Host`

`Host` composes all lower layers into a single runtime: DHT node, QUIC transport, NAT sensing, and UPnP mapping.

### Configuration (`host.Config`)

| Field | Meaning |
|-------|---------|
| `KeyStore` | Required. Must list exactly one `Address`. |
| `ListenAddr` | DHT UDP bind, e.g. `":4121"` (default). |
| `QUICListenAddr` | If non-empty, QUIC binds separately from DHT. If empty, QUIC shares the DHT UDP socket. |
| `PrivateKey` | Ed25519 key for QUIC/TLS. If nil, uses `EncryptedKeyStore.Ed25519PrivateKey`. |
| `FallbackHost` | Optional advertised host when bind address and reflection data are ambiguous. |
| `DisableUPnP` | Skip IGD UDP port mapping for the QUIC listen port. |
| `ICESignalURL` | WebSocket base URL for ICE trickle signaling. When set, used as fallback when direct QUIC fails. |
| `ICESTUNURLs` | `stun:` URIs for ICE gathering. |
| `Logger` | `*slog.Logger`. If nil, `slog.Default()` is used. |

### Lifecycle

```go
// 1. Create and start
h, err := host.New(cfg)

// 2. Bootstrap into the network
h.Node().BootstrapAddrs(ctx, bootstrapAddrs)

// 3. Use
h.PublishEndpoint(ctx, seq, ttl)
record, err := h.Resolve(ctx, remoteAddr)
conn, err := h.ConnectFromRecord(ctx, remoteAddr, record)

// 4. Accept inbound connections
agentConn, err := h.Accept(ctx)

// 5. Shut down
h.Close()
```

### Primary methods

| Method | Role |
|--------|------|
| `PublishEndpoint(ctx, seq, ttl)` | Builds multi-candidate endpoint payload (reflection, UPnP, fallback), signs, stores on DHT. |
| `PublishEndpointForAgent(ctx, agentAddr, seq, ttl)` | Same for a registered delegated agent. |
| `Resolve(ctx, target Address)` | Iterative DHT lookup; returns `*protocol.EndpointRecord`. |
| `Connect(ctx, expectRemote Address, udpAddr)` | QUIC dial to one UDP address with mutual TLS. |
| `ConnectFromRecord(ctx, expectRemote Address, er)` | Happy Eyeballs over all endpoints in the record; ICE fallback if all fail. |
| `ConnectFromRecordFor(ctx, localAgent, expectRemote, er)` | Same, using TLS credentials for a specific local agent. |
| `Accept(ctx)` | Blocks for inbound QUIC; returns `*AgentConn` with `Local` / `Remote` addresses. |
| `RegisterAgent(addr, priv)` | Add an extra agent identity on the same QUIC listener. |
| `RegisterDelegatedAgent(addr, opPriv, delegationCBOR)` | Register an agent with a master-derived AID and operational key. |
| `SendMailbox` / `PollMailbox` | DHT mailbox for the default host identity. |
| `RegisterTopic` / `RegisterTopicForAgent` | Topic rendezvous: publish service capability record. |
| `SearchTopic` / `SearchTopics` | Discover agents by capability name. |
| `Close()` | Shuts down QUIC, mux, and DHT. |

### `AgentConn`

Embeds `quic.Connection`. Fields:

- `Local` — agent `Address` selected for this connection
- `Remote` — peer `Address` from the mutual TLS certificate (inbound)

---

## `dht.Node`

Use when you implement your own transport stack and only need Kademlia-style RPCs.

### Configuration (`dht.Config`)

| Field | Meaning |
|-------|---------|
| `Transport` | Required. DHT UDP (or mux) transport. |
| `Keystore` | Required. Exactly one identity. |
| `RecordAuth` | Optional callback to enforce publish authority (self-sign or delegation check). |

### Lifecycle

```go
n := dht.NewNode(dht.Config{Transport: t, Keystore: ks})
n.Start()
n.BootstrapAddrs(ctx, addrs)
n.PublishEndpointRecord(ctx, rec)
result, err := n.NewQuery(20).Resolve(ctx, nodeID)
n.Close()
```

### Common methods

| Method | Role |
|--------|------|
| `BootstrapAddrs(ctx, []net.Addr)` | Bootstrap — only `ip:port` required; identity learned from PONG. |
| `PingIdentity(ctx, addr)` | Returns `PeerIdentity{Address, NodeID}`. |
| `PublishEndpointRecord(ctx, rec)` | STORE signed record to closest peers. |
| `PublishTopicRecord(ctx, storeKey, rec)` | STORE topic record at `TopicNodeID`. |
| `NewQuery(n).Resolve(ctx, NodeID)` | Iterative endpoint fetch. |

---

## Identity and signing

| Package | Items |
|---------|-------|
| `github.com/a2al/a2al` | `Address`, `NodeID`, `ParseAddress`, `NodeIDFromAddress` |
| `github.com/a2al/a2al/crypto` | `KeyStore`, `EncryptedKeyStore`, `AddressFromPublicKey`, `GenerateEd25519` |
| `github.com/a2al/a2al/identity` | `SignDelegation`, `EncodeDelegationProof`, `ParseDelegationProof`, `VerifyDelegation` |

---

## Not yet implemented

- **TURN relay** — config fields exist; server-side relay not yet integrated for symmetric-NAT fallback
- **IPv6 dual-stack** — wire format supports IPv6; `New()` currently uses `udp4` only

---

## Tests

```bash
go test -vet=off -count=1 ./...
```

See the [Go Packages reference](/docs/reference/go-packages) for the complete API surface, including `protocol`, `config`, and debug HTTP endpoints.
