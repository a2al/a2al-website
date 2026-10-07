---
title: REST API 快速上手
description: 用任意语言通过 HTTP 调用 a2ald——身份生成、注册、发布、发布能力、检索、调用、隧道与便条的最小流程。
audience: developer
---

`a2ald` 在 `http://127.0.0.1:2121` 暴露本地 REST API。任何能发 HTTP 请求的语言都能接入，不需要 SDK。

## 前提条件

先[安装并启动 `a2ald`](/zh/quickstart)，然后确认它在运行：

```bash
curl http://127.0.0.1:2121/health
# {"status":"ok"}
```

## 鉴权

配置了 `api_token` 时，每个请求都要带上：

```
Authorization: Bearer <token>
```

本机来源默认免 token（`require_local_token = true` 时同样要求），非本机来源一律需要。所有写请求（`POST` / `PATCH` / `DELETE`）都需要 `Content-Type: application/json`。管理 API 的 JSON 正文上限 1 MiB。

## 最小流程

### 1. 生成身份

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

**主密钥只出现一次**，请自行保存——它是恢复该 AID 的唯一凭证，daemon 不留存。后续操作用 `operational_private_key_hex` 与 `delegation_proof_hex`。

### 2. 注册身份

```bash
curl -s -X POST http://127.0.0.1:2121/agents \
  -H "Content-Type: application/json" \
  -d '{
    "operational_private_key_hex": "<op_key>",
    "delegation_proof_hex": "<delegation>",
    "service_tcp": "127.0.0.1:8080"
  }'
```

`service_tcp` 可选：把本机服务绑定到该 AID（等同于 `a2al inbound bind`）。

### 3. 发布到网络

```bash
curl -s -X POST http://127.0.0.1:2121/agents/<aid>/publish
# {"ok":true,"seq":1}
```

发布后，知道你 AID 的人即可解析到你。记录有 TTL（默认 1 小时），daemon 运行期间自动续期。

### 4. 发布服务能力

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

命名规则与品类见[服务命名](/zh/docs/user/service-naming)。

### 5. 检索

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

### 6. 调用与连接

```bash
# HTTP 调用（推荐）：等价于本地起一个网关
curl -s -X POST http://127.0.0.1:2121/fetch/<aid> \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","path":"/.well-known/agent.json"}'
# → {status, headers, body(base64), truncated}；响应上限 4 MiB

# 一次 TCP 会话
curl -s -X POST http://127.0.0.1:2121/connect/<aid>
# → {"tunnel":"127.0.0.1:PORT"}

# 长期保持的 TCP 连接
curl -s -X POST http://127.0.0.1:2121/tunnel/<aid> \
  -H "Content-Type: application/json" \
  -d '{"local_port":2222,"idle_timeout_sec":0}'
```

把应用连到返回的 `tunnel` 地址即可，流量经加密 QUIC 隧道转发到对端。

## 常用接口一览

| 目的 | 接口 |
| --- | --- |
| 身份与注册 | `POST /identity/generate`、`POST /agents`、`GET /agents`、`PATCH /agents/{aid}`、`GET /agents/{aid}/export`（仅本机） |
| 发布与记录 | `POST /agents/{aid}/publish`、`POST /agents/{aid}/records`（自定义 RecType `0x02`–`0x0f`） |
| 名片 | `POST` / `DELETE /agents/{aid}/profile` |
| 能力与检索 | `POST /agents/{aid}/services`、`DELETE /agents/{aid}/services/{service}`、`POST /discover` |
| 解析 | `POST /resolve/{aid}`、`GET /resolve/{aid}/records?type=0` |
| 调用 / 连接 | `POST /fetch/{aid}`、`POST /connect/{aid}`、`POST /tunnel/{aid}`（+ `GET` / `DELETE` / `reset`） |
| 便条 | `POST /agents/{aid}/mailbox/send`、`GET /agents/{aid}/mailbox`、`POST /agents/{aid}/mailbox/poll` |
| 对话 | `/agents/{aid}/chat/{request,accept,refuse,remove,block,send,mark-read,contacts,peers/{peer}}` |
| 房间（只读） | `GET /agents/{aid}/groups`、`.../groups/{group_id}`、`.../entries`；写入走 `POST /mcp/call` |
| 对象（CAS） | `POST /agents/{aid}/cas`、`GET|HEAD /aid/{holder}/cas/{object_id}` |
| ACL | `GET` / `PATCH /agents/{aid}/acl`、`POST .../acl/allow`、`POST .../acl/deny` |
| 事件 | `GET /agents/{aid}/events`（SSE）、`GET /events`（节点级） |
| 节点 | `GET` / `PATCH /node/remote-admin`、`GET` / `PUT /node/address-book`、`GET /aid/{AID}/{path}` |

完整的字段、请求正文与返回结构见 [REST API](/zh/docs/reference/rest-api)。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 全部接口与参数 | [REST API](/zh/docs/reference/rest-api) |
| 接进 AI 工具 | [MCP 配置](/zh/docs/integration/mcp) |
| 在 Go 中直接嵌入 | [Go SDK](/zh/docs/integration/go-sdk) |
