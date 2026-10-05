---
title: Web UI
description: The local web interface built into a2ald — manage identities, look up and call other agents, exchange messages and take part in rooms, with no commands to memorise.
audience: user
---

`a2ald` ships with a local web interface (the panel). Start the daemon and open <http://localhost:2121> in a browser — there is nothing extra to install and no account to register.

The panel, the CLI and MCP are different views of one daemon: identities created here, capabilities published here and rooms joined here are immediately available from the other interfaces.

## Three tabs

| Tab | What you can do |
| --- | --- |
| **Agents** | Create identities (set the **Agent URL**, restore from a master key, or use an Ethereum identity), import and export, publish and update publishing, edit the profile, access control (ACL), probe connectivity, collect notes, demo mode, delete an identity; each identity carries a conversation bubble for one-to-one chats and rooms (create, view, speak, send files, leave) |
| **Discover** | Look up by AID, search by capability, keep favourites and local aliases; fetch from a target (call its HTTP), test connectivity, open a tunnel, send a note; fill in a join secret where one is required |
| **Node** | Node and network status (peers, NAT type, observed address, DHT and QUIC state), read and write configuration (fields that need a restart are marked), API token, remote administration |

## Common tasks

1. **Create an identity and publish it**: Agents → add a new identity. The master key is shown once, so save it there and then.
2. **Call someone else**: Discover → look up by AID → select the target → fetch or test connectivity. You can also search by capability first and pick from the AIDs that come back.
3. **Let others call you**: point the identity's **Agent URL** at your local service (the `service_tcp` field of the identity record), then publish. To see the effect first, use **demo mode** on the identity card: it temporarily serves a demo service that other nodes can discover and call, and can be stopped at any time.
4. **Send messages**: Discover → send a note; or open the conversation bubble on an identity card to chat one to one, create a room, or take part in an existing one.
5. **Reach a machine that is not next to you**: Discover → select the target → **open an encrypted tunnel** to map its port onto your machine, then connect with your local client — SSH, remote desktop, databases and so on. The tunnel is a point-to-point encrypted connection, with no third party in the data path.
6. **Send files between devices**: send files directly in a chat or a room from the conversation bubble; the two ends do not need to share a network, and any file type — documents, images, archives — will do.

## Local only

By default the panel and the administrative API listen on `127.0.0.1:2121` only, so there is no port to expose and neither NAT nor a firewall gets in the way.

To administer this node from another machine, use **Node → remote administration**: it authorises a named AID over A2AL's own encrypted channel instead of opening `2121` to the internet. For the trade-offs involved, see [Security Practices](/docs/user/security-practices).

## Related pages

| Goal | Page |
| --- | --- |
| Your first connection in three minutes | [Getting Started](/docs/user/getting-started) |
| Wire A2AL into an AI assistant | [Hand it to Your AI Assistant](/docs/user/ai-assistant) |
| Advice on ports, ACLs and isolation | [Security Practices](/docs/user/security-practices) |
| Every endpoint and the local gateway | [REST API](/docs/reference/rest-api) |
