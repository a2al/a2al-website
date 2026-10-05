---
title: Docker での運用
description: "コンテナで a2ald を動かします。必要なポートとボリューム、イメージのビルド例、ホストから CLI と MCP に接続するときの注意点、隔離の指針。"
audience: operator
---

`a2ald` をコンテナに入れる目的は主に二つです。1つ以上の AID を個人の環境から分離すること、そして1台のマシンで互いに独立した複数のノードを動かすことです。公式リポジトリはまだビルド済みイメージを提供していないため、以下では自分でビルドして動かす方法を示します。

## コンテナ内の三つの制約

| 制約 | 説明 |
| --- | --- |
| ポート | `4121/UDP` と `4121/TCP` は外部から到達できる必要があります（QUIC の直通接続と ICE シグナリング）。`2121` は既定でコンテナ内の `127.0.0.1` のみを待ち受けます |
| データディレクトリの独占 | 1つのデータディレクトリを同時に使える `a2ald` は1つだけです。コンテナを増やすならボリュームも増やし、同じデータディレクトリを共有しないでください |
| ヘッドレス運用 | コンテナにはブラウザがないため、起動時に `--no-open-browser` を付けます |

## イメージをビルドする

イメージに必要なのは配布バイナリと最小限のランタイムだけです。`<バージョン>` は具体的な番号（例：`0.3.3`）に置き換えるか、`latest` を指すようにします。

```dockerfile
FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL "https://github.com/a2al/a2al/releases/download/v<バージョン>/a2al_<バージョン>_linux_amd64.tar.gz" \
      | tar xz -C /usr/local/bin a2ald a2al \
 && useradd -r -s /bin/false -M -d /var/lib/a2al a2al

USER a2al
VOLUME /var/lib/a2al

# QUIC の直通接続 / アドレス照会（UDP）と ICE シグナリング（TCP）
EXPOSE 4121/udp 4121/tcp

ENTRYPOINT ["a2ald", "-data-dir", "/var/lib/a2al", "--no-open-browser"]
```

ARM64 のホストでは `linux_amd64` を `linux_arm64` に置き換えます。イメージ内で `npm install -g a2ald` を実行する方法もありますが、配布アーカイブを使うほうが小さく、起動も予測しやすくなります。

## 実行する

```bash
docker build -t a2al .

docker run -d --name a2ald \
  --restart unless-stopped \
  -p 4121:4121/udp -p 4121:4121/tcp \
  -v a2al-data:/var/lib/a2al \
  a2al
```

ログを見るには次のようにします。

```bash
docker logs -f a2ald
```

すでにホストで `a2ald` が動いている場合、コンテナ内のこれは**2つ目のノード**です。独自のデータディレクトリと AID を持ち、互いに影響しません。

## ホストから CLI と MCP に接続する

管理面は既定でコンテナ内の `127.0.0.1` のみを待ち受けるため、`-p 2121:2121` を付けても効きません。ホスト上の CLI、パネル、MCP クライアントからコンテナへ接続するには、管理面を明示的に開き、同時に token を設定します。

```bash
docker run -d --name a2ald \
  --restart unless-stopped \
  -p 4121:4121/udp -p 4121:4121/tcp \
  -p 127.0.0.1:2121:2121 \
  -v a2al-data:/var/lib/a2al \
  a2al \
  -data-dir /var/lib/a2al --no-open-browser \
  --api-addr 0.0.0.0:2121
```

そのうえでコンテナの `config.toml` に `api_token` を設定します。ポートマッピングによってアクセス元は「本機以外」になるため、**token のないリクエストは拒否されます**。ホスト側では次のように使います。

```bash
a2al --api http://127.0.0.1:2121 --token <token> status
```

MCP クライアントは HTTP 形式で書きます。

```json
{
  "mcpServers": {
    "a2al": {
      "url": "http://127.0.0.1:2121/mcp/",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

> **よくあるエラー**：管理面がまだ本機待ち受け（`127.0.0.1`）のままのとき、ホストから転送されたリクエストが `400 host header not allowed` を返すことがあります。これは本機由来の `Host` ヘッダ検証が働いているためで、ネットワークの障害ではありません。上記のとおり `0.0.0.0` で待ち受けさせ、`api_token` を設定すれば解消します。

ホスト上のエージェントにコンテナ内 daemon のアイデンティティを使わせる場合は、CLI / MCP をマッピングしたアドレスに向けます。逆方向は直接的にはかないません。コンテナ内のエージェントは、ホスト上で `127.0.0.1` にのみバインドされたサービスには到達できないため、そのサービスもコンテナから到達できるアドレスにバインドする必要があります。

## 隔離の指針

- **1コンテナに1データディレクトリ**：ボリュームを分けて複数ノードを動かし、それぞれ別の `--listen`（例：`:4122`）と `--api-addr` を割り当てます。
- **必要なディレクトリだけをマウント**：ボリュームにはデータディレクトリだけを置きます。ファイルオブジェクトが必要なときは `files_root` を別途マウントし、ホームディレクトリ全体をコンテナに見せないでください。
- **権限を下げて実行**：イメージ内では非 root ユーザーで動かします（上記の `useradd` / `USER` を参照）。
- **管理面を外部に出さない**：`2121` はホストの `127.0.0.1` にのみマッピングし、常に `api_token` を設定します。
- **ネットワークモード**：既定の bridge ネットワークでは通常 UPnP が使えないため、`disable_upnp = true` が妥当です。コンテナとホストの間の直通接続は、ポートマッピングが正しいかどうかに依存します。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 設定項目の全体 | [設定](/ja/docs/ops/config) |
| Linux でサービスとして常駐させる | [systemd での運用](/ja/docs/ops/systemd) |
| ポートとアクセス制御の指針 | [セキュリティ実践](/ja/docs/user/security-practices) |
| プライベート（セルフホスト）ネットワーク（`--bootstrap`） | [プライベート（セルフホスト）ネットワーク](/ja/docs/user/private-network) |
