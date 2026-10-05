---
title: Go SDK
description: 在 Go 程序里直接嵌入 A2AL——host 与 dht 两个层级、配置项、生命周期、agent-route 帧与调试接口。
audience: developer
---

```go
import "github.com/a2al/a2al"
```

多数 Go 程序的入口是 `github.com/a2al/a2al/host`；需要更细控制时，`dht`、`protocol`、`identity`、`crypto` 都可用。**只做发布／解析／连接的程序依赖 `host`，不要 import `daemon`。**

## 集成层次

| 层次 | 包 | 何时使用 |
| --- | --- | --- |
| 节点运行时 | `github.com/a2al/a2al/host` | DHT + QUIC（单端口或分端口）、双向 TLS、发布／解析／连接助手。多数应用推荐。 |
| 仅 DHT | `github.com/a2al/a2al/dht` | 自带传输栈，只需要路由、引导与迭代 `FIND_VALUE` / `STORE`。 |
| 守护进程 | `a2ald` | 非 Go 集成；本地 REST + MCP + 面板。 |

## `host.Host`

`Host` 把下层组合成单一运行时：DHT 节点、QUIC 传输、NAT 探测与 UPnP 映射。

### `host.Config`

| 字段 | 含义 |
| --- | --- |
| `KeyStore` | 必需。必须恰好包含一个 `Address`。 |
| `ListenAddr` | DHT 的 UDP 绑定（默认 `":4121"`）。通配地址为双栈；写定 IPv4 / IPv6 主机时按该协议族绑定。 |
| `QUICListenAddr` | 留空时 QUIC 与 DHT 共用同一 UDP socket；非空时单独绑定。 |
| `PrivateKey` | 用于 QUIC / TLS 的 Ed25519 私钥；为空时取 `EncryptedKeyStore.Ed25519PrivateKey`。 |
| `MinObservedPeers` | 反射地址需要多少个对端一致（默认 3）。 |
| `FallbackHost` | 绑定地址与反射都不明确时对外公布的地址。 |
| `DisableUPnP` | 跳过 QUIC 端口的 IGD 映射（IPv4）。 |
| `DisableIPv6` | 强制 IPv4-only（库选项，不是 daemon 的 TOML 键）。 |
| `ICESignalURL` / `ICESignalURLs` | ICE WebSocket hub；`ICESignalURLs` 非空时以它为准，首个地址同时写入 `EndpointPayload.Signal`。 |
| `ICESTUNURLs` | `stun:` 地址；未配置 TURN 时留空即使用公共 STUN。 |
| `ICETURNURLs` | 旧式带内嵌凭据的 `turn:`；新代码优先用 `TURNServers`。 |
| `TURNServers` | 外部 TURN：`URL`、`Username`、`Credential`、`CredentialType`（`static` / `hmac` / `rest_api`）。凭据按 ICE 会话生成，从不发布到 DHT。 |
| `DisableRelay` | 为真时默认不使用 TURN 中继；也可按调用用 `DialOptions.DisableRelay`。默认 false（配置了 TURN 即允许中继）。 |
| `ICENetworkTypes` | ICE 使用的网络类型，默认 UDP4 + UDP6。 |
| `Logger` | `*slog.Logger`，默认 `slog.Default()`。 |

内部 DHT 节点的 `RecordAuth` 要求自签或有效委托。

### 生命周期

```go
// 1. 创建并启动
h, err := host.New(cfg)

// 2. 引导进网络（种子为 ip:port）
h.Node().BootstrapAddrs(ctx, bootstrapAddrs)

// 3. 使用
h.PublishEndpoint(ctx, seq, ttl)
record, err := h.Resolve(ctx, remoteAddr)
conn, err := h.ConnectFromRecord(ctx, remoteAddr, record)

// 4. 接收入站连接
agentConn, err := h.Accept(ctx)

// 5. 关闭
h.Close()
```

### 主要方法

