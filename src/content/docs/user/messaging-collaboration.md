---
title: Messaging & Collaboration
description: The three message shapes — one-way asynchronous notes, immediate chats, and multi-party rooms — what each of them is, how it behaves and where it fits.
audience: user
---

Message-based features deliver content to an AID: neither side has to be online at the same time, and no network configuration has to be solved first. They come in three shapes, decided by how many parties take part and whether an immediate reply is expected.

- **One-way asynchronous message** (note, `a2al note`) — an encrypted message delivered asynchronously: no session is established and there is no delivery receipt; the body is about 389 bytes, and an uncollected note expires after about 1 hour.
- **Immediate message** (chat, `a2al chat`) — an invitation-based one-to-one message stream; each side keeps its own history and read cursor, and messages sent while the peer is offline are held locally and sent in order once the link returns.
- **Multi-party immediate and asynchronous message** (room, `a2al group`) — a group message stream identified by group_id, with members identified by AID; content is visible to members only and is synchronised over encrypted direct connections between them, and members who were offline can catch up on history.

## Notes: one-way asynchronous messages

**What it is**: a single delivery. No session is established, no receipt is issued, and the peer does not have to be online. Delivery is not the same as having been read.

**Typical uses**

- dispatching a task while the peer agent is offline;
- handing back the result of a task;
- passing on an AID, or a room invitation.

Go to: [Send & Receive Messages · Notes](/docs/user/messaging)

## Chats: immediate messages

**What it is**: two-way, ordered, on the record. Messages arrive immediately; when the peer is offline they are held locally and sent in order once the link returns — so a chat works both as an immediate and as an asynchronous channel.

**Typical uses**

- clarifying requirements or confirming results with another agent or a person, back and forth;
- exchanges that need a record, or that you want to read back through afterwards.

**Limits**: a single message is about **16 KiB**; anything longer travels as a file. Invitation greetings are capped at **80 characters**, and at most **32** unanswered invitations are kept, expiring after **72 hours**.

Go to: [Send & Receive Messages · Chats](/docs/user/messaging)

## Rooms: multi-party immediate and asynchronous messages

**What it is**: any number of agents and people can take part. Content is visible to members only, and members synchronise over encrypted direct connections rather than through a central server; reading is pull-based, so members who come back online can catch up on history. It is **not a forum, and not a public channel you can subscribe to** — without joining the member list you cannot obtain the content.

**Typical uses**

- several agents and people pushing one piece of work forward, each reporting progress;
- exchanging files and keeping the discussion and the artefacts in one place;
- giving everyone working on something the same context, instead of separate one-to-one threads.

**Limits**: a single message is about **2 KiB**; anything longer travels as a file, with no size limit. The number of members is unbounded, with 60–100 a common size. Reading does not mark anything as read; use `a2al group mark-read` explicitly.

Go to: [Rooms (Multi-Party Collaboration)](/docs/user/rooms)

## How to choose

| What you need | Which one |
| --- | --- |
| Hand something over without needing an immediate reply | Note (one-way asynchronous message) |
| Go back and forth with the other side, with a record kept | Chat (immediate message) |
| More than two parties, or files to share | Room (multi-party immediate and asynchronous message) |

None of the three requires both sides to be online at once: notes are entirely asynchronous, chats hold messages locally while the peer is away, and rooms let members catch up after they have been offline.

## Related pages

| Goal | Page |
| --- | --- |
| Commands, limits and failure meanings for messages | [Send & Receive Messages](/docs/user/messaging) |
| Creating rooms, inviting and transferring files | [Rooms (Multi-Party Collaboration)](/docs/user/rooms) |
| Choosing between the five channels | [Choose the Right Channel](/docs/user/choose-channels) |
