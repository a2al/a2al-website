---
title: Go SDK
description: Go プログラムに A2AL を直接組み込みます。host と dht の二つの階層、設定項目、ライフサイクル、agent-route フレーム、デバッグ用インターフェース。
audience: developer
---

```go
import "github.com/a2al/a2al"
```

ほとんどの Go プログラムの入口は `github.com/a2al/a2al/host` です。より細かな制御が必要な場合は、`dht`、`protocol`、`identity`、`crypto` を使えます。**発行・解決・接続だけを行うプログラムは `host` に依存し、`daemon` は import しないでください。**

## 統合の階層

| 階層 | パッケージ | 使う場面 |
| --- | --- | --- |
| ノードランタイム | `github.com/a2al/a2al/host` | DHT + QUIC（単一ポートまたは分離ポート）、相互 TLS、発行／解決／接続のヘルパー。多くのアプリケーションに推奨です。 |
| DHT のみ | `github.com/a2al/a2al/dht` | 独自のトランスポートを持ち、経路制御、ブートストラップ、反復的な `FIND_VALUE` / `STORE` だけを使います。 |
| デーモン | `a2ald` | Go 以外からの統合。ローカルの REST + MCP + パネル。 |

## `host.Host`

`Host` は下位の層を一つのランタイムにまとめます。DHT ノード、QUIC トランスポート、NAT の検出、UPnP のマッピングです。

### `host.Config`

| フィールド | 意味 |
| --- | --- |
| `KeyStore` | 必須。`Address` をちょうど1つ含む必要があります。 |
| `ListenAddr` | DHT の UDP バインド（既定 `":4121"`）。ワイルドカードならデュアルスタック、IPv4 / IPv6 のホストを明示すればそのアドレスファミリでバインドします。 |
| `QUICListenAddr` | 空なら QUIC は DHT と同じ UDP ソケットを共有し、指定すれば個別にバインドします。 |
| `PrivateKey` | QUIC / TLS に使う Ed25519 秘密鍵。空の場合は `EncryptedKeyStore.Ed25519PrivateKey` を使います。 |
| `MinObservedPeers` | 反射アドレスを採用する前に、何台の相手が一致する必要があるか（既定 3）。 |
| `FallbackHost` | バインドアドレスも反射も明確でないときに外部へ公開するアドレス。 |
| `DisableUPnP` | QUIC ポートの IGD マッピング（IPv4）を省略します。 |
| `DisableIPv6` | IPv4 のみに固定します（ライブラリのオプションで、daemon の TOML キーではありません）。 |
| `ICESignalURL` / `ICESignalURLs` | ICE の WebSocket hub。`ICESignalURLs` が空でなければそちらを優先し、先頭のアドレスは `EndpointPayload.Signal` にも書き込まれます。 |
| `ICESTUNURLs` | `stun:` アドレス。TURN を設定しないまま空にすると公共 STUN を使います。 |
| `ICETURNURLs` | 資格情報を埋め込む旧形式の `turn:`。新しいコードは `TURNServers` を優先してください。 |
| `TURNServers` | 外部 TURN：`URL`、`Username`、`Credential`、`CredentialType`（`static` / `hmac` / `rest_api`）。資格情報は ICE セッションごとに生成し、DHT へは公開しません。 |
| `DisableRelay` | 真のとき、既定で TURN 中継を使いません。呼び出し単位では `DialOptions.DisableRelay` が同じ役割を果たします。既定は false（TURN を設定していれば中継を許可）。 |
| `ICENetworkTypes` | ICE が使うネットワーク種別。既定は UDP4 + UDP6。 |
| `Logger` | `*slog.Logger`。既定は `slog.Default()`。 |

内部の DHT ノードの `RecordAuth` は、自己署名か有効な委任を要求します。

### ライフサイクル

```go
// 1. 作成して起動
h, err := host.New(cfg)

// 2. ネットワークへ参加（シードは ip:port）
h.Node().BootstrapAddrs(ctx, bootstrapAddrs)

// 3. 使う
h.PublishEndpoint(ctx, seq, ttl)
record, err := h.Resolve(ctx, remoteAddr)
conn, err := h.ConnectFromRecord(ctx, remoteAddr, record)

// 4. 受信接続を受け入れる
agentConn, err := h.Accept(ctx)

// 5. 終了
h.Close()
```

### 主なメソッド

