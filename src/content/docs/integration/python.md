---
title: Python Sidecar
description: Start a2ald as a sidecar from the Python SDK — Daemon manages the process, Client calls REST; and where each of them stops.
audience: developer
---

The Python SDK manages `a2ald` as a **sidecar process**: it starts and cleans up on its own, with no manual daemon configuration. Platform binaries ship with the package.

```bash
pip install a2al
```

## `Daemon`

`Daemon` starts `a2ald` as a child process; using it as a context manager keeps start and stop clean.

```python
from a2al import Daemon, Client

# context manager: starts and stops automatically
with Daemon() as d:
    c = Client(d.api_base, token=d.api_token)
    print(c.health())

# or manage it by hand
d = Daemon()
d.start()          # blocks until /health answers
c = Client(d.api_base, token=d.api_token)
# … use c …
d.close()          # ends the process and removes the temporary data directory
```

| Constructor argument | Default | Notes |
| --- | --- | --- |
| `a2ald_exe` | auto-detected | Path to the `a2ald` binary; falls back to the `A2ALD_PATH` environment variable, then to the binary bundled with the package |
| `api_token` | `None` | API authentication token; falls back to the `A2AL_API_TOKEN` environment variable |
| `extra_args` | `[]` | Extra command-line arguments for `a2ald`, for example `["--bootstrap", "192.168.1.10:4121"]` |

After `start()`, `d.api_base` is the HTTP base URL (for example `http://127.0.0.1:52341`). The sidecar uses a temporary data directory and a free API port.

## `Client`

`Client` is a light REST client whose methods map straight onto the [REST API](/docs/reference/rest-api).

```python
c = Client("http://127.0.0.1:2121", token="mysecret")

c.health()                          # GET /health
c.status()                          # GET /status
c.identity_generate()               # POST /identity/generate
c.agent_register(op_key, proof)     # POST /agents
c.agent_publish(aid)                # POST /agents/{aid}/publish
c.resolve(remote_aid)               # POST /resolve/{aid}
c.connect(remote_aid)               # POST /connect/{aid} → {"tunnel":"127.0.0.1:PORT"}
c.fetch(remote_aid, method="GET", path="/.well-known/agent.json")
c.tunnel_open(remote_aid)           # POST /tunnel/{aid}
c.tunnel_close(tid)                 # DELETE /tunnel/{id}
c.discover(services, filter=None)   # POST /discover
```

| Method family | Endpoints |
| --- | --- |
| `health` / `config_get` | `/health`, `/config` |
| `identity_generate` / `agent_register` / `agent_publish` / `agents_list` | `/identity/generate`, `/agents` |
| `resolve` / `connect` / `fetch` | `/resolve/{aid}`, `/connect/{aid}`, `/fetch/{aid}` |
| `tunnel_open` / `tunnel_close` / `tunnel_list` / `tunnel_status` | `/tunnel*` |

Where it stops: `Client.fetch` / `connect` / `tunnel_open` take no `access_token`, and there is no `tunnel_reset`. Everything else can be reached with plain `HTTP` against `d.api_base`, or with the `a2al` CLI — both operate the same daemon.

## A complete example

```python
from a2al import Daemon, Client

with Daemon() as d:
    c = Client(d.api_base)

    identity = c.identity_generate()
    aid = identity["aid"]
    c.agent_register(
        identity["operational_private_key_hex"],
        identity["delegation_proof_hex"],
        service_tcp="127.0.0.1:8080",
    )

    c.post(f"/agents/{aid}/services", {
        "services": ["lang.translate"],
        "name": "My Translator",
        "brief": "EN↔ZH translation",
        "tags": ["zh-en"],
    })

    c.agent_publish(aid)

    results = c.discover(["lang.translate"], filter={"tags": ["zh-en"]})
    for entry in results["entries"]:
        print(entry["aid"], entry["brief"])

    tunnel = c.connect(results["entries"][0]["aid"])
    print(tunnel["tunnel"])  # "127.0.0.1:54321"
```

## Related pages

| Goal | Page |
| --- | --- |
| Every REST endpoint | [REST API](/docs/reference/rest-api) |
| Language-neutral HTTP examples | [REST API Quickstart](/docs/integration/rest) |
| Embedding directly in Go | [Go SDK](/docs/integration/go-sdk) |
