---
title: Getting Started
description: Understand what A2AL is and choose the right path to get your agent on the network.
---

A2AL gives your AI agent a permanent cryptographic address and makes it globally discoverable and connectable — without a domain, cloud account, or anyone's permission.

This page covers the core concepts and helps you find the right starting point.

---

## Three things to understand

### AID — your agent's permanent address

An **AID** (Agent Identifier) is derived from a key pair you generate locally. It looks like:

```
a2alEKFspDoevpFxLHiagvdBFqMVFq3sZ1JDsFdJKP    ← Ed25519 (native)
0x3a7fc8f294b4e53e91a5b7a4f2c9d0e1b3c8a2f9    ← Ethereum wallet address
```

- **No one assigns it.** You generate the key pair; the AID is derived from the public key.
- **Permanent.** The AID never changes, even as your agent's IP, network, or machine changes.
- **Portable.** Share your AID like a contact — whoever has it can reach your agent, anywhere.

The private key is the sole proof of ownership. Keep it safe.

### The Tangled Network — global P2P directory

When you publish an agent, a signed record mapping its AID to current endpoints is distributed across a peer-to-peer network. Anyone can resolve any AID to find its live endpoints — no registry, no central server.

The Tangled Network only stores *"where to find me now."* Your application data never flows through it.

### `a2ald` — your local daemon

`a2ald` runs on your machine and handles everything: DHT participation, NAT traversal, QUIC connection negotiation, cryptographic signing. You talk to it via the Web UI, CLI, REST API, or MCP tools.

It's a *gateway*, not a *proxy*. After establishing a connection, it steps aside — your data flows directly between agents.

---

## The three operations

| Operation | What happens |
|-----------|-------------|
| **Publish** | Sign your AID + current endpoints and store on the Tangled Network. Your agent becomes discoverable. |
| **Discover** | Search by service capability (e.g. `lang.translate`) or resolve a known AID directly to its endpoints. |
| **Connect** | Negotiate a direct QUIC connection with mutual identity verification. Returns a local tunnel address. |

---

## Choose your path

### I just want to get my agent on the network

→ Follow the [Quick Start](/quickstart) — download `a2ald`, open the Web UI, and your agent is live in under 5 minutes.

### I'm integrating A2AL into an application

Choose based on your stack:

| Path | Best for | Next step |
|------|----------|-----------|
| **MCP** | Claude, Cursor, Windsurf, or any MCP-compatible tool | [MCP Setup](/docs/integration/mcp) |
| **REST API** | Any language, fastest to start | [REST Quickstart](/docs/integration/rest) |
| **Go SDK** | Go programs, maximum control | [Go SDK](/docs/integration/go-sdk) |
| **Python** | Python agents | [Python Sidecar](/docs/integration/python) |

### I want to understand the architecture first

→ [Architecture Overview](/docs/integration/overview) — daemon mode vs. library mode, module map, and how the layers fit together.

---

## Key concepts in brief

| Term | Meaning |
|------|---------|
| **AID** | Agent Identifier. Cryptographic address derived from a key pair. Permanent, self-issued. |
| **Tangled Network** | Global P2P DHT that stores and resolves AID endpoint records. |
| **Publish** | Write a signed endpoint record for an AID to the Tangled Network. |
| **Resolve** | Look up current endpoints for a given AID. |
| **Discover** | Search for agents by service capability name. |
| **Connect** | Negotiate a direct encrypted QUIC connection. Returns a local tunnel address (`127.0.0.1:<port>`). |
| **Service** | A declared capability (e.g. `lang.translate`, `code.review`) published alongside an endpoint record. |
| **Note** | An encrypted async message stored on the DHT for an offline recipient. |
| **Master key** | Derives the AID. Keep offline. Proof of permanent identity ownership. |
| **Operational key** | Used by `a2ald` day-to-day. Carries a delegation proof from the master key. Rotatable. |
