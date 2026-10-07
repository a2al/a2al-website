---
title: 配置
description: a2ald 配置项参考——网络与端口、管理 API 与鉴权、密钥与文件、日志、ICE/TURN、自动发布与更新；哪些可热改，哪些需重启。
audience: operator
---

`a2ald` 的配置集中在数据目录下的 `config.toml`。默认数据目录：Windows `%APPDATA%\a2al`、macOS `~/Library/Application Support/a2al`、Linux `~/.config/a2al`。首次启动时若文件不存在，daemon 会写入一份默认配置。

## 改配置的三种方式

| 方式 | 适用 |
| --- | --- |
| 编辑 `config.toml` 后重启 | 全部字段；改动绝对生效 |
| `a2al config set <键> <值>` 或 `PATCH /config` | 仅可热改字段；返回 `restart_required` 列出仍需重启的键 |
| 命令行参数（`--listen`、`--api-addr`、`--bootstrap`、`--fallback-host`、`--no-open-browser`、`-config`） | 临时覆盖，优先级高于文件 |

## 网络与端口

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `listen_addr` | `:4121` | DHT 与直连的 UDP 监听地址。通配符 `:4121` 表示双栈（IPv4 + IPv6）；写定 IPv4 地址则为 IPv4-only。 |
| `quic_listen_addr` | 空 | 留空时 QUIC 与 DHT 共用同一 UDP 端口；填写后 QUIC 单独监听。 |
| `bootstrap` | `[]` | 种子节点，格式 `host:port`（不是 multiaddr）。留空加入公共网络；非空则跳过公共 DNS 与信标，只与给定节点组网。 |
| `min_observed_peers` | `3` | 反射地址被采纳前，需要多少个对端给出相同结果。 |
| `fallback_host` | 空 | 监听地址与反射都不明确时，对外公布的地址。 |
| `disable_upnp` | `false` | 跳过 UPnP（IPv4 的 IGD 端口映射）。云主机、无 UPnP 的路由器上可关闭。 |
| `bootstrap_node_ids` | 无 | 可选；要求引导节点的 NodeID 落在给定清单内（十六进制）。 |

端口占用为 **4121/UDP + 4121/TCP**：UDP 承载 QUIC 直连与地址查询，TCP 承载内置的 ICE 信令。管理面默认只监听 `127.0.0.1:2121`。

## 管理 API 与鉴权

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `api_addr` | `127.0.0.1:2121` | 面板、管理 API、本地网关的监听地址。保持本机监听即可正常使用。 |
| `api_token` | 空 | 留空表示开放访问（有意的默认）。设置后，非本机来源必须携带 `Authorization: Bearer`。 |
| `require_local_token` | `false` | 置为 `true` 时，本机调用同样需要 token——同一台机器上有多个用户时建议开启。 |
| `open_browser` | `true` | 启动时自动打开面板；无头或服务方式运行时可关闭（或传 `--no-open-browser`）。 |

管理面另有防护：本机来源的请求会校验 `Host` 头，以阻断 DNS rebinding；请求体上限 1 MiB（`fetch` 响应上限 4 MiB，超出标记 `truncated`）。

## 密钥、数据与文件

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `key_dir` | 空 | 留空时使用数据目录下的默认密钥目录。 |
| `files_root` | 空 | 交给 daemon 的文件对象字节的沙箱目录（`CAS`、`group_object_put` 的 `body_base64`）。留空时按路径登记对象没有额外目录限制。 |

数据目录权限为 `0700`、配置文件为 `0600`，密钥位于 `<数据目录>/keys/`。同一数据目录同时只能由一个 `a2ald` 进程使用（独占锁）。

## 日志

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `log_format` | `text` | `text` 或 `json`；后者便于日志聚合。 |
| `log_level` | `info` | `debug` / `info` / `warn` / `error`。 |
| `log_debug_components` | 无 | 需要时按组件打开调试，例如 `["ice", "punch", "natsense"]`。 |

## 发布与更新

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `auto_publish` | `true` | 保持地址记录续期，使知道你 AID 的人能解析到你；关闭后需手动 `a2al agents publish`。 |
| `learned_path_first` | `true` | 优先复用上次可用的 UDP 路径，失败再走 ICE。 |
| `[update] auto` | `true` | 后台检查更新；也可手动 `a2ald update`（面板不提供更新入口）。 |

## ICE 与 TURN

| 键 | 说明 |
| --- | --- |
| `ice_signal_url` / `ice_signal_urls` | ICE 信令（WebSocket）地址；`ice_signal_urls` 非空时以它为准。 |
| `ice_stun_urls` | `stun:` 地址；留空且未配置 TURN 时使用公共 STUN。 |
| `signal_listen_addr` | 内置 ICE 信令 hub 的 TCP 监听；留空默认从 `listen_addr` 派生同端口，`off` 关闭。 |
| `disable_relay` | 置为 `true` 时默认不使用 TURN 中继；也可按调用传入。 |
| `[[turn_servers]]` | 外部 TURN 服务器，字段 `url`、`username`、`credential`、`credential_type`（`static` / `hmac` / `rest_api`）。凭据不对外发布。 |

直连与 ICE 覆盖绝大多数网络组合；**双端均为对称 NAT**时才需要自配 TURN。A2AL 不设中继，中继只转发加密流量。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 端口取舍与访问控制建议 | [安全实践](/zh/docs/user/security-practices) |
| 在 Linux 上常驻运行 | [用 systemd 部署](/zh/docs/ops/systemd) |
| 在容器中运行 | [用 Docker 部署](/zh/docs/ops/docker) |
| 完整的 REST 配置接口 | [REST API](/zh/docs/reference/rest-api) |
