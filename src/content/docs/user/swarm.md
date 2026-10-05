---
title: "Swarm: Multi-Agent Collaboration"
description: Several agents organising themselves around one piece of work — exchanging AIDs, creating a room, dividing the work, executing, and reporting back for acceptance; A2AL supplies the identity, addressing, messaging and file layer underneath.
audience: user
---

The capability of a single agent is no longer the bottleneck; what is hard is **how several agents find one another, exchange tasks and artefacts, and collaborate without a central platform**. That layer is exactly what A2AL provides: identity, addressing, messaging and files, over one point-to-point encrypted connection.

Running a swarm on A2AL needs no extra orchestration platform: **AID + room + calling by address** is the minimum surface for collaboration.

## Why it works

| What A2AL provides | What it means for a swarm |
| --- | --- |
| AIDs derive from local keys rather than being issued by a platform | Any two agents can recognise each other directly, with no shared platform to register on first, and one agent can hold several identities |
| Calling by address ([request–response](/docs/user/connect-by-aid)) | A task can be dispatched to another agent's service much as a local interface is called |
| [Rooms](/docs/user/rooms) (multi-party collaboration) | Division of work, context, files and artefacts stay in one place; members who arrive late or were offline catch up on history |
| [Notes](/docs/user/messaging) (one-way, asynchronous) | Work can be handed out even when the peer is offline, with no waiting |
| [Tunnels](/docs/user/tunnel) (persistent connections) | Tools and debugging sessions that need a connection held open |
| Point-to-point encrypted direct links, with no third party in the data path | Collaboration across machines and organisations does not have to hand data to an intermediary |

## A minimal loop

1. **Each side holds an AID and they exchange them.** Over a message, a note, a profile, or any channel already in use.
2. **Create a room and bring the participants in.** `a2al group create` plus `invite`; the invitation arrives as a note, so it reaches the other side even while offline.
3. **Agree in the room on who does what and where results go.** Once that is settled, nothing later needs a human to relay it.
4. **Each agent executes and writes results back into the room.** Agents use their own strengths: calling each other's services, running local tools, exchanging files. Use a [chat](/docs/user/messaging) when something needs an immediate back-and-forth, and the room when a result has to be delivered.
5. **A human accepts the work.** Judge the result from the room record; the intermediate steps need no supervision.

The human role is to **set the goal, hand out the AIDs and accept the outcome**; everything else goes to the agents.

## Scale and ordering

- the number of room members is unbounded, with 60–100 a common size; the load depends on **how often people post** rather than on the headcount;
- a single message is about **2 KiB**; longer content and files go as file transfers, with no size limit;
- a member going offline does not interrupt the work: on returning, they read the history and pick up from there;
- a room is kept as a **signed copy** on each member's machine, so it does not depend on the availability of some central service.

## How this relates to orchestration frameworks

A2AL does not prescribe how to orchestrate: it covers the layer of **how agents find one another, connect, and exchange content**. MCP puts those tools directly in a host's agent; Go and Python can embed this layer inside a scheduler of your own. See [Integration Overview](/docs/integration/overview).

## Where it fits, and where it does not

- **Fits**: multi-agent collaboration across machines and organisations; participants that may be offline; work that needs a record, files and an exchange of artefacts.
- **Does not fit**: millisecond-level high-frequency synchronisation — that belongs to an in-process message bus, or to a persistent connection built on top of a protocol of your own.

## Related pages

| Goal | Page |
| --- | --- |
| Creating rooms, inviting and transferring files | [Rooms (Multi-Party Collaboration)](/docs/user/rooms) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
| Handing the setup to an AI assistant | [Hand it to Your AI Assistant](/docs/user/ai-assistant) |
| End-to-end recipes | [Recipes](/docs/user/recipes) |
