---
title: Go SDK
description: Embed A2AL directly in a Go program — the host and dht levels, configuration, lifecycle, the agent-route frame and the debug endpoints.
audience: developer
---

```go
import "github.com/a2al/a2al"
```

The entry point for most Go programs is `github.com/a2al/a2al/host`; when you need finer control, `dht`, `protocol`, `identity` and `crypto` are all available. **A program that only publishes, resolves and connects depends on `host` and should not import `daemon`.**

## Integration levels

| Level | Package | When to use it |
| --- | --- | --- |
| Node runtime | `github.com/a2al/a2al/host` | DHT + QUIC (one port or separate ports), mutual TLS, publish/resolve/connect helpers. Recommended for most applications. |
| DHT only | `github.com/a2al/a2al/dht` | Bring your own transport stack and use only routing, bootstrapping and iterative `FIND_VALUE` / `STORE`. |
| Daemon | `a2ald` | Non-Go integration; local REST + MCP + panel. |

## `host.Host`

`Host` composes the lower layers into a single runtime: a DHT node, QUIC transport, NAT detection and UPnP mapping.

### `host.Config`

| Field | Meaning |
| --- | --- |
| `KeyStore` | Required. Must contain exactly one `Address`. |
| `ListenAddr` | The DHT's UDP bind (default `":4121"`). A wildcard address is dual-stack; an explicit IPv4 / IPv6 host binds to that family. |
| `QUICListenAddr` | When empty, QUIC shares the DHT's UDP socket; when set, it binds separately. |
| `PrivateKey` | The Ed25519 private key used for QUIC / TLS; when empty, `EncryptedKeyStore.Ed25519PrivateKey` is used. |
| `MinObservedPeers` | How many peers must agree before a reflexive address is accepted (default 3). |
| `FallbackHost` | The address to publish when neither the bind address nor the reflexive observation is conclusive. |
| `DisableUPnP` | Skip IGD mapping for the QUIC port (IPv4). |
| `DisableIPv6` | Force IPv4-only (a library option, not a daemon TOML key). |
| `ICESignalURL` / `ICESignalURLs` | The ICE WebSocket hub; `ICESignalURLs` wins when non-empty, and its first address is also written into `EndpointPayload.Signal`. |
| `ICESTUNURLs` | `stun:` addresses; leaving them empty without TURN configured means public STUN is used. |
| `ICETURNURLs` | Legacy `turn:` URLs with inline credentials; new code should prefer `TURNServers`. |
| `TURNServers` | External TURN: `URL`, `Username`, `Credential`, `CredentialType` (`static` / `hmac` / `rest_api`). Credentials are generated per ICE session and never published to the DHT. |
| `DisableRelay` | When true, TURN relays are not used by default; per call, `DialOptions.DisableRelay` does the same. Default false (with TURN configured, relaying is allowed). |
| `ICENetworkTypes` | The network types ICE uses; UDP4 + UDP6 by default. |
| `Logger` | `*slog.Logger`, defaulting to `slog.Default()`. |

The internal DHT node's `RecordAuth` requires a self-signature or a valid delegation.

### Lifecycle

```go
// 1. create and start
h, err := host.New(cfg)

// 2. bootstrap into the network (seeds as ip:port)
h.Node().BootstrapAddrs(ctx, bootstrapAddrs)

// 3. use it
h.PublishEndpoint(ctx, seq, ttl)
record, err := h.Resolve(ctx, remoteAddr)
conn, err := h.ConnectFromRecord(ctx, remoteAddr, record)

// 4. accept inbound connections
agentConn, err := h.Accept(ctx)

// 5. shut down
h.Close()
```

### Main methods

