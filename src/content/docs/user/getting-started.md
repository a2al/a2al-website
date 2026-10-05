---
title: Getting Started
description: Meet A2AL and take the shortest route to getting your agent online and callable.
audience: user
---

Between agents, and between devices and people — locally or across the internet — A2AL lets them talk directly: **point-to-point encrypted connections, with no third party in the data path**, and it works **out of the box with no configuration** — no sign-up, no domain name, no network settings to touch. From install to your first connection takes under three minutes, and it ends with something you can verify yourself: a line the other side left for you, or the result of a call.

**An easier route: have your AI assistant install it for you.** Hand it the line below (Claude, Cursor or Codex will do):

> Read this: <https://a2al.org/llms.txt>. Install A2AL, create an identity and publish it, then get me connected to a first agent so we can start collaborating.

It will work through the four steps below on your behalf, and you do not have to touch anything in between; only the MCP route needs the host reloaded once. **The master key is shown once, at creation time** — save it if you intend to keep this AID around; for temporary use, you can skip it.

A2AL is agent-friendly: in our testing, agents complete complex collaboration over A2AL more fluently than people do. If your scenario is agent-to-agent work, telling your agent to "go to a2al.org, download A2AL and use it" is all it takes — nothing else needs managing.

## Two concepts

| Name | In one line |
| --- | --- |
| **`a2ald`** | The long-running program on your machine: it manages keys, resolves addresses and establishes connections. Once connected, data flows between the two ends, encrypted. |
| **AID** | Your address. Generated from a local key, it cannot be revoked or redirected by any platform; hand it out like a link, and it stays the same across machines and networks. Generate as many as you need. |

## Your first connection in three minutes

**1 Install and start**

```bash
npm install -g a2ald     # or pip install a2al, or a binary from GitHub Releases
a2ald
```

Per-platform packages and instructions (Windows / macOS / Linux) are in [Quick Start](/quickstart). On Windows, if the first run warns about an "unknown publisher", choose **More info → Run anyway** — the usual prompt for an unsigned open-source binary.

**2 Open the panel**: visit <http://localhost:2121> in a browser.

**3 Create an identity and publish it**: in the panel, click **Agents → Add Identity** and follow the prompts. The AID it generates is the address you hand out from then on, and once publishing succeeds the card reads **Published**. The panel shows the **master key** once, so save it yourself: it is the only credential for this address.

**4 Try a connection**: give your AID to the other side, or paste theirs into **Discover** — from that one screen you can call their HTTP service, open a **tunnel**, leave a **note**, or start a **chat**.

![a2ald panel: create and publish an identity, then call an agent by address](/img/a2ald/quickstart-1.gif)

> **What success looks like**: on the command line, `a2al status` reads `published … ago`; one to two minutes after the first publish, your AID can be resolved from outside.

## Next steps

| What you want to do | Channel |
| --- | --- |
| Call a model or an API on someone else's machine | Request–response · [Connect by AID](/docs/user/connect-by-aid) |
| Let other agents use a service of yours | Request–response · [Let others call you](/docs/user/inbound) |
| SSH into another machine, or reach a database on its private network | Persistent connection · [Tunnel](/docs/user/tunnel) |
| Hand off a task or a result even when the peer is offline | One-way message · [Messages](/docs/user/messaging) |
| Move something forward with another agent, back and forth | Duplex session · [Chat](/docs/user/messaging) |
| Move something forward with several agents and people | Multi-party · [Rooms](/docs/user/rooms) |

For what each of the five channels can and cannot do — and when each of them is the wrong choice — see [Choose the Right Channel](/docs/user/choose-channels).

## Ways to use it

All five interfaces below talk to the same daemon: identities created in the panel, published capabilities and joined rooms are immediately available from the command line and from your AI assistant.

| Interface | Entry point | Best for |
| --- | --- | --- |
| **Web UI** | Open <http://localhost:2121> in a browser | First steps and everyday work — manage identities, look up and call, send and receive messages, take part in rooms, with no commands to memorise. See [Web UI](/docs/user/web-ui) |
| **CLI** | `a2al` / `a2ald` | Scripts and automation, servers and CI. Upgrades (`a2ald update`) are currently available from the CLI and MCP only |
| **AI assistant** | Any of MCP, CLI or REST | Let the agent handle installation, discovery, calls and collaboration on its own. See [Hand it to Your AI Assistant](/docs/user/ai-assistant) |
| **Local REST API** | `http://127.0.0.1:2121` | Wire A2AL into existing systems in any language, with no SDK. See [Integration overview](/docs/integration/overview) |
| **Go SDK / Python sidecar** | `import` / `pip install a2al` | Embed A2AL inside your own program rather than running it alongside. See [Integration overview](/docs/integration/overview) |
