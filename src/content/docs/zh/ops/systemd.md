---
title: 用 systemd 部署
description: 在 Linux 上把 a2ald 作为常驻服务——deb/rpm 包安装，或系统级 / 用户级 systemd；端口、配置、日志与卸载。
audience: operator
---

需要「关掉终端、重启机器之后，别人仍能解析到你」，就让 `a2ald` 以服务方式常驻。Linux 上有三种方式，按环境选择一种即可。

| 方式 | 适合 | 需要 root |
| --- | --- | --- |
| deb / rpm 包 | 服务器、树莓派；一条命令装完 | 是 |
| 系统级 systemd | 自定义路径、自定义用户 | 是 |
| 用户级 systemd | 个人工作站、无 root 权限 | 否 |

## 方式一：包安装

发行版既提供二进制，也负责建用户、建目录、装 systemd unit 并启动服务。

```bash
# Debian / Ubuntu
sudo dpkg -i a2al_<版本>_amd64.deb

# CentOS / RHEL / Fedora
sudo rpm -i a2al-<版本>-1.x86_64.rpm
```

ARM64（树莓派、Graviton 等）把 `amd64` 换成 `arm64`（deb）或 `aarch64`（rpm）。安装包从 [GitHub Releases](https://github.com/a2al/a2al/releases) 获取。

安装后的路径：

| 内容 | 路径 |
| --- | --- |
| 配置 | `/opt/a2al/data/config.toml`（首次启动时生成） |
| 数据与密钥 | `/opt/a2al/data/` |
| 文件沙箱 | `/opt/a2al/files/` |
| 二进制 | `/opt/a2al/bin/`（并软链到 `/usr/local/bin/`） |

## 方式二：手动二进制 + 系统级 systemd

发行版包不可用或需要自定义时使用。

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

写入 unit 文件 `/etc/systemd/system/a2ald.service`：

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

## 方式三：用户级 systemd

个人工作站上不需要 root，登录后自动启动。数据目录使用默认的 `~/.config/a2al/`。

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

`ExecStart` 按 `which a2ald` 的实际路径调整。希望注销后仍然运行，需要开启 lingering：

```bash
loginctl enable-linger $USER
```

## 防火墙

数据面端口需要放行（UDP 承载 QUIC 直连与地址查询，TCP 承载 ICE 信令）：

```bash
# UFW（Ubuntu / Debian）
sudo ufw allow 4121/udp
sudo ufw allow 4121/tcp

# firewalld（CentOS / RHEL / Fedora）
sudo firewall-cmd --permanent --add-port=4121/udp
sudo firewall-cmd --permanent --add-port=4121/tcp
sudo firewall-cmd --reload
```

管理端口 `2121` 保持只监听本机，不要对外放行。

## 配置

运行中的服务不要边跑边改文件——先停、改、再起：

```bash
# 系统级
sudo systemctl stop a2ald
sudo -u a2al nano /opt/a2al/data/config.toml
sudo systemctl start a2ald

# 用户级
systemctl --user stop a2ald
nano ~/.config/a2al/config.toml
systemctl --user start a2ald
```

只做公共路由节点、不承载个人身份时，可以进一步收敛：

```toml
disable_upnp = true     # 服务器上没有 UPnP 路由器
auto_publish = false    # 不自动发布端点记录
log_format   = "json"   # 便于日志聚合
```

完整字段见[配置](/zh/docs/ops/config)。

## SELinux（仅 CentOS / RHEL）

```bash
sudo semanage fcontext -a -t var_t '/opt/a2al/data(/.*)?'
sudo restorecon -Rv /opt/a2al/data
# 若没有 semanage：
sudo dnf install -y policycoreutils-python-utils
```

## 日志与运维

```bash
# 系统级
sudo systemctl status a2ald
sudo journalctl -u a2ald -f

# 用户级
systemctl --user status a2ald
journalctl --user -u a2ald -f
```

## 卸载

```bash
# 包安装
sudo dpkg -r a2al       # Debian / Ubuntu
sudo rpm -e a2al        # CentOS / RHEL
# 数据与密钥保留在 /opt/a2al/data/；彻底清除：
sudo rm -rf /opt/a2al/data
sudo userdel a2al

# 手动安装
sudo systemctl disable --now a2ald
sudo rm /etc/systemd/system/a2ald.service
sudo systemctl daemon-reload
sudo rm -f /usr/local/bin/a2ald /usr/local/bin/a2al
sudo rm -rf /opt/a2al/bin
sudo rm -rf /opt/a2al/data   # 可选：会一并删除密钥与配置
sudo userdel a2al
```

macOS 与 Windows 使用内置命令 `a2ald service install|status|stop|start|uninstall`：macOS 写入 launchd 用户代理，Windows 提供系统服务或任务计划两种方式；见[快速开始](/zh/quickstart)与 [MCP 配置](/zh/docs/integration/mcp)。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 全部配置项 | [配置](/zh/docs/ops/config) |
| 在容器中运行 | [用 Docker 部署](/zh/docs/ops/docker) |
| 端口与访问控制建议 | [安全实践](/zh/docs/user/security-practices) |
