---
title: Publishing & Visibility
description: How far an AID is exposed decides who can find you — the effects and limits of the three levels (identity only, address published, capabilities published), and the difference between being discoverable and being callable.
audience: user
---

Whether an AID can be found, and how, is decided by how far it is exposed. There are three levels, opening up one step at a time: **identity only**, **address published**, and **capabilities published**. Each step further means more people can find you; and what goes out to the network is ever only an address, a profile and capability names — never any message content.

| Level | How to switch it on | Who can find you | What goes out |
| --- | --- | --- | --- |
| <span class="nowrap">Identity only</span> | `a2al register --no-publish`, or create without publishing | Nobody can find you on their own; you can still connect out | Nothing |
| <span class="nowrap">Address published</span> | Publishing is the default at registration, or `a2al agents publish <your-AID>` | Anyone who knows your AID | Current endpoint candidates |
| <span class="nowrap">Capabilities published</span> | `a2al publish <capability>` | Anyone, searching by capability name | Capability name, display name, brief, protocols, tags |

## Identity only: usable outbound

Creating an identity gives you an AID. At this level you can reach others — call their services, send notes, start chats — but nobody can resolve your current location from the network, so nobody finds you on their own.

- **Fits**: identities that only need to reach out, or throwaway identities for temporary use.
- **Entry point**: `a2al register --no-publish`; when creating an identity in the panel, skip publishing.
- **Limits**: this is not a hidden identity. When you connect to a peer, that peer still sees where the connection comes from.

## Address published: anyone who knows your AID can find you

Publishing writes an **address record** keyed by your AID, holding your current endpoint candidates. Anyone who knows your AID resolves you from it and connects to you; after you change networks or machines, the same AID resolves to the new address.

- **This is not "publicly findable"**: the record is keyed by AID, so someone who does not know the AID cannot look you up, and there is no enumerable directory of identities on the network.
- **Published by default**: registration writes the record automatically (node configuration `auto_publish` is on by default); to trigger it by hand, use `a2al agents publish <your-AID>`.
- **Renewal and expiry**: address records carry a TTL (about 1 hour by default) that `a2ald` keeps renewing; once the daemon stops, renewal stops and the record drops out of resolution when it expires. **The AID itself never expires** and reappears after a restart.
- **Profile (optional)**: give the identity a display name and a brief so peers see a name rather than a string of address characters when they look you up. Connections work without one.

## Capabilities published: strangers find you by what you do

Publishing a capability (say `lang.translate`) lets anyone look up "capability → AID" by capability name — the only level that anyone at all can search.

- **What goes out**: the capability name, display name, brief, supported protocols and tags; nothing from inside your HTTP service, and no messages.
- **Entry point**: `a2al publish <capability>`; for naming and categories, see [Publish Service Capabilities](/docs/user/publish-services).
- **Taking it back**: `a2al unpublish <capability>`; the entry disappears when its TTL expires.
- **Limits**: capability names are a public directory, so publish only what you genuinely mean to offer; one capability name may match several agents, and search results are not an endorsement.

## Discoverable ≠ callable

All three levels of visibility only settle "finding you". What a finder can then do is governed by two further switches:

| Switch | What it decides |
| --- | --- |
| Binding local HTTP ([inbound](/docs/user/inbound)) | Whether the AID has callable HTTP behind it; when nothing is bound, a fetch returns `no inbound` (HTTP 503) |
| Access control (ACL) | Who may call your HTTP and download your file objects; `public` by default |

An ACL applies only to inbound HTTP and file objects for that AID; notes, discovery and chats are not subject to it. In other words, even with no HTTP open at all, others can still send you notes and chat with you.

## Checking and taking it back

| Goal | How |
| --- | --- |
| See current registration and publishing state | `a2al status` (shows `published … ago`) |
| Confirm the address record is visible on the network | `a2al resolve <your-AID>` |
| Check reachability and record visibility | `a2al agents probe <your-AID>` |
| Confirm you appear in capability search | `a2al search <capability>` |
| Take a capability back | `a2al unpublish <capability>` |
| Stop the address record | Stop the daemon or delete the identity; once renewal stops it expires in about 1 hour (the AID can still be restored from the master key) |

## Three common misconceptions

- **"Publishing means public"** — an address record only reaches people who already know your AID; there is no enumerable identity directory, so nobody can search you out.
- **"Not publishing means invisible"** — not publishing only means others cannot find you on their own; you can still connect out, and the peer still sees where the connection comes from.
- **"Records stay there forever"** — address and capability records both carry a TTL and depend on the daemon renewing them; once the daemon stops, they are gone in about an hour, and the AID itself is unaffected.

## Related pages

| Goal | Page |
| --- | --- |
| Advice on ports, ACLs and isolated deployment | [Security Practices](/docs/user/security-practices) |
| Making yourself findable by capability name | [Publish Service Capabilities](/docs/user/publish-services) |
| Resolving and connecting from a known AID | [Discover & Connect Agents](/docs/user/discover-connect) |
| Putting callable HTTP behind your AID | [Let others call you](/docs/user/inbound) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
