---
title: Python 边车
description: 用 Python SDK 把 a2ald 当边车启动——Daemon 管理进程，Client 调用 REST；以及两者的能力边界。
audience: developer
---

Python SDK 把 `a2ald` 作为**边车进程**管理：自动启动、自动清理，不需要手工配置 daemon。它随包提供对应平台的二进制。

```bash
pip install a2al
```

## `Daemon`

`Daemon` 以子进程方式启动 `a2ald`，推荐用上下文管理器保证干净的启停。

```python
from a2al import Daemon, Client

# 上下文管理器：自动启动与关闭
with Daemon() as d:
    c = Client(d.api_base, token=d.api_token)
    print(c.health())

# 或手动管理
d = Daemon()
d.start()          # 阻塞直到 /health 应答
c = Client(d.api_base, token=d.api_token)
# … 使用 c …
d.close()          # 结束进程并清理临时数据目录
```

| 构造参数 | 默认 | 说明 |
| --- | --- | --- |
| `a2ald_exe` | 自动检测 | `a2ald` 二进制路径；依次回退到 `A2ALD_PATH` 环境变量与包内自带二进制 |
| `api_token` | `None` | API 鉴权 token；回退到 `A2AL_API_TOKEN` 环境变量 |
| `extra_args` | `[]` | 追加给 `a2ald` 的命令行参数，例如 `["--bootstrap", "192.168.1.10:4121"]` |

`start()` 之后 `d.api_base` 是 HTTP 基址（例如 `http://127.0.0.1:52341`）。边车使用临时数据目录与一个空闲 API 端口。

## `Client`

`Client` 是一个轻量 REST 客户端，方法直接对应 [REST API](/zh/docs/reference/rest-api)。

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

| 方法族 | 对应接口 |
| --- | --- |
| `health` / `config_get` | `/health`、`/config` |
| `identity_generate` / `agent_register` / `agent_publish` / `agents_list` | `/identity/generate`、`/agents` |
| `resolve` / `connect` / `fetch` | `/resolve/{aid}`、`/connect/{aid}`、`/fetch/{aid}` |
| `tunnel_open` / `tunnel_close` / `tunnel_list` / `tunnel_status` | `/tunnel*` |

边界：`Client.fetch` / `connect` / `tunnel_open` 不接受 `access_token`；没有 `tunnel_reset`。其余能力直接用 `HTTP` 打到 `d.api_base`，或用 `a2al` CLI——两者操作的是同一个 daemon。

## 完整示例

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

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 全部 REST 接口 | [REST API](/zh/docs/reference/rest-api) |
| 语言无关的 HTTP 示例 | [REST API 快速上手](/zh/docs/integration/rest) |
| 在 Go 中直接嵌入 | [Go SDK](/zh/docs/integration/go-sdk) |
