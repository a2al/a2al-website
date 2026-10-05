---
title: MCP 配置
description: 把 a2ald 接进 Claude Code、VS Code、Cursor 等 MCP 宿主——一条命令接入，两种运行模式，以及跨登录常驻的做法。
audience: developer
---

`a2ald` 本身就是一个 MCP 服务器：身份、发现、调用、隧道、便条、事件，以及一对一对话与房间（`chat_*` / `group_*`），都以工具形式暴露。宿主不需要任何适配代码。

## 最快路径

```bash
npx -y a2ald mcp add       # 或：a2ald mcp add
```

它会：没有 daemon 时启动一个；把 MCP 服务注册进它识别到的宿主。随后**重新加载宿主**，确认 `a2al_*` 工具出现，即可开始执行任务。`a2al doctor` 是可选项——只有在怀疑「你在对哪台 daemon 说话」时才需要。

如果 `mcp add` 不认识你的宿主，它不会写入任何东西，而是打印出条目供你自行放置：先跑 `a2ald mcp print`，再对照下面的片段。

## 两种运行模式

| 模式 | 客户端如何连接 | 适合 |
| --- | --- | --- |
| **持久 daemon**（默认） | `"url": "http://127.0.0.1:2121/mcp/"` | 协作、CLI、面板、多个宿主共用一个 daemon |
| **stdio** | `"command": "a2ald", "args": ["--mcp-stdio"]` | 只能拉起进程的宿主、CI；已有 daemon 时会代理过去 |

**stdio 的代价**（在没有任何 daemon 运行时）：新加入 DHT、**没有 REST API**（也就没有 CLI 与面板）、一个数据目录只能有一个进程、会话结束即停止发布。这些都可以接受时再用。

**stdio 智能代理**：`a2ald` 已在运行时，`a2ald --mcp-stdio` 会把 MCP 代理给它——无冷启动、无锁冲突。没有在运行时，这个进程就是节点：本机可用 < 1 分钟，能被找到 / 能找到别人 1–2 分钟。不必等待邻居计数。

> **数据目录锁**：一个数据目录同时只能由一个 `a2ald` 进程使用，误开第二个会报锁错误。需要第二个**节点**是另一回事：换 `--data-dir`、换 `--api-addr` 与 `--listen`，再让 CLI / MCP 指向新端口。

## 安装 a2ald