| Method | What it does |
| --- | --- |
| `PublishEndpoint` / `PublishEndpointForAgent` | Assemble a multi-candidate endpoint payload (reflexive, UPnP, fallback), sign it and store it in the DHT. |
| `Resolve` | Iterative lookup, returning a `*protocol.EndpointRecord`. |
| `Connect` | Establish a QUIC connection to a single UDP address and send the agent-route frame. |
| `ConnectFromRecord` / `ConnectFromRecordFor` | Happy Eyeballs across every endpoint in the record; falls back to ICE when direct connections fail and signalling addresses exist. Returns `(conn, isRelayed, err)`; when a relay is configured but disabled and direct connection fails, it returns `ErrRelayRequired`. |
| `Accept` | Accept inbound QUIC and return an `*AgentConn`. |
| `QUICDialTargets` / `FirstQUICAddr` | Derive ordered UDP targets from a record. |
| `BuildEndpointPayload` | Build candidates only, without writing to the DHT. |
| `SymmetricNATReachabilityHint` | Non-empty when symmetric NAT is detected (a relay may still be needed). |
| `RegisterAgent` / `RegisterDelegatedAgent` / `UnregisterAgent` / `RegisteredAgents` | Attach more AIDs to the same listener. |
| `SendMailbox` / `PollMailbox` (with `…ForAgent` variants) | Encrypted notes. |
| `RegisterTopic(s)` / `SearchTopic(s)` (with `…ForAgent` variants) | Capability name rendezvous. |
| `StartDebugHTTP` / `DebugHTTPHandler` | Read-only JSON. |

`AgentConn` embeds `quic.Connection` and exposes two AIDs, `Local` and `Remote`.

### The agent-route frame

After TLS, the client writes **4 magic bytes + the 21-byte target AID** on stream 0:

- **`a2r2`** (current): a length-prefixed control message, after which both sides FIN that stream and data moves to later streams. `host` implements this version.
- **`a2r1`**: still accepted inbound (the frame itself is all that is parsed).

When several agents share one listener, TLS SNI acts as a secondary hint.

## `dht.Node`

| Field | Meaning |
| --- | --- |
| `Transport` | Required. |
| `Keystore` | Required. One identity. |
| `OnObservedAddr` | Callback for the reflexive address. |
| `RecordAuth` | Runs after `VerifySignedRecord`; empty means no authority check. |

`BootstrapAddrs` accepts `ip:port` only. `PublishMailboxRecord` / `PublishTopicRecord` write records under the recipient's or the topic's NodeID respectively.

## Identity and signing

| Package | Contents |
| --- | --- |
| `github.com/a2al/a2al` | `Address`, `NodeID`, `ParseAddress`, `NodeIDFromAddress` |
| `…/crypto` | `KeyStore`, `EncryptedKeyStore`, `AddressFromPublicKey`, `GenerateEd25519` |
| `…/identity` | `SignDelegation`, `VerifyDelegation`, Ethereum / Paralism helpers |

## `protocol`

| Item | What it does |
| --- | --- |
| `SignedRecord` | The wire-format CBOR, optionally carrying a `Delegation`. |
| `EndpointPayload` | `Endpoints` (`quic://host:port` or `quic://[v6]:port`), `NatType`, `Signal`, `Signals`. `Turns` is only decoded from old records — **new publications no longer write it**. |
| `SignEndpointRecord` / `SignEndpointRecordDelegated` | Master-key signing vs operational user-key signing. |
| `ParseEndpointRecord` / `VerifySignedRecord` | Verify the signature, the TTL and the authority (`RecordAuth`). |
| Mailbox | `RecTypeMailbox` `0x80`; X25519 + AES-GCM helpers. |
| Topics | `RecTypeTopic` `0x10`; keyed by `SHA-256("topic:" ‖ name)`; `DiscoverFilter`. |

`timestamp` and `TTL` have to cover the current time.

## `config` and the debug endpoints

The `config` package handles the daemon's TOML: `Default()`, `Validate()`, `LoadFile` / `Save`, `ApplyEnv`. For examples, see `doc/a2ald-config.example.toml` in the repository.

Debug HTTP is best bound to `dht.DebugHTTPAddr` (`127.0.0.1:2634`); the daemon exposes the same set under `/debug/` on its administrative address.

| Path | Source |
| --- | --- |
| `/debug/identity`, `/debug/routing`, `/debug/store`, `/debug/stats` | `dht.Node` |
| `/debug/host` | `Host`: QUIC bindings, registered agents, a NAT summary |

## Tests

```bash
go test -vet=off -count=1 ./...
```

Each project under `examples/` has its own `go.mod` with a `replace` pointing at the module root.

## Related pages

| Goal | Page |
| --- | --- |
| Every exported symbol | [Go Packages](/docs/reference/go-packages) |
| Architecture and module layout | [Architecture Overview](/docs/integration/overview) |
| Protocol and wire format | [Protocol Specification](/docs/spec/protocol) |
