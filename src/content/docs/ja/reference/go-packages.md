---
title: Go パッケージ
description: A2AL Go モジュールの公開インターフェースのリファレンス——host、dht、protocol、identity、crypto、config とデバッグ HTTP。
audience: developer
---

公開インターフェース：`host`、`dht`、`protocol`、`identity`、`crypto`。モジュールパスは `github.com/a2al/a2al` です。

daemon の REST・MCP と Python サイドカーについては [REST API](/ja/docs/reference/rest-api) を、概念については[アーキテクチャ概要](/ja/docs/integration/overview)を参照してください。

| 層 | パッケージ | 使う場面 |
| --- | --- | --- |
| ノードランタイム | `github.com/a2al/a2al/host` | DHT + QUIC、公開・解決・接続 |
| DHT のみ | `github.com/a2al/a2al/dht` | 転送層は自前で用意し、ルーティングと STORE/FIND だけが必要 |
| デーモン | `a2ald` | REST、Web UI、MCP。組み込む場合を除き `host` を import しない |

## `host.Host`

DHT ノード、UDP mux または独立した QUIC ソケット、NAT 反射（`natsense`）、ICE、任意の TURN をまとめたものです。

ワイルドカードの `ListenAddr` / `QUICListenAddr`（`:4121`、`0.0.0.0:port`）は**デュアルスタック**でバインドし、IPv4 を明示した場合は IPv4-only を維持します。`DisableIPv6` は `udp4` を強制します（ライブラリ限定のオプションであり、daemon の TOML キーではありません）。

### `host.Config`

| フィールド | 意味 |
| --- | --- |
| `KeyStore` | 必須。ちょうど 1 つの `Address`。 |
| `ListenAddr` | DHT の UDP バインド（既定 `":4121"`）。ホストを特定しない場合はデュアルスタック。 |
| `QUICListenAddr` | 空なら DHT とソケットを共有（mux）。非空なら QUIC を別途バインド。 |
| `PrivateKey` | QUIC / TLS 用の Ed25519 秘密鍵。未指定なら `EncryptedKeyStore.Ed25519PrivateKey` を使用。 |
| `MinObservedPeers` | 反射アドレスの確定に必要な、一致するピア数（既定 3）。 |
| `FallbackHost` | バインドも反射も確定しない場合に外部へ広告するアドレス。 |
| `DisableUPnP` | QUIC ポートの IGD マッピング（IPv4）をスキップ。 |
| `DisableIPv6` | IPv4-only を強制。 |
| `ICESignalURL` / `ICESignalURLs` | ICE WebSocket ハブ。`ICESignalURLs` が非空なら優先し、先頭のアドレスは `EndpointPayload.Signal` にも書き込みます。 |
| `ICESTUNURLs` | `stun:` アドレス。TURN を設定しない場合は空のままで公共 STUN を利用します。 |
| `ICETURNURLs` | 資格情報を内蔵する旧式の `turn:`。`TURNServers` の利用を推奨します。 |
| `TURNServers` | 外部 TURN：`URL`、`Username`、`Credential`、`CredentialType`（`static` / `hmac` / `rest_api`）。資格情報は ICE セッションごとに生成し、公開しません。 |
| `ICEPublishTurns` | 非推奨。新しいノードは DHT に `turns[]` を書き込みません。 |
| `DisableRelay` | true のとき、既定で TURN 中継を使いません。呼び出しごとに `DialOptions.DisableRelay` で切り替えられます。既定は false。 |
| `ICENetworkTypes` | ICE のネットワーク種別。既定は UDP4 + UDP6。 |
| `Logger` | `*slog.Logger`。既定は `slog.Default()`。 |

内部の DHT ノードの `RecordAuth` は、自己署名か有効な委任を要求します。

### ライフサイクル

1. `host.New(cfg)`
2. `h.Node().BootstrapAddrs(ctx, []net.Addr{…})`——シードは `ip:port`
3. 任意で `ObserveFromPeers`
4. `PublishEndpoint` / `Resolve` / `ConnectFromRecord` / `Accept`
5. `h.Close()`

### メソッド

