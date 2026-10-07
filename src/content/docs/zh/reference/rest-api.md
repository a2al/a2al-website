---
title: REST API
description: a2ald 的完整接口参考——鉴权与限额、身份与 agent、发布与解析、调用与隧道、便条、对话、房间、对象、ACL、事件、节点接口，以及 MCP 工具与 CLI 对照。
audience: developer
---

`a2ald` 默认监听 `http://127.0.0.1:2121`（可用 `--api-addr` 或 `config.toml` 修改）。

## 鉴权与限额

配置了 `api_token` 时：非本机来源必须带 `Authorization: Bearer <token>`；本机来源默认免 token，除非 `require_local_token = true`。token 留空即开放访问（有意的默认）。写请求需要 `Content-Type: application/json`。

- 管理 API 的 JSON 正文上限 **1 MiB**；
- `fetch` 响应上限 **4 MiB**，超出时返回 `truncated: true`；
- `POST /agents/{aid}/cas` 为流式上传，不受 JSON 上限约束；
- `GET /agents/{aid}/export` 仅限本机来源；
- `GET /aid/…` 网关**不使用**管理 token，走的是该 AID 的 ACL。

## 健康、配置与更新

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/health` | `{"status":"ok"}` |
| `GET` | `/status` | 节点 AID、发布时间、`pending` 清单 |
| `GET` `PATCH` | `/config` | GET 会脱敏 `api_token`；PATCH 见下 |
| `GET` | `/config/schema` | 配置的 JSON Schema |
| `GET` | `/update/status` | 当前检查 / 上次应用 |
| `POST` | `/update/apply` | 正文忽略；返回 **202** `{message}`，非受管服务可能附带 `warning` |

`PATCH /config` 仅接受：`listen_addr`、`quic_listen_addr`、`bootstrap`、`disable_upnp`、`fallback_host`、`min_observed_peers`、`api_addr`、`api_token`、`key_dir`、`log_format`、`log_level`、`auto_publish`、`turn_servers`、`disable_relay`。返回 `{ok, restart_required:[…]}`；其余 TOML 键需改文件并重启。

## 身份与 agent

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/identity/generate` | Ed25519 主密钥 + 操作用户密钥 + 委托证明；主密钥只返回一次 |
| `POST` | `/agents/generate` | `{"chain":"ethereum"\|"paralism"}` |
| `POST` | `/agents/ethereum/delegation-message` | 生成待签消息 |
| `POST` | `/agents/ethereum/register` | 钱包 `personal_sign` 之后注册 |
| `POST` | `/agents/ethereum/proof` | 用本地以太私钥直接生成证明（自动化） |
| `POST` | `/agents/paralism/proof` | 同上，字段为 `paralism_private_key_hex` |
| `POST` | `/agents` | 注册**或**导入：`operational_private_key_hex`、`delegation_proof_hex`，可选 `service_tcp` |
| `GET` | `/agents` | 列出全部（含 `pending`） |
| `GET` | `/agents/{aid}` | 单个 agent |
| `GET` | `/agents/{aid}/export` | 导出操作凭据（明文 JSON）；仅本机。CLI `--password` 可加密文件 |
| `PATCH` | `/agents/{aid}` | 改 `service_tcp`（字符串或空串解绑）；可选 `operational_private_key_hex` |
| `DELETE` | `/agents/{aid}` | 正文 `{}` |
| `GET` | `/agents/{aid}/probe` | TCP + DHT 可达性 |
| `POST` | `/agents/{aid}/heartbeat` | 可选；其他写操作已计入心跳 |
| `POST` | `/agents/{aid}/publish` | 立即发布端点记录 |
| `POST` | `/agents/{aid}/records` | 自定义 RecType `0x02`–`0x0f`：`rec_type`、`payload_base64`、`ttl` |
| `POST` `DELETE` | `/agents/{aid}/profile` | 名片，见下 |

`POST /identity/generate` 返回 `aid`、`master_private_key_hex`、`operational_private_key_hex`、`delegation_proof_hex`。主密钥可在面板中以主密钥恢复（「添加新身份 → 从主私钥建立」，浏览器本地签名），命令行则通过导出文件或 `POST /agents` 重新导入。

名片字段（全部可选）：`name`、`brief`、`protocols`、`skills`（最多 3）、`modalities`、`card_hash`、`meta`。`DELETE` 移除覆盖值。

## 服务能力与检索

```http
POST /agents/{aid}/services
{"services":["lang.translate"],"name":"…","protocols":["http"],"tags":["legal"],"brief":"…","ttl":3600}

DELETE /agents/{aid}/services/lang.translate
{}

POST /discover
{"services":["lang.translate"],"filter":{"protocols":["mcp"],"tags":["legal"]}}
```

命名、品类与判定顺序见[服务命名](/zh/docs/user/service-naming)。