| 方式 | 命令 |
| --- | --- |
| npm（推荐，无需 Go） | `npm install -g a2ald` |
| npx（零安装） | 在 MCP 配置里直接用 `npx`，首次使用时下载 |
| 发行版二进制 | 从 [GitHub Releases](https://github.com/a2al/a2al/releases) 取 `a2al_<版本>_<平台>.tar.gz` / `.zip`，把 `a2ald` 放入 PATH |
| Python 边车 | `pip install a2al`（自带平台二进制） |

## 各宿主的配置

只有 `a2ald mcp add` 没覆盖到你的宿主时才需要手动放置。优先使用 HTTP；stdio 同样合法（已有 daemon 时它会代理）。

`mcp add` 已知的宿主：Claude Code、VS Code、Cursor、Claude Desktop、Windsurf、OpenClaw、Hermes、DeepSeek Harness。

| 宿主 | 做法 |
| --- | --- |
| **Claude Code** | `claude mcp add --scope user --transport http a2al http://127.0.0.1:2121/mcp/` |
| **VS Code** | `code --add-mcp "{\"name\":\"a2al\",\"type\":\"http\",\"url\":\"http://127.0.0.1:2121/mcp/\"}"` |
| **Cursor** | 编辑项目根 `.cursor/mcp.json` 或全局 `~/.cursor/mcp.json`，写入 `{"mcpServers":{"a2al":{"url":"http://127.0.0.1:2121/mcp/"}}}` |
| **Claude Desktop** | 编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）或 `%APPDATA%\Claude\claude_desktop_config.json`（Windows），用 `command: "a2ald"` / `args: ["--mcp-stdio"]` |
| **Windsurf** | 编辑 `~/.codeium/windsurf/mcp_config.json`，键名为 `serverUrl` |
| **Hermes（NousResearch）** | `hermes mcp add --url http://127.0.0.1:2121/mcp/ a2al`；或写入 `~/.hermes/config.yaml` 的 `mcp_servers.a2al.url` |
| **OpenClaw** | 复制 `skills/a2al/SKILL.md` 到工作区 skills 目录，再 `openclaw mcp add a2al --url http://127.0.0.1:2121/mcp/ --transport streamable-http` |
| **DeepSeek Harness** | 无 add 命令；在 `$DSH_HOME/cordis.patch.yml` 里插入 `@deepseek-ai/dsh-mcp-client` 配置，重启 `dsh web` |

下面是 HTTP 与 stdio 两种条目的通用形状：

```json
{
  "mcpServers": {
    "a2al": { "url": "http://127.0.0.1:2121/mcp/" }
  }
}
```

```json
{
  "mcpServers": {
    "a2al": {
      "command": "npx",
      "args": ["a2ald", "--mcp-stdio"]
    }
  }
}
```

`a2ald` 不在 PATH 时，把 `"command": "a2ald"` 换成绝对路径——macOS / Linux 如 `/usr/local/bin/a2ald`，Windows 如 `C:\Users\<you>\AppData\Roaming\npm\a2ald.cmd`。

## 跨登录常驻

`a2ald mcp add` 启动的 daemon 只够当前会话使用。是否装成**服务**是另一个决定：进程停止后，发布的记录会在 TTL（默认 1 小时）后过期。

```bash
# Windows / macOS
a2ald service install
a2ald service status|stop|start|uninstall

# Linux
systemctl --user enable --now a2ald     # 见「用 systemd 部署」
```

Linux 的 systemd 与容器方式见[用 systemd 部署](/zh/docs/ops/systemd)与[用 Docker 部署](/zh/docs/ops/docker)。

## 常见问题

**工具没有出现** —— 确认宿主是否已重新加载；`a2ald mcp add` 是否真的写入了配置（不认识宿主时不会写）。用 `a2ald mcp print` 打印条目自行放置。

**刚启动时 `a2al_resolve` 失败** —— 刚启动时本机可用 < 1 分钟，能被找到 / 能找到别人 1–2 分钟；已在运行则无需等待（首次连接 < 10 秒，之后约 10–100 ms）。邻居数量只说明谁在当前视野，`network_ready` 也不是「别人能找到你」的证据。

**发布之后是否一直可达** —— 不是。端点记录有 TTL（默认 1 小时），`a2ald` 运行期间自动续期；进程停止即停止续期，记录过期后不可达。需要长期可达就让 daemon 常驻。

**同一台机器能否运行两个 daemon** —— 同一数据目录不行（独占锁）。需要第二个独立节点时换数据目录与端口：`a2al --api http://127.0.0.1:<端口>`，MCP 指向新端口的 `/mcp/`。

**2121 端口被占用** —— 改 `config.toml` 的 `api_addr`，同步更新 MCP URL 与 CLI `--api`；第二个节点还要改 `--listen`。

## 可用工具

| 组 | 工具 |
| --- | --- |
| `a2al_*` | 身份生成、注册、发布、解析、检索、调用、隧道、便条、事件、状态、`a2al_agent_probe` |
| `chat_*` | `request` / `accept` / `refuse` / `remove` / `block` / `send` / `read` / `mark_read` / `contacts` |
| `group_*` | `create` / `list` / `invite` / `join` / `append` / `read` / `head` / `members` / `mark_read` / `retract` / `get_link` / `object_*` / `sync` |

MCP 不提供 ACL、远程管理、地址簿与名片接口——这些走 CLI 或 REST。参数表见 [REST API · MCP 工具](/zh/docs/reference/rest-api)。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 把接入交给 AI 助理 | [交给 AI 助理](/zh/docs/user/ai-assistant) |
| REST / Python 接入 | [REST API 快速上手](/zh/docs/integration/rest)｜[Python 边车](/zh/docs/integration/python) |
| 全部命令与参数 | [REST API](/zh/docs/reference/rest-api) |
