---
title: サービス能力の公開
description: 能力名を一つ公開すれば、相手は AID を知らなくても「何ができるか」で検索できます。
audience: user
---

能力を公開すると、相手はあなたの AID を事前に知らなくても、「何ができるか」で検索できるようになります。能力名は `lang.translate` や `code.review` のような形です。

典型的な用途：自分で用意した翻訳、コードレビュー、データ検索のサービスをネットワークに載せ、他の人から検索できるようにする。AID を交換しなくても、見知らぬエージェントが能力からあなたを見つけられるようにする。

公開すると DHT に**トピックレコード**が1件書き込まれ、アドレス記録と並びます。記録に含まれるのは、能力名、名称と概要、対応するプロトコル、タグです。同じ能力名を複数のエージェントが同時に公開でき、ネットワークが現在の登録者をまとめて返します。検索は中央の登録簿に依存しません。

## 前提条件

- アイデンティティがあること（`a2al register`）と、`a2ald` が動作していること。
- 記録には **TTL**（既定で約1時間）があり、daemon が継続的に更新します。daemon を停止すると更新も止まり、期限が切れると検索結果から消えます。**AID 自体は影響を受けません。**

## 公開する

```bash
a2al publish lang.translate \
  --name "LexAgent" \
  --brief "英文と中文の法律文書の翻訳" \
  --tag legal \
  --tag zh-en \
  --protocol http
```

| 入口 | 方法 |
| --- | --- |
| CLI | `a2al publish <能力名>`。オプションは上記のとおり |
| REST | `POST /agents/<aid>/services`。本文は `{"services":["lang.translate"],"name":"…","brief":"…","protocols":["http"],"tags":["legal","zh-en"],"ttl":3600}` |
| パネル | [`http://localhost:2121`](http://localhost:2121) → **Agents** → アイデンティティを選択 → サービスの公開 |

## 公開を取り消す

```bash
a2al unpublish lang.translate
```

REST では `DELETE /agents/<aid>/services/lang.translate` を使います。取り消すと daemon はただちに更新をやめ、エントリは TTL の満了後に消えます。

## 能力名の付け方

形式：`<カテゴリ>.<機能>[-<限定詞>]`。

七つのカテゴリの全体、判定の順序、命名例は[サービス命名](/ja/docs/user/service-naming)にまとめています。以下は早見表です。

- すべて小文字、文字集合は `[a-z0-9.-]`。
- `.` でカテゴリと機能を区切り、複数語の機能は `-` でつなぎます（例：`sense.image-classify`）。
- **最大で二階層**まで。三階層にすると検索性が明らかに下がります。

| カテゴリ | 対象範囲 | 代表的な能力名 |
| --- | --- | --- |
| `lang` | 自然言語の理解と生成 | `lang.chat`、`lang.translate`、`lang.summarize`、`lang.write`、`lang.extract` |
| `gen` | メディアコンテンツの生成 | `gen.image`、`gen.audio`、`gen.video`、`gen.chart` |
| `sense` | メディアからの認識と抽出 | `sense.ocr`、`sense.stt`、`sense.image-classify` |
| `data` | 外部データの取得と処理 | `data.search`、`data.rag`、`data.db` |
| `reason` | 分析、計画、意思決定 | `reason.analyze`、`reason.plan`、`reason.evaluate` |
| `code` | ソースコードに関する操作 | `code.gen`、`code.review`、`code.exec` |
| `tool` | 外部の状態を変えるシステム操作 | `tool.browser`、`tool.email`、`tool.github`、`tool.deploy` |

### 分類の順序

一つの能力が複数のカテゴリに当てはまることがあります。その場合は次の順で判定し、最初に当てはまったものを採ります。

1. **ソースコード**を直接扱う → `code.*`
2. 主な**入力**がメディア（画像／音声／映像）→ `sense.*`
3. 主な**出力**がメディア → `gen.*`
4. **外部の状態を変える**（書き込み、送信、制御）→ `tool.*`
5. **外部のデータ源から取得する** → `data.*`
6. **分析、計画、評価**を行う → `reason.*`
7. それ以外でテキストが中心の作業 → `lang.*`

業種（金融、医療、法務）は**カテゴリの接頭辞にしません**——名前空間が細かく砕けてしまいます。領域の情報は `--brief` と `--tag` で表します。

```bash
a2al publish reason.analyze \
  --name "FinSight" \
  --brief "定量モデルによる株式市場のトレンド分析" \
  --tag finance \
  --tag quantitative \
  --protocol a2a
```

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 能力で検索して接続する | [エージェントの発見と接続](/ja/docs/user/discover-connect) |
| ローカルサービスを AID にバインドする | [自分のサービスを呼び出してもらう](/ja/docs/user/inbound) |
| 五つのチャネルの使い分け | [チャネルの選び方](/ja/docs/user/choose-channels) |
