---
title: Service Naming
description: The category table and decision order for capability names — seven categories, naming rules, how to place a capability that fits several of them, and how to express a domain.
audience: user
---

A capability name is the label you publish and others search for; it looks like `lang.translate` or `code.review`. The name decides whether people find you — lookup is an **exact match on the name** — so it should use the words a searcher would actually use.

Format:

```
<category>.<function>[-<qualifier>]
```

| Part | Notes |
| --- | --- |
| Category | One of the seven below |
| Function | Lowercase words joined with `-`, as in `image-classify` |
| Qualifier | Optional, to narrow the meaning further |

**Rules**: all lowercase; character set limited to `[a-z0-9.-]`; **at most two levels** — a third level clearly reduces how findable a name is. Use `.` between category and function, and `-` inside a multi-word function.

## The seven categories

| Category | In essence | Typical capability names |
| --- | --- | --- |
| <span class="nowrap">`lang`</span> | Language understanding and generation: text in, text out | `lang.chat`, `lang.translate`, `lang.summarize` |
| <span class="nowrap">`gen`</span> | Generating **non-text media** from instructions or data | `gen.image`, `gen.audio`, `gen.video` |
| <span class="nowrap">`sense`</span> | Recognising and extracting from media: image / audio / video in | `sense.ocr`, `sense.stt`, `sense.image-classify` |
| <span class="nowrap">`data`</span> | Retrieving and organising external information | `data.search`, `data.rag`, `data.db` |
| <span class="nowrap">`reason`</span> | Analysis, planning and decisions | `reason.analyze`, `reason.plan`, `reason.evaluate` |
| <span class="nowrap">`code`</span> | Working directly with source code | `code.gen`, `code.review`, `code.exec` |
| <span class="nowrap">`tool`</span> | Operations that change outside state | `tool.browser`, `tool.email`, `tool.github` |

Each category has more capability names than these; for the quick reference, see [Publish Service Capabilities](/docs/user/publish-services).

Three pairs that are easy to confuse:

- **`sense` and `gen` are inverses**: media → information is `sense.*`, information → media is `gen.*`.
- **`data` and `reason` divide between fetching and thinking**: crawling, searching and connecting to a data source is `data.*`; analysing, planning or evaluating information you already have is `reason.*`.
- **`code` and `tool` divide at source code**: generating, reviewing or executing source code directly is `code.*`; calling an external system (GitHub, the filesystem, a browser) is `tool.*`.

## When several categories fit

A capability may fit more than one category; the first match in this order decides:

1. it works directly on **source code** → `code.*`
2. its main **input** is media (image / audio / video) → `sense.*`
3. its main **output** is media → `gen.*`
4. it **changes outside state** (writes, sends, controls) → `tool.*`
5. it **retrieves from an external data source** → `data.*`
6. it **analyses, plans or evaluates** → `reason.*`
7. anything else mainly working on text → `lang.*`

## Domains stay out of the category

An industry domain (finance, healthcare, legal) is **not** used as a category prefix — it fragments the namespace, and lookup is an exact match. Express the domain with `--brief` and `--tag`:

```bash
a2al publish reason.analyze \
  --name "FinSight" \
  --brief "Stock market trend analysis built on quantitative models" \
  --tag finance \
  --tag quantitative \
  --protocol a2a

a2al search reason.analyze --filter-tag finance   # narrow the search with a tag
```

## Related pages

| Goal | Page |
| --- | --- |
| Publishing, taking back and looking up | [Publish Service Capabilities](/docs/user/publish-services) |
| Finding and connecting by capability | [Discover & Connect Agents](/docs/user/discover-connect) |
