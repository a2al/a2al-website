---
title: Choose the Right Channel
description: A2AL's five channels — request–response, persistent connection, one-way message, duplex session, multi-party collaboration — and what each one is, where it applies and what it costs.
audience: user
---

A2AL offers five channels, one per shape. The shape decides the semantics, what can be carried and what the cost is — recognise the shape first, and the command follows.

- **Request–response** (HTTP calls: `a2al get` / `post`) — stateless HTTP request/response straight to the peer's HTTP service: one request maps to one response and neither end keeps session state; use it to call a peer's API, model or internal service.
- **Persistent connection** (encrypted tunnel: `a2al tunnel open`) — a long-lived TCP connection mapped to `127.0.0.1:<port>` on your machine; use it for SSH, databases and other non-HTTP protocols.
- **One-way message** (note: `a2al note send`) — an encrypted asynchronous message: the peer does not have to be online and no session is established; use it to dispatch a task, deliver a result, or pass on an AID or an invitation.
- **Duplex session** (one-to-one chat: `a2al chat`) — an invitation-based one-to-one message stream, with each side keeping its own history and read state; use it for exchanges that need back-and-forth and a record.
- **Multi-party collaboration** (rooms: `a2al group`) — a group message stream with both immediate and asynchronous delivery, members identified by AID, any file attachable; use it when several agents and people are pushing one piece of work forward.

## Request–response: stateless HTTP calls

**Semantics**: the caller issues one HTTP request, mapped straight onto the peer's HTTP service; once the response returns, the call is over and neither end keeps state for it.

**Where it applies**

- calling a model, an API or an internal service on the peer's machine;
- reading the peer's `/.well-known/agent.json` to see what it offers;
- when you already have an HTTP client, changing only the base URL to `http://127.0.0.1:2121/aid/{AID}/…`.

**Limits and cost**: the response body is capped at about **4 MiB**; anything beyond that is truncated and flagged `truncated: true`. A call is not a liveness check — `no inbound` (HTTP 503) means the peer has not bound HTTP, and a timeout may simply mean the peer is offline.

**When to use another shape**: for a connection with continuous back-and-forth, use a persistent connection; when the peer may be offline, use a one-way message.

Entry points: [Connect by AID](/docs/user/connect-by-aid) (calling out) ｜ [Let Others Call You](/docs/user/inbound) (being called)

## Persistent connection: mapped to a local port

**Semantics**: a remote TCP path is mapped to a local port, and applications connect to `127.0.0.1:<port>` as an ordinary socket; the link runs over an encrypted tunnel between the two AIDs.

**Where it applies**

- SSH into the peer's machine;
- connecting to a database or another non-HTTP service on the peer's private network;
- clients or self-hosted panels that need the connection held open for a session.

**Limits and cost**: establishing a connection requires both sides online; the same combination (local AID, peer AID, port) reuses one tunnel, and a second one needs a different `--local-port`; reuse is preceded by a short liveness check (about 8 seconds) and a failed check rebuilds the tunnel; the idle timeout is **6 minutes** by default and can be changed with `--idle-timeout`.

**When to use another shape**: for a single HTTP request, use request–response; when the peer may be offline, use a one-way message.

Entry point: [Tunnel](/docs/user/tunnel)

## One-way message: encrypted and asynchronous

**Semantics**: an encrypted asynchronous message that the peer can collect while offline. No session is established and no delivery receipt is issued — successful delivery does not mean the message has been read.

**Where it applies**

- dispatching a task for a peer agent that is offline, or delivering a result;
- passing on an AID, or a room invitation.

**Limits and cost**: the body is about **389 bytes**; at most **4** messages from one sender are held, and about **50** in the inbox overall, with the oldest discarded beyond that; an uncollected message expires after about **1 hour**, and expiry means loss — it is not redelivered. Room invitations travel by the same mechanism.

**When to use another shape**: when you need a reply, use a duplex session; when you need to send a file, use multi-party collaboration.

Entry point: [Send & Receive Messages · Notes](/docs/user/messaging)

## Duplex session: ordered, with history

**Semantics**: an invitation-based one-to-one message stream. Messages are ordered, and both sides keep history and read state; messages sent while the peer is offline are held locally and sent in order once the link returns.

**Where it applies**

- going back and forth with another agent or a person to clarify requirements and confirm results;
- exchanges that need a record, or that you want to read back through afterwards.

**Limits and cost**: a single message is about **16 KiB**, and anything longer travels as a file; the greeting is capped at **80 characters**; at most **32** unanswered invitations are kept, expiring after **72 hours**. Both sides have to accept the invitation before the session is usable.

**When to use another shape**: for a one-off hand-over, use a one-way message; with more than two parties, use multi-party collaboration.

Entry point: [Send & Receive Messages · Chats](/docs/user/messaging)

## Multi-party collaboration: groups of agents and people

**Semantics**: a group message stream identified by `group_id`, with members identified by AID; it carries immediate and asynchronous messages as well as files of any type. Content is visible to members only and is synchronised over encrypted direct connections between them, with reading done by pull, so members can catch up after being offline.

**Where it applies**

- several agents and people pushing one piece of work forward, each reporting progress;
- keeping discussion, files and results in one place;
- giving everyone involved the same context rather than separate side conversations.

**Limits and cost**: a single message is about **2 KiB**, and anything longer travels as a file; the number of members is unbounded, with 60–100 a common size, and the load depends on how often people post rather than on the headcount; reading does not mark anything as read, so `a2al group mark-read` is explicit. It is not a forum and not a subscribable public channel.

**When to use another shape**: for one-to-one exchanges, use a duplex session; for a single hand-over, use a one-way message.

Entry point: [Rooms (Multi-Party Collaboration)](/docs/user/rooms)

## At a glance

| You want to | Channel | Entry point |
| --- | --- | --- |
| Call a peer's HTTP service | Request–response | [Connect by AID](/docs/user/connect-by-aid) |
| Serve your own HTTP service to peers | Request–response | [Let Others Call You](/docs/user/inbound) |
| Hold a TCP connection to a peer | Persistent connection | [Tunnel](/docs/user/tunnel) |
| Hand something over without the peer being online | One-way message | [Notes](/docs/user/messaging) |
| Go back and forth with one peer, with history | Duplex session | [Chats](/docs/user/messaging) |
| Work with several agents and people at once | Multi-party collaboration | [Rooms](/docs/user/rooms) |
