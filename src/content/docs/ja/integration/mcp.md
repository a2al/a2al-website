---
title: MCP 設定
description: a2ald を Claude Code、VS Code、Cursor などの MCP ホストに接続します。コマンド1つで導入し、2つの実行モードを使い分け、ログインをまたいで常駐させる方法もまとめます。
audience: developer
---

`a2ald` 自体が MCP サーバーです。アイデンティティ、発見、呼び出し、トンネル、ノート、イベント、さらに1対1の会話とルーム（`chat_*` / `group_*`）までをツールとして公開します。ホスト側に適応コードは要りません。

## 最短の手順

```bash
npx -y a2ald mcp add       # または：a2ald mcp add
```

これにより、daemon がなければ起動し、認識したホストに MCP サーバーを登録します。そのあと**ホストを再読み込み**し、`a2al_*` ツールが現れることを確認すれば作業を始められます。`a2al doctor` は任意で、「どの daemon と話しているのか疑わしい」ときにだけ必要です。

`mcp add` がホストを認識できない場合は何も書き込まず、自分で配置するためのエントリを出力します。まず `a2ald mcp print` を実行し、以下の断片と照らし合わせてください。

## 2つの実行モード

| モード | クライアントの接続方法 | 向いている場面 |
| --- | --- | --- |
| **常駐 daemon**（既定） | `"url": "http://127.0.0.1:2121/mcp/"` | 協業、CLI、パネル、複数のホストで1つの daemon を共有する場合 |
| **stdio** | `"command": "a2ald", "args": ["--mcp-stdio"]` | プロセスの起動しかできないホスト、CI。既存の daemon があればそこへ代理接続します |

**stdio のコスト**（どこにも daemon が動いていない場合）：DHT への新規参加、**REST API なし**（つまり CLI とパネルもなし）、1つのデータディレクトリに1プロセス、セッションの終了とともに公開も停止します。これらを受け入れられる場合に使ってください。

**stdio のスマート代理**：`a2ald` がすでに動作していれば、`a2ald --mcp-stdio` は MCP をそこへ代理します。コールドスタートもロックの衝突もありません。動作していない場合、このプロセスがノードそのものになります。手元の利用は1分未満で可能になり、見つけてもらう／相手を見つけるには1〜2分かかります。隣接ノード数の待機は不要です。

> **データディレクトリのロック**：1つのデータディレクトリを同時に使える `a2ald` は1つだけです。誤って2つ目を起動するとロックエラーになります。2つ目の**ノード**が必要なのは別の話で、`--data-dir`、`--api-addr`、`--listen` を変え、CLI / MCP を新しいポートに向けてください。

## a2ald のインストール

