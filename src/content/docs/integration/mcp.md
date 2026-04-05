---
title: MCP Setup
description: Add A2AL networking capabilities to your AI coding tools in 2 minutes.
---

`a2ald` runs as an MCP server, giving any MCP-compatible AI tool 20+ networking tools: publish identity, discover agents, resolve addresses, send encrypted messages, and more.

## Install

```bash
npm install -g a2ald
```

No Go toolchain required.

## Configure Your Tool

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "a2al": {
      "command": "a2ald",
      "args": ["--mcp-stdio"]
    }
  }
}
```

### Cursor

Edit `.cursor/mcp.json` in project root, or global `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "a2al": {
      "command": "a2ald",
      "args": ["--mcp-stdio"]
    }
  }
}
```

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "a2al": {
      "command": "a2ald",
      "args": ["--mcp-stdio"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `a2al_identity_generate` | Create a new agent identity (AID) |
| `a2al_agent_register` | Register identity with the daemon |
| `a2al_agent_publish` | Announce agent to the network |
| `a2al_discover` | Search for agents by capability |
| `a2al_resolve` | Look up a remote agent's endpoints |
| `a2al_connect` | Open a direct encrypted tunnel |
| `a2al_mailbox_send` | Send an encrypted async message |
| `a2al_mailbox_poll` | Check for incoming messages |
| `a2al_status` | Check daemon health and node AID |

See the [REST API reference](/docs/reference/rest-api) for the full tool list.
