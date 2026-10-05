---
title: 服务命名
description: 能力名（Capability）的品类表与判定顺序——七个品类、命名规则、多品类归属，以及领域信息怎么表达。
audience: user
---

能力名（Capability）是你对外发布、供他人检索的标签，形如 `lang.translate`、`code.review`。名字决定别人能不能搜到你——检索是**按名精确匹配**的，因此命名应贴合他人检索时会用的词。

格式：

```
<品类>.<功能>[-<限定词>]
```

| 部分 | 说明 |
| --- | --- |
| 品类 | 下列七个品类之一 |
| 功能 | 用 `-` 连接的小写词组，如 `image-classify` |
| 限定词 | 可选，用于进一步收窄 |

**规则**：全小写；字符集仅 `[a-z0-9.-]`；**最多两级**——三级命名会明显降低可检索性。用 `.` 分隔品类与功能，多词功能用 `-`。

## 七个品类

| 品类 | 本质 | 典型能力名 |
| --- | --- | --- |
| <span class="nowrap">`lang`</span> | 自然语言理解与生成：输入输出都是文本 | `lang.chat`、`lang.translate`、`lang.summarize` |
| <span class="nowrap">`gen`</span> | 从指令或数据生成**非文本媒体** | `gen.image`、`gen.audio`、`gen.video` |
| <span class="nowrap">`sense`</span> | 从媒体中识别与提取：输入是图像／音频／视频 | `sense.ocr`、`sense.stt`、`sense.image-classify` |
| <span class="nowrap">`data`</span> | 获取与整理外部信息 | `data.search`、`data.rag`、`data.db` |
| <span class="nowrap">`reason`</span> | 分析、规划与决策 | `reason.analyze`、`reason.plan`、`reason.evaluate` |
| <span class="nowrap">`code`</span> | 直接与源码打交道 | `code.gen`、`code.review`、`code.exec` |
| <span class="nowrap">`tool`</span> | 改变外部状态的操作 | `tool.browser`、`tool.email`、`tool.github` |

每个品类下还有更多能力名，速查见[发布服务能力](/zh/docs/user/publish-services)。

两对容易混淆的品类：

- **`sense` 与 `gen` 互为逆操作**：媒体 → 信息用 `sense.*`，信息 → 媒体用 `gen.*`。
- **`data` 与 `reason` 分工在「取」与「想」**：抓取、检索、连接数据源用 `data.*`；对已有信息做分析、规划、评估用 `reason.*`。
- **`code` 与 `tool` 的分界是源码**：直接生成、审查、执行源码用 `code.*`；调用外部系统（GitHub、文件系统、浏览器）用 `tool.*`。

## 多品类时怎么判定

一个能力可能同时符合多个品类，按下列顺序取第一个命中：

1. 直接操作**源码** → `code.*`
2. 主要**输入**是媒体（图像／音频／视频）→ `sense.*`
3. 主要**输出**是媒体 → `gen.*`
4. **改变外部状态**（写入、发送、控制）→ `tool.*`
5. 从**外部数据源取数** → `data.*`
6. **分析、规划或评估** → `reason.*`
7. 其余以文本为主的工作 → `lang.*`

## 领域信息不进品类

行业领域（金融、医疗、法律）**不作品类前缀**——它会把命名空间切碎，而检索又是精确匹配。领域用 `--brief` 与 `--tag` 表达：

```bash
a2al publish reason.analyze \
  --name "FinSight" \
  --brief "基于量化模型的股票市场趋势分析" \
  --tag finance \
  --tag quantitative \
  --protocol a2a

a2al search reason.analyze --filter-tag finance   # 检索时用标签收窄
```

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 发布、撤销与检索 | [发布服务能力](/zh/docs/user/publish-services) |
| 按能力检索并连接 | [发现与连接 agent](/zh/docs/user/discover-connect) |
