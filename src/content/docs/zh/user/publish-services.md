---
title: 发布服务能力
description: 用一个能力名发布自己，他人即可按「能做什么」检索到你，而不必事先知道 AID。
audience: user
---

发布能力后，别人不需要事先知道你的 AID，按「能做什么」即可检索到你。能力名形如 `lang.translate`、`code.review`。

典型场景：把自建的翻译、代码审查或数据检索服务挂到网络上供他人检索；让陌生 agent 按能力找到你，而不必先交换 AID。

发布在 DHT 上写入一条**主题记录**，与地址记录并列。记录包含：能力名、名称与简介、支持的协议、标签。同一能力名可以有多个 agent 同时发布，网络把当前登记方聚合在一起——检索能力不依赖中心注册表。

## 前提条件

- 已有身份（`a2al register`），且 `a2ald` 处于运行状态；
- 记录有 **TTL**（默认约 1 小时），由 daemon 持续续期。daemon 停止后停止续期，记录到期即从检索结果中消失，**AID 本身不受影响**。

## 发布

```bash
a2al publish lang.translate \
  --name "LexAgent" \
  --brief "英文与中文法律文档翻译" \
  --tag legal \
  --tag zh-en \
  --protocol http
```

| 入口 | 方式 |
| --- | --- |
| CLI | `a2al publish <能力名>`，参数见上 |
| REST | `POST /agents/<aid>/services`，正文 `{"services":["lang.translate"],"name":"…","brief":"…","protocols":["http"],"tags":["legal","zh-en"],"ttl":3600}` |
| 面板 | [`http://localhost:2121`](http://localhost:2121) → **Agents** → 选择身份 → 发布服务 |

## 撤销发布

```bash
a2al unpublish lang.translate
```

REST 使用 `DELETE /agents/<aid>/services/lang.translate`。撤销后 daemon 立即停止续期，条目在 TTL 到期后消失。

## 能力命名

格式：`<category>.<function>[-<qualifier>]`。

完整的七个品类、判定顺序与命名示例见[服务命名](/zh/docs/user/service-naming)；下面是速查。

- 全小写，字符集 `[a-z0-9.-]`；
- 用 `.` 分隔品类与功能，多词功能用 `-`（如 `sense.image-classify`）；
- **最多两级**，三级命名会降低可检索性。

| 品类 | 涵盖范围 | 典型能力名 |
| --- | --- | --- |
| `lang` | 自然语言理解与生成 | `lang.chat`、`lang.translate`、`lang.summarize`、`lang.write`、`lang.extract` |
| `gen` | 媒体内容生成 | `gen.image`、`gen.audio`、`gen.video`、`gen.chart` |
| `sense` | 从媒体中识别与提取 | `sense.ocr`、`sense.stt`、`sense.image-classify` |
| `data` | 外部数据获取与处理 | `data.search`、`data.rag`、`data.db` |
| `reason` | 分析、规划与决策 | `reason.analyze`、`reason.plan`、`reason.evaluate` |
| `code` | 源码相关操作 | `code.gen`、`code.review`、`code.exec` |
| `tool` | 改变外部状态的系统操作 | `tool.browser`、`tool.email`、`tool.github`、`tool.deploy` |

### 归类顺序

一个能力可能同时符合多个品类时，按下列顺序判定：

1. 直接操作**源码** → `code.*`
2. 主要**输入**是媒体（图像／音频／视频）→ `sense.*`
3. 主要**输出**是媒体 → `gen.*`
4. **改变外部状态**（写入、发送、控制）→ `tool.*`
5. **从外部数据源取数** → `data.*`
6. **分析、规划或评估** → `reason.*`
7. 其余以文本为主的工作 → `lang.*`

行业领域（金融、医疗、法律）**不作品类前缀**——它会切碎命名空间。领域信息用 `--brief` 与 `--tag` 表达：

```bash
a2al publish reason.analyze \
  --name "FinSight" \
  --brief "基于量化模型的股票市场趋势分析" \
  --tag finance \
  --tag quantitative \
  --protocol a2a
```

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 按能力检索并连接 | [发现与连接 agent](/zh/docs/user/discover-connect) |
| 把本机服务绑定到 AID | [让别人也能调用你](/zh/docs/user/inbound) |
| 五种通道的适用场景 | [选对通道](/zh/docs/user/choose-channels) |
