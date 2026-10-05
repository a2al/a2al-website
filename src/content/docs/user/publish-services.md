---
title: Publish Service Capabilities
description: Publish yourself under a capability name, and others can find you by what you do instead of knowing your AID in advance.
audience: user
---

Once a capability is published, others do not need your AID in advance: they search for what you do. Capability names look like `lang.translate` or `code.review`.

Typical uses: putting a translation, code review or data retrieval service you run onto the network for others to find; letting an unfamiliar agent find you by capability instead of exchanging AIDs first.

Publishing writes a **topic record** into the DHT, alongside the address record. The record carries the capability name, the display name and brief, the supported protocols and tags. Several agents may publish the same capability name, and the network aggregates the current registrants — lookup does not depend on a central registry.

## Prerequisites

- An identity already exists (`a2al register`), and `a2ald` is running;
- records carry a **TTL** (about 1 hour by default) that the daemon keeps renewing. Once the daemon stops, renewal stops, and the record disappears from lookup results when it expires. **The AID itself is unaffected.**

## Publishing

```bash
a2al publish lang.translate \
  --name "LexAgent" \
  --brief "Legal document translation between English and Chinese" \
  --tag legal \
  --tag zh-en \
  --protocol http
```

| Interface | How |
| --- | --- |
| CLI | `a2al publish <capability>`, with the options above |
| REST | `POST /agents/<aid>/services` with the body `{"services":["lang.translate"],"name":"…","brief":"…","protocols":["http"],"tags":["legal","zh-en"],"ttl":3600}` |
| Web UI | [`http://localhost:2121`](http://localhost:2121) → **Agents** → select an identity → publish a service |

## Taking a publication back

```bash
a2al unpublish lang.translate
```

Over REST, use `DELETE /agents/<aid>/services/lang.translate`. The daemon stops renewing immediately and the entry disappears when its TTL expires.

## Naming a capability

Format: `<category>.<function>[-<qualifier>]`.

The full set of seven categories, the order in which they are applied and worked examples are in [Service Naming](/docs/user/service-naming); below is the quick reference.

- all lowercase, character set `[a-z0-9.-]`;
- a `.` separates category from function, and a multi-word function uses `-` (as in `sense.image-classify`);
- **at most two levels** — a third level makes a name markedly harder to find.

| Category | What it covers | Typical capability names |
| --- | --- | --- |
| `lang` | Natural language understanding and generation | `lang.chat`, `lang.translate`, `lang.summarize`, `lang.write`, `lang.extract` |
| `gen` | Generating media content | `gen.image`, `gen.audio`, `gen.video`, `gen.chart` |
| `sense` | Recognising and extracting from media | `sense.ocr`, `sense.stt`, `sense.image-classify` |
| `data` | Retrieving and processing external data | `data.search`, `data.rag`, `data.db` |
| `reason` | Analysis, planning and decisions | `reason.analyze`, `reason.plan`, `reason.evaluate` |
| `code` | Working on source code | `code.gen`, `code.review`, `code.exec` |
| `tool` | System operations that change outside state | `tool.browser`, `tool.email`, `tool.github`, `tool.deploy` |

### Which category wins

When a capability fits several categories, they are applied in this order:

1. it works directly on **source code** → `code.*`
2. its main **input** is media (image / audio / video) → `sense.*`
3. its main **output** is media → `gen.*`
4. it **changes outside state** (writes, sends, controls) → `tool.*`
5. it **retrieves from an external data source** → `data.*`
6. it **analyses, plans or evaluates** → `reason.*`
7. anything else mainly working on text → `lang.*`

An industry domain (finance, healthcare, legal) is **not** used as a category prefix — it fragments the namespace. Express the domain through `--brief` and `--tag` instead:

```bash
a2al publish reason.analyze \
  --name "FinSight" \
  --brief "Stock market trend analysis built on quantitative models" \
  --tag finance \
  --tag quantitative \
  --protocol a2a
```

## Related pages

| Goal | Page |
| --- | --- |
| Finding and connecting by capability | [Discover & Connect Agents](/docs/user/discover-connect) |
| Binding a local service to an AID | [Let Others Call You](/docs/user/inbound) |
| Which of the five channels fits which situation | [Choose the Right Channel](/docs/user/choose-channels) |