| メソッド | 役割 |
| --- | --- |
| `PublishEndpoint` / `PublishEndpointForAgent` | 複数候補を持つ単一の `quic://` ペイロード（v4/v6、UPnP 有効時はマッピング結果を含む）に署名し、STORE します。 |
| `Resolve` | 反復クエリ → `*protocol.EndpointRecord`。 |
| `Connect` | 単一の UDP アドレスへ QUIC 接続を確立し、agent-route フレームを送信します。 |
| `ConnectFromRecord` / `ConnectFromRecordFor` | レコードの端点に対して Happy Eyeballs を実行し、直接接続が失敗してシグナリングアドレスがある場合は ICE にフォールバックします。`(conn, isRelayed, err)` を返し、中継が設定済みかつ無効で直接接続が失敗した場合は `ErrRelayRequired` を返します。 |
| `Accept` | 受信した QUIC 接続を受け付け、`*AgentConn` を返します。 |
| `QUICDialTargets` / `FirstQUICAddr` | レコードから順序付きの UDP ターゲットを得ます。 |
| `BuildEndpointPayload` | STORE せずに候補のみを生成します。 |
| `SymmetricNATReachabilityHint` | 対称 NAT を検出したときに非空になります（中継が必要な場合もあります）。 |
| `RegisterAgent` / `RegisterDelegatedAgent` / `UnregisterAgent` / `RegisteredAgents` | 同じリスナーに追加の AID を紐づけます。 |
| `SendMailbox` / `PollMailbox`（`ForAgent` 版を含む） | 暗号化した便箋。 |
| `RegisterTopic(s)` / `SearchTopic(s)`（`ForAgent` 版を含む） | 能力名によるランデブー。 |
| `StartDebugHTTP` / `DebugHTTPHandler` | 読み取り専用の JSON。 |
| `Close` | QUIC、mux、DHT、UPnP マッピングを停止します。 |

`AgentConn` は `quic.Connection` を埋め込み、`Local` / `Remote` の 2 つの AID を提供します。

### agent-route

TLS の後、クライアントはストリーム 0 に **4 バイトのマジック + 21 バイトの対象 AID**を書き込みます。

- **`a2r2`**（現行）：長さ接頭辞付きの制御メッセージを送り、その後双方がそのストリームを FIN します。データは以降のストリームで流れます。`host` はこの版を実装しています。
- **`a2r1`**：受信側では引き続き受け付けます（フレームのパースのみ）。

複数の agent が 1 つのリスナーを共有する場合、TLS SNI が二次的なヒントになります。

## `dht.Node`

| フィールド | 意味 |
| --- | --- |
| `Transport` | 必須。 |
| `Keystore` | 必須。1 つのアイデンティティ。 |
| `OnObservedAddr` | 反射アドレスのコールバック。 |
| `RecordAuth` | `VerifySignedRecord` の後に実行します。空なら権限チェックを行いません。 |

`BootstrapAddrs` は `ip:port` のみを受け付けます。`PublishMailboxRecord` / `PublishTopicRecord` は、それぞれ受信者またはトピックの NodeID にレコードを STORE します。

## アイデンティティ

| パッケージ | 内容 |
| --- | --- |
| `github.com/a2al/a2al` | `Address`、`NodeID`、`ParseAddress`、`NodeIDFromAddress` |
| `…/crypto` | `KeyStore`、`EncryptedKeyStore`、`AddressFromPublicKey`、`GenerateEd25519` |
| `…/identity` | `SignDelegation`、`VerifyDelegation`、Ethereum / Paralism の補助 |

## `protocol`

| 項目 | 役割 |
| --- | --- |
| `SignedRecord` | CBOR のワイヤ形式。任意で `Delegation` を含みます。 |
| `EndpointPayload` | `Endpoints`（`quic://host:port` または `quic://[v6]:port`）、`NatType`、`Signal`、`Signals`。`Turns` は旧レコードからのデコード時のみで、**新規公開時には書き込みません**。 |
| `SignEndpointRecord` / `SignEndpointRecordDelegated` | マスター鍵による署名と、操作鍵による署名。 |
| `ParseEndpointRecord` / `VerifySignedRecord` | 署名、TTL、権限を検証します。 |
| メールボックス | `RecTypeMailbox` `0x80`。X25519 + AES-GCM の補助。 |
| トピック | `RecTypeTopic` `0x10`。キーは `SHA-256("topic:" ‖ name)`。`DiscoverFilter`。 |

`timestamp` + `TTL` は現在時刻をカバーしている必要があります。

## `config`（daemon の TOML）

`Default()`、`Validate()`、`LoadFile` / `Save`、`ApplyEnv`。記述例はリポジトリの `doc/a2ald-config.example.toml`、フィールドの説明は[設定](/ja/docs/ops/config)を参照してください。

## デバッグ HTTP

ライブラリとして `Host` / `Node` を使う場合は、`dht.DebugHTTPAddr`（`127.0.0.1:2634`）にバインドすることを推奨します。daemon は管理アドレスの `/debug/` 配下で同じインターフェース群を公開します。

| パス | 提供元 |
| --- | --- |
| `/debug/identity`、`/debug/routing`、`/debug/store`、`/debug/stats` | `dht.Node` |
| `/debug/host` | `Host`：QUIC バインド、登録済み agent、NAT の概要 |

## `natsense`

`Sense()`：`TrustedUDP` / `TrustedUDPAll`（v4 と v6）、`InferNATType`、`InferV6Reach`。小規模なテストネットワークでは `MinAgreeing` を下げられます。

## テスト

```bash
go test -vet=off -count=1 ./...
```

`examples/` 配下の各ディレクトリは、それぞれ独自の `go.mod` と `replace` を持ちます。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 導入ガイドとサンプル | [Go SDK](/ja/docs/integration/go-sdk) |
| プロトコルとワイヤ形式 | [プロトコル仕様](/ja/docs/spec/protocol) |
