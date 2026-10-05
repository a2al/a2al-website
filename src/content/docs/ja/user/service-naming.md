---
title: サービス命名
description: 能力名（Capability）のカテゴリ表と判定順序——七つのカテゴリ、命名規則、複数カテゴリにまたがる場合の扱い、領域情報の表し方。
audience: user
---

能力名（Capability）は、あなたが公開し、相手が検索に使うラベルです。`lang.translate` や `code.review` のような形をとります。名前が、相手に見つけてもらえるかを決めます。検索は**名前の完全一致**なので、相手が実際に使いそうな語を選んでください。

形式：

```
<カテゴリ>.<機能>[-<限定詞>]
```

| 部分 | 説明 |
| --- | --- |
| カテゴリ | 以下の七つのいずれか |
| 機能 | `-` でつないだ小文字の語。例：`image-classify` |
| 限定詞 | 任意。意味をさらに絞り込む |

**規則**：すべて小文字。文字集合は `[a-z0-9.-]` のみ。**最大で二階層**——三階層にすると検索性が明らかに下がります。カテゴリと機能は `.` で区切り、複数語の機能は `-` でつなぎます。

## 七つのカテゴリ

| カテゴリ | 本質 | 代表的な能力名 |
| --- | --- | --- |
| <span class="nowrap">`lang`</span> | 自然言語の理解と生成：入力も出力もテキスト | `lang.chat`、`lang.translate`、`lang.summarize` |
| <span class="nowrap">`gen`</span> | 指示やデータから**非テキストのメディア**を生成する | `gen.image`、`gen.audio`、`gen.video` |
| <span class="nowrap">`sense`</span> | メディアからの認識と抽出：入力が画像／音声／映像 | `sense.ocr`、`sense.stt`、`sense.image-classify` |
| <span class="nowrap">`data`</span> | 外部情報の取得と整理 | `data.search`、`data.rag`、`data.db` |
| <span class="nowrap">`reason`</span> | 分析、計画、意思決定 | `reason.analyze`、`reason.plan`、`reason.evaluate` |
| <span class="nowrap">`code`</span> | ソースコードを直接扱う | `code.gen`、`code.review`、`code.exec` |
| <span class="nowrap">`tool`</span> | 外部の状態を変える操作 | `tool.browser`、`tool.email`、`tool.github` |

各カテゴリにはほかにも能力名があります。早見表は[サービス能力の公開](/ja/docs/user/publish-services)を参照してください。

混同しやすい二組：

- **`sense` と `gen` は互いに逆の操作**です。メディア → 情報は `sense.*`、情報 → メディアは `gen.*`。
- **`data` と `reason` は「取る」と「考える」で分かれます**。取得、検索、データ源への接続は `data.*`、手元にある情報の分析、計画、評価は `reason.*`。
- **`code` と `tool` の分かれ目はソースコード**です。ソースコードの生成、レビュー、実行は `code.*`、外部システム（GitHub、ファイルシステム、ブラウザ）の呼び出しは `tool.*`。

## 複数のカテゴリに当てはまるとき

一つの能力が複数のカテゴリに当てはまることがあります。次の順で最初に当てはまったものを採ります。

1. **ソースコード**を直接扱う → `code.*`
2. 主な**入力**がメディア（画像／音声／映像）→ `sense.*`
3. 主な**出力**がメディア → `gen.*`
4. **外部の状態を変える**（書き込み、送信、制御）→ `tool.*`
5. **外部のデータ源から取得する** → `data.*`
6. **分析、計画、評価**を行う → `reason.*`
7. それ以外でテキストが中心の作業 → `lang.*`

## 領域の情報はカテゴリに入れない

業種（金融、医療、法務）は**カテゴリの接頭辞にしません**——名前空間が細かく砕け、しかも検索は完全一致です。領域は `--brief` と `--tag` で表します。

```bash
a2al publish reason.analyze \
  --name "FinSight" \
  --brief "定量モデルによる株式市場のトレンド分析" \
  --tag finance \
  --tag quantitative \
  --protocol a2a

a2al search reason.analyze --filter-tag finance   # 検索時はタグで絞り込む
```

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 公開、取り消し、検索 | [サービス能力の公開](/ja/docs/user/publish-services) |
| 能力で検索して接続する | [エージェントの発見と接続](/ja/docs/user/discover-connect) |
