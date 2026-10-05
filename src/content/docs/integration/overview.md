---
title: Architecture Overview
description: "How A2AL is layered — the protocol does addressing and connections, the daemon provides identity, messaging and applications — and the trade-offs between the four integration paths: MCP, REST, Go and Python."
audience: developer
---

## The one-sentence model

Every participant holds a permanent address (**AID**), and any two addresses can **find each other and connect directly**. That is all the protocol layer does: resolve an AID to its current endpoints and let the two ends establish a point-to-point encrypted connection. Once connected, application data flows between the two ends and never through the network.

## Concepts

**AID** — not an IP address, not a username, not a domain name, but a cryptographic address derived from a local key and bound to you by mathematical relation. IP addresses change; the AID does not: once someone has noted your AID, you can change networks, machines and devices and it still resolves to you.

**Three operations are the whole protocol**:

```
Publish  — declare that you exist, and where you are right now
Resolve  — look up where the other side is right now, from its AID
Connect  — open a direct, encrypted, mutually authenticated channel
```

After `Connect`, application data flows directly between the two ends. The network (the Tangled Network) carries addressing only and does not touch payloads.

**NAT is not the problem**: the daemon tries a direct connection first, and when both ends sit behind NAT it negotiates a path with ICE (the same mechanism WebRTC calls in browsers use). Routing is solved by the protocol, so application code sees nothing but an ordinary connection.

**`a2ald`** is the local daemon that implements the above and provides applications on top of the protocol: one-to-one chats, rooms, notes (messages that tolerate being offline), file objects and access control. REST, MCP, the CLI and the panel are different interfaces to the same daemon.

## Inside the protocol

A2AL is a point-to-point addressing and connectivity layer. An AID maps to live endpoints in the DHT, and two agents then establish a mutually authenticated TLS session over QUIC; application payloads travel over that session and not through the directory.

**The protocol itself** is not in the data path once a connection is up, and it holds no application state. Applications are carried by the **daemon** (`a2ald`): notes, one-to-one chats, rooms, file objects, access control, MCP, REST and the panel all live at that layer.

## Runtime layers

```
┌──────────────────────────────────────────────────────────────┐
│  a2ald — REST · MCP · Web UI · chat · rooms · notes · ACL    │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│  host — DHT + QUIC + NAT sense + UPnP + ICE + TURN (optional)│
└───┬──────────┬──────────────────────┬──────────────────┬─────┘
    │          │                      │                  │
  dht      transport              natsense           signaling
           (UDP mux,               natmap             (ICE hub)
            dual-stack)            (UPnP IPv4)
    │
 protocol — records, mailbox, topics, streams
 identity / crypto — AID, sign, delegation
```

A Go program that only needs to publish, resolve and connect depends on `host`; every other language and use case integrates through `a2ald`.

## Identity

An AID is 21 bytes: `[version 1][hash 20]`.

| Version | Scheme | Hash |
| --- | --- | --- |
| `0xA0` | Ed25519 | `SHA-256(pubkey)[0:20]` |
| `0xA1` | P-256 | `SHA-256(pubkey)[0:20]` (bytes allocated; `a2ald` has no generation path yet) |
| `0xA2` | Paralism / HASH160 | `RIPEMD160(SHA-256(pubkey))` |
| `0xA3` | Ethereum | `Keccak-256(pubkey)[12:32]` |

Display encoding: native identities are 42 hexadecimal characters (letter case acts as a checksum), while Ethereum and Paralism use `0x` hex. The full registry is in [Address Version Registry](/docs/reference/address-version-registry).

**NodeID** = `SHA-256(version ‖ hash)`, used for DHT routing only and not as an application-level identity.

**Delegation**: the master key derives the AID and stays offline, while an operating user key publishes on its behalf carrying a delegation proof. On key rotation, the delegation with the newer `IssuedAt` takes effect.

## Records (DHT)

The common container is a CBOR-encoded `SignedRecord`, and both writes and reads verify the signature, the TTL window and the signing authority (self-signed or a valid delegation).

| RecType | Purpose |
| --- | --- |
| `0x01` | Endpoint record: `quic://` candidates, NAT hints, ICE signalling addresses |
| `0x02`–`0x0f` | Profiles and custom signed records |
| `0x10` | Topics (capability names), keyed by `SHA-256("topic:" ‖ name)` |
| `0x80` | Encrypted notes (mailbox), held under the recipient's NodeID |

