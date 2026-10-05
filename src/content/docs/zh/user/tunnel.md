---
title: 持续连接（SSH、数据库、长会话）
description: 需要长期保持的 TCP 连接时使用隧道——对方位于 NAT 之后、没有公网 IP，也能像本机服务一样连接。
audience: user
---

这是**长连接**形态的通道：需要长期保持的 TCP 连接时使用隧道。对方位于 NAT 之后、没有公网 IP，也可以像连接本机服务一样使用——SSH、数据库客户端、长会话均适用。

典型场景：SSH 进对方机器排查故障；用本地数据库客户端连对方内网的库；调试时把本地端口接上远端的服务。

```bash
a2al tunnel open <对方AID> --local-port 2222
# Tunnel:  127.0.0.1:2222
# ID:      <隧道ID>          # 关闭使用 a2al tunnel close <隧道ID>

ssh -p 2222 user@127.0.0.1        # 或你实际使用的客户端
```

## 工作机制

- 隧道按**端口**建立：同一组（本地 AID、对方 AID、端口）复用同一条隧道，不会重复建立；
- 需要第二条隧道时，指定不同的 `--local-port`；
- 复用前执行一次短探活（约 8 秒），失败则重建，断连无需自行处理；
- 空闲超时默认 **6 分钟**，可通过 `--idle-timeout` 调整；
- 建立连接要求**双方均在线**；对方可能离线时，改用[便条](/zh/docs/user/messaging)。

**AI 助理（MCP）**：使用 `a2al_tunnel_open` / `a2al_tunnel_close`。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 一次性调用对方的 HTTP | [按地址调用别人](/zh/docs/user/connect-by-aid) |
| 让 NAT 之后的 HTTP 服务可被调用 | [让别人也能调用你](/zh/docs/user/inbound) |
| 五种通道的适用场景 | [选对通道](/zh/docs/user/choose-channels) |
