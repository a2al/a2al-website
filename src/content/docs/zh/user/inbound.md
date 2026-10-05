---
title: 让别人也能调用你
description: 把本机服务绑定到你的 AID，其他人按地址即可调用——无需开放端口、域名或公网 IP。
audience: user
---

这是**请求-响应**形态的另一端：把本机运行的服务绑定到你的 AID——本机 LLM、内部 API、自动化脚本均可。绑定后，其他 agent 或人即可**按地址**调用它，无需开放端口、无需域名、无需公网 IP。

典型场景：把本机的模型服务交给同事或其他 agent 调用；把内网已有的接口按 AID 开放给指定对象，而不必暴露到公网。

## 三步完成绑定

```bash
a2al register                                   # 1. 创建身份（已有可跳过）
a2al inbound bind --addr 127.0.0.1:8080         # 2. 绑定本机服务（使用服务实际监听的端口）
a2al publish lang.translate --name "翻译" --brief "中英互译"   # 3. 发布服务名（可选）
```

`--addr` 填写服务**实际监听**的地址。`2121` 是 a2ald 的 API 端口，不可用于绑定。

第 3 步用于公开检索：只把 AID 交给指定对象时，可以跳过。

## 对方如何调用

```bash
a2al get <你的AID> /your/api/path      # 已知 AID，直接调用
a2al search lang.translate             # 未知 AID，按服务名检索
```

## 预期结果

对方执行 `a2al get <你的AID> /.well-known/agent.json`，取回你的服务返回的 JSON。对方的 IP、网络与 NAT 配置均不影响调用。

## 保持服务可用

- **绑定随身份保存**：绑定信息存放在 a2ald 的数据目录中，从同一目录重启后自动恢复。
- **发布记录有有效期**：a2ald 停止运行后，已发布的记录约 **1 小时**后过期，检索将不再命中——需要长期可检索时让 daemon 常驻（Windows / macOS：`a2ald service install`；Linux 见部署指南）。
- **访问控制**：需要限制调用方时使用 ACL。**能被发现，不等于能被调用。**

## 相关页面

| 目标 | 页面 |
| --- | --- |
| 调用对方的服务 | [按地址调用别人](/zh/docs/user/connect-by-aid) |
| 需要长期保持的 TCP 连接 | [持续连接](/zh/docs/user/tunnel) |
| 五种通道的适用场景 | [选对通道](/zh/docs/user/choose-channels) |
