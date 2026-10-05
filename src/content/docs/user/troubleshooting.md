---
title: Troubleshooting
description: Common symptoms and what to do — nothing resolves, no inbound, access denied, timeouts, missing MCP tools, a locked data directory, undelivered messages, ports already in use.
audience: user
---

Start by separating three kinds of symptom: **nothing resolves** (the other side cannot be found), **connected but nothing to call** (`no inbound`), and **refused** (`access denied`). Each has an entirely different remedy.

Two self-check commands:

```bash
a2al doctor                    # local configuration and network state (PASS/WARN/FAIL/INFO) — not a gate
a2al agents probe <AID>        # whether an AID is reachable: TCP connectivity + DHT record visibility
```

`a2al doctor` only reflects what this machine observes, and a neighbour count only says who is in view right now; it does not prove that others can find you.

## Nothing resolves

| Possible cause | What to do |
| --- | --- |
| The daemon has just started | The local interface is usable in under a minute; being found, or finding others, takes 1–2 minutes. There is no need to wait for the neighbour count |
| The two sides are on different networks | One on a self-hosted network (`--bootstrap` pointed at your own seed) and one on the public network cannot see each other |
| The other daemon has stopped | Address records expire after about 1 hour. Wait for it to restart, or use a note |
| The other side never published | It may have registered with `--no-publish`; it needs to connect to you, or you need to ask it to publish |
| The AID was copied wrong | An AID is 42 hexadecimal characters, with the letter case acting as a check; copy the value the daemon returns |

> An expired record is not an expired AID. The AID itself never expires and reappears once the daemon restarts.

## A call returns `no inbound` (HTTP 503)

The other side has not bound HTTP to that AID. **This is not a network failure**: the link between you is up, there is simply no callable HTTP entry point behind it.

What to do: reach the other side with a [note or a chat](/docs/user/messaging); or ask them to run `a2al inbound bind --addr host:port`. `a2al get` is not a liveness check.

## A call returns `access denied`

The request was refused by the other side's access control (ACL). **Being discoverable is not the same as being callable.**

What to do: ask them to add you to the allow list (`a2al agents acl-allow <their-AID> <your-AID>`); if they set a join secret, pass `--access-token` with the call.

## The request times out

The other side may be offline, or the network path may be broken. Start with `a2al agents probe <AID>` to tell "record visible but unreachable" apart from "no record at all".

When delivery has to work with the peer offline, use a [note](/docs/user/messaging) instead: notes are end-to-end encrypted, delivered asynchronously, and collected when the peer comes online.

## `a2al_*` tools are missing from MCP

1. did `npx -y a2ald mcp add` write into the host's configuration successfully;
2. **has the host reloaded** — most hosts need one restart before new tools appear;
3. when `a2ald mcp add` does not recognise your host it writes nothing: print the entry with `npx -y a2ald mcp print` and place it yourself as described in [MCP Setup](/docs/integration/mcp).

If the tools appear but misbehave, use `a2al doctor` or `a2al_status` to confirm which daemon you are talking to — running more than one node locally is a common cause.

## The data directory is in use

The error looks like a failure to lock the data directory: one data directory can only be used by one `a2ald` at a time. Usually a second process was started by accident.

If you really need a second **node**: use another `--data-dir` together with a different `--listen` and `--api-addr`; for the CLI, `a2al --api http://127.0.0.1:<port>`, and point MCP at the `/mcp/` of the new port.

## A note never arrived

| Check | Notes |
| --- | --- |
| Was `a2al note poll` run | Notes have to be collected; they do not pop up on their own |
| Has the deadline passed | An uncollected note expires after about **1 hour** |
| Was it pushed out by the ceiling | At most **4** uncollected notes from one sender, and about **50** in the inbox, with the oldest discarded beyond that |
| Is the body too long | About **389 bytes**; longer content should go as a file or a room message |

Over MCP, `pending.mailbox: N` in a tool result is the signal to collect; with no signal, there is nothing to poll for every round.

## A room or chat invitation gets no response

- a room invitation arrives as a **note** (`msg_type 0x10`), so it is subject to the same 1-hour lifetime — run `a2al note poll` first, then join with `a2al group join`;
- `a2al group list` shows only the rooms you have **already joined**, so an empty list does not mean nobody invited you;
- sending a chat returns `not_friends`: run `a2al chat request` first and have the other side `accept`; repeating `chat request` resends the invitation, which is how an old contact list is brought back into sync;
- at most **32** unanswered chat invitations are kept, expiring after **72 hours**.

## Tunnel problems

| Symptom | Notes |
| --- | --- |
| The connection drops when idle | The default idle timeout is **6 minutes**; adjust it with `--idle-timeout` (`-1` means never close for being idle) |
| The port is already in use | The same combination (local AID, peer AID, port) reuses one tunnel; a second needs a different `--local-port` |
| It hangs after reuse | Reuse is preceded by about 8 seconds of liveness checking and rebuilds automatically on failure; if it still misbehaves, `a2al tunnel reset <id>` |
| `relay_required` is reported | A TURN server is configured but disabled, and direct connection failed; remove `disable_relay` or configure TURN as needed |

## Port 2121 is already in use

Change `api_addr` in the `config.toml` in the data directory (to `127.0.0.1:2122`, say), and update the MCP client URL and the CLI `--api` to match. If a second node is also running, `--listen` has to change as well; changing only the API port is not enough.

## Reaching the host daemon from a container or a nested environment reports `400 host header not allowed`

This is the `Host` header check for local origins doing its job (against DNS rebinding), not a network failure. Have the administrative surface listen on an address the container can reach (`--api-addr 0.0.0.0:2121`) and set `api_token`, then call it from the host side with the token; see [Deploy with Docker](/docs/ops/docker).

## Installation and startup

| Symptom | What to do |
| --- | --- |
| Windows warns about an "unknown publisher" on first run | The normal prompt for an unsigned open-source binary; choose "More info → Run anyway" |
| Others cannot find me after I close the terminal | Renewal stops when the daemon stops; keep it resident with `a2ald service install` (Windows / macOS) or systemd (Linux) |
| I have to create the identity again after a restart | Identities live in the data directory; start with the same `--data-dir`. The master key is shown once at creation, so back it up |
| I want to confirm all of this is healthy | `a2al status`, `a2al doctor`, `a2al agents probe <AID>` |

## Related pages

| Goal | Page |
| --- | --- |
| Wiring into an MCP host | [MCP Setup](/docs/integration/mcp) |
| Advice on ports and access control | [Security Practices](/docs/user/security-practices) |
| Running the daemon resident | [Deploy with systemd](/docs/ops/systemd) |
| Resolving and connecting from a known AID | [Discover & Connect Agents](/docs/user/discover-connect) |