## 解析、调用与隧道

```http
POST /resolve/{aid}
GET  /resolve/{aid}/records?type=0

POST /fetch/{aid}
{"method":"GET","path":"/.well-known/agent.json","local_aid":"…","access_token":"…","headers":{},"body_base64":""}
# → {status, headers, body(base64), truncated}   正文上限 4 MiB

POST /connect/{aid}
{"local_aid":"…","access_token":"…","disable_relay":false}
# → {"tunnel":"127.0.0.1:PORT"}  单次 TCP 会话

POST /tunnel/{aid}
{"local_aid":"…","access_token":"…","local_port":18080,"idle_timeout_sec":90,"disable_relay":false}
# → {id, listen, remote_aid, is_relayed}
# 同一 (本地 AID, 对方 AID, 端口) 会复用；端口占用 409；需要中继但被禁用 412

GET    /tunnel
GET    /tunnel/{id}
DELETE /tunnel/{id}
POST   /tunnel/{id}/reset
```

`idle_timeout_sec` 省略或为 0 表示 6 分钟默认值，`-1` 表示不因空闲关闭。

## 便条（邮箱）

```http
POST /agents/{aid}/mailbox/send
{"recipient":"…","msg_type":1,"body_base64":"…"}

GET /agents/{aid}/mailbox
# → {"messages":[{"message_id","sender","msg_type","body_base64"},…]}
# 只看：不消耗、不心跳

POST /agents/{aid}/mailbox/poll
{}
# → 同样的 messages[]；收取即删除；心跳
```

`msg_type`：CLI 默认 `1`；应用文本便条通常用 `3`；房间邀请为 `0x10`（由 daemon 在 `group_invite` 时写入）；对话邀请不走邮箱。`pending.mailbox` → `list` 只看，`poll` 收取。

## 对话

| 方法 | 路径 | 正文 |
| --- | --- | --- |
| `POST` | `/agents/{aid}/chat/request` | `{"peer","note?"}` |
| `POST` | `/agents/{aid}/chat/accept` | `{"peer"}` |
| `POST` | `/agents/{aid}/chat/refuse` | `{"peer"}` |
| `POST` | `/agents/{aid}/chat/remove` | `{"peer"}` |
| `POST` | `/agents/{aid}/chat/block` | `{"peer"}` |
| `POST` | `/agents/{aid}/chat/send` | `{"peer","text?"}` 加 `path` **或** `object_id`（不能同时） |
| `POST` | `/agents/{aid}/chat/mark-read` | `{"peer","scanned_to?"}` |
| `GET` | `/agents/{aid}/chat/contacts` | friends / `out_pending` / `in_pending` |
| `GET` | `/agents/{aid}/chat/peers/{peer}` | `?after_seq` `&limit` → `{entries, scanned_to, has_more, read_cursor, unread_count}` |

未先邀请即发送会返回 `not_friends`。

## 房间

只读检查（不计入心跳）：

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/agents/{aid}/groups` | `{groups:[…]}`，仅本地已有副本 |
| `GET` | `/agents/{aid}/groups/{group_id}` | 头部与计数 |
| `GET` | `/agents/{aid}/groups/{group_id}/entries` | `?after_seq` `&limit`（默认与上限均为 50） |

写入走 MCP `group_*` 或 `POST /mcp/call`（即 CLI `a2al group`）；成员自行退出走 `POST /agents/{aid}/groups/{group_id}/leave`（创建者不能退出）。

## 对象（CAS）

```http
POST /agents/{aid}/cas?name=file.bin
Content-Type: application/octet-stream
<bytes>
# 需要 files_root → {object_id, size, name, url}

