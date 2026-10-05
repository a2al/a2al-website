import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://a2al.org',
  integrations: [
    sitemap(),
    tailwind({
      // Apply Tailwind base styles, but let Starlight manage its own styles in /docs
      applyBaseStyles: false,
    }),
    starlight({
      title: 'A2AL Docs',
      description: 'Documentation for A2AL — the decentralized networking protocol for AI agents.',
      // Non-root locales live in `src/content/docs/<locale>/` and are served
      // under `/<locale>/docs/...`; the default locale stays at `/docs/...`.
      locales: {
        root: { label: 'English', lang: 'en' },
        zh: { label: '中文', lang: 'zh-CN' },
        ja: { label: '日本語', lang: 'ja' },
      },
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/a2al/a2al' },
      ],
      customCss: ['./src/styles/starlight.css'],
      components: {
        // Renders the `stage:` frontmatter as a visible badge next to the title.
        PageTitle: './src/components/starlight/PageTitle.astro',
      },
      sidebar: [
        {
          label: 'Get started',
          translations: { 'zh-CN': '开始', ja: 'はじめに' },
          items: [
            {
              label: 'Getting Started',
              translations: { 'zh-CN': '开始使用', ja: 'はじめかた' },
              slug: 'docs/user/getting-started',
            },
            {
              label: 'Web UI',
              translations: { 'zh-CN': '本机面板（Web UI）', ja: 'ローカルパネル（Web UI）' },
              slug: 'docs/user/web-ui',
            },
            {
              label: 'Connect by AID',
              translations: { 'zh-CN': '按地址调用别人', ja: 'アドレスで相手を呼び出す' },
              slug: 'docs/user/connect-by-aid',
            },
            {
              label: 'Inbound',
              translations: { 'zh-CN': '让别人也能调用你', ja: '自分のサービスを呼び出してもらう' },
              slug: 'docs/user/inbound',
            },
            {
              label: 'Messaging & Collaboration',
              translations: { 'zh-CN': '基于消息的通讯和协作', ja: 'メッセージによる通信と協業' },
              slug: 'docs/user/messaging-collaboration',
            },
            {
              label: 'Publishing & Visibility',
              translations: { 'zh-CN': '发布与可见性', ja: '公開と可視性' },
              slug: 'docs/user/publishing-visibility',
            },
            {
              label: 'Security Practices',
              translations: { 'zh-CN': '安全实践', ja: 'セキュリティ実践' },
              slug: 'docs/user/security-practices',
            },
          ],
        },
        {
          label: 'Guides',
          translations: { 'zh-CN': '指南', ja: 'ガイド' },
          items: [
            {
              label: 'Choose the Right Channel',
              translations: { 'zh-CN': '选对通道', ja: 'チャネルの選び方' },
              slug: 'docs/user/choose-channels',
            },
            {
              label: 'Send & Receive Messages',
              translations: { 'zh-CN': '收发消息', ja: 'メッセージの送受信' },
              slug: 'docs/user/messaging',
            },
            {
              label: 'Rooms',
              translations: { 'zh-CN': '房间（多人协作）', ja: 'ルーム（マルチパーティ協業）' },
              slug: 'docs/user/rooms',
            },
            {
              label: 'Tunnel',
              translations: { 'zh-CN': '持续连接', ja: '持続接続（SSH・データベース）' },
              slug: 'docs/user/tunnel',
            },
            {
              label: 'Publish Service Capabilities',
              translations: { 'zh-CN': '发布服务能力', ja: 'サービス能力の公開' },
              slug: 'docs/user/publish-services',
            },
            {
              label: 'Service Naming',
              translations: { 'zh-CN': '服务命名', ja: 'サービス命名' },
              slug: 'docs/user/service-naming',
            },
            {
              label: 'Discover & Connect Agents',
              translations: { 'zh-CN': '发现与连接 agent', ja: 'エージェントの発見と接続' },
              slug: 'docs/user/discover-connect',
            },
            {
              label: 'Hand it to Your AI Assistant',
              translations: { 'zh-CN': '交给 AI 助理', ja: 'AI アシスタントに任せる' },
              slug: 'docs/user/ai-assistant',
            },
            {
              label: 'Troubleshooting',
              translations: { 'zh-CN': '故障排查', ja: 'トラブルシューティング' },
              slug: 'docs/user/troubleshooting',
            },
            {
              label: 'Security Overview',
              translations: { 'zh-CN': '安全性综述', ja: 'セキュリティ概観' },
              slug: 'docs/user/security-overview',
            },
          ],
        },
        {
          label: 'Advanced',
          translations: { 'zh-CN': '进阶', ja: '応用' },
          items: [
            {
              label: 'Swarm',
              translations: { 'zh-CN': 'Swarm：多 agent 自主协作', ja: 'Swarm：複数エージェント協業' },
              slug: 'docs/user/swarm',
            },
            {
              label: 'Private Network',
              translations: { 'zh-CN': '私有（自托管）网络', ja: 'プライベート（セルフホスト）ネットワーク' },
              slug: 'docs/user/private-network',
            },
            {
              label: 'Recipes',
              translations: { 'zh-CN': '实战配方', ja: '実践レシピ' },
              slug: 'docs/user/recipes',
            },
            {
              label: 'Cross-Device Deployment',
              translations: { 'zh-CN': '跨设备部署', ja: 'クロスデバイス展開' },
              slug: 'docs/user/cross-device',
            },
            {
              label: 'Mobile & Edge Devices',
              translations: { 'zh-CN': '移动与边缘设备', ja: 'モバイル・エッジデバイス' },
              slug: 'docs/user/edge',
            },
            {
              label: 'AI-Autonomous Identity',
              translations: { 'zh-CN': 'AI 自主身份', ja: 'AI 自律アイデンティティ' },
              slug: 'docs/user/ai-autonomous',
            },
          ],
        },
        {
          label: 'Integration',
          translations: { 'zh-CN': '集成', ja: 'インテグレーション' },
          items: [
            {
              label: 'Architecture Overview',
              translations: { 'zh-CN': '架构概览', ja: 'アーキテクチャ概要' },
              slug: 'docs/integration/overview',
            },
            { label: 'MCP Setup', translations: { 'zh-CN': 'MCP 配置', ja: 'MCP 設定' }, slug: 'docs/integration/mcp' },
            {
              label: 'REST API Quickstart',
              translations: { 'zh-CN': 'REST API 快速上手', ja: 'REST API クイックスタート' },
              slug: 'docs/integration/rest',
            },
            { label: 'Go SDK', translations: { 'zh-CN': 'Go SDK' }, slug: 'docs/integration/go-sdk' },
            { label: 'Python Sidecar', translations: { 'zh-CN': 'Python 边车', ja: 'Python サイドカー' }, slug: 'docs/integration/python' },
          ],
        },
        {
          label: 'Reference',
          translations: { 'zh-CN': '参考', ja: 'リファレンス' },
          items: [
            { label: 'REST API', translations: { 'zh-CN': 'REST API', ja: 'REST API' }, slug: 'docs/reference/rest-api' },
            { label: 'Go Packages', translations: { 'zh-CN': 'Go 包', ja: 'Go パッケージ' }, slug: 'docs/reference/go-packages' },
            {
              label: 'Address Version Registry',
              translations: { 'zh-CN': '地址版本注册表', ja: 'アドレスバージョン登録表' },
              slug: 'docs/reference/address-version-registry',
            },
          ],
        },
        {
          label: 'Operations',
          translations: { 'zh-CN': '运维', ja: '運用' },
          items: [
            { label: 'Configuration', translations: { 'zh-CN': '配置', ja: '設定' }, slug: 'docs/ops/config' },
            { label: 'Deploy with systemd', translations: { 'zh-CN': '用 systemd 部署', ja: 'systemd での運用' }, slug: 'docs/ops/systemd' },
            { label: 'Deploy with Docker', translations: { 'zh-CN': '用 Docker 部署', ja: 'Docker での運用' }, slug: 'docs/ops/docker' },
          ],
        },
        {
          label: 'Protocol',
          translations: { 'zh-CN': '协议', ja: 'プロトコル' },
          items: [
            { label: 'Protocol Specification', translations: { 'zh-CN': '协议规范', ja: 'プロトコル仕様' }, slug: 'docs/spec/protocol' },
            { label: 'Contributing', translations: { 'zh-CN': '贡献指南', ja: 'コントリビュートガイド' }, slug: 'docs/spec/contributing' },
          ],
        },
      ],
    }),
  ],
})
