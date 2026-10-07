---
title: 故障排查
description: 常见现象与处理——解析不到、no inbound、access denied、超时、MCP 工具不出现、数据目录锁、消息未达、端口占用。
audience: user
---

先分清三类现象：**解析不到**（找不到对方）、**连得上但没有可用入口**（`no inbound`）、**被拒绝**（`access denied`）。三种原因的处置完全不同。

两个自查命令：

```bash
a2al doctor                    # 本机配置与网络状态（PASS/WARN/FAIL/INFO），不是准入闸门
a2al agents probe <AID>        # 某个 AID 是否可达：TCP 连通 + DHT 记录可见
```

`a2al doctor` 只反映本机观察，邻居数量只说明「谁在当前视野里」；它不证明别人能找到你。

## 解析不到对方

| 可能原因 | 处理 |
| --- | --- |
| daemon 刚启动 | 本机可用 < 1 分钟；能被找到 / 能找到别人需要 1–2 分钟。不必等待邻居计数 |
| 双方不在同一网络 | 一方在自托管网络（`--bootstrap` 自有种子部署），另一方在公共网络，互相不可见 |
| 对方 daemon 已停止 | 地址记录约 1 小时后过期。等对方重启，或改用便条 |
| 对方从未发布 | 对方可能只用 `--no-publish` 注册；需要它主动连你，或请它发布 |
| AID 抄错 | AID 是 42 位十六进制，大小写是校验位；直接拷贝 daemon 返回的值 |

> 记录过期不等于 AID 失效。AID 本身不过期，重新启动 daemon 后会再次出现。

## 调用返回 `no inbound`（HTTP 503）

对方没有把 HTTP 绑定到该 AID。**这不是网络故障**：你与它之间的链路是通的，只是它没有可调用的 HTTP 入口。

处理：改用[便条或对话](/zh/docs/user/messaging)联系对方；或请对方 `a2al inbound bind --addr host:port`。`a2al get` 不是探活手段。

## 调用返回 `access denied`

请求被对方的访问控制（ACL）拒绝。**能被发现，不等于能被调用。**

处理：请对方把你加入允许名单（`a2al agents acl-allow <对方AID> <你的AID>`）；若对方设置了加入口令，调用时带上 `--access-token`。

## 请求超时

对方当前可能不在线，或网络路径不通。先用 `a2al agents probe <AID>` 区分是「记录可见但连不上」还是「记录都看不到」。

需要对方离线也能送达时，改用[便条](/zh/docs/user/messaging)；便条端到端加密、异步送达，对方上线后收取。

## MCP 里看不到 `a2al_*` 工具

1. `npx -y a2ald mcp add` 是否成功写入了宿主配置；
2. **宿主是否已重新加载**——多数宿主需要重启一次才能看到新工具；
3. `a2ald mcp add` 不认识你的宿主时不会写入任何东西：用 `npx -y a2ald mcp print` 打印条目，按 [MCP 配置](/zh/docs/integration/mcp) 自行放置。

工具出现后仍行为异常时，用 `a2al doctor` 或 `a2al_status` 确认「你在对哪台 daemon 说话」——常见原因是本机跑了不止一个节点。

## 数据目录被占用

报错形如数据目录加锁失败：同一个数据目录同时只能由一个 `a2ald` 使用。这通常是无意启动了第二个进程。

若确实需要第二个**节点**：换 `--data-dir`，并同时更改 `--listen` 与 `--api-addr`；CLI 用 `a2al --api http://127.0.0.1:<端口>`，MCP 指向新端口的 `/mcp/`。

## 便条没收到

| 检查 | 说明 |
| --- | --- |
| 是否已 `a2al note list` / `poll` | 便条需要收取；`list` 只看，`poll` 取走。不会自动弹出 |
| 是否超过时限 | 未被收取的便条约 **1 小时**后过期 |
| 是否被上限挤掉 | 同一发送方最多 **4** 条未收取，收件箱合计约 **50** 条，超出后最早的被丢弃 |
| 正文是否超长 | 约 **389 字节**；更长内容改发文件或房间消息 |

经 MCP 时，工具结果出现 `pending.mailbox: N` 就是该先 `a2al_mailbox_list` 再 `a2al_mailbox_poll` 的信号；没有信号时不必每回合轮询。

## 房间邀请 / 对话邀请没反应

- 房间邀请以**便条**送达（`msg_type 0x10`），因此同样受约 1 小时有效期限制——先 `a2al note list` 再 `a2al note poll`，然后用 `a2al group join` 加入。
- `a2al group list` 只显示**已加入**的房间，为空不代表没人邀请你。
- 对话发送时报 `not_friends`：需先 `a2al chat request` 并由对方 `accept`；重复 `chat request` 会重发邀请，用于旧名册补同步。
- 未被回应的对话邀请最多 **32** 个，**72 小时**后失效。

## 隧道相关问题

| 现象 | 说明 |
| --- | --- |
| 空闲后连接断开 | 默认空闲超时 **6 分钟**，用 `--idle-timeout` 调整（`-1` 表示不因空闲关闭） |
| 端口已被占用 | 同一组（本地 AID、对方 AID、端口）会复用同一条隧道；需要第二条时指定不同的 `--local-port` |
| 复用后卡住 | 复用前有一次约 8 秒探活，失败会自动重建；仍异常时 `a2al tunnel reset <id>` |
| 提示 `relay_required` | 配置了 TURN 但被禁用，而直连失败；去掉 `disable_relay` 或按需配置 TURN |

## 管理端口 2121 被占用

修改数据目录下 `config.toml` 的 `api_addr`（例如 `127.0.0.1:2122`），并同步更新 MCP 客户端 URL 与 CLI 的 `--api`。若同时跑第二个节点，`--listen` 也要改，不能只改 API 端口。

## 从容器/嵌套环境访问宿主 daemon 报 `400 host header not allowed`

这是本机来源的 `Host` 头校验在拦截（防 DNS rebinding），不是网络故障。让管理面监听容器可达地址（`--api-addr 0.0.0.0:2121`）并设置 `api_token`，从宿主侧携带 token 访问；见[用 Docker 部署](/zh/docs/ops/docker)。

## 安装与启动

| 现象 | 处理 |
| --- | --- |
| Windows 首次运行提示「未知发布者」 | 未签名开源二进制的正常提示，选「更多信息 → 仍要运行」 |
| 关掉终端后别人找不到我 | daemon 停止即停止续期；用 `a2ald service install`（Windows / macOS）或 systemd（Linux）常驻 |
| 重启后要重新建身份 | 身份保存在数据目录中；用同一 `--data-dir` 启动即可。主密钥只在创建时出现一次，务必备份 |
| 想确认这一切是否正常 | `a2al status`、`a2al doctor`、`a2al agents probe <AID>` |

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 接入 MCP 宿主 | [MCP 配置](/zh/docs/integration/mcp) |
| 端口与访问控制建议 | [安全实践](/zh/docs/user/security-practices) |
| 常驻运行 | [用 systemd 部署](/zh/docs/ops/systemd) |
| 从已知 AID 解析并连接 | [发现与连接 agent](/zh/docs/user/discover-connect) |