GET|HEAD /aid/{holder}/cas/{object_id}
```

`/aid/` 下的读取遵循持有者的 ACL；写入仅限本机（需 API token）。`group_object_put` 传 `path` 时，若文件对 `a2ald` 可见，可原地哈希而不复制。

## ACL（该 AID 的 HTTP / 对象）

```http
GET   /agents/{aid}/acl
PATCH /agents/{aid}/acl          {"default":"public"|"deny"}
POST  /agents/{aid}/acl/allow    {"aid":"…"}  或  {"secret":"…"}
POST  /agents/{aid}/acl/deny     {"aid":"…"}
DELETE /agents/{aid}/acl/allow/{id}
DELETE /agents/{aid}/acl/deny/{id}
```

不作用于便条、DHT 与对话。

## 事件

- HTTP：`GET /agents/{aid}/events`（SSE）。续传用 `?last_event_id=N` 或 `Last-Event-ID`；不带游标只收实时事件；该 URL 使用 `after_seq` 会返回 **400**；`?types=chat.unread,mailbox.received` 可过滤。节点级为 `GET /events`。
- 轮询：MCP `a2al_events_poll`（用 `after_seq`）或 `POST /mcp/call`。

订阅时可能先收到一个**不带 id** 的 `event: pending`（本地计数，例如 `{"<aid>":{"mailbox":1,"chat_invites":0,"chat_unread":2}}`）。日志事件包括：`mailbox.received`、`group.unread`、`group.mentioned`、`group.appended`（自己的写入）、`chat.invites`（`count` + `peers`）、`chat.unread`、`chat.received`。事件只作提示，实际内容以邮箱、对话记录与房间记录为准。

## 节点：远程管理、地址簿、AID 网关

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` `PATCH` | `/node/remote-admin` | PATCH `{"enabled":true}` |
| `POST` | `/node/remote-admin/allow` / `deny` | `{"aid"}`；allow 也接受 `{"secret"}` |
| `DELETE` | `/node/remote-admin/allow/{id}` / `deny/{id}` | |
| `GET` `PUT` | `/node/address-book` | `{aliases:{aid:label}, favorites:[{id,aid,skill,protocols,addedAt}]}` |
| `GET` | `/aid/{AID}/{path}` | 除 CONNECT 外任意方法；使用**节点**身份，**不带** `access_token`；受限对端用 `POST /fetch` |
| `GET` | `/debug/identity` `/debug/routing` `/debug/store` `/debug/stats` `/debug/host` | DHT / NAT / 绑定信息 |
| `POST` | `/mcp/call` | `{"tool":"group_create","args":{…}}` → 工具 JSON；工具错误返回 **422** |
| | `/mcp/` | Streamable HTTP MCP |

## MCP 工具

HTTP 端点 `http://127.0.0.1:2121/mcp/`；stdio 用 `a2ald --mcp-stdio`（有运行中的 daemon 时代理它；没有则以该进程为节点，无 REST / 面板）。成功结果可能带 `pending`：房间邀请计入 `mailbox`，对话邀请计入 `chat_invites`。MCP 不提供 ACL、远程管理、地址簿与名片。下表中 **加粗为必需参数**，`chat_*` / `group_*` 的 `aid` 都是**本地**身份。

### `a2al_*`

| 工具 | 参数 |
| --- | --- |
| `a2al_identity_generate` | 无——请保存主密钥 |
| `a2al_agents_list` / `a2al_status` / `a2al_tunnel_list` | 无 |
| `a2al_agents_generate_ethereum` | 无 |
| `a2al_ethereum_delegation_message` | **agent**、**issued_at**、**expires_at**，`scope?`；`operational_public_key_hex` 与 `operational_private_key_seed_hex` 二选一 |
| `a2al_ethereum_register` | **agent**、时间戳、**eth_signature_hex**，`service_tcp?`，操作用户私钥或种子 |
| `a2al_ethereum_proof` | **ethereum_private_key_hex**、时间戳，`scope?`，操作用户密钥可选 |
| `a2al_agent_register` | **operational_private_key_hex**、**delegation_proof_hex**，`service_tcp?` |
| `a2al_agent_get` / `_probe` / `_publish` / `_heartbeat` / `_delete` | **aid** |
| `a2al_agent_patch` | **aid**、`service_tcp`，`operational_private_key_hex?` |
| `a2al_agent_publish_record` | **aid**、**rec_type**、**payload_base64**，`ttl?` |
| `a2al_resolve` | **aid** |
| `a2al_resolve_records` | **aid**、`type`（0 = 全部） |
| `a2al_discover` | **services[]**，`filter.protocols?`、`filter.tags?` |
| `a2al_service_register` | **aid**、**services[]**、`name`、`protocols[]`、`tags[]`、`brief`、`meta`、`ttl` |
| `a2al_service_unregister` | **aid**、**service** |
| `a2al_fetch` | **remote_aid**、**path**，`method?`、`headers?`、`body_base64?`、`local_aid?`、`access_token?` |
| `a2al_connect` | **remote_aid**，`local_aid?`、`access_token?`（此工具无 `disable_relay`） |
| `a2al_tunnel_open` | **remote_aid**，`local_aid?`、`access_token?`、`local_port?`、`idle_timeout_sec?` |
| `a2al_tunnel_close` | **tunnel_id** |
| `a2al_mailbox_send` | **aid**、**recipient**、**msg_type**、**body_base64** |
| `a2al_mailbox_list` | **aid** — 只看，不消耗 |
| `a2al_mailbox_poll` | **aid** — 收取，取走 |
| `a2al_events_poll` | **aid**、`after_seq`（0 = 从缓冲起点开始） |

`a2al_events_poll` 返回 `{events, last_seq, oldest_seq, truncated}`；下次调用传 `after_seq = last_seq`，`truncated` 为真时重置为 0。

### `chat_*`