| 方法 | 作用 |
| --- | --- |
| `PublishEndpoint` / `PublishEndpointForAgent` | 组装多候选端点载荷（反射、UPnP、fallback），签名后存入 DHT。 |
| `Resolve` | 迭代查询，返回 `*protocol.EndpointRecord`。 |
| `Connect` | 向单个 UDP 地址建立 QUIC 连接并发送 agent-route 帧。 |
| `ConnectFromRecord` / `ConnectFromRecordFor` | 对记录中的全部端点做 Happy Eyeballs；直连失败且有信令地址时回退 ICE。返回 `(conn, isRelayed, err)`；配置了中继但被禁用且直连失败时返回 `ErrRelayRequired`。 |
| `Accept` | 接收入站 QUIC，返回 `*AgentConn`。 |
| `QUICDialTargets` / `FirstQUICAddr` | 由记录得到有序的 UDP 目标。 |
| `BuildEndpointPayload` | 只生成候选，不写入 DHT。 |
| `SymmetricNATReachabilityHint` | 探测到对称 NAT 时非空（可能仍需要中继）。 |
| `RegisterAgent` / `RegisterDelegatedAgent` / `UnregisterAgent` / `RegisteredAgents` | 在同一个监听器上挂载更多 AID。 |
| `SendMailbox` / `PollMailbox`（含 `…ForAgent`） | 加密便条。 |
| `RegisterTopic(s)` / `SearchTopic(s)`（含 `…ForAgent`） | 能力名会合。 |
| `StartDebugHTTP` / `DebugHTTPHandler` | 只读 JSON。 |

`AgentConn` 内嵌 `quic.Connection`，并给出 `Local` / `Remote` 两个 AID。

### agent-route 帧

TLS 之后，客户端在 stream 0 上写入 **4 字节 magic + 21 字节目标 AID**：

- **`a2r2`**（当前版本）：长度前缀的控制消息，随后双方 FIN 掉该 stream；数据走后续 stream。`host` 实现这一版本。
- **`a2r1`**：入站仍接受（只解析帧本身）。

当多个 agent 共享同一监听器时，TLS SNI 作为次级提示。

## `dht.Node`

| 字段 | 含义 |
| --- | --- |
| `Transport` | 必需。 |
| `Keystore` | 必需。一个身份。 |
| `OnObservedAddr` | 反射地址回调。 |
| `RecordAuth` | 在 `VerifySignedRecord` 之后执行；为空表示不做权限检查。 |

`BootstrapAddrs` 只接受 `ip:port`。`PublishMailboxRecord` / `PublishTopicRecord` 分别把记录写到收件人或主题的 NodeID。

## 身份与签名

| 包 | 内容 |
| --- | --- |
| `github.com/a2al/a2al` | `Address`、`NodeID`、`ParseAddress`、`NodeIDFromAddress` |
| `…/crypto` | `KeyStore`、`EncryptedKeyStore`、`AddressFromPublicKey`、`GenerateEd25519` |
| `…/identity` | `SignDelegation`、`VerifyDelegation`、Ethereum / Paralism 辅助 |

## `protocol`

| 项 | 作用 |
| --- | --- |
| `SignedRecord` | 线格式 CBOR，可选携带 `Delegation`。 |
| `EndpointPayload` | `Endpoints`（`quic://host:port` 或 `quic://[v6]:port`）、`NatType`、`Signal`、`Signals`。`Turns` 仅从旧记录解码，**新发布不再写入**。 |
| `SignEndpointRecord` / `SignEndpointRecordDelegated` | 主密钥签名 vs 操作用户密钥签名。 |
| `ParseEndpointRecord` / `VerifySignedRecord` | 校验签名、TTL 与权限（`RecordAuth`）。 |
| 邮箱 | `RecTypeMailbox` `0x80`；X25519 + AES-GCM 辅助。 |
| 主题 | `RecTypeTopic` `0x10`；键为 `SHA-256("topic:" ‖ name)`；`DiscoverFilter`。 |

`timestamp` 与 `TTL` 必须覆盖当前时间。

## `config` 与调试接口

`config` 包提供 daemon 的 TOML 处理：`Default()`、`Validate()`、`LoadFile` / `Save`、`ApplyEnv`。示例见仓库 `doc/a2ald-config.example.toml`。

调试 HTTP 建议绑定 `dht.DebugHTTPAddr`（`127.0.0.1:2634`）；daemon 在管理地址的 `/debug/` 下暴露同一组接口。

| 路径 | 来源 |
| --- | --- |
| `/debug/identity`、`/debug/routing`、`/debug/store`、`/debug/stats` | `dht.Node` |
| `/debug/host` | `Host`：QUIC 绑定、已注册 agent、NAT 摘要 |

## 测试

```bash
go test -vet=off -count=1 ./...
```

`examples/` 使用各自的 `go.mod` 与 `replace` 指向模块根。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 全部导出符号 | [Go 包](/zh/docs/reference/go-packages) |
| 架构与模块划分 | [架构概览](/zh/docs/integration/overview) |
| 协议与线格式 | [协议规范](/zh/docs/spec/protocol) |
