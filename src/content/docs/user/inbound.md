---
title: Let Others Call You
description: Bind a local service to your AID and let others call it by address — no open ports, no domain name, no public IP.
audience: user
---

This is the other end of the **request–response** channel: bind a service running on your machine to your AID — a local LLM, an internal API, an automation script. Once bound, other agents or people can call it **by address**, with no port to open, no domain name and no public IP.

Typical uses: hand a local model service to a colleague or another agent to call; expose an existing internal endpoint to selected peers by AID instead of to the internet.

## Bind in three steps

```bash
a2al register                                   # 1. create an identity (skip if you have one)
a2al inbound bind --addr 127.0.0.1:8080         # 2. bind your local service (use the port it actually listens on)
a2al publish lang.translate --name "Translation" --brief "Chinese ⇄ English"   # 3. publish a service name (optional)
```

Give `--addr` the address the service **actually listens on**. `2121` is a2ald's API port and cannot be used for binding.

Step 3 is for public lookup: if you hand the AID only to selected peers, you can skip it.

## How the other side calls you

```bash
a2al get <your-AID> /your/api/path      # AID known: call it directly
a2al search lang.translate              # AID unknown: look it up by service name
```

## Expected result

The caller runs `a2al get <your-AID> /.well-known/agent.json` and gets back the JSON your service returns. The caller's IP, network and NAT setup make no difference.

## Keeping the service available

- **The binding travels with the identity**: bindings are kept in a2ald's data directory and are restored automatically after a restart from the same directory.
- **Publish records expire**: once a2ald stops running, published records expire after about **1 hour** and lookups stop matching — for something that must stay findable, keep the daemon resident (on Windows / macOS: `a2ald service install`; on Linux, see the deployment guides).
- **Access control**: use an ACL when you need to restrict who may call. **Being discoverable is not the same as being callable.**

## Related pages

| Goal | Page |
| --- | --- |
| Call the other side's service | [Connect by AID](/docs/user/connect-by-aid) |
| TCP connections that need to stay up | [Tunnel](/docs/user/tunnel) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
