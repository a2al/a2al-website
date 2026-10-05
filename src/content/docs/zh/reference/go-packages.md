---
title: Go 包
description: A2AL Go 模块的导出接口参考——host、dht、protocol、identity、config 与调试 HTTP。
audience: developer
---

公开接口：`host`、`dht`、`protocol`、`identity`、`crypto`。模块路径 `github.com/a2al/a2al`。

daemon 的 REST、MCP 与 Python 见 [REST API](/zh/docs/reference/rest-api)；概念见[架构概览](/zh/docs/integration/overview)。

| 层次 | 包 | 何时使用 |
| --- | --- | --- |
| 节点运行时 | `github.com/a2al/a2al/host` | DHT + QUIC，发布 / 解析 / 连接 |
| 仅 DHT | `github.com/a2al/a2al/dht` | 自带传输，只要路由与 STORE/FIND |
| 守护进程 | `a2ald` | REST、面板、MCP——除非嵌入，不要 import `host` |

## `host.Host`

包含 DHT 节点、UDP mux 或独立 QUIC socket、NAT 反射（`natsense`）、ICE 与可选 TURN。

通配 `ListenAddr` / `QUICListenAddr`（`:4121`、`0.0.0.0:port`）绑定**双栈**，写定 IPv4 则保持 IPv4-only。`DisableIPv6` 强制 `udp4`（仅库选项，不是 daemon 的 TOML 键）。

### `host.Config`

| 字段 | 含义 |
| --- | --- |
| `KeyStore` | 必需。恰好一个 `Address`。 |
| `ListenAddr` | DHT 的 UDP 绑定（默认 `":4121"`）。未指定具体主机时双栈。 |
| `QUICListenAddr` | 留空表示与 DHT 共用 socket（mux）；非空则单独绑定 QUIC。 |
| `PrivateKey` | QUIC / TLS 用的 Ed25519 私钥；否则取 `EncryptedKeyStore.Ed25519PrivateKey`。 |
| `MinObservedPeers` | 反射地址需要多少个对端一致（默认 3）。 |
| `FallbackHost` | 绑定与反射都不明确时对外公布的地址。 |
| `DisableUPnP` | 跳过 QUIC 端口的 IGD 映射（IPv4）。 |
| `DisableIPv6` | 强制 IPv4-only。 |
| `ICESignalURL` / `ICESignalURLs` | ICE WebSocket hub；`ICESignalURLs` 非空时优先，首个地址同时写入 `EndpointPayload.Signal`。 |
| `ICESTUNURLs` | `stun:` 地址；未配置 TURN 时留空即用公共 STUN。 |
| `ICETURNURLs` | 旧式内嵌凭据的 `turn:`，建议改用 `TURNServers`。 |
| `TURNServers` | 外部 TURN：`URL`、`Username`、`Credential`、`CredentialType`（`static` / `hmac` / `rest_api`）。凭据按 ICE 会话生成，从不发布。 |
| `ICEPublishTurns` | 已废弃。新节点不在 DHT 上写 `turns[]`。 |
| `DisableRelay` | 为真时默认不使用 TURN 中继；按调用可用 `DialOptions.DisableRelay`。默认 false。 |
| `ICENetworkTypes` | ICE 网络类型，默认 UDP4 + UDP6。 |
| `Logger` | `*slog.Logger`，默认 `slog.Default()`。 |

内部 DHT 节点的 `RecordAuth` 要求自签或有效委托。

### 生命周期

1. `host.New(cfg)`
2. `h.Node().BootstrapAddrs(ctx, []net.Addr{…})`——种子为 `ip:port`
3. 可选 `ObserveFromPeers`
4. `PublishEndpoint` / `Resolve` / `ConnectFromRecord` / `Accept`
5. `h.Close()`

### 方法

