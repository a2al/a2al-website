---
title: エージェントの発見と接続
description: 二つの発見経路——既知の AID の解決と、能力による検索——と用途別の接続の選び方。身元の検証はハンドシェイク内で完結し、ポートマッピングは不要です。
audience: user
---

相手を見つける経路は二つあります。**AID が分かっている場合は直接解決し**、分からない場合は**能力で検索します**。AID が手に入ったら、用途に応じて接続方法を選びます。

典型的な用途：相手の名刺にある AID しか手元にないときは、まず解決してから呼び出す。「コードレビュー」のような能力が必要だと分かっているときは、先に検索し、結果から適したエージェントを選ぶ。

## 既知の AID を解決する

```bash
a2al resolve <相手のAID>      # 現在のアドレス記録を解決する
a2al info <相手のAID>         # プロフィールを確認する
```

REST では `POST /resolve/{aid}`（アドレス記録）、`GET /resolve/{aid}/records?type=0` です。返る内容には現在のエンドポイント、`nat_type`、シーケンス番号、TTL が含まれます。

```json
{
  "aid": "A06aE78750B7f0a5975a9f455C98087902a4Ab15ca",
  "endpoints": ["quic://203.0.113.7:4122"],
  "nat_type": 1,
  "seq": 7,
  "ttl": 3600
}
```

## 能力で検索する

相手が[サービス能力を公開](/ja/docs/user/publish-services)していれば、AID を知らなくても能力名で検索できます。

```bash
a2al search lang.translate                      # 能力名で検索する
a2al search reason.analyze --filter-tag finance # タグで絞り込む
a2al search code.review --filter-protocol mcp   # プロトコルで絞り込む
```

REST では `POST /discover`、本文は `{"services":["lang.translate"],"filter":{"tags":["legal"],"protocols":["http"]}}` です。返る各レコードには能力名、AID、名称、概要、プロトコル、タグが含まれます。

| フィルタ | 意味 |
| --- | --- |
| `tags` | AND 条件。挙げたタグをすべて持つエージェントだけを返します |
| `protocols` | AND 条件。挙げたプロトコルをすべて支えるエージェントだけを返します |

同じ能力名に複数のエージェントが対応することがあり、選ぶのは呼び出す側です。検索結果そのものは、何らかの推奨を意味しません。

## 接続の方法

AID が手に入ったら用途で選びます。チャネルごとのトレードオフは[チャネルの選び方](/ja/docs/user/choose-channels)にまとめています。

| 用途 | 方法 |
| --- | --- |
| 相手の HTTP / API を呼び出す | `a2al get <AID> <path>`、`a2al post`、`a2al_fetch`、または `http://127.0.0.1:2121/aid/{AID}/…` |
| 1回の TCP セッション | `a2al connect <AID>`（ローカルのトンネルポートを返し、その接続の終了とともに閉じます） |
| 長期に保つ TCP 接続 | `a2al tunnel open <AID> --local-port N` |
| 相手がオフラインになりうるときのメッセージ | `a2al note send`、`a2al chat` |

`connect` と `tunnel open` はどちらもローカルのポートを返します。アプリケーションは通常の TCP ソケットとしてそのポートに接続してください。

## 接続はどのように確立するか

1. AID を現在のアドレス記録へ解決する。
2. すべての候補エンドポイントへ同時に接続を試みる。
3. 双方が自分の Ed25519 鍵から導いた証明書で**相互 TLS** を完了する——身元の検証はハンドシェイクの内側で完結し、第三者に依存しません。
4. 直通がいずれも失敗し、アドレス記録にシグナリング用のアドレスがある場合は、WebSocket 上の ICE に切り替えます。

NAT 越えは `a2ald` が自動的に処理します（相手側反射、UPnP、ICE による穴あけ）。家庭用ルーター、企業の NAT、クラウドのホストでも、通常はポートマッピングも VPN も不要です。**双方が対称 NAT の内側にある**少数の組み合わせでは、自前の TURN サーバーの設定が必要です。A2AL は中継を設けておらず、資格情報は手元に留まり外部へ公開されません。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 能力名で自分を検索可能にする | [サービス能力の公開](/ja/docs/user/publish-services) |
| 相手の HTTP サービスを呼び出す | [アドレスで相手を呼び出す](/ja/docs/user/connect-by-aid) |
| 五つのチャネルの使い分け | [チャネルの選び方](/ja/docs/user/choose-channels) |
