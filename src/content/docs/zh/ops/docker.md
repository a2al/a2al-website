---
title: 用 Docker 部署
description: 在容器中运行 a2ald——端口与卷的要求、镜像构建示例、从宿主接入 CLI 与 MCP 时的常见问题，以及隔离建议。
audience: operator
---

把 `a2ald` 放进容器，主要目的有两个：把一个或多个 AID 与个人环境隔离；在一台机器上跑多个彼此独立的节点。官方仓库暂未提供预构建镜像，下面给出自行构建与运行的做法。

## 容器内的三个约束

| 约束 | 说明 |
| --- | --- |
| 端口 | `4121/UDP` 与 `4121/TCP` 必须能从外部访问（QUIC 直连与 ICE 信令）；`2121` 默认只监听容器内的 `127.0.0.1` |
| 数据目录独占 | 一个数据目录同时只能由一个 `a2ald` 进程使用。多个容器 = 多个卷，不要共享同一个数据目录 |
| 无头运行 | 容器里没有浏览器，启动时加 `--no-open-browser` |

## 构建镜像

镜像只包含发行版二进制与最小运行时。把 `<版本>` 换成一个具体版本号（例如 `0.3.3`），或改指向 `latest`：

```dockerfile
FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/* \
 && curl -fsSL "https://github.com/a2al/a2al/releases/download/v<版本>/a2al_<版本>_linux_amd64.tar.gz" \
      | tar xz -C /usr/local/bin a2ald a2al \
 && useradd -r -s /bin/false -M -d /var/lib/a2al a2al

USER a2al
VOLUME /var/lib/a2al

# QUIC 直连 / 地址查询（UDP）与 ICE 信令（TCP）
EXPOSE 4121/udp 4121/tcp

ENTRYPOINT ["a2ald", "-data-dir", "/var/lib/a2al", "--no-open-browser"]
```

ARM64 主机把 `linux_amd64` 换成 `linux_arm64`。也可以先把 `npm install -g a2ald` 装到镜像里，但直接用发行版压缩包体积更小、启动更可预测。

## 运行

```bash
docker build -t a2al .

docker run -d --name a2ald \
  --restart unless-stopped \
  -p 4121:4121/udp -p 4121:4121/tcp \
  -v a2al-data:/var/lib/a2al \
  a2al
```

看日志：

```bash
docker logs -f a2ald
```

如果宿主机上已经有一个 `a2ald`，容器里的这个就是**第二个节点**——它有自己的数据目录与 AID，互不影响。

## 从宿主接入 CLI 与 MCP

管理面默认只监听容器内的 `127.0.0.1`，映射 `-p 2121:2121` 不会生效。要让宿主上的 CLI、面板或 MCP 客户端连进容器，需要显式放开管理面，并同时设置 token：

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

然后在容器的 `config.toml` 里设置 `api_token`。端口映射把来源变成「非本机」，此时**没有 token 的请求会被拒绝**。宿主侧使用：

```bash
a2al --api http://127.0.0.1:2121 --token <token> status
```

MCP 客户端写 HTTP 形态即可：

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

> **常见报错**：管理面仍是本机监听（`127.0.0.1`）时，从宿主转发进来的请求可能返回 `400 host header not allowed`——这是本机来源的 `Host` 头校验在起作用，不是网络故障。按上面的方式改为监听 `0.0.0.0` 并设置 `api_token` 即可。

宿主上的 agent 要使用容器内 daemon 的身份时，把 CLI/MCP 指向映射出来的地址即可；反过来，容器里的 agent 无法直接访问宿主上只绑定 `127.0.0.1` 的服务——需要把宿主服务也绑定到可从容器访问的地址。

## 隔离建议

- **一容器一数据目录**：用不同卷跑多个节点，分别绑定不同 `--listen`（如 `:4122`）与 `--api-addr` 端口。
- **只挂所需目录**：卷里只有数据目录；需要文件对象时再单独挂 `files_root`，不要让容器看见整个家目录。
- **降权运行**：镜像里以非 root 用户运行（见上面的 `useradd` / `USER`）。
- **管理面不对外**：`2121` 只映射到宿主 `127.0.0.1`，并始终设置 `api_token`。
- **网络模式**：默认 bridge 网络下，UPnP 通常不可用，可设 `disable_upnp = true`；容器与宿主之间的直连依赖端口映射是否正确。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 全部配置项 | [配置](/zh/docs/ops/config) |
| 在 Linux 上以服务方式常驻 | [用 systemd 部署](/zh/docs/ops/systemd) |
| 端口与访问控制建议 | [安全实践](/zh/docs/user/security-practices) |
| 私有（自托管）网络（`--bootstrap`） | [私有（自托管）网络](/zh/docs/user/private-network) |
