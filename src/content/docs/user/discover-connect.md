---
title: Discover & Connect Agents
description: Two discovery paths — resolving a known AID and searching by capability — plus how to choose a connection for the job; identity is verified inside the handshake, with no port mapping.
audience: user
---

There are two ways to find the other side: **resolve directly when the AID is known**, and **search by capability when it is not**. Once you have an AID, pick the connection that suits the job.

Typical uses: with nothing but the AID from someone's card, resolve it and then call it; knowing only that you need something like "code review", search first and pick a suitable agent from the results.

## Resolving a known AID

```bash
a2al resolve <peer-AID>      # resolve the current address record
a2al info <peer-AID>         # read the profile
```

Over REST: `POST /resolve/{aid}` (address record), `GET /resolve/{aid}/records?type=0`. The result carries the current endpoints, `nat_type`, sequence number and TTL.

```json
{
  "aid": "A06aE78750B7f0a5975a9f455C98087902a4Ab15ca",
  "endpoints": ["quic://203.0.113.7:4122"],
  "nat_type": 1,
  "seq": 7,
  "ttl": 3600
}
```

## Searching by capability

When the other side has [published service capabilities](/docs/user/publish-services), search by capability name without knowing the AID first:

```bash
a2al search lang.translate                      # search by capability name
a2al search reason.analyze --filter-tag finance # narrow by tag
a2al search code.review --filter-protocol mcp   # narrow by protocol
```

Over REST: `POST /discover`, with the body `{"services":["lang.translate"],"filter":{"tags":["legal"],"protocols":["http"]}}`. Each result carries the capability name, AID, display name, brief, protocols and tags.

| Filter | Semantics |
| --- | --- |
| `tags` | AND: returns only agents that carry all the listed tags |
| `protocols` | AND: returns only agents that support all the listed protocols |

One capability name may match several agents, and the caller chooses — search results themselves are not an endorsement of anything.

## How to connect

With the AID in hand, choose by purpose; the trade-offs between channels are in [Choose the Right Channel](/docs/user/choose-channels).

| Purpose | How |
| --- | --- |
| Calling the peer's HTTP / API | `a2al get <AID> <path>`, `a2al post`, `a2al_fetch`, or `http://127.0.0.1:2121/aid/{AID}/…` |
| A single TCP session | `a2al connect <AID>` (returns a local tunnel port that ends with that connection) |
| A TCP connection that stays up | `a2al tunnel open <AID> --local-port N` |
| A message when the peer may be offline | `a2al note send`, `a2al chat` |

Both `connect` and `tunnel open` return a local port; the application connects to it as an ordinary TCP socket.

## How a connection is established

1. the AID is resolved to its current address record;
2. all candidate endpoints are dialled concurrently;
3. the two sides complete **mutual TLS** with certificates derived from their own Ed25519 keys — identity verification happens inside the handshake and depends on no third party;
4. if every direct attempt fails and the address record carries a signalling address, it falls back to ICE over WebSocket.

NAT traversal is handled by `a2ald` automatically (peer reflexive candidates, UPnP, ICE hole punching), so a home router, corporate NAT or cloud host normally needs no port mapping and no VPN. The few combinations where **both sides are behind symmetric NAT** need a TURN server of your own; A2AL runs no relays, and the credentials stay on your machine and are never published.

## Related pages

| Goal | Page |
| --- | --- |
| Making yourself findable by capability name | [Publish Service Capabilities](/docs/user/publish-services) |
| Calling the other side's HTTP service | [Connect by AID](/docs/user/connect-by-aid) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
