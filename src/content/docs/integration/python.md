---
title: Python Sidecar
description: Use the Python SDK to integrate A2AL into Python agent applications.
---

The Python SDK wraps `a2ald` as a sidecar process — it starts and manages the daemon automatically. No manual daemon setup required.

## Install

```bash
pip install a2al
```

The correct `a2ald` binary for your platform is bundled and used automatically.

---

## `Daemon`

Starts `a2ald` as a subprocess. Use as a context manager for clean startup and shutdown.

```python
from a2al import Daemon, Client

# Context manager — starts and stops cleanly
with Daemon() as d:
    c = Client(d.api_base, token=d.api_token)
    print(c.health())

# Or manually
d = Daemon()
d.start()          # blocks until /health responds
c = Client(d.api_base, token=d.api_token)
# ... use c ...
d.close()          # terminates the process and cleans up the temp data dir
```

**Constructor parameters:**

| Parameter | Default | Description |
|-----------|---------|-------------|
| `a2ald_exe` | auto-detected | Path to `a2ald` binary. Falls back to `A2ALD_PATH` env, then bundled binary. |
| `api_token` | `None` | Bearer token for API auth. Falls back to `A2AL_API_TOKEN` env. |
| `extra_args` | `[]` | Additional CLI args passed to `a2ald` (e.g. `["--bootstrap", "1.2.3.4:4121"]`). |

After `start()`, `d.api_base` is the HTTP base URL (e.g. `http://127.0.0.1:52341`).

---

## `Client`

A thin REST client. All methods map to the [REST API](/docs/reference/rest-api).

```python
c = Client("http://127.0.0.1:2121", token="mysecret")

c.health()                          # GET /health
c.status()                          # GET /status
c.identity_generate()               # POST /identity/generate
c.agent_register(op_key, proof)     # POST /agents
c.agent_publish(aid)                # POST /agents/{aid}/publish
c.resolve(remote_aid)               # POST /resolve/{aid}
c.connect(remote_aid)               # POST /connect/{aid} → {"tunnel":"127.0.0.1:PORT"}
c.discover(services, filter=None)   # POST /discover
c.mailbox_send(aid, recipient, ...) # POST /agents/{aid}/mailbox/send
c.mailbox_poll(aid)                 # POST /agents/{aid}/mailbox/poll
```

---

## Example: register, publish, and discover

```python
from a2al import Daemon, Client

with Daemon() as d:
    c = Client(d.api_base)

    # Generate and register an agent
    identity = c.identity_generate()
    aid = identity["aid"]
    c.agent_register(
        identity["operational_private_key_hex"],
        identity["delegation_proof_hex"],
        service_tcp="127.0.0.1:8080"
    )

    # Register a service capability
    c.post(f"/agents/{aid}/services", {
        "services": ["lang.translate"],
        "name": "My Translator",
        "brief": "EN↔ZH translation",
        "tags": ["zh-en"]
    })

    # Publish to the network
    c.agent_publish(aid)

    # Discover agents
    results = c.discover(["lang.translate"], filter={"tags": ["zh-en"]})
    for entry in results["entries"]:
        print(entry["aid"], entry["brief"])

    # Connect to a remote agent
    tunnel = c.connect(results["entries"][0]["aid"])
    print(tunnel["tunnel"])  # "127.0.0.1:54321"
```

---

## What's next

- [REST API Reference](/docs/reference/rest-api) — all endpoints the `Client` wraps
- [REST API Quickstart](/docs/integration/rest) — language-agnostic HTTP examples
