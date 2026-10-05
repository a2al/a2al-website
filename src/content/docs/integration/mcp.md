---
title: MCP Setup
description: Wiring a2ald into Claude Code, VS Code, Cursor and other MCP hosts — one command to add it, two ways to run it, and how to keep it resident across logins.
audience: developer
---

`a2ald` is itself an MCP server: identity, discovery, calls, tunnels, notes and events, along with one-to-one chats and rooms (`chat_*` / `group_*`), are all exposed as tools. The host needs no adapter code.

## The fastest path

```bash
npx -y a2ald mcp add       # or: a2ald mcp add
```

It will: start a daemon if none is running, and register the MCP server with every host it recognises. Then **reload the host**, confirm the `a2al_*` tools are there, and start working. `a2al doctor` is optional — you need it only when you suspect you are talking to the wrong daemon.

If `mcp add` does not recognise your host it writes nothing and prints the entry for you to place yourself: run `a2ald mcp print` first, then follow the snippets below.

## Two run modes

| Mode | How the client connects | Best for |
| --- | --- | --- |
| **Resident daemon** (default) | `"url": "http://127.0.0.1:2121/mcp/"` | Collaboration, the CLI, the panel, several hosts sharing one daemon |
| **stdio** | `"command": "a2ald", "args": ["--mcp-stdio"]` | Hosts that can only spawn a process, and CI; proxies to an existing daemon when there is one |

**What stdio costs** (with no daemon running anywhere): a fresh join to the DHT, **no REST API** (and therefore no CLI and no panel), one process per data directory, and publishing that stops when the session ends. Use it when all of that is acceptable.

**The stdio smart proxy**: with `a2ald` already running, `a2ald --mcp-stdio` proxies MCP to it — no cold start and no lock conflict. With nothing running, this process *is* the node: the local interface is usable in under a minute, and being found or finding others takes 1–2 minutes. There is no need to wait for the neighbour count.

> **Data directory lock**: one data directory can only be used by one `a2ald` process at a time, and starting a second by accident reports a lock error. A second **node** is a different matter: change `--data-dir`, `--api-addr` and `--listen`, then point the CLI / MCP at the new port.

## Installing a2ald

| Method | Command |
| --- | --- |
| npm (recommended, no Go needed) | `npm install -g a2ald` |
| npx (nothing to install) | Use `npx` directly in the MCP configuration; it downloads on first use |
| Release binary | Take `a2al_<version>_<platform>.tar.gz` / `.zip` from [GitHub Releases](https://github.com/a2al/a2al/releases) and put `a2ald` on your PATH |
| Python sidecar | `pip install a2al` (ships platform binaries) |

## Configuring individual hosts

You only need to place the entry by hand when `a2ald mcp add` does not cover your host. Prefer HTTP; stdio is equally valid (it proxies when a daemon exists).

Hosts `mcp add` knows: Claude Code, VS Code, Cursor, Claude Desktop, Windsurf, OpenClaw, Hermes, DeepSeek Harness.

| Host | How |
| --- | --- |
| **Claude Code** | `claude mcp add --scope user --transport http a2al http://127.0.0.1:2121/mcp/` |
| **VS Code** | `code --add-mcp "{\"name\":\"a2al\",\"type\":\"http\",\"url\":\"http://127.0.0.1:2121/mcp/\"}"` |
| **Cursor** | Edit `.cursor/mcp.json` at the project root, or `~/.cursor/mcp.json` globally, and add `{"mcpServers":{"a2al":{"url":"http://127.0.0.1:2121/mcp/"}}}` |
| **Claude Desktop** | Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows), using `command: "a2ald"` / `args: ["--mcp-stdio"]` |
| **Windsurf** | Edit `~/.codeium/windsurf/mcp_config.json`; the key is `serverUrl` |
| **Hermes (NousResearch)** | `hermes mcp add --url http://127.0.0.1:2121/mcp/ a2al`; or set `mcp_servers.a2al.url` in `~/.hermes/config.yaml` |
| **OpenClaw** | Copy `skills/a2al/SKILL.md` into your workspace skills directory, then `openclaw mcp add a2al --url http://127.0.0.1:2121/mcp/ --transport streamable-http` |
| **DeepSeek Harness** | No add command; insert the `@deepseek-ai/dsh-mcp-client` configuration into `$DSH_HOME/cordis.patch.yml` and restart `dsh web` |

The general shapes for HTTP and stdio entries:

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

When `a2ald` is not on your PATH, replace `"command": "a2ald"` with an absolute path — `/usr/local/bin/a2ald` on macOS / Linux, or `C:\Users\<you>\AppData\Roaming\npm\a2ald.cmd` on Windows.

## Staying resident across logins

The daemon `a2ald mcp add` starts serves the current session only. Installing it as a **service** is a separate decision: once the process stops, published records expire with the TTL (1 hour by default).

```bash
# Windows / macOS
a2ald service install
a2ald service status|stop|start|uninstall

# Linux
systemctl --user enable --now a2ald     # see "Deploy with systemd"
```

For the Linux systemd and container approaches, see [Deploy with systemd](/docs/ops/systemd) and [Deploy with Docker](/docs/ops/docker).

## Common questions

**The tools never appear** — check whether the host has reloaded, and whether `a2ald mcp add` actually wrote to its configuration (it writes nothing for an unrecognised host). Print the entry with `a2ald mcp print` and place it yourself.

**`a2al_resolve` fails just after startup** — the local interface is usable in under a minute after start, while being found or finding others takes 1–2 minutes; when a daemon is already running there is nothing to wait for (a first connection takes under 10 seconds, and 10–100 ms thereafter). A neighbour count only says who is in view, and `network_ready` is not evidence that others can find you either.

**Is it reachable forever once published** — no. Endpoint records have a TTL (1 hour by default) that `a2ald` renews while it runs; stopping the process stops renewal, and the record becomes unreachable once it expires. For long-term reachability, keep the daemon resident.

**Can two daemons run on one machine** — not on the same data directory (it holds an exclusive lock). For a second independent node, change the data directory and ports: `a2al --api http://127.0.0.1:<port>`, with MCP pointed at `/mcp/` on the new port.

**Port 2121 is taken** — change `api_addr` in `config.toml` and update the MCP URL and the CLI `--api` to match; a second node also needs a different `--listen`.

## Available tools

| Group | Tools |
| --- | --- |
| `a2al_*` | Identity generation, registration, publishing, resolve, search, calls, tunnels, notes, events, status, `a2al_agent_probe` |
| `chat_*` | `request` / `accept` / `refuse` / `remove` / `block` / `send` / `read` / `mark_read` / `contacts` |
| `group_*` | `create` / `list` / `invite` / `join` / `append` / `read` / `head` / `members` / `mark_read` / `retract` / `get_link` / `object_*` / `sync` |

MCP does not cover ACLs, remote administration, the address book or profiles — those go through the CLI or REST. For the parameter tables, see [REST API · MCP tools](/docs/reference/rest-api).

## Related pages

| Goal | Page |
| --- | --- |
| Handing the setup to an AI assistant | [Hand it to Your AI Assistant](/docs/user/ai-assistant) |
| REST / Python integration | [REST API Quickstart](/docs/integration/rest) ｜ [Python Sidecar](/docs/integration/python) |
| Every command and option | [REST API](/docs/reference/rest-api) |
