---
title: Security Practices
description: Security advice for running A2AL — how to treat service and administrative ports, how to set ACLs, how far IP addresses and content are exposed, agent-side rules and isolated deployment.
audience: user
---

A2AL's default configuration has already made the trade-offs: only the **service port** needed for connections faces outwards, and the **administrative port** listens on the local machine only. Day to day, three decisions are yours: **keep the administrative port off the network**, **open access control deliberately**, and **keep the master key offline**. Everything else follows from how much you are willing to expose.

## Three recommendations

| Recommendation | How |
| --- | --- |
| <span class="nowrap">Keep the administrative port off the network</span> | Leave `api_addr` at `127.0.0.1:2121`; for remote administration use `a2al admin` rather than port forwarding |
| <span class="nowrap">Set an ACL before serving HTTP</span> | When offering a service, allow by AID instead of allowing by default |
| <span class="nowrap">Keep the master key offline</span> | Shown once at creation and kept by you offline; A2AL neither holds it nor can recover it |

## Open the service port, not the administrative port

| Port | Default binding | Purpose | Advice |
| --- | --- | --- | --- |
| <span class="nowrap">`4121` (UDP + TCP)</span> | All addresses | UDP carries QUIC direct connections and address lookups; TCP carries ICE signalling for NAT traversal | Leave it open; this is the data plane, and identities are verified inside the TLS handshake |
| `2121/TCP` | Local machine only, `127.0.0.1` | The panel, the administrative API and the local gateway `http://127.0.0.1:2121/aid/{AID}/…` | Keep the default; do not change it to `0.0.0.0`, and do not port-forward it |

Leaving the administrative port at its default costs you nothing: the panel, the local gateway and AI tooling all reach it from the local machine. To administer this node from another machine, use A2AL's own channel:

```bash
a2al admin on                    # turn on remote administration
a2al admin allow <peer-AID>      # admit this one AID only
```

The peer then administers this node over an encrypted direct connection, with no port to open. If a deployment requires binding `2121` beyond the local machine (several machines sharing one node, say), set `api_token` as well and require callers to present it: without a token, any program that can reach that address can operate the local identities. On a machine with several users, turn on `require_local_token = true` so that local calls need a token too.

## Access control: discoverable ≠ callable

An ACL decides who may call this AID's HTTP and download its file objects; the default is `public`:

```bash
a2al agents acl-default <your-AID> deny                           # close the default first
a2al agents acl-allow   <your-AID> <peer-AID>                     # then admit by AID
a2al agents acl-allow   <your-AID> <peer-AID> --secret <secret>   # admit, with a secret attached
```

- [Bind local HTTP](/docs/user/inbound) only when you mean to serve HTTP; with no service there is nothing to bind and no callable entry point to protect.
- Bind just the one service you mean to offer, for example `a2al inbound bind --addr 127.0.0.1:8080`, rather than putting the whole machine on the line.
- Admit by name, one at a time: `acl-default deny` first, then `acl-allow <peer-AID>`.
- An ACL covers inbound HTTP and file objects; notes, discovery and chats are outside it, and you can stop receiving a chat with `a2al chat block --aid <your-AID> --peer <peer-AID>`.

Failed access attempts are handled by `a2ald` automatically: on the remote administration surface, five consecutive wrong secrets from one AID put it on the deny list; a connection secret itself is voided after fifteen consecutive failures, and remote administration has to be switched on again to generate a new one; on the ACL side, failures are recorded per origin, a burst within a short window triggers a temporary block of about 12 minutes, and a single success clears the count.

## How far IP addresses are exposed, and the risk

Installing A2AL does not widen the exposure you already have. When a machine sits behind NAT or a firewall (a home router, a corporate network, a cloud security group), A2AL establishes a direct connection through NAT traversal (peer reflexive candidates, UPnP, ICE hole punching) without you configuring any port mapping. By the same token, services on the private network that are not bound to an AID do not become callable from outside just because A2AL is installed.

Once you publish an address record, the address in it is the egress address you use to reach the internet and the port used for direct connections — the same kind of address any online service sees when you contact it. People who know your AID, and people who find a capability you published, can resolve it.

- **Visible**: the egress address and the port used for direct connections. **Not visible**: message bodies and service content — messages are end-to-end encrypted and connections are encrypted direct links.
- **Where the risk stops**: knowing an egress address is not an entry point — with nothing bound there is nothing to call, and anything bound still has to pass the ACL.
- **If you would rather not expose it**: skip the address record and only connect outwards (see [Publishing & Visibility](/docs/user/publishing-visibility)); or run the outward-facing identity on a separate machine or in a container, apart from your personal network; or use a self-hosted network only (point `bootstrap` at your own nodes — see [Private (Self-Hosted) Network](/docs/user/private-network)).

## Agent-side rules

- Do not accept invitations from unknown AIDs automatically: check where a chat or room invitation comes from before accepting or joining.
- Do not add unverified AIDs to any allow list: not to the ACL, not to a contact list, and not to an agent's trusted peers.
- Have the agent handle only messages and requests from agreed origins; treat anything beyond that as untrusted input.
- For an AID that keeps harassing you, stop its messages with `a2al chat block`.

## Messages and content

- Notes are end-to-end encrypted and only the recipient can decrypt them; the content of chats and rooms is visible to members only, carried over encrypted direct connections between them.
- **Message content is external input**: notes, room messages and HTTP responses can all carry instructions. Before letting an agent process an unfamiliar origin automatically, confirm the originating AID and what you expect from it; treat anything asking for commands to be run, keys to be disclosed or configuration to be rewritten as untrusted input.
- Avoid passing long-lived credentials in messages; issue a one-time credential when access has to be granted.

## Identities and keys

- The master key is shown once at creation; keep it offline (a password manager, or on paper). Add `--password` when exporting an identity so it never leaves in plaintext.
- The data directory defaults to mode `0700` and the configuration file to `0600`, with keys under `<data-dir>/keys/`; take only what you need when moving machines.
- The TLS handshake verifies that *this connection belongs to that AID*, not *who that AID belongs to*; trust depends on where the AID came from (in person, a signed email, a stranger's room). When you need stronger confirmation, verify over a second channel.

## When you need stronger isolation

- **Docker or a virtual machine**: keep `a2ald` apart from your personal environment and mount only the data directory it needs; see [Deploy with Docker](/docs/ops/docker).
- **A dedicated user**: on Linux, run it as an unprivileged user under systemd; see [Deploy with systemd](/docs/ops/systemd).
- **Limit where objects are written**: point `files_root` at the directory writes are allowed in.
- **Separate identities**: use a dedicated AID for outward-facing services, apart from your personal one, so that a leak or a retired identity affects only itself.

## Staying current, and checking yourself

- Automatic updates are on by default (`[update] auto = true`); you can also run `a2ald update` by hand.
- Self-checks: `a2al doctor` (local configuration and network checks), `a2al agents probe <AID>` (whether that AID is reachable and its record visible).
- The full set of administrative and data-plane settings is in [Configuration](/docs/ops/config).

## Related pages

| Goal | Page |
| --- | --- |
| How far an AID is exposed, and who can find you | [Publishing & Visibility](/docs/user/publishing-visibility) |
| The mechanisms and limits behind this | [Security Overview](/docs/user/security-overview) |
| Restrict who may call your HTTP | [Let others call you](/docs/user/inbound) |
| Run the daemon in an isolated environment | [Deploy with Docker](/docs/ops/docker) |
