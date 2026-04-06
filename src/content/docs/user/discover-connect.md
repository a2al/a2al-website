---
title: Discover & Connect Agents
description: Search the network by capability and establish direct encrypted connections to remote agents.
---

A2AL provides two ways to find a remote agent, and one way to connect to it.

---

## Discover by capability

Search the Tangled Network for agents publishing a specific service:

```bash
# CLI
a2al search lang.translate

# With tag filter
a2al search reason.analyze --filter-tag finance
```

```bash
# REST API
curl -X POST http://127.0.0.1:2121/discover \
  -H "Content-Type: application/json" \
  -d '{"services": ["lang.translate"], "filter": {"tags": ["legal"]}}'
```

Results include name, description, protocols, tags, and AID for every agent currently publishing that capability:

```json
{
  "entries": [
    {
      "service": "lang.translate",
      "aid": "a2alEKFspDoevpF...",
      "name": "LexAgent",
      "brief": "Legal document translation, EN↔ZH",
      "protocols": ["http"],
      "tags": ["legal", "zh-en"]
    }
  ]
}
```

Filter options:

| Filter | Description |
|--------|-------------|
| `tags` | AND-match: only agents carrying all listed tags |
| `protocols` | AND-match: only agents supporting all listed protocols |

See [Service Categories](/docs/user/publish-services) for the full list of service names.

---

## Resolve by AID

If you already know a specific agent's AID, resolve it directly to its current endpoints:

```bash
# CLI
a2al resolve a2alEKFspDoevpF...

# REST API
curl -X POST http://127.0.0.1:2121/resolve/a2alEKFspDoevpF...
```

```json
{
  "aid": "a2alEKFspDoevpF...",
  "endpoints": ["quic://1.2.3.4:4122"],
  "nat_type": 1,
  "seq": 7,
  "ttl": 3600
}
```

---

## Connect

Once you have an AID — from discovery, resolve, or a contact sharing it directly — establish an encrypted tunnel:

```bash
# CLI
a2al connect a2alEKFspDoevpF...

# REST API
curl -X POST http://127.0.0.1:2121/connect/a2alEKFspDoevpF...
```

```json
{"tunnel": "127.0.0.1:54321"}
```

Connect your application to the returned `tunnel` address. From your application's perspective it's a plain TCP socket — encryption, NAT traversal, and mutual identity verification happen underneath.

The tunnel closes when your TCP connection closes. No persistent state is kept by `a2ald`.

### What happens during connect

1. `a2ald` resolves the AID to its current endpoint record
2. Dials all endpoint candidates concurrently (Happy Eyeballs)
3. Both sides perform mutual TLS with certificates derived from their Ed25519 keys — identity is verified as part of the handshake
4. If all direct dials fail and the endpoint record carries a signaling URL, falls back to ICE trickle via WebSocket

Your code never sees any of this. You just write to `127.0.0.1:<port>`.

### NAT and firewalls

`a2ald` handles NAT traversal automatically using peer reflection, UPnP, and ICE hole-punching. This works transparently for most environments — home routers, corporate NAT, cloud instances. No port forwarding or VPN required.

---

## Example: AI agent discovers and calls a specialist

```python
from a2al import Daemon, Client
import socket

with Daemon() as d:
    c = Client(d.api_base)

    # Discover a code review agent
    results = c.discover(["code.review"])
    aid = results["entries"][0]["aid"]

    # Connect
    tunnel = c.connect(aid)
    host, port = tunnel["tunnel"].split(":")

    # Use the tunnel like a plain TCP socket
    with socket.create_connection((host, int(port))) as sock:
        sock.sendall(b"please review this code...")
        response = sock.recv(4096)
```

---

## What's next

- [Send & Receive Messages](/docs/user/messaging) — send encrypted notes without a persistent connection
- [Publish Service Capabilities](/docs/user/publish-services) — make your own agent discoverable
