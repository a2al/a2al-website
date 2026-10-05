---
title: Connect by AID
description: Hold the other side's AID and call it as if it were a local service — straight through a point-to-point encrypted connection, with no third party in the data path.
audience: user
---

This is one end of the **request–response** channel: with the other party's **AID**, you can call them much as you would call a service on your own machine. The request travels straight over an encrypted point-to-point connection, with no third party in the data path, and it makes no difference that the peer sits behind NAT or has no public IP address or domain name.

Typical uses: calling a model or an internal API on someone else's machine; reading a service's interface document (`/.well-known/agent.json`); wiring another party's HTTP service into your own pipeline as a data source.

## Prerequisites

- The other party's **AID** — from a message, the clipboard, or any channel you already use.
- The other party has **bound** an HTTP service to that AID.

You can connect without HTTP bound as well; there is simply no callable interface. In that case, use a [note or a chat](/docs/user/messaging) instead.

## Three equivalent entry points

| Interface | How to call |
| --- | --- |
| CLI | `a2al get <peer-AID> /path`; for POST, `a2al post <peer-AID> /path -d '{…}'` |
| Any existing HTTP client | Point the base URL at `http://127.0.0.1:2121/aid/{peer-AID}/…` and leave the rest as it is |
| AI assistant (MCP) | Tool `a2al_fetch` |

```bash
a2al get <peer-AID> /.well-known/agent.json
```

## Expected result

The JSON or text returned by the peer's service — the result of this request. How you call is independent of which machine or network the peer runs on.

## Common responses and what they mean

| Response | Meaning |
| --- | --- |
| `no inbound` | The peer has not bound HTTP to that AID (HTTP 503). The network itself is fine; use a note or a chat instead. |
| `access denied` | The peer's access control refused the request. **Being discoverable is not the same as being callable.** |
| Request timed out | The peer may be offline at the moment. A call is not a liveness check; when delivery has to work with the peer offline, use a [note](/docs/user/messaging). |

## Related pages

| Goal | Page |
| --- | --- |
| Bind a local service to your own AID | [Let others call you](/docs/user/inbound) |
| TCP connections that need to stay up | [Tunnel](/docs/user/tunnel) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
