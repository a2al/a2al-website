---
title: Deploy with systemd
description: "Run a2ald as a resident service on Linux — installing a deb/rpm package, or setting up systemd system-wide or per user, with ports, configuration, logs and uninstalling."
audience: operator
---

When you need "close the terminal, reboot the machine, and people can still resolve me", make `a2ald` resident as a service. On Linux there are three routes; pick the one that matches your environment.

| Route | Best for | Needs root |
| --- | --- | --- |
| deb / rpm package | Servers, Raspberry Pi; one command and it is done | Yes |
| system-level systemd | Custom paths, custom users | Yes |
| per-user systemd | Personal workstations, no root | No |

## Route one: package install

The package provides both binaries and takes care of creating the user and directories, installing the systemd unit and starting the service.

```bash
# Debian / Ubuntu
sudo dpkg -i a2al_<version>_amd64.deb

# CentOS / RHEL / Fedora
sudo rpm -i a2al-<version>-1.x86_64.rpm
```

On ARM64 (Raspberry Pi, Graviton and the like), replace `amd64` with `arm64` (deb) or `aarch64` (rpm). Packages come from [GitHub Releases](https://github.com/a2al/a2al/releases).

Paths after installation:

| Contents | Path |
| --- | --- |
| Configuration | `/opt/a2al/data/config.toml` (created on first start) |
| Data and keys | `/opt/a2al/data/` |
| File sandbox | `/opt/a2al/files/` |
| Binaries | `/opt/a2al/bin/` (symlinked into `/usr/local/bin/`) |

## Route two: manual binaries with system-level systemd

Use this when no package is available for your distribution, or when you need custom paths.

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

Write the unit file `/etc/systemd/system/a2ald.service`:

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

## Route three: per-user systemd

On a personal workstation, no root is needed and the service starts when you log in. The data directory is the default `~/.config/a2al/`.

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

Adjust `ExecStart` to whatever `which a2ald` reports. To keep it running after you log out, enable lingering:

```bash
loginctl enable-linger $USER
```

## Firewall

The data-plane ports have to be open (UDP carries QUIC direct connections and address lookups, TCP carries ICE signalling):

```bash
# UFW (Ubuntu / Debian)
sudo ufw allow 4121/udp
sudo ufw allow 4121/tcp

# firewalld (CentOS / RHEL / Fedora)
sudo firewall-cmd --permanent --add-port=4121/udp
sudo firewall-cmd --permanent --add-port=4121/tcp
sudo firewall-cmd --reload
```

Leave the administrative port `2121` listening on the local machine only, and do not open it.

## Configuration

Do not edit files under a running service — stop, edit, start:

```bash
# system-wide
sudo systemctl stop a2ald
sudo -u a2al nano /opt/a2al/data/config.toml
sudo systemctl start a2ald

# per user
systemctl --user stop a2ald
nano ~/.config/a2al/config.toml
systemctl --user start a2ald
```

When the machine serves only as a public routing node and carries no personal identities, you can tighten it further:

```toml
disable_upnp = true     # no UPnP router on a server
auto_publish = false    # do not publish endpoint records automatically
log_format   = "json"   # easier log aggregation
```

The complete set of fields is in [Configuration](/docs/ops/config).

## SELinux (CentOS / RHEL only)

```bash
sudo semanage fcontext -a -t var_t '/opt/a2al/data(/.*)?'
sudo restorecon -Rv /opt/a2al/data
# without semanage:
sudo dnf install -y policycoreutils-python-utils
```

## Logs and operations

```bash
# system-wide
sudo systemctl status a2ald
sudo journalctl -u a2ald -f

# per user
systemctl --user status a2ald
journalctl --user -u a2ald -f
```

## Uninstalling

```bash
# package install
sudo dpkg -r a2al       # Debian / Ubuntu
sudo rpm -e a2al        # CentOS / RHEL
# data and keys remain in /opt/a2al/data/; to remove them entirely:
sudo rm -rf /opt/a2al/data
sudo userdel a2al

# manual install
sudo systemctl disable --now a2ald
sudo rm /etc/systemd/system/a2ald.service
sudo systemctl daemon-reload
sudo rm -f /usr/local/bin/a2ald /usr/local/bin/a2al
sudo rm -rf /opt/a2al/bin
sudo rm -rf /opt/a2al/data   # optional: this takes the keys and configuration with it
sudo userdel a2al
```

On macOS and Windows, use the built-in `a2ald service install|status|stop|start|uninstall`: on macOS it writes a launchd user agent, and on Windows it offers either a system service or a scheduled task; see [Quick Start](/quickstart) and [MCP Setup](/docs/integration/mcp).

## Related pages

| Goal | Page |
| --- | --- |
| Every configuration field | [Configuration](/docs/ops/config) |
| Running in a container | [Deploy with Docker](/docs/ops/docker) |
| Advice on ports and access control | [Security Practices](/docs/user/security-practices) |
