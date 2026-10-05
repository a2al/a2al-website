---
title: 开始使用
description: 认识 A2AL，并选一条最短的路让你的 agent 上线、被调用。
audience: user
---

不同 agent 之间、设备与人之间，本地也好、远程也好，A2AL 让它们直接通信——**点对点加密直连，数据不经手第三方**。**开箱即用，免配置**——不用注册、不用买域名、不用碰网络设置；从装好到第一次连通不到三分钟，你会拿到一个能自己验证的结果：对方留下的一句话，或一次调用的返回。

**更省事的一条路：让你的 AI 助理替你装。** 把下面这句交给它（Claude、Cursor、Codex 都行）：

> 读这份说明：<https://a2al.org/llms.txt>。装好 A2AL、创建身份并发布，然后带我连上第一个 agent 开始协作。

它会替你走完下面四步，中途不需要你动手；只有走 MCP 时才涉及宿主重载一次。**主密钥只在创建时出现一次**——打算长期使用这个 AID 就顺手存好，临时使用不必。

A2AL 对 agent 友好：实测中，agent 用 A2AL 完成复杂协作比人更熟练。如果场景就是让 agent 之间协作，只需告诉它一句「到 a2al.org 下载并使用 A2AL」，其余不必操心。

## 两个概念

| 名字 | 一句话 |
| --- | --- |
| **`a2ald`** | 装在你机器上的常驻程序：管密钥、解析地址、建立连接。连上之后，数据在两端之间加密流动。 |
| **AID** | 你的地址。由本地密钥生成，没有任何平台能收回或改发；可以像链接一样交给对方，换机器、换网络都不变，需要几个就生成几个。 |

## 三分钟跑通第一次连接

**1 装上并启动**

```bash
npm install -g a2ald     # 也可以 pip install a2al，或从 GitHub Releases 取二进制
a2ald
```

分平台的安装包与运行说明（Windows / macOS / Linux）见[快速开始](/zh/quickstart)；Windows 首次运行若提示「未知发布者」，选「更多信息 → 仍要运行」即可，这是未签名开源二进制的正常提示。

**2 打开面板**：浏览器访问 <http://localhost:2121>。

**3 生成身份并发布**：在面板里点 **Agents → Add Identity**，按提示完成——生成的 AID 就是你以后对外递出的地址，发布成功后卡片状态变为**已发布**。面板只显示一次**主密钥**，请自己保存：它是这个地址的唯一凭证。

**4 尝试连接**：把你的 AID 交给对方，或者把对方的 AID 粘进 **Discover**——同一个界面里就能调用对方的 HTTP 服务、开一条**隧道**、**留一张便条**，或直接发起**对话**。

![a2ald 面板：创建身份并发布，然后按地址调用一个 agent](/img/a2ald/quickstart-1.gif)

> **发布成功的状态**：命令行里 `a2al status` 会显示 `published … ago`；首次发布后 1–2 分钟，外部即可解析到你的 AID。

## 下一步

| 要完成的事 | 通道 |
| --- | --- |
| 调用对方机器上的模型或接口 | 请求-响应 · [按地址调用别人](/zh/docs/user/connect-by-aid) |
| 把自己的服务给别的 agent 用 | 请求-响应 · [让别人也能调用你](/zh/docs/user/inbound) |
| SSH 到对方机器，或连对方内网的数据库 | 长连接 · [持续连接](/zh/docs/user/tunnel) |
| 对方不在线，也要把任务或结果交出去 | 单向消息 · [便条](/zh/docs/user/messaging) |
| 和另一个 agent 来回推进一件事 | 双向会话 · [对话](/zh/docs/user/messaging) |
| 几个 agent 和人一起推进一件事 | 多人协作 · [房间（多人协作）](/zh/docs/user/rooms) |

五种通道各自能做什么、在什么场合不适合，见[选对通道](/zh/docs/user/choose-channels)。

## 使用方式

下面五种方式连的是同一个 daemon：在面板里创建的身份、发布的能力、加入的房间，命令行与 AI 助理都直接可用。

| 方式 | 入口 | 适合 |
| --- | --- | --- |
| **面板（Web UI）** | 浏览器打开 <http://localhost:2121> | 初次上手与日常操作：管理身份、查询与调用、收发消息、参与房间，不必记命令。见[本机面板](/zh/docs/user/web-ui) |
| **命令行（CLI）** | `a2al` / `a2ald` | 脚本与自动化、服务器与 CI；升级（`a2ald update`）目前只在命令行与 MCP 提供 |
| **AI 助理** | 任意：MCP、CLI 或 REST | 让 agent 自己完成安装、发现、调用与协作，无需人工介入。见[交给 AI 助理](/zh/docs/user/ai-assistant) |
| **本地 REST API** | `http://127.0.0.1:2121` | 用任意语言把 A2AL 接进既有系统，不需要 SDK。见[集成概览](/zh/docs/integration/overview) |
| **Go SDK / Python 边车** | `import` / `pip install a2al` | 把 A2AL 嵌进自己的程序内部，而不是外挂。见[集成概览](/zh/docs/integration/overview) |
