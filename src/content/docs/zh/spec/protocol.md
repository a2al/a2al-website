---
title: 协议规范
description: 面向第三方实现者——AID 格式、DHT 记录结构、CBOR 线格式与连接建立流程。
audience: developer
---

本文面向第三方协议实现者与需要理解线格式、数据结构与网络行为的开发者。应用开发者请先看[开始使用](/zh/docs/user/getting-started)，或从[架构概览](/zh/docs/integration/overview)、[Go 包](/zh/docs/reference/go-packages)入手。

## 地址格式（AID）

A2AL 的 `Address` 是固定的 **21 字节**：

```
[ 版本字节 (1 字节) ][ 哈希 (20 字节) ]
```

版本字节编码密钥算法与哈希派生方法。

### 当前分配

| 版本字节 | 名称 | 密钥算法 | 20 字节派生 | 用途 |
| --- | --- | --- | --- | --- |
| `0xA0` | Ed25519 | Ed25519 | `SHA-256(pubkey)[0:20]` | A2AL 原生身份 |
| `0xA1` | P256 | P-256 (NIST) | `SHA-256(pubkey)[0:20]` | A2AL 原生 P-256 身份 |
| `0xA2` | Paralism | secp256k1 | `RIPEMD160(SHA-256(pubkey))` | Paralism、Bitcoin P2PKH、Cosmos SDK |
| `0xA3` | Ethereum | secp256k1 | `Keccak-256(pubkey)[12:32]` | Ethereum 与 EVM 兼容链 |

### 版本字节空间

| 区间 | 状态 | 政策 |
| --- | --- | --- |
| `0xA0`–`0xA7` | 正式 | 需专家评审 |
| `0xA8`–`0xAD` | 保留 | 冻结；仅供未来标准流程 |
| `0xAE` | 实验 | 无需登记；不保证唯一 |
| `0xAF` | 私有 | 无需登记；不保证唯一 |

完整的分配表与申请流程见[地址版本注册表](/zh/docs/reference/address-version-registry)。

### 展示编码

- `0xA0`（Ed25519）与 `0xA1`（P256）：**42 位十六进制字符串**，大小写是按 SHA-256 计算的校验位；
- `0xA2`（Paralism）与 `0xA3`（Ethereum）：`0x` 前缀十六进制。

解析按格式自动识别；写入代码时请直接使用 daemon 返回的字符串，不要自行改写大小写。

### DHT NodeID

DHT 路由键由 `Address` 确定性派生：

```
NodeID = SHA-256(版本字节 ‖ 20 字节哈希)   = 32 字节
```

`NodeID` 只用于 DHT 内部的 XOR 距离路由，不暴露在应用层。这一分离让路由方案可以独立于身份方案演进。

## 线格式数据结构（CBOR）

所有记录以 CBOR 编码，并包在 `SignedRecord` 容器中。

### `SignedRecord`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `RecType` | `uint8` | `0x01` 端点、`0x10` 主题、`0x80` 邮箱、`0x02`–`0x0f` 自定义 |
| `Address` | 21 字节 | 发布者 AID |
| `Pubkey` | bytes | 签名公钥（可能是操作用户密钥） |
| `Payload` | bytes | CBOR 编码的类型载荷 |
| `Seq` | `uint64` | 单调序号 |
| `Timestamp` | `uint64` | Unix 秒 |
| `TTL` | `uint32` | 有效期（秒） |
| `Signature` | bytes | 对规范字段的 Ed25519 或 secp256k1 签名 |
| `Delegation` | bytes | 可选 CBOR `DelegationProof`（操作用户密钥代表主密钥派生的 AID 签名时携带） |

记录在写入与读取时都会校验：签名完整性、`timestamp + TTL` 覆盖当前时间，以及**签名权限**——签名密钥要么直接派生该 `Address`，要么携带主密钥签发的有效委托。

### `EndpointPayload`（RecType `0x01`）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `Endpoints` | `[]string` | 端点 URL，如 `quic://1.2.3.4:4122`、`quic://[2001:db8::1]:4122` |
| `NatType` | `uint8` | `0` 未知、`1` 全锥形、`2` 受限、`3` 端口受限、`4` 对称 |
| `Signal` | `string` | 可选的 ICE trickle 信令基址（兼容旧对端） |
| `Signals` | `[]string` | 多信令地址；非空时优先于 `Signal` |
| `Turns` | `[]string` | 仅从旧记录解码；**新节点不再写入** `turn://` 提示，中继凭据只留在本机 |

