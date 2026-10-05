---
title: Python サイドカー
description: Python SDK から a2ald をサイドカーとして起動します。Daemon がプロセスを管理し、Client が REST を呼び出します。それぞれの能力の境界もまとめます。
audience: developer
---

Python SDK は `a2ald` を**サイドカープロセス**として管理します。起動も後片付けも自動で、daemon を手作業で設定する必要はありません。対応プラットフォームのバイナリはパッケージに同梱されています。

```bash
pip install a2al
```

## `Daemon`

`Daemon` は `a2ald` を子プロセスとして起動します。コンテキストマネージャーとして使うと、起動と終了が確実です。

```python
from a2al import Daemon, Client

# コンテキストマネージャー：起動と終了を自動化
with Daemon() as d:
    c = Client(d.api_base, token=d.api_token)
    print(c.health())

# 手動で管理する場合
d = Daemon()
d.start()          # /health が応答するまでブロックします
c = Client(d.api_base, token=d.api_token)
# … c を使う …
d.close()          # プロセスを終了し、一時データディレクトリを片付けます
```

| コンストラクタ引数 | 既定 | 説明 |
| --- | --- | --- |
| `a2ald_exe` | 自動検出 | `a2ald` バイナリのパス。`A2ALD_PATH` 環境変数、パッケージ同梱のバイナリの順にフォールバックします |
| `api_token` | `None` | API 認証の token。`A2AL_API_TOKEN` 環境変数にフォールバックします |
| `extra_args` | `[]` | `a2ald` に渡す追加のコマンドライン引数。例：`["--bootstrap", "192.168.1.10:4121"]` |

`start()` のあと、`d.api_base` が HTTP のベース URL です（例：`http://127.0.0.1:52341`）。サイドカーは一時的なデータディレクトリと空いている API ポートを使います。

## `Client`

`Client` は軽量な REST クライアントで、メソッドは [REST API](/ja/docs/reference/rest-api)にそのまま対応します。

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

| メソッド群 | 対応するインターフェース |
| --- | --- |
| `health` / `config_get` | `/health`、`/config` |
| `identity_generate` / `agent_register` / `agent_publish` / `agents_list` | `/identity/generate`、`/agents` |
| `resolve` / `connect` / `fetch` | `/resolve/{aid}`、`/connect/{aid}`、`/fetch/{aid}` |
| `tunnel_open` / `tunnel_close` / `tunnel_list` / `tunnel_status` | `/tunnel*` |

境界：`Client.fetch` / `connect` / `tunnel_open` は `access_token` を受け付けず、`tunnel_reset` もありません。それ以外の能力は `HTTP` で `d.api_base` に直接投げるか、`a2al` CLI を使います。どちらも同じ daemon を操作します。

## 完全な例

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

## 関連ページ

| 目的 | ページ |
| --- | --- |
| REST インターフェースの全体 | [REST API](/ja/docs/reference/rest-api) |
| 言語に依存しない HTTP の例 | [REST API クイックスタート](/ja/docs/integration/rest) |
| Go に直接組み込む | [Go SDK](/ja/docs/integration/go-sdk) |
