---
title: Configuration
description: "A reference for a2ald settings — network and ports, the administrative API and authentication, keys and files, logging, ICE/TURN, automatic publishing and updates; what can be changed live and what needs a restart."
audience: operator
---

`a2ald` keeps its configuration in `config.toml` inside the data directory. Default data directories: `%APPDATA%\a2al` on Windows, `~/Library/Application Support/a2al` on macOS, and `~/.config/a2al` on Linux. If the file does not exist on first start, the daemon writes a default one.

## Three ways to change configuration

| Method | Applies to |
| --- | --- |
| Edit `config.toml` and restart | Every field; the change is certain to take effect |
| `a2al config set <key> <value>` or `PATCH /config` | Live-changeable fields only; the response lists keys that still need a restart under `restart_required` |
| Command-line options (`--listen`, `--api-addr`, `--bootstrap`, `--fallback-host`, `--no-open-browser`, `-config`) | Temporary overrides that take precedence over the file |

## Network and ports

| Key | Default | Notes |
| --- | --- | --- |
| `listen_addr` | `:4121` | The UDP listen address for the DHT and direct connections. The wildcard `:4121` means dual-stack (IPv4 + IPv6); an explicit IPv4 address makes it IPv4-only. |
| `quic_listen_addr` | empty | When empty, QUIC and the DHT share one UDP port; when set, QUIC listens separately. |
| `bootstrap` | `[]` | Seed nodes in `host:port` form (not multiaddrs). Empty joins the public network; non-empty skips public DNS and the beacons and forms a network only with the nodes given. |
| `min_observed_peers` | `3` | How many peers must report the same result before a reflexive address is accepted. |
| `fallback_host` | empty | The address published when neither the listen address nor the reflexive observation is conclusive. |
| `disable_upnp` | `false` | Skip UPnP (IGD port mapping for IPv4). Reasonable on cloud hosts and routers without UPnP. |
| `bootstrap_node_ids` | none | Optional; requires bootstrap peers to have a NodeID in the given list (hexadecimal). |

Port usage is **4121/UDP + 4121/TCP**: UDP carries QUIC direct connections and address lookups, TCP carries the built-in ICE signalling. The administrative surface listens on `127.0.0.1:2121` by default.

## Administrative API and authentication

| Key | Default | Notes |
| --- | --- | --- |
| `api_addr` | `127.0.0.1:2121` | The listen address for the panel, the administrative API and the local gateway. Keeping it local is perfectly usable. |
| `api_token` | empty | Empty means open access (a deliberate default). Once set, non-local origins must send `Authorization: Bearer`. |
| `require_local_token` | `false` | When `true`, local calls need a token as well — worth enabling on a machine with several users. |
| `open_browser` | `true` | Open the panel automatically at startup; turn it off for headless or service operation (or pass `--no-open-browser`). |

The administrative surface has further protections: local-origin requests have their `Host` header checked to block DNS rebinding, and request bodies are capped at 1 MiB (a `fetch` response is capped at 4 MiB and flagged `truncated` beyond that).

## Keys, data and files

| Key | Default | Notes |
| --- | --- | --- |
| `key_dir` | empty | Empty uses the default key directory inside the data directory. |
| `files_root` | empty | The sandbox directory for file-object bytes handed to the daemon (`CAS`, the `body_base64` of `group_object_put`). Empty means objects registered by path have no extra directory restriction. |

The data directory has mode `0700` and the configuration file `0600`, with keys under `<data-dir>/keys/`. One data directory can be used by one `a2ald` process at a time (an exclusive lock).

## Logging

| Key | Default | Notes |
| --- | --- | --- |
| `log_format` | `text` | `text` or `json`; the latter suits log aggregation. |
| `log_level` | `info` | `debug` / `info` / `warn` / `error`. |
| `log_debug_components` | none | Turn on debugging per component when needed, for example `["ice", "punch", "natsense"]`. |

## Publishing and updates

| Key | Default | Notes |
| --- | --- | --- |
| `auto_publish` | `true` | Keep address records renewed so that people who know your AID can resolve you; with it off, publish by hand with `a2al publish`. |
| `learned_path_first` | `true` | Prefer reusing the last working UDP path, and fall back to ICE if that fails. |
| `[update] auto` | `true` | Check for updates in the background; `a2ald update` does it by hand too (the panel offers no update entry point). |

## ICE and TURN

| Key | Notes |
| --- | --- |
| `ice_signal_url` / `ice_signal_urls` | ICE signalling (WebSocket) addresses; when `ice_signal_urls` is non-empty it takes precedence. |
| `ice_stun_urls` | `stun:` addresses; empty with no TURN configured means public STUN is used. |
| `signal_listen_addr` | The TCP listen address of the built-in ICE signalling hub; empty derives the same port from `listen_addr`, and `off` disables it. |
| `disable_relay` | When `true`, TURN relays are not used by default; it can also be passed per call. |
| `[[turn_servers]]` | External TURN servers with the fields `url`, `username`, `credential`, `credential_type` (`static` / `hmac` / `rest_api`). Credentials are never published. |

Direct connections and ICE cover the vast majority of network combinations; **only when both ends are behind symmetric NAT** do you need to configure TURN yourself. A2AL runs no relays, and a relay forwards encrypted traffic only.

## Related pages

| Goal | Page |
| --- | --- |
| Advice on ports and access control | [Security Practices](/docs/user/security-practices) |
| Running resident on Linux | [Deploy with systemd](/docs/ops/systemd) |
| Running in a container | [Deploy with Docker](/docs/ops/docker) |
| The full REST configuration surface | [REST API](/docs/reference/rest-api) |
