---
title: Deploy with Docker
description: "Run a2ald in a container — the ports and volumes it needs, an image build example, reaching the CLI and MCP from the host, and isolation advice."
audience: operator
---

Putting `a2ald` in a container serves two purposes: keeping one or more AIDs apart from your personal environment, and running several independent nodes on one machine. The official repository does not ship a prebuilt image yet; here is how to build and run one yourself.

## Three constraints inside a container

| Constraint | Notes |
| --- | --- |
| Ports | `4121/UDP` and `4121/TCP` must be reachable from outside (QUIC direct connections and ICE signalling); `2121` listens only on the container's `127.0.0.1` by default |
| One data directory | One data directory can only be used by one `a2ald` process at a time. Several containers mean several volumes — do not share one data directory |
| Headless | There is no browser in a container, so start with `--no-open-browser` |

## Building an image

The image only needs the release binaries and a minimal runtime. Replace `<version>` with a concrete version (say `0.3.3`), or point it at `latest`:

```dockerfile
FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL "https://github.com/a2al/a2al/releases/download/v<version>/a2al_<version>_linux_amd64.tar.gz" \
      | tar xz -C /usr/local/bin a2ald a2al \
 && useradd -r -s /bin/false -M -d /var/lib/a2al a2al

USER a2al
VOLUME /var/lib/a2al

# QUIC direct connections / address lookups (UDP) and ICE signalling (TCP)
EXPOSE 4121/udp 4121/tcp

ENTRYPOINT ["a2ald", "-data-dir", "/var/lib/a2al", "--no-open-browser"]
```

On an ARM64 host, change `linux_amd64` to `linux_arm64`. You can also `npm install -g a2ald` inside the image, but the release tarball is smaller and its startup more predictable.

## Running it

```bash
docker build -t a2al .

docker run -d --name a2ald \
  --restart unless-stopped \
  -p 4121:4121/udp -p 4121:4121/tcp \
  -v a2al-data:/var/lib/a2al \
  a2al
```

To follow the logs:

```bash
docker logs -f a2ald
```

If the host already runs an `a2ald`, the one in the container is a **second node** — it has its own data directory and AID, and the two do not affect each other.

## Reaching the CLI and MCP from the host

The administrative surface listens on `127.0.0.1` inside the container, so mapping `-p 2121:2121` will not work on its own. To let a CLI, panel or MCP client on the host reach into the container, open the administrative surface explicitly and set a token at the same time:

```bash
docker run -d --name a2ald \
  --restart unless-stopped \
  -p 4121:4121/udp -p 4121:4121/tcp \
  -p 127.0.0.1:2121:2121 \
  -v a2al-data:/var/lib/a2al \
  a2al \
  -data-dir /var/lib/a2al --no-open-browser \
  --api-addr 0.0.0.0:2121
```

Then set `api_token` in the container's `config.toml`. Port mapping makes the request non-local, and **a request without a token will be refused**. On the host side:

```bash
a2al --api http://127.0.0.1:2121 --token <token> status
```

An MCP client takes the HTTP form:

```json
{
  "mcpServers": {
    "a2al": {
      "url": "http://127.0.0.1:2121/mcp/",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

> **A common error**: while the administrative surface still listens locally (`127.0.0.1`), a request forwarded in from the host may return `400 host header not allowed` — that is the local-origin `Host` header check doing its job, not a network failure. Listen on `0.0.0.0` and set `api_token` as above to resolve it.

For agents on the host to use the identities of the containerised daemon, point the CLI / MCP at the mapped address. The reverse does not work directly: an agent inside the container cannot reach a host service bound only to `127.0.0.1` — that service has to be bound to an address the container can reach as well.

## Isolation advice

- **One data directory per container**: run several nodes on different volumes, each with its own `--listen` (say `:4122`) and `--api-addr` port.
- **Mount only what is needed**: the volume holds the data directory alone; mount `files_root` separately when file objects are needed, and do not let the container see your whole home directory.
- **Drop privileges**: run as a non-root user inside the image (see the `useradd` / `USER` above).
- **Keep the administrative surface off the network**: map `2121` to the host's `127.0.0.1` only, and always set `api_token`.
- **Network mode**: on the default bridge network, UPnP is usually unavailable, so `disable_upnp = true` is reasonable; direct connections between container and host depend on the port mappings being right.

## Related pages

| Goal | Page |
| --- | --- |
| Every configuration field | [Configuration](/docs/ops/config) |
| Running as a service on Linux | [Deploy with systemd](/docs/ops/systemd) |
| Advice on ports and access control | [Security Practices](/docs/user/security-practices) |
| Private (self-hosted) networks (`--bootstrap`) | [Private (Self-Hosted) Network](/docs/user/private-network) |
