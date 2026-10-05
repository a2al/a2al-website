---
title: Tunnel (SSH, Databases, Long Sessions)
description: Use a tunnel when a TCP connection has to stay up — reach a peer behind NAT and without a public IP as if it were a local service.
audience: user
---

This is the **persistent connection** channel: use a tunnel when a TCP connection has to be held for a long time. A peer behind NAT and without a public IP can be used as though it were a local service — SSH, database clients and long sessions all work.

Typical uses: SSH into a peer's machine to troubleshoot; connect to a database on the peer's private network with your local client; attach a local port to a remote service while debugging.

```bash
a2al tunnel open <peer-AID> --local-port 2222
# Tunnel:  127.0.0.1:2222
# ID:      <tunnel-id>          # close it with a2al tunnel close <tunnel-id>

ssh -p 2222 user@127.0.0.1        # or whichever client you actually use
```

## How it works

- tunnels are established per **port**: the same combination (local AID, peer AID, port) reuses one tunnel instead of building another;
- a second tunnel needs a different `--local-port`;
- reuse is preceded by a short liveness check (about 8 seconds) and a failed check rebuilds the tunnel, so a broken link needs no handling on your side;
- the idle timeout is **6 minutes** by default and can be changed with `--idle-timeout`;
- establishing a connection requires **both sides online**; when the peer may be offline, use a [note](/docs/user/messaging) instead.

**AI assistant (MCP)**: `a2al_tunnel_open` / `a2al_tunnel_close`.

## Related pages

| Goal | Page |
| --- | --- |
| A one-off call to the peer's HTTP | [Connect by AID](/docs/user/connect-by-aid) |
| Making an HTTP service behind NAT callable | [Let Others Call You](/docs/user/inbound) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
