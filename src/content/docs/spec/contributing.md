---
title: Contributing
description: Contributing code, docs, and address version registry entries to A2AL — conventions, tests, commit messages, and licensing.
audience: developer
---

A2AL's implementation, documentation, and address version registry all live in a single open-source repository. What follows covers everything from a one-line docs fix to a feature pull request.

## Before you start

- **Open an issue for anything substantial.** Aligning on direction first avoids duplicated effort; bug fixes and small improvements can go straight to a PR.
- **Every contributor signs a Contributor License Agreement (CLA).** A bot prompts you on your first PR — sign as instructed.

## Development environment

Go 1.24+ is required.

```bash
git clone https://github.com/a2al/a2al
cd a2al
go test -vet=off -count=1 ./...
```

Build both binaries:

```bash
go build ./cmd/a2ald   # daemon
go build ./cmd/a2al    # command line
```

The suite covers the DHT, protocol, identity, host, and daemon layers. `-vet=off` is there because some generated code trips vet; `-count=1` disables the test cache. Cases that need real networking work fine over the loopback interface.

```bash
go test -vet=off -count=1 -run TestConnPool ./daemon/...   # one package, one case
```

Each directory under `examples/` has its own `go.mod` and a `replace` pointing at the module root, so `go run .` inside any of them works.

## Code map

| Directory | Contents |
| --- | --- |
| `cmd/a2ald/` | Daemon entry point, service installation, MCP wiring |
| `cmd/a2al/` | Command-line entry point and subcommands |
| `daemon/` | REST routes, MCP service, tunnel, fetch, ACL, rooms, chats, CAS |
| `dht/` | Kademlia DHT — STORE / FIND_VALUE / routing table |
| `host/` | Embedding interface: publish, resolve, connect, accept |
| `protocol/` | CBOR wire format, signed records, mailbox, topics |
| `identity/` | Delegation proofs, Ethereum / Paralism helpers |
| `crypto/` | KeyStore, Ed25519, AES-GCM, address derivation |
| `chat/` `group/` | Storage, append, sync, and objects for one-to-one chats and rooms |
| `natsense/` `signaling/` | NAT-type detection, UPnP; ICE signaling |
| `transport/` | UDP mux and dual-stack binding |

## Pull request conventions

- One PR does one thing;
- new behavior comes with tests;
- `go test -vet=off -count=1 ./...` must pass before you submit;
- follow the existing code style, and discuss before adding a new external dependency.

## Commit messages

Use conventional prefixes: `feat:`, `fix:`, `docs:`, `test:`, `chore:`. Keep the subject within 72 characters.

## Documentation and the address version registry

- Change implementation and docs separately: a behavior change comes with the matching update under `doc/`.
- To request a new address version byte (`0xA4`–`0xA7`), use the **Address Version Request** template; requirements and review criteria are in the [Address Version Registry](/docs/reference/address-version-registry).

## License

By contributing, you agree to license your contribution under the [Mozilla Public License 2.0](https://github.com/a2al/a2al/blob/main/LICENSE) and to grant The A2AL Authors additional rights under the CLA.

## Related pages

| For | Page |
| --- | --- |
| Protocol and wire format details | [Protocol Specification](/docs/spec/protocol) |
| Architecture and module layout | [Architecture Overview](/docs/integration/overview) |
| Requesting an address version byte | [Address Version Registry](/docs/reference/address-version-registry) |
