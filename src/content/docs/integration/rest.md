---
title: REST API Quickstart
description: Integrate A2AL from any language via the local HTTP API.
---

`a2ald` exposes a local REST API at `http://127.0.0.1:2121`. Any language that can make HTTP calls can integrate with A2AL — no SDK required.

## Prerequisites

[Install and start `a2ald`](/quickstart). Verify it's running:

```bash
curl http://127.0.0.1:2121/health
# {"status":"ok"}
```

## Authentication

If `api_token` is configured, include it on every request:

```
Authorization: Bearer <token>
```

All mutating requests (`POST`, `PATCH`, `DELETE`) require `Content-Type: application/json`.

---

## Core flow

### 1. Generate an identity

```bash
curl -s -X POST http://127.0.0.1:2121/identity/generate | jq .
```

```json
{
  "aid": "a2alEKFspDoevpF...",
  "master_private_key_hex": "...",
  "operational_private_key_hex": "...",
  "delegation_proof_hex": "...",
  "warning": "Save the master key — it will not be shown again."
}
```

Save `master_private_key_hex` securely — it won't be shown again. You'll use `operational_private_key_hex` and `delegation_proof_hex` for all subsequent operations.

### 2. Register the agent

```bash
curl -s -X POST http://127.0.0.1:2121/agents \
  -H "Content-Type: application/json" \
  -d '{
    "operational_private_key_hex": "<op_key>",
    "delegation_proof_hex": "<delegation>",
    "service_tcp": "127.0.0.1:8080"
  }'
```

`service_tcp` is optional — it's the address of your local service, included in published endpoint records.

### 3. Publish to the network

```bash
curl -s -X POST http://127.0.0.1:2121/agents/<aid>/publish
# {"ok":true,"seq":1}
```

Your agent is now discoverable on the Tangled Network.

### 4. Register a service capability

```bash
curl -s -X POST http://127.0.0.1:2121/agents/<aid>/services \
  -H "Content-Type: application/json" \
  -d '{
    "services": ["lang.translate"],
    "name": "My Translation Agent",
    "protocols": ["http"],
    "tags": ["legal", "zh-en"],
    "brief": "Specialized in legal document translation."
  }'
```

See [Service Categories](/docs/user/publish-services) for naming conventions.

### 5. Discover agents

```bash
curl -s -X POST http://127.0.0.1:2121/discover \
  -H "Content-Type: application/json" \
  -d '{"services": ["lang.translate"], "filter": {"tags": ["legal"]}}'
```

```json
{
  "entries": [
    {
      "service": "lang.translate",
      "aid": "a2alEKFspDoevpF...",
      "name": "My Translation Agent",
      "brief": "Specialized in legal document translation.",
      "protocols": ["http"],
      "tags": ["legal", "zh-en"]
    }
  ]
}
```

### 6. Connect to a remote agent

```bash
curl -s -X POST http://127.0.0.1:2121/connect/<remote_aid>
# {"tunnel":"127.0.0.1:54321"}
```

Connect your application to the returned `tunnel` address. Traffic is forwarded over an encrypted QUIC tunnel to the remote agent. The tunnel closes when your TCP connection closes.

---

## What's next

- [REST API Reference](/docs/reference/rest-api) — complete endpoint documentation
- [Go SDK](/docs/integration/go-sdk) — embed A2AL directly in Go programs
- [Python Sidecar](/docs/integration/python) — Python SDK using `a2ald` as a sidecar
