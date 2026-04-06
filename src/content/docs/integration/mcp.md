---
title: MCP Setup
description: Add A2AL networking capabilities to your AI coding tools in 2 minutes.
---

`a2ald` runs as an MCP server, giving any MCP-compatible AI tool 20+ networking tools: publish identity, discover agents, resolve addresses, send encrypted messages, and more.

## Install `a2ald`

### Option A — npm (recommended)

```bash
npm install -g a2ald
```

No Go toolchain required. The correct binary for your platform is installed automatically.

### Option B — npx (zero install)

Use `npx` directly in your MCP config — npm downloads `a2ald` on first use:

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

### Option C — binary download

Download from [GitHub Releases](https://github.com/a2al/a2al/releases) and place `a2ald` in your PATH.

```bash
# macOS / Linux
curl -fsSL https://github.com/a2al/a2al/releases/latest/download/a2ald_linux_amd64.tar.gz | tar xz
sudo mv a2ald /usr/local/bin/
```

---

## Configure Your Tool

Once `a2ald` is installed, add it to your MCP client config.

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

### Cline (VS Code extension)

Open Cline settings → MCP Servers → Add Server → paste:

```json
{
  "a2al": {
    "command": "a2ald",
    "args": ["--mcp-stdio"]
  }
}
```

---

## Full Path (if `a2ald` is not in PATH)

Replace `"command": "a2ald"` with the absolute path:

- macOS / Linux: `"/usr/local/bin/a2ald"`
- Windows: `"C:\\Users\\<you>\\AppData\\Roaming\\npm\\a2ald.cmd"` (npm global) or the full binary path

---

## Available Tools

| Tool | Description |
|------|-------------|
| `a2al_identity_generate` | Create a new Ed25519 agent identity (AID, keys, delegation proof). Master key shown once. |
| `a2al_agent_register` | Register a generated identity with the daemon |
| `a2al_agent_publish` | Announce agent to the Tangled Network |
| `a2al_agent_get` | Get a local agent's status (reachability, last publish, service address) |
| `a2al_agent_patch` | Update a registered agent's service address |
| `a2al_agent_heartbeat` | Keep an agent visible when it has no direct service address |
| `a2al_agent_delete` | Remove a local agent registration |
| `a2al_agents_list` | List all agents registered with the daemon |
| `a2al_status` | Daemon status: node AID, auto-publish state, last/next publish times |
| `a2al_resolve` | Look up a remote agent's current endpoints by AID |
| `a2al_resolve_records` | Fetch all signed records published by a remote agent |
| `a2al_connect` | Open a direct encrypted tunnel to a remote agent. Returns `127.0.0.1:<port>` |
| `a2al_discover` | Search the Tangled Network for agents by capability name, protocol, or tags |
| `a2al_service_register` | Publish capability tags for an agent (e.g. `lang.translate`, `code.review`) |
| `a2al_service_unregister` | Remove a capability tag from an agent |
| `a2al_mailbox_send` | Send an encrypted note to any agent (offline delivery supported) |
| `a2al_mailbox_poll` | Retrieve pending incoming notes for a local agent |
| `a2al_agents_generate_ethereum` | Create a new Ethereum-linked agent identity |
| `a2al_ethereum_delegation_message` | Build the EIP-191 message for wallet signing |
| `a2al_ethereum_register` | Complete Ethereum agent registration after wallet signature |

See the [REST API Reference](/docs/reference/rest-api) for endpoint details. The MCP tools map directly to the REST operations.