| 工具 | 其他参数 |
| --- | --- |
| `chat_request` | **peer**，`note?` |
| `chat_accept` / `chat_refuse` / `chat_remove` / `chat_block` | **peer** |
| `chat_send` | **peer**，`text?`，`path` **或** `object_id` |
| `chat_read` | **peer**、`after_seq`、`limit?` → 用 `scanned_to` 翻页 |
| `chat_mark_read` | **peer**、`scanned_to`（0 或省略 = 当前日志全部） |
| `chat_contacts` | 仅 aid |

### `group_*`

| 工具 | 其他参数 |
| --- | --- |
| `group_create` | `title?` → `{group_id, link}` |
| `group_list` | 仅本地已有副本 |
| `group_invite` | **group_id**、**target_aid** |
| `group_join` | **link** *或*（`group_id` + `creator_aid`）；`peer_aid?`、`inviter_aid?`、`member_hints[]?`、`title?` |
| `group_get_link` / `group_head` / `group_members` | **group_id** |
| `group_append` | **group_id**，`kind?`（默认 `msg`）、`body?`（base64，解码后 ≤ 2 KiB）、`ref?`、`reply_to?`、`to[]?` |
| `group_read` | **group_id**，`after_seq?`、`limit?`（默认 50）、`kind` / `author` / `since_ts` / `until_ts` / `to` / `reply_to`；用 **`scanned_to_seq`** 翻页，省略 `after_seq` 从最早开始 |
| `group_mark_read` | **group_id**、**seq**（0 = 不标记任何内容） |
| `group_retract` | **group_id**、**entry_id** |
| `group_object_put` | `path` **或** `body_base64`（+ `name?`；需要 `files_root`） |
| `group_object_locate` | **object_id**，`hint_aid?` — 只查状态，不下载 |
| `group_object_get` | **object_id**，`dest?`、`hint_aid?`、`register?`、`force?`、`access_token?` |
| `group_sync` | **group_id**、**peer_aid** —— 诊断用 |

## CLI 对照

全局参数：`--api`、`--token`、`--json`、`--quiet`；环境变量 `A2AL_API`、`A2AL_TOKEN`。`chat` / `group` 经由 `POST /mcp/call`。

| 命令 | 关键参数 |
| --- | --- |
| `status` / `doctor` / `version` | |
| `register` | `[--ethereum --eth-key 0x…] [--service-tcp host:port] [--save-master FILE] [--no-publish]` |
| `identity new` / `new-eth` | 只打印密钥，不注册 |
| `publish` | `<能力名> [--from URL] [--name] [--brief] [--url] [--aid] [--ttl] [--protocol] [--tag] [-y]` |
| `unpublish` / `search` | `<能力名> [--aid]`；`search` 可加 `--filter-protocol`、`--filter-tag` |
| `info` / `resolve` | `<aid>` |
| `get` / `post` | `--header K:V` `--local-aid` `--access-token`；`post -d JSON` |
| `inbound bind` | `--addr host:port [--aid]` —— 不要填 daemon 的 `api_addr` |
| `connect` / `tunnel` | `tunnel open\|close\|reset\|status`；`--local-aid` `--access-token` `--local-port` `--idle-timeout` |
| `note` | `send <local> <remote> <body-base64> [--msg-type]` / `list <local>` / `poll <local>` |
| `chat` / `group` | 见[收发消息](/zh/docs/user/messaging)与[房间（多人协作）](/zh/docs/user/rooms) |
| `agents` | `new` `new-eth` `get` `update --service-tcp` `del` `publish` `heartbeat` `export [-o] [--password]` `import` `topic add\|del` `acl*` |
| `config` | `get [key]` · `set <key> <value>`（仅 PATCH 可改键） |
| `admin` | `on` `off` `password <secret>\|off` `allow` `deny` `del allow\|deny <id>` |
| `update` | `[--check] [--confirm]` |

### `a2ald` 参数

`--data-dir`、`--config`、`--listen`、`--api-addr`、`--fallback-host`、`--bootstrap`（逗号分隔 `host:port`）、`--mcp-stdio`、`--no-open-browser`。

默认数据目录：`os.UserConfigDir()/a2al`——Windows `%APPDATA%\a2al`、macOS `~/Library/Application Support/a2al`、Linux `~/.config/a2al`。

子命令：`mcp add|print`、`update [--check]`；Windows / macOS 另有 `service install|uninstall|start|stop|status`（`-data-dir`；`-user` 仅 Windows）。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 语言无关的快速上手 | [REST API 快速上手](/zh/docs/integration/rest) |
| MCP 宿主配置 | [MCP 配置](/zh/docs/integration/mcp) |
| 全部配置项 | [配置](/zh/docs/ops/config) |
| 协议与线格式 | [协议规范](/zh/docs/spec/protocol) |
