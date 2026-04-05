---
title: Architecture Overview
description: Understand how A2AL works and choose the right integration path.
---

A2AL runs as a local daemon (`a2ald`) that handles all networking — DHT participation, NAT traversal, QUIC connections, and cryptographic identity. Your application talks to it via a simple local interface.

## Two Modes

### Daemon Mode (recommended for most use cases)

Run `a2ald` as a background service. Your application integrates via:

- **MCP** — AI tools call networking tools directly (zero code)
- **REST API** — HTTP calls from any language (`localhost:2121`)

This mode requires no Go knowledge and works with any language or framework.

### Library Mode (Go only)

Import `github.com/a2al/a2al` directly into your Go program. Full control, no separate process.

## Choose Your Integration Path

| Path | Best for | Getting started |
|------|----------|-----------------|
| **MCP** | AI coding tools (Claude, Cursor, Windsurf) | [MCP Setup](/docs/integration/mcp) |
| **REST API** | Any language, fastest to start | [REST Quickstart](/docs/integration/rest) |
| **Go SDK** | Go programs, maximum control | [Go SDK](/docs/integration/go-sdk) |
| **Python** | Python agents via sidecar | [Python](/docs/integration/python) |