| 方法 | コマンド |
| --- | --- |
| npm（推奨、Go 不要） | `npm install -g a2ald` |
| npx（インストール不要） | MCP 設定で `npx` をそのまま使い、初回利用時に取得します |
| 配布バイナリ | [GitHub Releases](https://github.com/a2al/a2al/releases) から `a2al_<バージョン>_<プラットフォーム>.tar.gz` / `.zip` を取得し、`a2ald` を PATH に置きます |
| Python サイドカー | `pip install a2al`（プラットフォーム別バイナリを同梱） |

## ホストごとの設定

手作業での配置が必要なのは、`a2ald mcp add` がお使いのホストに対応していない場合だけです。HTTP を優先してください。stdio も同様に有効です（daemon があればそこへ代理します）。

`mcp add` が対応しているホスト：Claude Code、VS Code、Cursor、Claude Desktop、Windsurf、OpenClaw、Hermes、DeepSeek Harness。

| ホスト | 方法 |
| --- | --- |
| **Claude Code** | `claude mcp add --scope user --transport http a2al http://127.0.0.1:2121/mcp/` |
| **VS Code** | `code --add-mcp "{\"name\":\"a2al\",\"type\":\"http\",\"url\":\"http://127.0.0.1:2121/mcp/\"}"` |
| **Cursor** | プロジェクト直下の `.cursor/mcp.json`、または全体の `~/.cursor/mcp.json` を編集し、`{"mcpServers":{"a2al":{"url":"http://127.0.0.1:2121/mcp/"}}}` を書き込みます |
| **Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json`（macOS）または `%APPDATA%\Claude\claude_desktop_config.json`（Windows）を編集し、`command: "a2ald"` / `args: ["--mcp-stdio"]` を使います |
| **Windsurf** | `~/.codeium/windsurf/mcp_config.json` を編集します。キー名は `serverUrl` です |
| **Hermes（NousResearch）** | `hermes mcp add --url http://127.0.0.1:2121/mcp/ a2al`、または `~/.hermes/config.yaml` の `mcp_servers.a2al.url` に書きます |
| **OpenClaw** | `skills/a2al/SKILL.md` をワークスペースの skills ディレクトリにコピーし、`openclaw mcp add a2al --url http://127.0.0.1:2121/mcp/ --transport streamable-http` |
| **DeepSeek Harness** | add コマンドはありません。`$DSH_HOME/cordis.patch.yml` に `@deepseek-ai/dsh-mcp-client` の設定を挿入し、`dsh web` を再起動します |

HTTP と stdio の一般的な形は次のとおりです。

```json
{
  "mcpServers": {
    "a2al": { "url": "http://127.0.0.1:2121/mcp/" }
  }
}
```

```json
{
  "mcpServers": {
    "a2al": {
      "command": "npx",
      "args": ["a2ald", "--mcp-stdio"]
    }
  }
}
```

`a2ald` が PATH にない場合は、`"command": "a2ald"` を絶対パスに置き換えます。macOS / Linux なら `/usr/local/bin/a2ald`、Windows なら `C:\Users\<you>\AppData\Roaming\npm\a2ald.cmd` です。

## ログインをまたいで常駐させる

`a2ald mcp add` が起動する daemon は現在のセッションの分だけです。**サービス**として導入するかどうかは別の判断で、プロセスが停止すると公開済みの記録は TTL（既定で1時間）の後に失効します。

```bash
# Windows / macOS
a2ald service install
a2ald service status|stop|start|uninstall

# Linux
systemctl --user enable --now a2ald     # 「systemd での運用」を参照
```

Linux の systemd とコンテナの方法は、[systemd での運用](/ja/docs/ops/systemd)と [Docker での運用](/ja/docs/ops/docker)にあります。

## よくある質問

**ツールが現れない** —— ホストを再読み込みしたか、`a2ald mcp add` が本当に設定を書き込んだかを確認してください（認識できないホストには書き込みません）。`a2ald mcp print` でエントリを出力し、自分で配置します。

**起動直後に `a2al_resolve` が失敗する** —— 起動直後は手元の利用が1分未満で可能になり、見つけてもらう／相手を見つけるには1〜2分かかります。すでに動作していれば待つ必要はありません（初回接続は10秒未満、以後は約10〜100 ms）。隣接ノードの数は現在の視界を示すにすぎず、`network_ready` も「他の人があなたを見つけられる」証拠ではありません。

**公開すればずっと到達可能か** —— そうではありません。エンドポイント記録には TTL（既定で1時間）があり、`a2ald` の動作中は自動で更新されます。プロセスが止まれば更新も止まり、記録の失効後は到達できません。長期の到達性が必要なら daemon を常駐させてください。

**1台のマシンで2つの daemon を動かせるか** —— 同じデータディレクトリでは動きません（排他ロック）。独立した2つ目のノードが必要な場合は、データディレクトリとポートを変えます。`a2al --api http://127.0.0.1:<ポート>`、MCP は新しいポートの `/mcp/` を指します。

**ポート 2121 が使われている** —— `config.toml` の `api_addr` を変更し、MCP の URL と CLI の `--api` も合わせて更新します。2つ目のノードでは `--listen` も必要です。

## 利用できるツール

| グループ | ツール |
| --- | --- |
| `a2al_*` | アイデンティティの生成、登録、公開、解決、検索、呼び出し、トンネル、ノート、イベント、状態、`a2al_agent_probe` |
| `chat_*` | `request` / `accept` / `refuse` / `remove` / `block` / `send` / `read` / `mark_read` / `contacts` |
| `group_*` | `create` / `list` / `invite` / `join` / `append` / `read` / `head` / `members` / `mark_read` / `retract` / `get_link` / `object_*` / `sync` |

MCP は ACL、リモート管理、アドレス帳、プロフィールのインターフェースを提供しません。これらは CLI か REST を使います。引数の一覧は [REST API · MCP ツール](/ja/docs/reference/rest-api)にあります。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 接続の準備を AI アシスタントに任せる | [AI アシスタントに任せる](/ja/docs/user/ai-assistant) |
| REST / Python での統合 | [REST API クイックスタート](/ja/docs/integration/rest)｜[Python サイドカー](/ja/docs/integration/python) |
| コマンドと引数の全体 | [REST API](/ja/docs/reference/rest-api) |
