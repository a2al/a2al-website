---
title: 贡献指南
description: 参与 A2AL 的代码、文档与地址版本注册表——提交前的约定、测试、提交信息与许可。
audience: developer
---

A2AL 的实现、文档与地址版本注册表都在同一个开源仓库中维护。下面是从改一行文档到提交一次特性改动的约定。

## 开始之前

- **较大的工作先开 issue。** 先对齐方向可以避免重复投入；bug 修复与小改进可以直接提 PR。
- **所有贡献者都需签署贡献者许可协议（CLA）。** 首次提 PR 时机器人会自动提示，按提示签署即可。

## 开发环境

要求 Go 1.24+。

```bash
git clone https://github.com/a2al/a2al
cd a2al
go test -vet=off -count=1 ./...
```

构建两个二进制：

```bash
go build ./cmd/a2ald   # 守护进程
go build ./cmd/a2al    # 命令行
```

测试套件覆盖 DHT、协议、身份、host 与 daemon 各层。`-vet=off` 是因为部分生成代码会触发 vet；`-count=1` 关闭测试缓存。需要真实网络的用例使用本机回环即可。

```bash
go test -vet=off -count=1 -run TestConnPool ./daemon/...   # 单包单用例
```

`examples/` 目录有自己的 `go.mod` 与 `replace` 指向模块根，进入各子目录 `go run .` 即可运行。

## 代码地图

| 目录 | 内容 |
| --- | --- |
| `cmd/a2ald/` | 守护进程入口、服务安装、MCP 接入 |
| `cmd/a2al/` | 命令行入口与各子命令 |
| `daemon/` | REST 路由、MCP 服务、隧道、fetch、ACL、房间、对话、CAS |
| `dht/` | Kademlia DHT——STORE / FIND_VALUE / 路由表 |
| `host/` | 对外嵌入接口：发布、解析、连接、接收 |
| `protocol/` | 线格式 CBOR、签名记录、邮箱、主题 |
| `identity/` | 委托证明、Ethereum / Paralism 辅助 |
| `crypto/` | KeyStore、Ed25519、AES-GCM、地址派生 |
| `chat/` `group/` | 一对一对话与房间的存储、追加、同步、对象 |
| `natsense/` `signaling/` | NAT 类型探测、UPnP；ICE 信令 |
| `transport/` | UDP mux 与双栈绑定 |

## 提 PR 的约定

- 一个 PR 只做一件事；
- 新行为需要带测试；
- 提交前 `go test -vet=off -count=1 ./...` 必须通过；
- 沿用现有代码风格；引入新的外部依赖前先讨论。

## 提交信息

使用约定式前缀：`feat:`、`fix:`、`docs:`、`test:`、`chore:`；标题不超过 72 个字符。

## 文档与地址版本注册表

- 实现与文档分开改：涉及行为的改动同步更新 `doc/` 下的对应文档。
- 申请新的地址版本字节（`0xA4`–`0xA7`）走 **Address Version Request** 模板；要求与评审标准见[地址版本注册表](/zh/docs/reference/address-version-registry)。

## 许可

贡献即表示同意以 [Mozilla Public License 2.0](https://github.com/a2al/a2al/blob/main/LICENSE) 授权你的贡献，并按 CLA 授予 The A2AL Authors 额外权利。

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 协议与线格式细节 | [协议规范](/zh/docs/spec/protocol) |
| 架构与模块划分 | [架构概览](/zh/docs/integration/overview) |
| 地址版本字节的申请流程 | [地址版本注册表](/zh/docs/reference/address-version-registry) |
