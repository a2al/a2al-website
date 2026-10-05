---
title: 架构概览
description: A2AL 的分层结构——协议只做寻址与连接，守护进程提供身份、消息与应用；以及 MCP、REST、Go、Python 四条集成路径的取舍。
audience: developer
---

## 一句话模型

每个参与者拥有一个永久地址（**AID**），任意两个地址都能**互相找到并直接连接**。协议层只做这件事：把 AID 解析到当前端点，让两端建立点对点加密连接。连上之后，应用数据在两端之间流动，不经过网络。

## 概念

**AID** —— 不是 IP、不是用户名、不是域名，而是由本地密钥派生、由数学关系绑定到你的密码学地址。IP 会变，AID 不变：别人记下你的 AID 之后，你换网络、换机器、换设备，它依然能解析到你。

**三个操作，就是协议的全部**：

```
Publish  —— 声明你存在，以及此刻在哪里
Resolve  —— 由 AID 查到对方此刻的位置
Connect  —— 打开一条直接、加密、双向认证的通道
```

`Connect` 之后应用数据在两端之间直接流动。网络（Tangled Network）只承担寻址，不接触载荷。

**NAT 不是问题所在**：daemon 先尝试直连；两端都在 NAT 之后时，用 ICE（浏览器 WebRTC 通话采用的同一机制）协商路径。路由由协议自行解决，应用代码看到的就是一条普通连接。

**`a2ald`** 是实现上述能力的本地守护进程，并在协议之上提供应用：一对一对话、房间、便条（容忍离线的消息）、文件对象与访问控制。REST、MCP、CLI 与面板都是同一个 daemon 的不同接口。

## 协议内部

A2AL 是点对点的寻址与连接层。AID 映射到 DHT 上的实时端点，两个 agent 随后建立双向 TLS 的 QUIC 会话；应用载荷走这条会话，不经过目录。

**协议本身**在连上之后不在数据路径上，也不托管应用状态。承载应用的是 **daemon**（`a2ald`）：便条、一对一对话、房间、文件对象、访问控制、MCP、REST 与面板都在这一层。

## 运行时分层

```
┌──────────────────────────────────────────────────────────────┐
│  a2ald — REST · MCP · Web UI · chat · rooms · notes · ACL    │
└──────────────────────────────┬───────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────┐
│  host — DHT + QUIC + NAT sense + UPnP + ICE + TURN (optional)│
└───┬──────────┬──────────────────────┬──────────────────┬─────┘
    │          │                      │                  │
  dht      transport              natsense           signaling
           (UDP mux,               natmap             (ICE hub)
            dual-stack)            (UPnP IPv4)
    │
 protocol — records, mailbox, topics, streams
 identity / crypto — AID, sign, delegation
```

只需要发布／解析／连接的 Go 程序依赖 `host`；其余语言与场景通过 `a2ald` 接入。

## 身份

AID 是 21 字节：`[版本 1][哈希 20]`。

| 版本 | 方案 | 哈希 |
| --- | --- | --- |
| `0xA0` | Ed25519 | `SHA-256(pubkey)[0:20]` |
| `0xA1` | P-256 | `SHA-256(pubkey)[0:20]`（字节已分配，`a2ald` 暂无生成路径） |
| `0xA2` | Paralism / HASH160 | `RIPEMD160(SHA-256(pubkey))` |
| `0xA3` | Ethereum | `Keccak-256(pubkey)[12:32]` |

展示编码：原生身份为 42 位十六进制（大小写是校验），Ethereum / Paralism 为 `0x` 十六进制。完整登记见[地址版本注册表](/zh/docs/reference/address-version-registry)。

**NodeID** = `SHA-256(version ‖ hash)`，只用于 DHT 路由，不是应用层身份。

**委托（delegation）**：主密钥派生 AID 并保持离线；操作用户密钥携带委托证明对外发布。密钥轮换时，`IssuedAt` 较新的委托生效。

## 记录（DHT）

统一容器是 CBOR 编码的 `SignedRecord`，写入与读取时都校验签名、TTL 窗口与签名权限（自签或有效委托）。

| RecType | 作用 |
| --- | --- |
| `0x01` | 端点记录：`quic://` 候选、NAT 提示、ICE 信令地址 |
| `0x02`–`0x0f` | 名片与自定义签名记录 |
| `0x10` | 主题（能力名），键为 `SHA-256("topic:" ‖ name)` |
| `0x80` | 加密便条（邮箱），存于收件人 NodeID |

端点载荷可同时列出 **IPv4 与 IPv6** 的 `quic://` 地址。新节点**不再**把 TURN 地址写入记录，中继凭据只留在本机；多信令地址用 `Signals` 字段承载。

