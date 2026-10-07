---
title: 实战配方
description: 五条端到端的完整配方——让本机服务可被调用、跨 NAT 直达、把本地服务接进 AI 助理、搭建私有（自托管）网络、向离线机器交付任务。
audience: user
---

这里的每一条都从具体处境出发，到一次可验证的结果结束。参数与命令全集见 [REST API](/zh/docs/reference/rest-api) 与各主题页面。

## 一、让本机服务可被任意位置调用

**处境**：本机跑着模型服务、工作流、内部 API，希望另一个 agent、另一台机器或同事能调用它——不开放端口、不配域名。

```bash
a2al register                                     # 1. 创建身份（已有可跳过）
a2al inbound bind --addr 127.0.0.1:8080 --aid <你的AID>   # 2. 绑定服务实际监听的端口
a2al publish lang.translate --aid <你的AID>       # 3. 可选：发布能力名，便于他人检索
```

`--addr` 填服务实际监听的地址，**不要填 `2121`**（那是 daemon 的管理端口）。

**对方的调用**

```bash
a2al get <你的AID> /your/api/path     # 已知 AID
a2al search lang.translate            # 未知 AID，按能力名检索后再调用
```

**成功的标志**：对方 `a2al get <你的AID> /.well-known/agent.json` 返回你服务的 JSON；对方的 IP、网络与 NAT 配置不影响结果。

**保持可用**：绑定随身份保存在数据目录里，重启后自动恢复；发布记录在 daemon 停止后约 1 小时过期。需要长期可检索时让 daemon 常驻（Windows / macOS：`a2ald service install`；Linux：[用 systemd 部署](/zh/docs/ops/systemd)）。限制调用方见[安全实践](/zh/docs/user/security-practices)。

## 二、直达别人 NAT 之后的 agent

**处境**：同事的笔记本、远程工作站或家里的机器上跑着 agent。你只有它的 AID，希望不装 VPN、不要公网 IP、不依赖会失效的隧道地址。

**前提**：两台机器都运行 `a2ald`；对方已注册 AID 并发布（或已按配方一绑定服务）。

```bash
# 一次 HTTP 调用
a2al get <对方AID> /.well-known/agent.json

# 需要长期保持的 TCP 连接（SSH、数据库、gRPC）
a2al tunnel open <对方AID> --local-port 2222
# Tunnel:  127.0.0.1:2222
ssh -p 2222 user@127.0.0.1
```

**成功的标志**：调用完成。对方的机器可能完全没有可路由的公网地址，NAT 穿透由 `a2ald` 透明处理。

**对方不在线时**：先用便条把任务交出去，等它上线收取。

```bash
a2al note send <你的AID> <对方AID> "$(printf '%s' '执行任务 X' | base64 -w0)"
```

## 三、把本地服务接进 AI 助理

**处境**：你在用 Claude、Cursor 或其他 MCP 宿主，希望它能调用本机的模型、私有工具或公司内部 API，而服务不暴露到公网。

```bash
npx -y a2ald mcp add          # 1. 接入 MCP（宿主要重新加载后才能看到工具）
```

在宿主里或命令行完成第 2 步：

```bash
a2al register                              # 创建 AID
a2al inbound bind --addr 127.0.0.1:11434   # 以 Ollama 为例
```

也可以直接对助理说：「注册一个新身份，并把我本机 `127.0.0.1:11434` 的 Ollama 绑定上去」——它会调用 `a2al_agent_register` 与 `a2al_agent_patch`。

**第 3 步（跨机器）**：把 AID 交给对方；对端 `a2al resolve <AID>` 后 `a2al_fetch` 需要的路径。调用端到端加密，中间不经过任何服务器。

## 四、给自己的一组机器建私有（自托管）网络

**处境**：家里有几台机器、团队有若干服务器，或者是一个隔离的实验环境。希望它们彼此能找到、能连通，但流量不进出公共目录。

**第一台（种子节点）**：

```bash
a2ald --listen :4121 --data-dir /var/lib/a2al/node-a
```

记下它的地址，例如 `192.168.1.10`。

**其余机器**：

```bash
a2ald --bootstrap 192.168.1.10:4121 --data-dir /var/lib/a2al/node-b
```

`--bootstrap` 非空会完全跳过公共 DNS 与信标；请使用全新的 `--data-dir`，避免旧的 `peers.cache` 仍去连公共节点。

**同一台机器上跑两个节点**（测试用）：

```bash
a2ald --data-dir ./node-a --listen :4121 --fallback-host 127.0.0.1

a2ald --data-dir ./node-b --listen :4122 --api-addr 127.0.0.1:2122 \
      --fallback-host 127.0.0.1 --bootstrap 127.0.0.1:4121

a2al --api http://127.0.0.1:2122 resolve <node-a 上的AID>
```

身份、便条、房间与会话在自托管网络上行为完全一致——协议相同，目录是你自己的。细节见[私有（自托管）网络](/zh/docs/user/private-network)。

## 五、把任务交给一台离线的机器

**处境**：要把工作交给另一个 agent 或机器，但它现在不在线——还没开机，或者夜里要重启。

```bash
PAYLOAD=$(printf '%s' '{"job":"process_data","file":"s3://…"}' | base64 -w0)
a2al note send <你的AID> <对方AID> "$PAYLOAD"
```

对方回来时收取：

```bash
a2al note poll <对方AID>
```

**经由 MCP**：`a2al_mailbox_send` / `a2al_mailbox_list` / `a2al_mailbox_poll`。工具结果里出现 `pending.mailbox: N` 就是该先看（`list`）再取（`poll`）的信号——没有信号时不必每回合轮询。

**便条不是对话**：它是加密的异步投递，不是实时通道，也不是投递回执。需要来回沟通，等双方都在线后使用[对话](/zh/docs/user/messaging)；需要传文件，使用[房间](/zh/docs/user/rooms)。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 五种通道如何选择 | [选对通道](/zh/docs/user/choose-channels) |
| 常驻运行与端口 | [用 systemd 部署](/zh/docs/ops/systemd) |
| 全部命令与参数 | [REST API](/zh/docs/reference/rest-api) |
| 常见问题与报错含义 | [故障排查](/zh/docs/user/troubleshooting) |
