---
title: Recipes
description: Five end-to-end recipes — making a local service callable, reaching an agent behind NAT, wiring a local service into an AI assistant, building a private (self-hosted) network, and delivering a task to an offline machine.
audience: user
---

Each of these starts from a concrete situation and ends with a result you can verify. The complete set of options and commands is in the [REST API](/docs/reference/rest-api) and the individual topic pages.

## 1. Make a local service callable from anywhere

**Situation**: a model server, a workflow or an internal API runs on your machine, and another agent, another machine or a colleague should be able to call it — without opening a port or configuring a domain.

```bash
a2al register                                     # 1. create an identity (skip if you have one)
a2al inbound bind --addr 127.0.0.1:8080 --aid <your-AID>   # 2. bind the port the service actually listens on
a2al publish lang.translate --aid <your-AID>       # 3. optional: publish a capability name for others to find
```

Give `--addr` the address the service actually listens on, and **never `2121`** (that is the daemon's administrative port).

**How the other side calls it**

```bash
a2al get <your-AID> /your/api/path     # AID known
a2al search lang.translate             # AID unknown: search by capability name, then call
```

**Signs of success**: the other side runs `a2al get <your-AID> /.well-known/agent.json` and gets your service's JSON back; the caller's IP, network and NAT setup make no difference.

**Keeping it available**: the binding is stored with the identity in the data directory and is restored after a restart; publish records expire about 1 hour after the daemon stops. For something that must stay findable, keep the daemon resident (Windows / macOS: `a2ald service install`; Linux: [Deploy with systemd](/docs/ops/systemd)). Restricting who may call is covered in [Security Practices](/docs/user/security-practices).

## 2. Reach an agent behind someone else's NAT

**Situation**: an agent runs on a colleague's laptop, a remote workstation or a machine at home. You have only its AID, and you would rather not install a VPN, depend on a public IP, or rely on a tunnel address that goes stale.

**Prerequisites**: both machines run `a2ald`, and the other side has registered an AID and published it (or has bound a service as in recipe 1).

```bash
# a single HTTP call
a2al get <peer-AID> /.well-known/agent.json

# a TCP connection that needs to stay up (SSH, databases, gRPC)
a2al tunnel open <peer-AID> --local-port 2222
# Tunnel:  127.0.0.1:2222
ssh -p 2222 user@127.0.0.1
```

**Signs of success**: the call completes. The other machine may have no routable public address at all; `a2ald` handles NAT traversal transparently.

**When the other side is offline**: hand the task over with a note and let it collect when it returns.

```bash
a2al note send <your-AID> <peer-AID> "$(printf '%s' 'Run task X' | base64 -w0)"
```

## 3. Wire a local service into an AI assistant

**Situation**: you are using Claude, Cursor or another MCP host and want it to call a model, a private tool or a company-internal API on your machine, with the service never exposed to the internet.

```bash
npx -y a2ald mcp add          # 1. add MCP (the host must reload before the tools appear)
```

Do step 2 in the host or on the command line:

```bash
a2al register                              # create an AID
a2al inbound bind --addr 127.0.0.1:11434   # Ollama, as an example
```

You can also simply tell the assistant: "register a new identity and bind the Ollama instance on my machine at `127.0.0.1:11434`" — it will call `a2al_agent_register` and `a2al_agent_patch`.

**Step 3 (across machines)**: hand the AID to the other side; they resolve it with `a2al resolve <AID>` and then `a2al_fetch` the path they need. The call is end-to-end encrypted and passes through no server.

## 4. Build a private (self-hosted) network for a group of machines

**Situation**: a few machines at home, several servers on a team, or an isolated test environment. They should find and reach one another, without traffic going to a public directory.

**The first machine (seed node)**:

```bash
a2ald --listen :4121 --data-dir /var/lib/a2al/node-a
```

Note its address, say `192.168.1.10`.

**Every other machine**:

```bash
a2ald --bootstrap 192.168.1.10:4121 --data-dir /var/lib/a2al/node-b
```

A non-empty `--bootstrap` skips public DNS and the beacons entirely; use a **fresh** `--data-dir` so an old `peers.cache` does not keep dialling public nodes.

**Two nodes on one machine** (for testing):

```bash
a2ald --data-dir ./node-a --listen :4121 --fallback-host 127.0.0.1

a2ald --data-dir ./node-b --listen :4122 --api-addr 127.0.0.1:2122 \
      --fallback-host 127.0.0.1 --bootstrap 127.0.0.1:4121

a2al --api http://127.0.0.1:2122 resolve <an-AID-on-node-a>
```

Identities, notes, rooms and sessions behave identically on a self-hosted network — same protocol, your directory. Details are in [Private (Self-Hosted) Network](/docs/user/private-network).

## 5. Hand a task to a machine that is offline

**Situation**: you want to hand work to another agent or machine, and it is not online right now — it has not been started, or it reboots overnight.

```bash
PAYLOAD=$(printf '%s' '{"job":"process_data","file":"s3://…"}' | base64 -w0)
a2al note send <your-AID> <peer-AID> "$PAYLOAD"
```

The other side collects it on return:

```bash
a2al note poll <peer-AID>
```

**Over MCP**: `a2al_mailbox_send` / `a2al_mailbox_list` / `a2al_mailbox_poll`. A `pending.mailbox: N` in a tool result is the signal to look (`list`) then take (`poll`) — with no signal, there is nothing to poll for every round.

**A note is not a chat**: it is encrypted asynchronous delivery, not a live channel and not a delivery receipt. When you need back-and-forth, wait until both sides are online and use a [chat](/docs/user/messaging); to transfer files, use a [room](/docs/user/rooms).

## Related pages

| Goal | Page |
| --- | --- |
| How to choose between the five channels | [Choose the Right Channel](/docs/user/choose-channels) |
| Running the daemon resident, and ports | [Deploy with systemd](/docs/ops/systemd) |
| Every command and option | [REST API](/docs/reference/rest-api) |
| Common problems and what errors mean | [Troubleshooting](/docs/user/troubleshooting) |
