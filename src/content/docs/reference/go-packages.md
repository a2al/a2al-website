---
title: Go Packages
description: Reference for the exported interfaces of the A2AL Go module — host, dht, protocol, identity, config, and the debug HTTP endpoints.
audience: developer
---

Exported packages: `host`, `dht`, `protocol`, `identity`, `crypto`. Module path `github.com/a2al/a2al`.

For the daemon's REST and MCP interfaces and the Python sidecar, see the [REST API](/docs/reference/rest-api); for the concepts, see the [Architecture Overview](/docs/integration/overview).

| Level | Package | Use when |
| --- | --- | --- |
| Node runtime | `github.com/a2al/a2al/host` | DHT + QUIC, publish / resolve / connect |
| DHT only | `github.com/a2al/a2al/dht` | You bring your own transport and only need routing and STORE/FIND |
| Daemon | `a2ald` | REST, Web UI, MCP — do not import `host` unless you are embedding |

## `host.Host`

Wraps a DHT node, a UDP mux or a separate QUIC socket, NAT reflection (`natsense`), ICE, and optional TURN.

Wildcard `ListenAddr` / `QUICListenAddr` values (`:4121`, `0.0.0.0:port`) bind **dual-stack**; a specific IPv4 address stays IPv4-only. `DisableIPv6` forces `udp4` (a library option only, not a daemon TOML key).

### `host.Config`

| Field | Meaning |
| --- | --- |
| `KeyStore` | Required. Exactly one `Address`. |
| `ListenAddr` | UDP binding for the DHT (default `":4121"`). Dual-stack when no specific host is given. |
| `QUICListenAddr` | Empty shares the socket with the DHT (mux); non-empty binds QUIC separately. |
| `PrivateKey` | Ed25519 private key for QUIC / TLS; otherwise taken from `EncryptedKeyStore.Ed25519PrivateKey`. |
| `MinObservedPeers` | How many peers must agree on a reflected address (default 3). |
| `FallbackHost` | Address to advertise when neither binding nor reflection is conclusive. |
| `DisableUPnP` | Skip IGD mapping of the QUIC port (IPv4). |
| `DisableIPv6` | Force IPv4-only. |
| `ICESignalURL` / `ICESignalURLs` | ICE WebSocket hub; `ICESignalURLs` wins when non-empty, and its first address is also written into `EndpointPayload.Signal`. |
| `ICESTUNURLs` | `stun:` addresses; leave empty to use public STUN when no TURN is configured. |
| `ICETURNURLs` | Legacy `turn:` with inline credentials; prefer `TURNServers`. |
| `TURNServers` | External TURN: `URL`, `Username`, `Credential`, `CredentialType` (`static` / `hmac` / `rest_api`). Credentials are minted per ICE session and never published. |
| `ICEPublishTurns` | Deprecated. New nodes do not write `turns[]` to the DHT. |
| `DisableRelay` | When true, TURN relaying is off by default; can still be toggled per call via `DialOptions.DisableRelay`. Defaults to false. |
| `ICENetworkTypes` | ICE network types; defaults to UDP4 + UDP6. |
| `Logger` | `*slog.Logger`, defaults to `slog.Default()`. |

The internal DHT node's `RecordAuth` requires either a self-signature or a valid delegation.

### Lifecycle

1. `host.New(cfg)`
2. `h.Node().BootstrapAddrs(ctx, []net.Addr{…})` — seeds are `ip:port`
3. Optionally `ObserveFromPeers`
4. `PublishEndpoint` / `Resolve` / `ConnectFromRecord` / `Accept`
5. `h.Close()`

### Methods

