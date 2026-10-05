---
title: コントリビュートガイド
description: A2AL へのコード・ドキュメント・アドレスバージョン登録表の貢献——提出前の約束事、テスト、コミットメッセージ、ライセンス。
audience: developer
---

A2AL の実装、ドキュメント、アドレスバージョン登録表は、いずれも同じオープンソースリポジトリで管理しています。ここでは、ドキュメントの 1 行の修正から機能追加のプルリクエストまで、その進め方をまとめます。

## はじめる前に

- **規模の大きい作業は、まず Issue を立ててください。** 先に方向性を揃えておくと、手戻りを避けられます。バグ修正や小さな改善は、そのまま PR を出して構いません。
- **すべてのコントリビューターはコントリビューターライセンス契約（CLA）に署名する必要があります。** 初回の PR でボットが案内しますので、表示に従って署名してください。

## 開発環境

Go 1.24 以上が必要です。

```bash
git clone https://github.com/a2al/a2al
cd a2al
go test -vet=off -count=1 ./...
```

2 つのバイナリをビルドします。

```bash
go build ./cmd/a2ald   # daemon
go build ./cmd/a2al    # コマンドライン
```

テストスイートは DHT、プロトコル、アイデンティティ、host、daemon の各層をカバーしています。`-vet=off` は一部の生成コードが vet に引っかかるため、`-count=1` はテストキャッシュを無効にするためです。実ネットワークを要するケースも、ローカルのループバックで問題なく動作します。

```bash
go test -vet=off -count=1 -run TestConnPool ./daemon/...   # 単一パッケージの単一ケース
```

`examples/` 配下の各ディレクトリは独自の `go.mod` と、モジュールルートを指す `replace` を持っています。各ディレクトリで `go run .` を実行できます。

## コードマップ

| ディレクトリ | 内容 |
| --- | --- |
| `cmd/a2ald/` | daemon のエントリポイント、サービス登録、MCP 連携 |
| `cmd/a2al/` | コマンドラインのエントリポイントと各サブコマンド |
| `daemon/` | REST ルート、MCP サービス、トンネル、fetch、ACL、ルーム、対話、CAS |
| `dht/` | Kademlia DHT——STORE / FIND_VALUE / ルーティングテーブル |
| `host/` | 外部公開の組み込み向けインターフェース——公開・解決・接続・受信 |
| `protocol/` | CBOR のワイヤ形式、署名付きレコード、メールボックス、トピック |
| `identity/` | 委任証明、Ethereum / Paralism の補助 |
| `crypto/` | KeyStore、Ed25519、AES-GCM、アドレス導出 |
| `chat/` `group/` | 一対一の対話とルームの保存・追記・同期・オブジェクト |
| `natsense/` `signaling/` | NAT 種別の検出、UPnP、ICE シグナリング |
| `transport/` | UDP mux とデュアルスタックのバインディング |

## PR の約束事

- 1 つの PR は 1 つのことを行う。
- 新しい挙動にはテストを添える。
- 提出前に `go test -vet=off -count=1 ./...` が通っていること。
- 既存のコードスタイルに従い、新しい外部依存を導入する前に相談する。

## コミットメッセージ

`feat:`、`fix:`、`docs:`、`test:`、`chore:` といった規約ベースの接頭辞を使います。件名は 72 文字以内に収めてください。

## ドキュメントとアドレスバージョン登録表

- 実装とドキュメントは別々に変更します。挙動に関わる変更は、`doc/` 配下の該当ドキュメントも合わせて更新してください。
- 新しいアドレスバージョンバイト（`0xA4`〜`0xA7`）の申請は **Address Version Request** テンプレートを使います。要件と審査基準は[アドレスバージョン登録表](/ja/docs/reference/address-version-registry)にあります。

## ライセンス

貢献する時点で、あなたの貢献を [Mozilla Public License 2.0](https://github.com/a2al/a2al/blob/main/LICENSE) の下でライセンスすること、および CLA に基づき The A2AL Authors に追加の権利を付与することに同意したものとみなします。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| プロトコルとワイヤ形式の詳細 | [プロトコル仕様](/ja/docs/spec/protocol) |
| アーキテクチャとモジュール分割 | [アーキテクチャ概要](/ja/docs/integration/overview) |
| アドレスバージョンバイトの申請手順 | [アドレスバージョン登録表](/ja/docs/reference/address-version-registry) |
