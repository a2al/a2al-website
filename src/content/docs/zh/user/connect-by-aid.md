---
title: 按地址调用别人
description: 持有对方的 AID，即可像调用本机服务一样调用对方——点对点加密直达，数据不经手第三方。
audience: user
---

这是**请求-响应**形态的通道：持有对方的 **AID**，即可像调用本机服务一样调用对方。请求点对点加密直达，数据不经手第三方；对方位于 NAT 之后、没有公网 IP 或域名，都不影响。

典型场景：调用对方机器上的模型或内部 API；读取对方服务的接口清单（`/.well-known/agent.json`）；把对方的 HTTP 服务当作一个数据源接进自己的流程。

## 前提条件

- 持有对方的 **AID**，通过消息、粘贴板或任意既有渠道获取均可；
- 对方已将 HTTP 服务**绑定**到该 AID。

未绑定 HTTP 也可以连通，只是没有可调用的接口。此时改用[便条或对话](/zh/docs/user/messaging)。

## 三种等价入口

| 使用方式 | 调用方法 |
| --- | --- |
| 命令行 | `a2al get <对方AID> /path`；POST 使用 `a2al post <对方AID> /path -d '{…}'` |
| 现有 HTTP 客户端 | 将 base URL 换为 `http://127.0.0.1:2121/aid/{对方AID}/…`，其余不变 |
| AI 助理（MCP） | 工具 `a2al_fetch` |

```bash
a2al get <对方AID> /.well-known/agent.json
```

## 预期结果

返回对方服务给出的 JSON 或文本，即本次请求的结果。调用方式与对方所在的机器、网络无关。

## 常见返回及其含义

| 返回 | 含义 |
| --- | --- |
| `no inbound` | 对方未将 HTTP 绑定到该 AID（HTTP 503）。网络本身正常，可改用便条或对话。 |
| `access denied` | 请求被对方的访问控制拒绝。**能被发现，不等于能被调用。** |
| 请求超时 | 对方当前可能不在线。调用不是探活手段；需要对方离线也能送达时，使用[便条](/zh/docs/user/messaging)。 |

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 把本机服务绑定到自己的 AID | [让别人也能调用你](/zh/docs/user/inbound) |
| 需要长期保持的 TCP 连接 | [持续连接](/zh/docs/user/tunnel) |
| 五种通道的适用场景 | [选对通道](/zh/docs/user/choose-channels) |
