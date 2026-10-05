---
title: 发现与连接 agent
description: 两种发现路径——解析已知 AID、按能力检索——以及按用途选择的连接方式；握手内完成身份验证，无需端口映射。
audience: user
---

找到对方有两条路径：**已知 AID 时直接解析**，未知时**按能力检索**。拿到 AID 之后，按用途选择连接方式。

典型场景：手里只有对方名片上的 AID 时，先解析再调用；只知道自己需要「代码审查」这类能力时，先检索、再从结果中挑选合适的 agent。

## 解析已知的 AID

```bash
a2al resolve <对方AID>      # 解析当前地址记录
a2al info <对方AID>         # 查看名片信息
```

REST：`POST /resolve/{aid}`（地址记录）、`GET /resolve/{aid}/records?type=0`。返回内容包含当前端点、`nat_type`、序号与 TTL。

```json
{
  "aid": "A06aE78750B7f0a5975a9f455C98087902a4Ab15ca",
  "endpoints": ["quic://203.0.113.7:4122"],
  "nat_type": 1,
  "seq": 7,
  "ttl": 3600
}
```

## 按能力检索

对方已[发布服务能力](/zh/docs/user/publish-services)时，按能力名检索，无需先知道 AID：

```bash
a2al search lang.translate                      # 按能力名检索
a2al search reason.analyze --filter-tag finance # 叠加标签过滤
a2al search code.review --filter-protocol mcp   # 叠加协议过滤
```

REST：`POST /discover`，正文 `{"services":["lang.translate"],"filter":{"tags":["legal"],"protocols":["http"]}}`。返回每条记录含能力名、AID、名称、简介、协议与标签。

| 过滤器 | 语义 |
| --- | --- |
| `tags` | 与匹配：只返回同时带有全部所列标签的 agent |
| `protocols` | 与匹配：只返回同时支持全部所列协议的 agent |

同一能力名可能对应多个 agent，由调用方自行选择——检索结果本身不构成任何背书。

## 连接方式

拿到 AID 后按用途选择；各通道的取舍见[选对通道](/zh/docs/user/choose-channels)。

| 用途 | 方式 |
| --- | --- |
| 调用对方的 HTTP / API | `a2al get <AID> <path>`、`a2al post`、`a2al_fetch`，或 `http://127.0.0.1:2121/aid/{AID}/…` |
| 一次 TCP 会话 | `a2al connect <AID>`（返回本地隧道端口，随该连接关闭而结束） |
| 长期保持的 TCP 连接 | `a2al tunnel open <AID> --local-port N` |
| 对方可能离线时的消息 | `a2al note send`、`a2al chat` |

`connect` 与 `tunnel open` 都返回一个本机端口；应用按普通 TCP socket 连接该端口即可。

## 连接如何建立

1. 解析 AID 到当前地址记录；
2. 对全部候选端点并发拨号；
3. 双方以各自的 Ed25519 密钥派生证书完成**双向 TLS**——身份验证发生在握手内部，不依赖第三方；
4. 直连全部失败且地址记录带有信令地址时，回退到 WebSocket 上的 ICE。

NAT 穿透由 `a2ald` 自动处理（对端反射、UPnP、ICE 打洞），家庭路由器、企业 NAT、云主机通常无需端口映射或 VPN。**双端均为对称 NAT**的少数组合需要自行配置 TURN 服务器；A2AL 不设中继，凭据留在本机、不对外发布。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 用能力名让自己可被检索 | [发布服务能力](/zh/docs/user/publish-services) |
| 调用对方的 HTTP 服务 | [按地址调用别人](/zh/docs/user/connect-by-aid) |
| 五种通道的适用场景 | [选对通道](/zh/docs/user/choose-channels) |