| メソッド | 役割 |
| --- | --- |
| `PublishEndpoint` / `PublishEndpointForAgent` | 複数候補のエンドポイントペイロード（反射、UPnP、fallback）を組み立て、署名して DHT に保存します。 |
| `Resolve` | 反復的な問い合わせを行い、`*protocol.EndpointRecord` を返します。 |
| `Connect` | 単一の UDP アドレスへ QUIC 接続を確立し、agent-route フレームを送ります。 |
| `ConnectFromRecord` / `ConnectFromRecordFor` | 記録中の全エンドポイントに対して Happy Eyeballs を行い、直通が失敗してシグナリングアドレスがあれば ICE に切り替えます。`(conn, isRelayed, err)` を返し、中継が設定されているのに無効化されていて直通も失敗した場合は `ErrRelayRequired` を返します。 |
| `Accept` | 受信 QUIC を受け入れ、`*AgentConn` を返します。 |
| `QUICDialTargets` / `FirstQUICAddr` | 記録から順序付きの UDP ターゲットを得ます。 |
| `BuildEndpointPayload` | 候補の生成のみを行い、DHT へは書き込みません。 |
| `SymmetricNATReachabilityHint` | 対称 NAT を検出したときに非空になります（中継が必要な場合があります）。 |
| `RegisterAgent` / `RegisterDelegatedAgent` / `UnregisterAgent` / `RegisteredAgents` | 同じリスナーにさらに AID を載せます。 |
| `SendMailbox` / `PollMailbox`（`…ForAgent` あり） | 暗号化されたノート。 |
| `RegisterTopic(s)` / `SearchTopic(s)`（`…ForAgent` あり） | 能力名のランデブー。 |
| `StartDebugHTTP` / `DebugHTTPHandler` | 読み取り専用の JSON。 |

`AgentConn` は `quic.Connection` を埋め込み、`Local` と `Remote` の2つの AID を提供します。

### agent-route フレーム

TLS のあと、クライアントはストリーム0 に **4 バイトのマジック + 21 バイトの宛先 AID** を書き込みます。

- **`a2r2`**（現行）：長さ前置きの制御メッセージで、そのあと双方がそのストリームを FIN し、データは後続のストリームを通ります。`host` はこの形式を実装しています。
- **`a2r1`**：受信側では引き続き受け付けます（フレーム自体のみを解析します）。

複数のエージェントが同じリスナーを共有する場合、TLS SNI が二次的な手掛かりになります。

## `dht.Node`

| フィールド | 意味 |
| --- | --- |
| `Transport` | 必須。 |
| `Keystore` | 必須。1つのアイデンティティ。 |
| `OnObservedAddr` | 反射アドレスのコールバック。 |
| `RecordAuth` | `VerifySignedRecord` の後に実行されます。空なら権限の確認を行いません。 |

`BootstrapAddrs` は `ip:port` のみを受け付けます。`PublishMailboxRecord` / `PublishTopicRecord` は、それぞれ受信者またはトピックの NodeID の下に記録を書き込みます。

## アイデンティティと署名

| パッケージ | 内容 |
| --- | --- |
| `github.com/a2al/a2al` | `Address`、`NodeID`、`ParseAddress`、`NodeIDFromAddress` |
| `…/crypto` | `KeyStore`、`EncryptedKeyStore`、`AddressFromPublicKey`、`GenerateEd25519` |
| `…/identity` | `SignDelegation`、`VerifyDelegation`、Ethereum / Paralism のヘルパー |

## `protocol`

| 項目 | 役割 |
| --- | --- |
| `SignedRecord` | ワイヤ形式の CBOR。任意で `Delegation` を伴います。 |
| `EndpointPayload` | `Endpoints`（`quic://host:port` または `quic://[v6]:port`）、`NatType`、`Signal`、`Signals`。`Turns` は旧記録のデコードにのみ対応し、**新しい公開では書き込みません**。 |
| `SignEndpointRecord` / `SignEndpointRecordDelegated` | マスターキーによる署名と、操作用ユーザー鍵による署名。 |
| `ParseEndpointRecord` / `VerifySignedRecord` | 署名、TTL、権限（`RecordAuth`）を検証します。 |
| メールボックス | `RecTypeMailbox` `0x80`。X25519 + AES-GCM のヘルパー。 |
| トピック | `RecTypeTopic` `0x10`。鍵は `SHA-256("topic:" ‖ name)`。`DiscoverFilter`。 |

`timestamp` と `TTL` は現在時刻を覆っている必要があります。

## `config` とデバッグ用インターフェース

`config` パッケージは daemon の TOML を扱います。`Default()`、`Validate()`、`LoadFile` / `Save`、`ApplyEnv` です。例はリポジトリの `doc/a2ald-config.example.toml` にあります。

デバッグ用 HTTP は `dht.DebugHTTPAddr`（`127.0.0.1:2634`）にバインドするのがおすすめです。daemon は管理アドレスの `/debug/` 以下に同じ一式を公開します。

| パス | 取得元 |
| --- | --- |
| `/debug/identity`、`/debug/routing`、`/debug/store`、`/debug/stats` | `dht.Node` |
| `/debug/host` | `Host`：QUIC のバインド、登録済みエージェント、NAT の要約 |

## テスト

```bash
go test -vet=off -count=1 ./...
```

`examples/` はそれぞれ独自の `go.mod` を持ち、`replace` でモジュールのルートを指しています。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| エクスポートされるシンボルの全体 | [Go パッケージ](/ja/docs/reference/go-packages) |
| アーキテクチャとモジュールの分割 | [アーキテクチャ概要](/ja/docs/integration/overview) |
| プロトコルとワイヤ形式 | [プロトコル仕様](/ja/docs/spec/protocol) |