## 连接建立

通配监听（`:4121`）默认**双栈**（UDP 绑定 `[::]`；Windows 为成对 socket），写定 IPv4 地址则保持 IPv4-only。

拨号方对候选端点并发拨号（Happy Eyeballs，有 IPv6 时优先）。直连 QUIC 全部失败、且记录带有信令地址时，两端使用**内置 ICE hub**（WebSocket trickle）协商路径；可选的外部 **TURN**（static / HMAC / REST 凭据）提供中继候选。UPnP IGD 映射作用于 IPv4。

TLS 之后，stream 0 先发送一帧 **agent-route**，使多个 AID 共享同一个 QUIC 监听：

- 当前帧：`a2r2` + 21 字节目标 AID，随后一次短控制交换，数据走后续 stream。
- 入站仍接受旧版 `a2r1`（仅 25 字节帧）。

服务 HTTP 使用专用 stream 类型，文件对象使用内容寻址 stream。

**访问控制**（daemon）作用于该 AID 的**入站 HTTP 与对象下载**；便条、DHT 与对话信封不受同一份允许／拒绝名单约束。

## 守护进程提供的应用

| 能力 | 行为 |
| --- | --- |
| 便条 Notes | DHT 邮箱上的加密存储转发，对方离线也能投递 |
| 对话 Chat | 互相邀请后建立；在线时直发，否则先落本地 |
| 房间 Rooms | 每个 AID 一份签名副本，成员经 QUIC 同步；对象按哈希寻址 |
| ACL | 该 AID 的 HTTP / 对象的允许／拒绝名单，可附加加入口令 |
| 名片 Profile | 签名的名称／简介／技能记录（RecType `0x02`） |
| 地址簿 | 本地别名与收藏（`/node/address-book`） |
| 远程管理 | 允许另一个 AID 管理本节点 |
| AID URL | `http://127.0.0.1:2121/aid/{AID}/path` —— 本地网关，无需额外端口 |

## 管理 API

默认监听 `127.0.0.1:2121`。设置 `api_token` 后：本机来源默认免 token（`require_local_token = true` 时同样要求），非本机来源一律需要 `Authorization: Bearer`。留空 token 即开放访问（有意的默认）。凭据导出仅限本机来源；本机来源的 `Host` 头会做校验以阻断 DNS rebinding。字段全集见[配置](/zh/docs/ops/config)。

## 两条集成模式

| 模式 | 说明 |
| --- | --- |
| **守护进程模式**（多数场景） | 运行 `a2ald`，通过 [MCP](/zh/docs/integration/mcp)（AI 工具零代码）、[REST](/zh/docs/integration/rest)（任意语言，`localhost:2121`）、[Python 边车](/zh/docs/integration/python) 接入。不需要 Go 环境。 |
| **库模式**（仅 Go） | 直接 import `github.com/a2al/a2al/host`，不额外起进程，完全控制。见 [Go SDK](/zh/docs/integration/go-sdk)。 |

## 模块图

![A2AL 模块架构](/diagrams/module-map.svg)

依赖自上而下：`daemon` 依赖 `host`；`host` 依赖 `dht`、`transport`、`natsense`、`protocol`；最底层是 `identity` / `crypto`。

## 模块说明

| 模块 | 职责 |
| --- | --- |
| `identity` / `crypto` | 密钥生成、AID 派生、签名与校验、委托模型 |
| `protocol` | 全部线格式 CBOR 结构：端点记录、邮箱消息、主题记录 |
| `transport` | UDP socket 管理；`UDPMux` 在 DHT 与 QUIC 之间解复用同一 socket |
| `dht` | Kademlia 风格 DHT：`FIND_NODE`、`FIND_VALUE`、`STORE` 与 K-Bucket 路由 |
| `natsense` / `natmap` | 由对端反射推断 NAT 类型；处理 UPnP 端口映射 |
| `signaling` | WebSocket ICE trickle 信令，直连失败时的回退路径 |
| `host` | 主要 Go 集成层，把下层组合成单一运行时 |
| `daemon` | `a2ald` 二进制：在 `host` 之上提供 REST、MCP、面板与自动续期 |

## 与其他协议的关系

| 协议 | 关系 |
| --- | --- |
| **MCP** | 工具调用约定。`a2ald` 作为 MCP 服务器，把网络能力暴露为工具。 |
| **A2A / ANP** | 协作与组网愿景。A2AL 提供它们所假设、但未定义的寻址与连接层。 |
| **QUIC** | agent 之间的传输：TLS 1.3、多路复用、连接迁移。 |
| **ICE / STUN / TURN** | NAT 穿越。A2AL 不自造穿越协议；TURN 是可选的**外部**服务。 |