| 方法 | 作用 |
| --- | --- |
| `PublishEndpoint` / `PublishEndpointForAgent` | 签名单一多候选 `quic://` 载荷（v4/v6，启用了 UPnP 时含映射结果）并 STORE。 |
| `Resolve` | 迭代查询 → `*protocol.EndpointRecord`。 |
| `Connect` | 向单个 UDP 地址建立 QUIC 连接并发送 agent-route 帧。 |
| `ConnectFromRecord` / `ConnectFromRecordFor` | 对记录端点做 Happy Eyeballs；直连失败且有信令地址时走 ICE。返回 `(conn, isRelayed, err)`；配置了中继却被禁用且直连失败时返回 `ErrRelayRequired`。 |
| `Accept` | 接收入站 QUIC → `*AgentConn`。 |
| `QUICDialTargets` / `FirstQUICAddr` | 由记录得到有序 UDP 目标。 |
| `BuildEndpointPayload` | 只生成候选，不 STORE。 |
| `SymmetricNATReachabilityHint` | 探测到对称 NAT 时非空（仍可能需要中继）。 |
| `RegisterAgent` / `RegisterDelegatedAgent` / `UnregisterAgent` / `RegisteredAgents` | 同一监听器上挂载更多 AID。 |
| `SendMailbox` / `PollMailbox`（含 `ForAgent`） | 加密便条。 |
| `RegisterTopic(s)` / `SearchTopic(s)`（含 `ForAgent`） | 能力名会合。 |
| `StartDebugHTTP` / `DebugHTTPHandler` | 只读 JSON。 |
| `Close` | 关闭 QUIC、mux、DHT 与 UPnP 映射。 |

`AgentConn` 内嵌 `quic.Connection`，提供 `Local` / `Remote` 两个 AID。

### agent-route

TLS 之后，客户端在 stream 0 上写入 **4 字节 magic + 21 字节目标 AID**。

- **`a2r2`**（当前）：长度前缀控制消息，随后双方 FIN 该 stream；数据走后续 stream。`host` 实现这一版本。
- **`a2r1`**：入站仍接受（只解析帧）。

多个 agent 共享监听器时，TLS SNI 作为次级提示。

## `dht.Node`

| 字段 | 含义 |
| --- | --- |
| `Transport` | 必需。 |
| `Keystore` | 必需。一个身份。 |
| `OnObservedAddr` | 反射地址回调。 |
| `RecordAuth` | 在 `VerifySignedRecord` 之后执行；为空表示不做权限检查。 |

`BootstrapAddrs` 只接受 `ip:port`。`PublishMailboxRecord` / `PublishTopicRecord` 分别把记录 STORE 到收件人或主题的 NodeID。

## 身份

| 包 | 内容 |
| --- | --- |
| `github.com/a2al/a2al` | `Address`、`NodeID`、`ParseAddress`、`NodeIDFromAddress` |
| `…/crypto` | `KeyStore`、`EncryptedKeyStore`、`AddressFromPublicKey`、`GenerateEd25519` |
| `…/identity` | `SignDelegation`、`VerifyDelegation`、Ethereum / Paralism 辅助 |

## `protocol`

| 项 | 作用 |
| --- | --- |
| `SignedRecord` | 线格式 CBOR，可选 `Delegation`。 |
| `EndpointPayload` | `Endpoints`（`quic://host:port` 或 `quic://[v6]:port`）、`NatType`、`Signal`、`Signals`。`Turns` 只从旧记录解码，**新发布不写**。 |
| `SignEndpointRecord` / `SignEndpointRecordDelegated` | 主密钥签名 vs 操作用户密钥签名。 |
| `ParseEndpointRecord` / `VerifySignedRecord` | 校验签名、TTL 与权限。 |
| 邮箱 | `RecTypeMailbox` `0x80`；X25519 + AES-GCM 辅助。 |
| 主题 | `RecTypeTopic` `0x10`；键为 `SHA-256("topic:" ‖ name)`；`DiscoverFilter`。 |

`timestamp` + `TTL` 必须覆盖当前时间。

## `config`（daemon TOML）

`Default()`、`Validate()`、`LoadFile` / `Save`、`ApplyEnv`。示例见仓库 `doc/a2ald-config.example.toml`，字段说明见[配置](/zh/docs/ops/config)。

## 调试 HTTP

库方式的 `Host` / `Node` 建议绑定 `dht.DebugHTTPAddr`（`127.0.0.1:2634`）；daemon 在管理地址的 `/debug/` 下暴露同一组接口。

| 路径 | 来源 |
| --- | --- |
| `/debug/identity`、`/debug/routing`、`/debug/store`、`/debug/stats` | `dht.Node` |
| `/debug/host` | `Host`：QUIC 绑定、已注册 agent、NAT 摘要 |

## `natsense`

`Sense()`：`TrustedUDP` / `TrustedUDPAll`（v4 与 v6）、`InferNATType`、`InferV6Reach`。小型测试网可调低 `MinAgreeing`。

## 测试

```bash
go test -vet=off -count=1 ./...
```

`examples/` 使用各自的 `go.mod` 与 `replace`。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 上手指南与示例 | [Go SDK](/zh/docs/integration/go-sdk) |
| 协议与线格式 | [协议规范](/zh/docs/spec/protocol) |
