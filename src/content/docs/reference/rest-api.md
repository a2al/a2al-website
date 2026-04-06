---
title: REST API
description: Complete reference for the a2ald REST API.
---

`a2ald` binds to `http://127.0.0.1:2121` by default (configurable via `--api-addr`).

## Authentication

If `api_token` is configured, every request must include:

```
Authorization: Bearer <token>
```

All mutating requests (`POST`, `PATCH`, `DELETE`) require `Content-Type: application/json`.

---

## Health and Status

### `GET /health`

```json
{"status":"ok"}
```

### `GET /status`

Node state: AID, publish status, timing.

```json
{
  "node_aid": "a2alEKFspDoevpF...",
  "auto_publish": true,
  "node_seq": 4,
  "node_published": true,
  "node_last_publish_at": "2026-04-06T12:00:00Z",
  "node_next_republish_estimate": "2026-04-06T12:30:00Z",
  "republish_interval_s": 1800,
  "endpoint_ttl_s": 3600
}
```

---

## Identity

### `POST /identity/generate`

Generate a new Ed25519 agent identity. Returns keys and delegation proof **once** — the daemon does not retain the master key.

```json
{
  "aid": "a2alEKFspDoevpF...",
  "master_private_key_hex": "...",
  "operational_private_key_hex": "...",
  "delegation_proof_hex": "...",
  "warning": "Save the master key — it will not be shown again."
}
```

### `POST /agents/generate`

Generate a blockchain-linked identity (Ethereum or Paralism). Keys are not retained.

**Request:** `{"chain": "ethereum"}` — `chain` is `"ethereum"` (default) or `"paralism"`.

---

## Agents

### `POST /agents`

Register a previously generated identity with the daemon.

**Request:**
```json
{
  "operational_private_key_hex": "...",
  "delegation_proof_hex": "...",
  "service_tcp": "127.0.0.1:8080"
}
```

`service_tcp` is optional — your local service address, included in published endpoint records.

**Response:** `{"aid": "a2alEKFspDoevpF...", "status": "registered"}`

### `GET /agents`

List all registered agents and their status.

```json
{
  "agents": [
    {
      "aid": "a2alEKFspDoevpF...",
      "service_tcp": "127.0.0.1:8080",
      "service_tcp_ok": true,
      "heartbeat_seconds_ago": 12,
      "last_publish_at": "2026-04-06T12:00:00Z"
    }
  ]
}
```

### `GET /agents/{aid}`

Single agent status including reachability and publish info.

### `PATCH /agents/{aid}`

Update `service_tcp`. Requires the operational private key.

**Request:**
```json
{
  "operational_private_key_hex": "...",
  "service_tcp": "127.0.0.1:9090"
}
```

### `DELETE /agents/{aid}`

Unregister an agent. Body: `{}`.

### `POST /agents/{aid}/publish`

Publish or refresh the agent's DHT endpoint record immediately.

**Response:** `{"ok": true, "seq": 5}`

### `POST /agents/{aid}/heartbeat`

Signal that the agent is alive. Prevents auto-publish from skipping idle agents.

### `POST /agents/{aid}/records`

Publish a custom signed record (RecType `0x02`–`0x0f`).

**Request:**
```json
{
  "rec_type": 2,
  "payload_base64": "...",
  "ttl": 3600
}
```

---

## Services (Capability Discovery)

### `POST /agents/{aid}/services`

Register capabilities for an agent, making it discoverable by service name.

**Request:**
```json
{
  "services": ["lang.translate"],
  "name": "My Translation Agent",
  "protocols": ["mcp", "http"],
  "tags": ["legal", "zh-en"],
  "brief": "Specialized in legal document translation.",
  "meta": {"url": "https://example.com/agent"},
  "ttl": 3600
}
```

### `DELETE /agents/{aid}/services/{service}`

Remove a service from the daemon's renewal list. Body: `{}`. The DHT entry expires after its TTL.

### `POST /discover`

Search for agents by capability.

**Request:**
```json
{
  "services": ["lang.translate"],
  "filter": {
    "protocols": ["mcp"],
    "tags": ["legal"]
  }
}
```

**Response:**
```json
{
  "entries": [
    {
      "service": "lang.translate",
      "aid": "a2alEKFspDoevpF...",
      "name": "My Translation Agent",
      "brief": "Specialized in legal document translation.",
      "protocols": ["mcp"],
      "tags": ["legal", "zh-en"]
    }
  ]
}
```

---

## Resolve and Connect

### `POST /resolve/{aid}`

Resolve a remote AID to its current endpoint record.

```json
{
  "aid": "a2alEKFspDoevpF...",
  "endpoints": ["quic://1.2.3.4:4122"],
  "nat_type": 1,
  "seq": 7,
  "ttl": 3600
}
```

### `GET /resolve/{aid}/records?type={rec_type}`

Fetch raw `SignedRecord`s for a remote AID. Omit `type` or set `type=0` for all record types.

### `POST /connect/{aid}`

Establish a direct encrypted tunnel to a remote agent. Returns a local TCP address.

**Request** (optional — only needed when multiple local agents are registered):
```json
{"local_aid": "a2alXYZ..."}
```

**Response:**
```json
{"tunnel": "127.0.0.1:54321"}
```

Connect your application to `tunnel`. Traffic is forwarded over QUIC to the remote agent. The tunnel closes when your TCP connection closes.

---

## Mailbox

### `POST /agents/{aid}/mailbox/send`

Send an encrypted note to any agent by AID, even if they are offline.

**Request:**
```json
{
  "recipient": "a2alRemoteAID...",
  "msg_type": 1,
  "body_base64": "..."
}
```

### `POST /agents/{aid}/mailbox/poll`

Retrieve and decrypt pending incoming notes.

**Response:**
```json
{
  "messages": [
    {
      "sender": "a2alSenderAID...",
      "msg_type": 1,
      "body_base64": "..."
    }
  ]
}
```

---

## Ethereum Identity

### `POST /agents/ethereum/delegation-message`

Build the EIP-191 `personal_sign` message for wallet-based delegation.

**Request:**
```json
{
  "agent": "0x3a7f...",
  "issued_at": 1712345678,
  "expires_at": 1743881678,
  "operational_public_key_hex": "..."
}
```

**Response:** `{"message": "Sign this message in your wallet:\n..."}`

### `POST /agents/ethereum/register`

Register an Ethereum-linked agent after wallet signing.

**Request:**
```json
{
  "agent": "0x3a7f...",
  "issued_at": 1712345678,
  "expires_at": 1743881678,
  "eth_signature_hex": "...",
  "service_tcp": "127.0.0.1:8080",
  "operational_private_key_seed_hex": "..."
}
```

### `POST /agents/ethereum/proof`

Generate an Ethereum delegation proof from a private key (automation / scripting).

### `POST /agents/paralism/proof`

Generate a Paralism blockchain delegation proof from a private key.

---

## Config

### `GET /config`

Current daemon configuration (`api_token` redacted as `***`).

### `PATCH /config`

Partial config update.

**Request (any subset of fields):**
```json
{
  "auto_publish": true,
  "fallback_host": "1.2.3.4",
  "api_token": "mysecret"
}
```

**Response:** `{"ok": true, "restart_required": ["fallback_host"]}`

### `GET /config/schema`

JSON Schema for all config fields (for UI / tooling).

---

## MCP transport

`a2ald` also exposes its capabilities as MCP tools:

- **Streamable HTTP**: `http://127.0.0.1:2121/mcp/`
- **Stdio**: `a2ald --mcp-stdio`

See [MCP Setup](/docs/integration/mcp) for platform-specific configuration.
