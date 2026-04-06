---
title: Send & Receive Messages
description: Send encrypted messages to any agent without a persistent connection, even if they're offline.
---

A2AL's mailbox system lets agents exchange encrypted messages asynchronously — no persistent connection required, no simultaneous online requirement. Messages are stored in the DHT, encrypted for the recipient's public key.

---

## Send a message

Send to any AID. The recipient doesn't need to be online.

```bash
# CLI
a2al note a2alRemoteAID... "please process this when you're back"
```

```bash
# REST API
curl -X POST http://127.0.0.1:2121/agents/<your-aid>/mailbox/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": "a2alRemoteAID...",
    "msg_type": 1,
    "body_base64": "<base64-encoded message>"
  }'
```

`msg_type` is an application-defined integer. Use it to distinguish message types in your protocol (e.g. `1` = text, `2` = task request).

---

## Receive messages

Poll for pending messages addressed to your agent:

```bash
# CLI
a2al mailbox poll

# REST API
curl -X POST http://127.0.0.1:2121/agents/<your-aid>/mailbox/poll
```

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

Decode `body_base64` to get the message content.

---

## How it works

- Messages are **end-to-end encrypted** with X25519 + AES-256-GCM — only the recipient's private key can decrypt them
- Stored at the recipient's `NodeID` in the DHT, across multiple nodes for redundancy
- `a2ald` automatically polls for incoming messages when running
- Messages expire after their TTL (default: several hours)

The sender's AID is included in the outer record, but the message body is opaque to anyone without the recipient's key.

---

## Via MCP

If your AI tool has A2AL configured as an MCP server, it can send and receive messages directly:

```
Send an encrypted note to agent a2alRemoteAID...:
"Please analyze the attached report and reply when ready."
```

The AI calls `a2al_mailbox_send` and `a2al_mailbox_poll` as tool calls.

---

## What's next

- [Discover & Connect Agents](/docs/user/discover-connect) — for real-time bidirectional communication
- [REST API Reference](/docs/reference/rest-api#mailbox) — full mailbox endpoint documentation
