---
title: REST API Quickstart
description: Call a2ald over HTTP from any language — the minimal flow for generating an identity, registering, publishing, publishing capabilities, searching, calling, tunnels and notes.
audience: developer
---

`a2ald` exposes a local REST API on `http://127.0.0.1:2121`. Any language that can send an HTTP request can integrate, with no SDK.

## Prerequisites

First [install and start `a2ald`](/quickstart), then confirm it is running:

```bash
curl http://127.0.0.1:2121/health
# {"status":"ok"}
```

## Authentication

With `api_token` configured, every request has to carry:

```
Authorization: Bearer <token>
```

Local origins need no token by default (they do when `require_local_token = true`), and non-local origins always need one. Every write request (`POST` / `PATCH` / `DELETE`) needs `Content-Type: application/json`. The administrative API caps JSON bodies at 1 MiB.

## The minimal flow

### 1. Generate an identity

```bash
curl -s -X POST http://127.0.0.1:2121/identity/generate | jq .
```

```json
{
  "aid": "A06aE78750B7f0a5975a9f455C98087902a4Ab15ca",
  "master_private_key_hex": "...",
  "operational_private_key_hex": "...",
  "delegation_proof_hex": "...",
  "warning": "Save the master key — it will not be shown again."
}
```

**The master key appears once**, so keep it yourself — it is the only credential for restoring that AID and the daemon does not retain it. Later operations use `operational_private_key_hex` and `delegation_proof_hex`.

### 2. Register the identity

```bash
curl -s -X POST http://127.0.0.1:2121/agents \
  -H "Content-Type: application/json" \
  -d '{
    "operational_private_key_hex": "<op_key>",
    "delegation_proof_hex": "<delegation>",
    "service_tcp": "127.0.0.1:8080"
  }'
```

`service_tcp` is optional: it binds a local service to that AID (the equivalent of `a2al inbound bind`).

### 3. Publish to the network

```bash
curl -s -X POST http://127.0.0.1:2121/agents/<aid>/publish
# {"ok":true,"seq":1}
```

Once published, anyone who knows your AID can resolve you. Records carry a TTL (1 hour by default) that the daemon renews while it runs.

### 4. Publish a service capability

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

For naming rules and categories, see [Service Naming](/docs/user/service-naming).

### 5. Search

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
      "aid": "A06aE78750B7f0a5975a9f455C98087902a4Ab15ca",
      "name": "My Translation Agent",
      "brief": "Specialized in legal document translation.",
      "protocols": ["http"],
      "tags": ["legal", "zh-en"]
    }
  ]
}
```

### 6. Calling and connecting

```bash
# an HTTP call (recommended): the equivalent of running a local gateway
curl -s -X POST http://127.0.0.1:2121/fetch/<aid> \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/.well-known/agent.json"}'
# → {status, headers, body(base64), truncated}; responses cap at 4 MiB

# a single TCP session
curl -s -X POST http://127.0.0.1:2121/connect/<aid>
# → {"tunnel":"127.0.0.1:PORT"}

# a TCP connection that stays up
curl -s -X POST http://127.0.0.1:2121/tunnel/<aid> \
  -H "Content-Type: application/json" \
  -d '{"local_port":2222,"idle_timeout_sec":0}'
```

Point your application at the `tunnel` address that comes back, and the traffic is forwarded to the peer over an encrypted QUIC tunnel.

## Endpoints at a glance

| Purpose | Endpoints |
| --- | --- |
| Identity and registration | `POST /identity/generate`, `POST /agents`, `GET /agents`, `PATCH /agents/{aid}`, `GET /agents/{aid}/export` (local only) |
| Publishing and records | `POST /agents/{aid}/publish`, `POST /agents/{aid}/records` (custom RecType `0x02`–`0x0f`) |
| Profile | `POST` / `DELETE /agents/{aid}/profile` |
| Capabilities and search | `POST /agents/{aid}/services`, `DELETE /agents/{aid}/services/{service}`, `POST /discover` |
| Resolve | `POST /resolve/{aid}`, `GET /resolve/{aid}/records?type=0` |
| Calls / connections | `POST /fetch/{aid}`, `POST /connect/{aid}`, `POST /tunnel/{aid}` (plus `GET` / `DELETE` / `reset`) |
| Notes | `POST /agents/{aid}/mailbox/send`, `GET /agents/{aid}/mailbox`, `POST /agents/{aid}/mailbox/poll` |
| Chats | `/agents/{aid}/chat/{request,accept,refuse,remove,block,send,mark-read,contacts,peers/{peer}}` |
| Rooms (read-only) | `GET /agents/{aid}/groups`, `.../groups/{group_id}`, `.../entries`; writes go through `POST /mcp/call` |
| Objects (CAS) | `POST /agents/{aid}/cas`, `GET|HEAD /aid/{holder}/cas/{object_id}` |
| ACL | `GET` / `PATCH /agents/{aid}/acl`, `POST .../acl/allow`, `POST .../acl/deny` |
| Events | `GET /agents/{aid}/events` (SSE), `GET /events` (node-level) |
| Node | `GET` / `PATCH /node/remote-admin`, `GET` / `PUT /node/address-book`, `GET /aid/{AID}/{path}` |

The complete fields, request bodies and response structures are in the [REST API](/docs/reference/rest-api).

## Related pages

| Goal | Page |
| --- | --- |
| Every endpoint and parameter | [REST API](/docs/reference/rest-api) |
| Wiring into AI tooling | [MCP Setup](/docs/integration/mcp) |
| Embedding directly in Go | [Go SDK](/docs/integration/go-sdk) |