每个记录会发布多个端点候选。连接方对全部候选并发拨号（Happy Eyeballs），以最先成功的一条为准。

### `TopicPayload`（RecType `0x10`）

存储在 `SHA-256("topic:" + 能力名)` 处，而不是 agent 自己的 `NodeID`；同一能力名的多个发布者由 DHT 聚合。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `Name` | `string` | 可读的 agent 名称 |
| `Protocols` | `[]string` | 支持的协议，如 `"mcp"`、`"http"`、`"a2a"` |
| `Tags` | `[]string` | 用于过滤的标签 |
| `Brief` | `string` | 简短描述（≤ 140 字符） |
| `Meta` | map | 可选扩展元数据 |

整条 `TopicPayload` 的 CBOR 编码上限为 **512 字节**。

### `DelegationProof`

把操作用户密钥绑定到主 AID 的授权声明：

| 字段 | 说明 |
| --- | --- |
| `MasterAID` | 被委托的永久 AID |
| `OperationalPubkey` | 获授权代表 `MasterAID` 发布的公钥 |
| `Scope` | 权限范围（当前为网络操作） |
| `IssuedAt` / `ExpiresAt` | 有效期（Unix 秒） |
| `Signature` | 主密钥对上述规范字段的签名 |

主密钥只在生成 `DelegationProof` 时需要；之后 `a2ald` 只持有操作用户密钥与 CBOR 编码的证明。轮换凭据即重新签发一份证明，**AID 不变**。

### 邮箱（RecType `0x80`）

存储在 `NodeID(recipient)`。外层 `SignedRecord.Address` 标识发送者；载荷使用 X25519 + HKDF + AES-256-GCM 加密——只有持有收件人私钥的一方能解密。

## DHT 操作

A2AL 使用 Kademlia 风格的 DHT，迭代执行 `FIND_NODE`、`FIND_VALUE`、`STORE`。

记录存储执行 `RecordAuth`：写入的记录必须对自身 `Address` 自签，或携带由派生该 `Address` 的主密钥签发的有效 `DelegationProof`。

引导节点是首次启动时加入网络用的公开节点。一旦加入，`a2ald` 会建立自己的路由表，不再依赖引导节点。

## 连接建立

### 直连（主路径）

`ConnectFromRecord` 对目标端点记录中的全部 `Endpoints` 并发拨号，首个 QUIC 握手成功者胜出。双方以各自 Ed25519 密钥派生的证书完成**双向 TLS**——身份验证发生在握手内部，不依赖 CA、域名或证书分发。通配监听默认双栈，有 IPv6 候选时优先。

### ICE（回退路径）

直连全部失败、且记录带有信令地址时，双方以由两个 AID 确定性派生的 room ID 连上信令服务，通过 WebSocket trickle 交换 ICE 候选，建立点对点 UDP 路径后在其上跑 QUIC。可选的外部 TURN 在此阶段提供中继候选；**A2AL 不设中继**，凭据留在本机、不发布到 DHT。

### agent-route 帧

TLS 握手之后，客户端发送 **`a2r2` + 21 字节目标 AID**（4 字节 magic + 21 字节地址），随后进行一次短控制交换，数据走后续 stream。这让共享同一个 QUIC 监听器的多个 AID 可以各自寻址；入站仍接受旧版 `a2r1`（仅 25 字节帧）。

## 应用层边界

协议只负责寻址与连接。以下属于 daemon（`a2ald`）而非协议：便条、对话、房间、文件对象，以及**访问控制**——ACL 只作用于某个 AID 的入站 HTTP 与对象下载，不作用于 DHT、便条与对话信封。

## 地址版本申请

申请 `0xA4`–`0xA7` 中的未分配版本字节，按 **Address Version Request** 模板开 GitHub Issue，需包含名称、密钥算法、20 字节派生、签名验证方式、理由与代表实现。评审标准与完整流程见[地址版本注册表](/zh/docs/reference/address-version-registry)。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 版本字节的分配与申请 | [地址版本注册表](/zh/docs/reference/address-version-registry) |
| 分层与实现结构 | [架构概览](/zh/docs/integration/overview) |
| 参与实现与文档 | [贡献指南](/zh/docs/spec/contributing) |
