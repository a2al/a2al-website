---
title: systemd での運用
description: "Linux で a2ald を常駐サービスとして動かします。deb／rpm パッケージでの導入、システム単位／ユーザー単位の systemd、ポート、設定、ログ、アンインストールまで。"
audience: operator
---

「ターミナルを閉じ、マシンを再起動しても、他の人が自分の AID を解決できる」ようにしたい場合は、`a2ald` をサービスとして常駐させます。Linux では三つの方法があり、環境に合うものを一つ選べば十分です。

| 方法 | 向いている環境 | root が必要か |
| --- | --- | --- |
| deb / rpm パッケージ | サーバー、Raspberry Pi。コマンド1つで完了 | 必要 |
| システム単位の systemd | 独自のパスやユーザーを使う場合 | 必要 |
| ユーザー単位の systemd | 個人のワークステーション、root 権限がない場合 | 不要 |

## 方法1：パッケージでの導入

ディストリビューションのパッケージはバイナリを提供するだけでなく、ユーザーとディレクトリの作成、systemd unit の設置、サービスの起動まで行います。

```bash
# Debian / Ubuntu
sudo dpkg -i a2al_<バージョン>_amd64.deb

# CentOS / RHEL / Fedora
sudo rpm -i a2al-<バージョン>-1.x86_64.rpm
```

ARM64（Raspberry Pi、Graviton など）では `amd64` を `arm64`（deb）または `aarch64`（rpm）に置き換えます。パッケージは [GitHub Releases](https://github.com/a2al/a2al/releases) から取得します。

導入後のパス：

| 内容 | パス |
| --- | --- |
| 設定 | `/opt/a2al/data/config.toml`（初回起動時に生成） |
| データと鍵 | `/opt/a2al/data/` |
| ファイルのサンドボックス | `/opt/a2al/files/` |
| バイナリ | `/opt/a2al/bin/`（`/usr/local/bin/` にシンボリックリンク） |

## 方法2：手動配置のバイナリ + システム単位の systemd

ディストリビューションのパッケージが使えない場合や、独自のパスを使いたい場合に選びます。

```bash
sudo mkdir -p /opt/a2al/bin
sudo cp a2ald a2al /opt/a2al/bin/
sudo chmod +x /opt/a2al/bin/a2ald /opt/a2al/bin/a2al
sudo ln -sf /opt/a2al/bin/a2ald /usr/local/bin/a2ald
sudo ln -sf /opt/a2al/bin/a2al  /usr/local/bin/a2al

sudo useradd -r -s /bin/false -M -d /opt/a2al a2al
sudo mkdir -p /opt/a2al/data /opt/a2al/files
sudo chown -R a2al:a2al /opt/a2al/data /opt/a2al/files
```

unit ファイル `/etc/systemd/system/a2ald.service` を書きます。

```ini
[Unit]
Description=A2AL Daemon
Documentation=https://a2al.org
After=network-online.target
Wants=network-online.target

[Service]
User=a2al
Group=a2al
ExecStart=/opt/a2al/bin/a2ald -data-dir /opt/a2al/data
Restart=on-failure
RestartSec=5
TimeoutStopSec=10

# Hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/a2al/data /opt/a2al/files

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now a2ald
```

## 方法3：ユーザー単位の systemd

個人のワークステーションでは root は不要で、ログイン後に自動で起動します。データディレクトリは既定の `~/.config/a2al/` です。

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/a2ald.service <<'EOF'
[Unit]
Description=A2AL Daemon
After=network.target

[Service]
ExecStart=/usr/local/bin/a2ald
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now a2ald
```

`ExecStart` は `which a2ald` が示す実際のパスに合わせてください。ログアウト後も動かし続けるには lingering を有効にします。

```bash
loginctl enable-linger $USER
```

## ファイアウォール

データ面のポートは開放が必要です（UDP が QUIC の直通接続とアドレス照会、TCP が ICE シグナリングを担います）。

```bash
# UFW（Ubuntu / Debian）
sudo ufw allow 4121/udp
sudo ufw allow 4121/tcp

# firewalld（CentOS / RHEL / Fedora）
sudo firewall-cmd --permanent --add-port=4121/udp
sudo firewall-cmd --permanent --add-port=4121/tcp
sudo firewall-cmd --reload
```

管理ポート `2121` は本機のみの待ち受けを保ち、外部に開放しないでください。

## 設定

動作中のサービスを横で編集しないでください。停止し、編集し、起動します。

```bash
# システム単位
sudo systemctl stop a2ald
sudo -u a2al nano /opt/a2al/data/config.toml
sudo systemctl start a2ald

# ユーザー単位
systemctl --user stop a2ald
nano ~/.config/a2al/config.toml
systemctl --user start a2ald
```

公共の経路ノードとしてのみ使い、個人のアイデンティティを載せない場合は、さらに絞り込めます。

```toml
disable_upnp = true     # サーバーに UPnP ルーターはない
auto_publish = false    # エンドポイント記録を自動公開しない
log_format   = "json"   # ログ集約が容易
```

項目の全体は[設定](/ja/docs/ops/config)にあります。

## SELinux（CentOS / RHEL のみ）

```bash
sudo semanage fcontext -a -t var_t '/opt/a2al/data(/.*)?'
sudo restorecon -Rv /opt/a2al/data
# semanage がない場合：
sudo dnf install -y policycoreutils-python-utils
```

## ログと運用

```bash
# システム単位
sudo systemctl status a2ald
sudo journalctl -u a2ald -f

# ユーザー単位
systemctl --user status a2ald
journalctl --user -u a2ald -f
```

## アンインストール

```bash
# パッケージでの導入
sudo dpkg -r a2al       # Debian / Ubuntu
sudo rpm -e a2al        # CentOS / RHEL
# データと鍵は /opt/a2al/data/ に残ります。完全に消す場合：
sudo rm -rf /opt/a2al/data
sudo userdel a2al

# 手動配置
sudo systemctl disable --now a2ald
sudo rm /etc/systemd/system/a2ald.service
sudo systemctl daemon-reload
sudo rm -f /usr/local/bin/a2ald /usr/local/bin/a2al
sudo rm -rf /opt/a2al/bin
sudo rm -rf /opt/a2al/data   # 任意：鍵と設定も一緒に削除されます
sudo userdel a2al
```

macOS と Windows では組み込みの `a2ald service install|status|stop|start|uninstall` を使います。macOS は launchd のユーザーエージェントを書き込み、Windows はシステムサービスとタスクスケジューラの2通りを提供します。詳しくは[クイックスタート](/ja/quickstart)と [MCP 設定](/ja/docs/integration/mcp)を参照してください。

## 関連ページ

| 目的 | ページ |
| --- | --- |
| 設定項目の全体 | [設定](/ja/docs/ops/config) |
| コンテナで動かす | [Docker での運用](/ja/docs/ops/docker) |
| ポートとアクセス制御の指針 | [セキュリティ実践](/ja/docs/user/security-practices) |