An endpoint payload can list `quic://` addresses for **both IPv4 and IPv6**. New nodes **no longer** write TURN addresses into records — relay credentials stay on the local machine — and multiple signalling addresses are carried in the `Signals` field.

## Establishing a connection

A wildcard listener (`:4121`) is **dual-stack** by default (a UDP bind on `[::]`; paired sockets on Windows), while an explicit IPv4 address keeps it IPv4-only.

The dialling side connects to candidate endpoints concurrently (Happy Eyeballs, preferring IPv6 when available). If every direct QUIC attempt fails and the record carries signalling addresses, the two ends negotiate a path over the **built-in ICE hub** (WebSocket trickle); an optional external **TURN** (static / HMAC / REST credentials) supplies relay candidates. UPnP IGD mapping applies to IPv4.

After TLS, stream 0 first carries an **agent-route** frame so that several AIDs can share one QUIC listener:

- current frame: `a2r2` plus the 21-byte target AID, followed by one short control exchange, with data on subsequent streams;
- inbound still accepts the older `a2r1` (a 25-byte frame only).

Service HTTP uses a dedicated stream type, and file objects use content-addressed streams.

**Access control** (daemon) applies to the AID's **inbound HTTP and object downloads**; notes, DHT traffic and chat envelopes are not governed by the same allow/deny list.

## Applications the daemon provides

| Capability | Behaviour |
| --- | --- |
| Notes | Encrypted store-and-forward over a DHT mailbox, delivered even when the peer is offline |
| Chats | Established after mutual invitation; sent directly when online, held locally otherwise |
| Rooms | One signed copy per AID, members synchronising over QUIC; objects addressed by hash |
| ACL | Allow/deny lists for that AID's HTTP and objects, optionally with a join secret |
| Profile | Signed name / brief / skill record (RecType `0x02`) |
| Address book | Local aliases and favourites (`/node/address-book`) |
| Remote administration | Let another AID administer this node |
| AID URL | `http://127.0.0.1:2121/aid/{AID}/path` — the local gateway, with no extra port |

## Administrative API

It listens on `127.0.0.1:2121` by default. With `api_token` set: local origins need no token by default (they do when `require_local_token = true`), and non-local origins always need `Authorization: Bearer`. An empty token means open access (a deliberate default). Credential export is restricted to local origins, and the `Host` header of local-origin requests is checked to block DNS rebinding. The full set of fields is in [Configuration](/docs/ops/config).

## Two integration modes

| Mode | Notes |
| --- | --- |
| **Daemon mode** (most cases) | Run `a2ald` and integrate through [MCP](/docs/integration/mcp) (AI tooling with no code), [REST](/docs/integration/rest) (any language, `localhost:2121`) or the [Python sidecar](/docs/integration/python). No Go toolchain needed. |
| **Library mode** (Go only) | Import `github.com/a2al/a2al/host` directly, with no extra process and full control. See the [Go SDK](/docs/integration/go-sdk). |

## Module map

![A2AL module architecture](/diagrams/module-map.svg)

Dependencies run top-down: `daemon` depends on `host`; `host` depends on `dht`, `transport`, `natsense` and `protocol`; `identity` / `crypto` sit at the bottom.

## Module descriptions

| Module | Responsibility |
| --- | --- |
| `identity` / `crypto` | Key generation, AID derivation, signing and verification, the delegation model |
| `protocol` | Every wire-format CBOR structure: endpoint records, mailbox messages, topic records |
| `transport` | UDP socket management; `UDPMux` demultiplexes one socket between DHT and QUIC |
| `dht` | A Kademlia-style DHT: `FIND_NODE`, `FIND_VALUE`, `STORE` and K-bucket routing |
| `natsense` / `natmap` | Infer the NAT type from peer reflexive observation; handle UPnP port mapping |
| `signaling` | WebSocket ICE trickle signalling, the fallback when direct connections fail |
| `host` | The main Go integration layer, composing the lower layers into one runtime |
| `daemon` | The `a2ald` binary: REST, MCP, the panel and automatic renewal on top of `host` |

## Relationship to other protocols

| Protocol | Relationship |
| --- | --- |
| **MCP** | A tool-calling convention. `a2ald` acts as an MCP server, exposing network capabilities as tools. |
| **A2A / ANP** | Collaboration and networking visions. A2AL provides the addressing and connectivity layer they assume but do not define. |
| **QUIC** | The transport between agents: TLS 1.3, multiplexing, connection migration. |
| **ICE / STUN / TURN** | NAT traversal. A2AL does not invent a traversal protocol of its own; TURN is an optional **external** service. |
