---
title: REST API クイックスタート
description: 任意の言語から HTTP で a2ald を呼び出します。アイデンティティの生成、登録、公開、能力の公開、検索、呼び出し、トンネル、ノートまでの最小の流れ。
audience: developer
---

`a2ald` は `http://127.0.0.1:2121` にローカルの REST API を公開します。HTTP リクエストを送れる言語であればどれでも統合でき、SDK は不要です。

## 前提条件

まず [`a2ald` をインストールして起動](/ja/quickstart)し、動作していることを確認します。

```bash
curl http://127.0.0.1:2121/health
# {"status":"ok"}
```

## 認証

`api_token` を設定した場合、すべてのリクエストに次を付けます。

```
Authorization: Bearer <token>
```

本機由来のアクセスは既定で token 不要（`require_local_token = true` なら必要）、本機以外からのアクセスには常に必要です。書き込みを伴うリクエスト（`POST` / `PATCH` / `DELETE`）には `Content-Type: application/json` が必要です。管理 API の JSON 本文の上限は 1 MiB です。

## 最小の流れ

### 1. アイデンティティを生成する

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

**マスターキーは一度だけ表示されます。** その AID を復元する唯一の資格情報で、daemon は保持しません。以後の操作には `operational_private_key_hex` と `delegation_proof_hex` を使います。

### 2. アイデンティティを登録する

```bash
curl -s -X POST http://127.0.0.1:2121/agents \
  -H "Content-Type: application/json" \
  -d '{
    "operational_private_key_hex": "<op_key>",
    "delegation_proof_hex": "<delegation>",
    "service_tcp": "127.0.0.1:8080"
  }'
```

`service_tcp` は任意で、ローカルサービスをその AID にバインドします（`a2al inbound bind` と同じ意味です）。

### 3. ネットワークへ公開する

```bash
curl -s -X POST http://127.0.0.1:2121/agents/<aid>/publish
# {"ok":true,"seq":1}
```

公開後は、あなたの AID を知る人があなたを解決できるようになります。記録には TTL（既定で1時間）があり、daemon の動作中は自動で更新されます。

### 4. サービス能力を公開する

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

命名規則とカテゴリは[サービス命名](/ja/docs/user/service-naming)を参照してください。

### 5. 検索する

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

### 6. 呼び出しと接続

```bash
# HTTP 呼び出し（推奨）：ローカルゲートウェイを立てるのと同じ
curl -s -X POST http://127.0.0.1:2121/fetch/<aid> \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/.well-known/agent.json"}'
# → {status, headers, body(base64), truncated}。応答の上限は 4 MiB

# 1回の TCP セッション
curl -s -X POST http://127.0.0.1:2121/connect/<aid>
# → {"tunnel":"127.0.0.1:PORT"}

# 長期に保つ TCP 接続
curl -s -X POST http://127.0.0.1:2121/tunnel/<aid> \
  -H "Content-Type: application/json" \
  -d '{"local_port":2222,"idle_timeout_sec":0}'
```

アプリケーションは返ってきた `tunnel` のアドレスに接続するだけです。トラフィックは暗号化された QUIC トンネルで相手へ転送されます。

## よく使うインターフェース一覧

| 目的 | インターフェース |
| --- | --- |
| アイデンティティと登録 | `POST /identity/generate`、`POST /agents`、`GET /agents`、`PATCH /agents/{aid}`、`GET /agents/{aid}/export`（本機のみ） |
| 公開と記録 | `POST /agents/{aid}/publish`、`POST /agents/{aid}/records`（独自 RecType `0x02`–`0x0f`） |
| プロフィール | `POST` / `DELETE /agents/{aid}/profile` |
| 能力と検索 | `POST /agents/{aid}/services`、`DELETE /agents/{aid}/services/{service}`、`POST /discover` |
| 解決 | `POST /resolve/{aid}`、`GET /resolve/{aid}/records?type=0` |
| 呼び出し / 接続 | `POST /fetch/{aid}`、`POST /connect/{aid}`、`POST /tunnel/{aid}`（ほかに `GET` / `DELETE` / `reset`） |
| ノート | `POST /agents/{aid}/mailbox/send`、`POST /agents/{aid}/mailbox/poll` |
| 会話 | `/agents/{aid}/chat/{request,accept,refuse,remove,block,send,mark-read,contacts,peers/{peer}}` |
| ルーム（読み取りのみ） | `GET /agents/{aid}/groups`、`.../groups/{group_id}`、`.../entries`。書き込みは `POST /mcp/call` 経由 |
| オブジェクト（CAS） | `POST /agents/{aid}/cas`、`GET|HEAD /aid/{holder}/cas/{object_id}` |
| ACL | `GET` / `PATCH /agents/{aid}/acl`、`POST .../acl/allow`、`POST .../acl/deny` |
| イベント | `GET /agents/{aid}/events`（SSE）、`GET /events`（ノード単位） |
| ノード | `GET` / `PATCH /node/remote-admin`、`GET` / `PUT /node/address-book`、`GET /aid/{AID}/{path}` |

フィールド、リクエスト本文、応答構造の全体は [REST API](/ja/docs/reference/rest-api)にあります。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| インターフェースと引数の全体 | [REST API](/ja/docs/reference/rest-api) |
| AI ツールへの接続 | [MCP 設定](/ja/docs/integration/mcp) |
| Go に直接組み込む | [Go SDK](/ja/docs/integration/go-sdk) |
