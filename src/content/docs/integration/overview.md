---
title: Architecture Overview
description: Understand how A2AL works and choose the right integration path.
---

A2AL is a decentralized address resolution protocol. Its sole function is to map a cryptographic identity (AID) to current network endpoints, so that any two agents can establish a direct encrypted connection without prior knowledge of each other's IP address or network location.

A2AL does **not** route application data, operate as a message relay, or manage application-level state. Once a connection is established, the protocol steps aside. All data flows directly between agents.

## Two Modes

### Daemon Mode (recommended for most use cases)

Run `a2ald` as a background service. Your application integrates via:

- **MCP** — AI tools call networking tools directly (zero code)
- **REST API** — HTTP calls from any language (`localhost:2121`)

This mode requires no Go knowledge and works with any language or framework.

### Library Mode (Go only)

Import `github.com/a2al/a2al` directly into your Go program. Full control, no separate process. The primary entry point is the `host` package.

## Module Map

![A2AL module architecture](/diagrams/module-map.svg)

Dependencies flow downward. `daemon` depends on `host`; `host` depends on `dht`, `transport`, `natsense`, and `protocol`; all depend on `identity`/`crypto` at the bottom.

## Module Descriptions

| Module | Role |
|--------|------|
| `identity` / `crypto` | Key generation, AID derivation, sign/verify, delegation model. |
| `protocol` | All on-wire CBOR data structures: endpoint records, mailbox messages, topic records. |
| `transport` | UDP socket management. `UDPMux` demultiplexes a single UDP socket between DHT and QUIC. |
| `dht` | Kademlia-style DHT: `FIND_NODE`, `FIND_VALUE`, `STORE`, K-Bucket routing. |
| `natsense` / `natmap` | Infers NAT type from peer reflection; handles UPnP port mapping. |
| `signaling` | WebSocket ICE trickle signaling, used as fallback when direct QUIC fails. |
| `host` | Primary Go integration layer. Composes all lower layers into a single runtime. |
| `daemon` | The `a2ald` binary. Wraps `host` with REST API, MCP server, Web UI, and auto-publish. |

## Connection Establishment

Two paths exist for establishing a QUIC connection:

**Direct path (primary):** Dials all endpoints from the target's record concurrently. The first successful QUIC handshake wins. Both sides perform mutual TLS with certificates derived from their Ed25519 keys.

**ICE path (fallback):** When all direct dials fail and the endpoint record carries a signaling URL, both peers exchange ICE candidates via WebSocket and establish a peer-to-peer UDP path. QUIC then runs over that path.

## Choose Your Integration Path

| Path | Best for | Getting started |
|------|----------|-----------------|
| **MCP** | AI coding tools (Claude, Cursor, Windsurf) | [MCP Setup](/docs/integration/mcp) |
| **REST API** | Any language, fastest to start | [REST Quickstart](/docs/integration/rest) |
| **Go SDK** | Go programs, maximum control | [Go SDK](/docs/integration/go-sdk) |
| **Python** | Python agents via sidecar | [Python Sidecar](/docs/integration/python) |

## Relationship to Other Protocols

| Protocol | Relationship |
|----------|-------------|
| **MCP** | A2AL runs as an MCP server, exposing networking as tool calls. MCP defines the calling convention; A2AL provides the network. |
| **A2A** | A2AL provides the discovery and connectivity layer that A2A assumes but does not define. A2A messages flow over A2AL connections. |
| **QUIC** | A2AL uses QUIC for all agent-to-agent connections: TLS 1.3, stream multiplexing, connection migration. |
| **ICE/STUN** | Used in the ICE fallback path. A2AL does not define its own NAT traversal protocol. |
