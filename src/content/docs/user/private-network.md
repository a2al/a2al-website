---
title: Private (Self-Hosted) Network
description: Point --bootstrap at your own seed node and a set of machines discovers and connects to one another inside your own directory — the same protocol, with traffic that never enters the public network.
audience: user
---

By default `a2ald` joins the public network (the Tangled Network), with public nodes carrying addressing. Point `bootstrap` at your own seed nodes instead, and **addressing happens only between your machines** — the protocol is unchanged, so identities, notes, chats, rooms and calls all behave as usual; only the directory is yours.

Where this fits: machines on a team's internal network, a home lab, an isolated test environment, an air-gapped network, or any deployment where nodes should not talk to a public directory.

> "Private" here means **the addressing directory is yours**, and has nothing to do with LAN addresses such as `192.168.x.x`: a machine behind NAT on a private address can join the public network perfectly well, and conversely, machines spread across the world can form a self-hosted network.

## Building a private (self-hosted) network

**The first machine (seed node)**:

```bash
a2ald --listen :4121 --data-dir /var/lib/a2al/node-a
```

Note its reachable address, say `192.168.1.10`.

**Every other machine**:

```bash
a2ald --bootstrap 192.168.1.10:4121 --data-dir /var/lib/a2al/node-b
```

`--bootstrap` takes a comma-separated list of `host:port` entries (not multiaddrs). **A non-empty list skips public DNS and the beacons entirely**; it can also be written as `bootstrap = [...]` in `config.toml`, see [Configuration](/docs/ops/config).

Machines that join later point at the `--listen` address of any node already running, and the network grows from there with no central coordination.

## Two things to watch

| Watch out for | Why |
| --- | --- |
| Use a **fresh data directory** | An old `peers.cache` may still hold public nodes, leaving the node joined to a self-hosted network while dialling the public one |
| The first machine can run on its own | The seed node does not need to connect to anyone; the others bootstrap to it once they start |

## Two nodes on one machine

When testing a self-hosted network (or checking that two versions interoperate), run two data directories and two ports at once:

```bash
# node A
a2ald --data-dir ./node-a --listen :4121 --fallback-host 127.0.0.1

# node B
a2ald --data-dir ./node-b --listen :4122 --api-addr 127.0.0.1:2122 \
      --fallback-host 127.0.0.1 --bootstrap 127.0.0.1:4121

# from node B: resolve an AID registered on node A
a2al --api http://127.0.0.1:2122 resolve <AID>
```

One data directory can only be used by one `a2ald` at a time; a second or third node needs its own `--data-dir`, together with a different `--listen` and `--api-addr`.

## Optional: restricting bootstrap peers

To stop a node accepting bootstrap peers from anywhere, pin the NodeIDs it will accept:

```toml
bootstrap_node_ids = ["<hex>"]
```

Only bootstrap peers whose NodeID appears in the list are accepted.

## How a private (self-hosted) network differs

| Item | Private (self-hosted) network |
| --- | --- |
| Addressing scope | Only the seed nodes you supply and the nodes downstream of them |
| Address records | Still published and renewed, but written only into the DHT of your own network |
| Capability search | Only nodes on the same self-hosted network are found |
| Identity | Identical to the public network: the AID derives from a local key and can move between networks at any time |

The two do not resolve across each other: an AID on a self-hosted network is not visible on the public one, and vice versa. To make one machine reachable on both, run two nodes with separate data directories.

## Related pages

| Goal | Page |
| --- | --- |
| The full recipe for building and checking one | [Recipes](/docs/user/recipes) |
| Network and bootstrap settings | [Configuration](/docs/ops/config) |
| Advice on ports, ACLs and isolation | [Security Practices](/docs/user/security-practices) |