| Method | What it does |
| --- | --- |
| `PublishEndpoint` / `PublishEndpointForAgent` | Sign a single multi-candidate `quic://` payload (v4/v6, plus the mapped result when UPnP is enabled) and STORE it. |
| `Resolve` | Iterative lookup → `*protocol.EndpointRecord`. |
| `Connect` | Open a QUIC connection to a single UDP address and send an agent-route frame. |
| `ConnectFromRecord` / `ConnectFromRecordFor` | Happy Eyeballs over the record's endpoints; falls back to ICE when direct attempts fail and a signaling address is present. Returns `(conn, isRelayed, err)`; returns `ErrRelayRequired` when a relay is configured but disabled and the direct attempt fails. |
| `Accept` | Accept an inbound QUIC connection → `*AgentConn`. |
| `QUICDialTargets` / `FirstQUICAddr` | Ordered UDP targets from a record. |
| `BuildEndpointPayload` | Produce candidates without STORE. |
| `SymmetricNATReachabilityHint` | Non-empty when a symmetric NAT is detected (a relay may still be needed). |
| `RegisterAgent` / `RegisterDelegatedAgent` / `UnregisterAgent` / `RegisteredAgents` | Attach more AIDs to the same listener. |
| `SendMailbox` / `PollMailbox` (and `ForAgent` variants) | Encrypted notes. |
| `RegisterTopic(s)` / `SearchTopic(s)` (and `ForAgent` variants) | Capability-name rendezvous. |
| `StartDebugHTTP` / `DebugHTTPHandler` | Read-only JSON. |
| `Close` | Shut down QUIC, the mux, the DHT, and UPnP mappings. |

`AgentConn` embeds `quic.Connection` and exposes `Local` / `Remote` AIDs.

### agent-route

After TLS, the client writes **a 4-byte magic + the 21-byte target AID** on stream 0.

- **`a2r2`** (current): a length-prefixed control message, after which both sides FIN that stream; data travels on subsequent streams. This is what `host` implements.
- **`a2r1`**: still accepted inbound (frame parsing only).

TLS SNI serves as a secondary hint when several agents share a listener.

## `dht.Node`

| Field | Meaning |
| --- | --- |
| `Transport` | Required. |
| `Keystore` | Required. One identity. |
| `OnObservedAddr` | Callback for reflected addresses. |
| `RecordAuth` | Runs after `VerifySignedRecord`; empty means no permission check. |

`BootstrapAddrs` accepts `ip:port` only. `PublishMailboxRecord` / `PublishTopicRecord` STORE records at the recipient's or topic's NodeID respectively.

## Identity

| Package | Contents |
| --- | --- |
| `github.com/a2al/a2al` | `Address`, `NodeID`, `ParseAddress`, `NodeIDFromAddress` |
| `…/crypto` | `KeyStore`, `EncryptedKeyStore`, `AddressFromPublicKey`, `GenerateEd25519` |
| `…/identity` | `SignDelegation`, `VerifyDelegation`, Ethereum / Paralism helpers |

## `protocol`

| Item | Purpose |
| --- | --- |
| `SignedRecord` | CBOR wire format, optional `Delegation`. |
| `EndpointPayload` | `Endpoints` (`quic://host:port` or `quic://[v6]:port`), `NatType`, `Signal`, `Signals`. `Turns` is decoded from old records only and is **never written on new publishes**. |
| `SignEndpointRecord` / `SignEndpointRecordDelegated` | Signed by the master key vs. by an operational key. |
| `ParseEndpointRecord` / `VerifySignedRecord` | Verify signature, TTL, and authority. |
| Mailbox | `RecTypeMailbox` `0x80`; X25519 + AES-GCM helpers. |
| Topic | `RecTypeTopic` `0x10`; key is `SHA-256("topic:" ‖ name)`; `DiscoverFilter`. |

`timestamp` + `TTL` must cover the current time.

## `config` (daemon TOML)

`Default()`, `Validate()`, `LoadFile` / `Save`, `ApplyEnv`. For an example see `doc/a2ald-config.example.toml` in the repository; for field descriptions see [Configuration](/docs/ops/config).

## Debug HTTP

A library-mode `Host` / `Node` should bind `dht.DebugHTTPAddr` (`127.0.0.1:2634`); the daemon exposes the same set of endpoints under `/debug/` on the admin address.

| Path | Source |
| --- | --- |
| `/debug/identity`, `/debug/routing`, `/debug/store`, `/debug/stats` | `dht.Node` |
| `/debug/host` | `Host`: QUIC bindings, registered agents, NAT summary |

## `natsense`

`Sense()`: `TrustedUDP` / `TrustedUDPAll` (v4 and v6), `InferNATType`, `InferV6Reach`. Small test networks can lower `MinAgreeing`.

## Testing

```bash
go test -vet=off -count=1 ./...
```

Each directory under `examples/` has its own `go.mod` and `replace`.

## Related pages

| For | Page |
| --- | --- |
| Getting-started guide and examples | [Go SDK](/docs/integration/go-sdk) |
| Protocol and wire format | [Protocol Specification](/docs/spec/protocol) |
