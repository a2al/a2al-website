---
title: 設定
description: "a2ald の設定項目のリファレンス。ネットワークとポート、管理 API と認証、鍵とファイル、ログ、ICE／TURN、自動公開と更新。どれが動的に変更でき、どれが再起動を要するかも示します。"
audience: operator
---

`a2ald` の設定はデータディレクトリの `config.toml` に集約されています。既定のデータディレクトリは、Windows が `%APPDATA%\a2al`、macOS が `~/Library/Application Support/a2al`、Linux が `~/.config/a2al` です。初回起動時にファイルがなければ、daemon が既定の設定を書き出します。

## 設定を変える三つの方法

| 方法 | 適用範囲 |
| --- | --- |
| `config.toml` を編集して再起動 | すべての項目。変更は確実に反映されます |
| `a2al config set <キー> <値>` または `PATCH /config` | 動的に変更できる項目のみ。応答の `restart_required` に、再起動が必要な残りのキーが並びます |
| コマンドライン引数（`--listen`、`--api-addr`、`--bootstrap`、`--fallback-host`、`--no-open-browser`、`-config`） | 一時的な上書き。優先度はファイルより上です |

## ネットワークとポート

| キー | 既定 | 説明 |
| --- | --- | --- |
| `listen_addr` | `:4121` | DHT と直通接続の UDP 待ち受けアドレス。ワイルドカード `:4121` はデュアルスタック（IPv4 + IPv6）、IPv4 アドレスを明示すると IPv4 のみになります。 |
| `quic_listen_addr` | 空 | 空のときは QUIC と DHT が同じ UDP ポートを共有し、指定すると QUIC が個別に待ち受けます。 |
| `bootstrap` | `[]` | シードノード。形式は `host:port`（multiaddr ではありません）。空なら公共ネットワークに参加し、空でなければ公共 DNS とビーコンを飛ばして指定したノードだけでネットワークを組みます。 |
| `min_observed_peers` | `3` | 反射アドレスを採用する前に、同じ結果を返す必要がある相手の数。 |
| `fallback_host` | 空 | 待ち受けアドレスも反射も明確でないときに外部へ公開するアドレス。 |
| `disable_upnp` | `false` | UPnP（IPv4 の IGD ポートマッピング）を省略します。クラウドのホストや UPnP のないルーターでは無効化して構いません。 |
| `bootstrap_node_ids` | なし | 任意。ブートストラップ先の NodeID が指定した一覧（16進数）にあることを要求します。 |

ポートの使用は **4121/UDP + 4121/TCP** です。UDP が QUIC の直通接続とアドレス照会を、TCP が内蔵の ICE シグナリングを担います。管理面は既定で `127.0.0.1:2121` のみを待ち受けます。

## 管理 API と認証

| キー | 既定 | 説明 |
| --- | --- | --- |
| `api_addr` | `127.0.0.1:2121` | パネル、管理 API、ローカルゲートウェイの待ち受けアドレス。本機での待ち受けのままで問題なく使えます。 |
| `api_token` | 空 | 空は開放アクセスを意味します（意図された既定です）。設定すると、本機以外からのアクセスに `Authorization: Bearer` が必要になります。 |
| `require_local_token` | `false` | `true` にすると本機からの呼び出しにも token が必要になります。1台のマシンを複数人で使う場合は有効化をおすすめします。 |
| `open_browser` | `true` | 起動時にパネルを自動で開きます。ヘッドレスやサービスとして動かす場合は無効化します（`--no-open-browser` でも可）。 |

管理面にはほかの防御もあります。本機由来のリクエストは `Host` ヘッダを検証して DNS リバインディングを遮断し、リクエスト本文の上限は 1 MiB です（`fetch` の応答は上限 4 MiB で、超えた分は `truncated` と記されます）。

## 鍵、データ、ファイル

| キー | 既定 | 説明 |
| --- | --- | --- |
| `key_dir` | 空 | 空のときはデータディレクトリ内の既定の鍵ディレクトリを使います。 |
| `files_root` | 空 | daemon に渡すファイルオブジェクトのバイト列（`CAS`、`group_object_put` の `body_base64`）のサンドボックスディレクトリ。空のときはパスで登録するオブジェクトに追加のディレクトリ制限はありません。 |

データディレクトリの権限は `0700`、設定ファイルは `0600` で、鍵は `<データディレクトリ>/keys/` に置かれます。1つのデータディレクトリを同時に使える `a2ald` は1つだけです（排他ロック）。

## ログ

| キー | 既定 | 説明 |
| --- | --- | --- |
| `log_format` | `text` | `text` または `json`。後者はログ集約に適します。 |
| `log_level` | `info` | `debug` / `info` / `warn` / `error`。 |
| `log_debug_components` | なし | 必要に応じてコンポーネント単位でデバッグを有効にします。例：`["ice", "punch", "natsense"]`。 |

## 公開と更新

| キー | 既定 | 説明 |
| --- | --- | --- |
| `auto_publish` | `true` | アドレス記録の更新を続け、あなたの AID を知る人が解決できるようにします。無効にすると手動で `a2al agents publish` が必要です。 |
| `learned_path_first` | `true` | 前回使えた UDP 経路を優先して再利用し、失敗したら ICE に切り替えます。 |
| `[update] auto` | `true` | バックグラウンドで更新を確認します。手動の `a2ald update` も可能です（パネルに更新の入口はありません）。 |

## ICE と TURN

| キー | 説明 |
| --- | --- |
| `ice_signal_url` / `ice_signal_urls` | ICE シグナリング（WebSocket）のアドレス。`ice_signal_urls` が空でなければそちらを優先します。 |
| `ice_stun_urls` | `stun:` アドレス。TURN を設定せず空にすると公共 STUN を使います。 |
| `signal_listen_addr` | 内蔵の ICE シグナリング hub の TCP 待ち受け。空なら `listen_addr` から同じポートを導出し、`off` で無効化します。 |
| `disable_relay` | `true` のとき、既定で TURN 中継を使いません。呼び出し単位でも指定できます。 |
| `[[turn_servers]]` | 外部の TURN サーバー。フィールドは `url`、`username`、`credential`、`credential_type`（`static` / `hmac` / `rest_api`）。資格情報は外部へ公開されません。 |

直通接続と ICE がほとんどのネットワーク構成を覆います。**双方が対称 NAT の内側にある場合**に限り、TURN を自前で設定する必要があります。A2AL は中継を設けず、中継は暗号化されたトラフィックだけを転送します。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| ポートの取捨とアクセス制御の指針 | [セキュリティ実践](/ja/docs/user/security-practices) |
| Linux で常駐させる | [systemd での運用](/ja/docs/ops/systemd) |
| コンテナで動かす | [Docker での運用](/ja/docs/ops/docker) |
| REST の設定インターフェースの全体 | [REST API](/ja/docs/reference/rest-api) |
