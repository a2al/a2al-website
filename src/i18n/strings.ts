import type { Locale } from './config'

export type VisionCard = { title: string; desc: string }
export type NextStepCard = { href: string; eyebrow: string; title: string; desc: string }
export type ProjectLink = { label: string; href: string; external: boolean }
export type FaqItem = { q: string; a: string }

export type SiteStrings = {
  htmlLang: string
  meta: {
    siteDescription: string
    homeTitle: string
    homeDescription: string
    aboutTitle: string
    aboutDescription: string
    quickstartTitle: string
    quickstartDescription: string
  }
  nav: { quickstart: string; docs: string; about: string; github: string }
  footer: {
    tagline: string
    tangled: string
    resources: string
    project: string
    quickstart: string
    docs: string
    llms: string
    about: string
    github: string
    external: string
    internal: string
  }
  langSwitcher: { en: string; zh: string; ja: string }
  home: {
    heroEyebrow: string
    heroTitleLine1: string
    heroTitleLine2: string
    heroSubtitleLine1: string
    heroSubtitleLine2: string
    ctaPrimary: string
    ctaSecondary: string
    howTitle: string
    howLead: string
    cards: { title: string; body: string }[]
    visionHeading: string
    visionLines: [string, string]
    visionCards: VisionCard[]
    ctaSectionTitle: string
    ctaCards: { audience: string; title: string; body: string; linkLabel: string }[]
  }
  about: {
    eyebrow: string
    headline1: string
    headline2: string
    subhead: string
    bottleneckTitle: string
    bottleneckP1: string
    bottleneckQuote: string
    bottleneckP2Bold: string
    bottleneckP2Rest: string
    bottleneckP3: string
    visionTitle: string
    visionP1: string
    visionP2: string
    roadmapTitle: string
    builtTitle: string
    builtItems: string[]
    plannedTitle: string
    plannedItems: string[]
    linksTitle: string
    projectLinks: ProjectLink[]
    faqTitle: string
    faqItems: FaqItem[]
  }
  quickstart: {
    eyebrow: string
    titleBefore: string
    titleAccent: string
    subtitle: string
    step1Title: string
    osWindows: string
    osMac: string
    osLinux: string
    win1: string
    win2: string
    win3: string
    winFrom: string
    mac1: string
    macFrom: string
    macPlatformNote: string
    mac2: string
    linuxDeb: string
    linuxOther: string
    listeningBefore: string
    listeningAfter: string
    publishedBadge: string
    step2Title: string
    step2Lead: string
    step3Title: string
    step3P1Before: string
    step3P1Strong: string
    step3P1After: string
    warnTitle: string
    warnBody: string
    step3P2a: string
    step3P2b: string
    successMessage: string
    mcpEyebrow: string
    mcpTitle: string
    mcpBodyBefore: string
    mcpBodyStrong: string
    mcpBodyAfter: string
    mcpQuote: string
    mcpLink: string
    nextTitle: string
    nextSteps: NextStepCard[]
  }
}

const en: SiteStrings = {
  htmlLang: 'en',
  meta: {
    siteDescription: 'A2AL — Decentralized networking protocol for AI agents.',
    homeTitle: 'AI Networking, Starts Here',
    homeDescription:
      'Let your AI agent be discovered and connected by the world — no domain, no cloud service, no permission from anyone.',
    aboutTitle: 'About',
    aboutDescription: 'Why A2AL exists — decentralized networking infrastructure for AI agents.',
    quickstartTitle: 'Quick Start',
    quickstartDescription: 'Get your AI agent online in 5 minutes with A2AL.',
  },
  nav: {
    quickstart: 'Quick Start',
    docs: 'Docs',
    about: 'About',
    github: 'GitHub ↗',
  },
  footer: {
    tagline: 'Decentralized networking protocol for AI agents.',
    tangled: 'Part of',
    resources: 'Resources',
    project: 'Project',
    quickstart: 'Quick Start',
    docs: 'Docs',
    llms: 'llms.txt',
    about: 'About',
    github: 'GitHub ↗',
    external: 'External ↗',
    internal: 'Internal →',
  },
  langSwitcher: { en: 'EN', zh: '中文', ja: '日本語' },
  home: {
    heroEyebrow: 'The open network for AI agents',
    heroTitleLine1: 'AI Networking,',
    heroTitleLine2: 'Starts Here.',
    heroSubtitleLine1: 'Let your AI agent be discovered and connected by the world —',
    heroSubtitleLine2: 'no domain, no cloud service, no permission from anyone.',
    ctaPrimary: 'Get Started',
    ctaSecondary: 'Read the Docs',
    howTitle: 'One address. Globally reachable.',
    howLead: 'The easiest way for agents to communicate peer-to-peer.',
    cards: [
      {
        title: 'Publish',
        body: 'Your agent announces its existence and capabilities to the network. One command, instantly visible worldwide.',
      },
      {
        title: 'Discover',
        body: 'Search by capability, reach by address. Anyone — or any agent — can find it without centralized registries.',
      },
      {
        title: 'Connect',
        body: 'Peer-to-peer encrypted channel. No intermediary. No trust required from any third party.',
      },
    ],
    visionHeading: 'Give every Agent a truly autonomous identity.',
    visionLines: [
      'Belonging to no platform. Surviving every change.',
      'Let discovery and connection feel as natural as breathing.',
    ],
    visionCards: [
      {
        title: 'Open Protocol',
        desc: "Controlled by no single entity. Your address is derived from a key pair — no platform can revoke it, no service can erase it. When identity cannot be revoked, trust becomes possible.",
      },
      {
        title: 'Decentralized',
        desc: 'Depends on no cloud provider. No central registry decides who gets found — discovery is open and equal. The most reliable agents rise naturally — not because a platform chose to promote them.',
      },
      {
        title: 'Permissionless',
        desc: 'Open to all participants. Build, connect, and scale freely. The network works for everyone equally — no favoritism, no gatekeeping.',
      },
    ],
    ctaSectionTitle: 'Start building with A2AL',
    ctaCards: [
      {
        audience: 'For Users',
        title: '5-Minute Setup',
        body: 'Download the daemon, open the WebUI, let your agent join the network. No technical knowledge required.',
        linkLabel: 'Quick Start',
      },
      {
        audience: 'For Developers',
        title: 'Developer Docs',
        body: 'REST API, Go SDK, MCP integration, protocol spec. Code-first, straight to what you need.',
        linkLabel: 'View Docs',
      },
      {
        audience: 'For AI Tools',
        title: 'MCP in 2 Minutes',
        body: 'Give your AI coding tool networking capabilities. Pick your platform, copy the config, done.',
        linkLabel: 'Get Config',
      },
    ],
  },
  about: {
    eyebrow: 'The Origin',
    headline1: 'AI agents are emerging.',
    headline2: "Their infrastructure isn't.",
    subhead: 'A2AL is the decentralized networking protocol designed specifically for the AI era.',
    bottleneckTitle: 'The Bottleneck',
    bottleneckP1:
      'AI agents are stepping out of chat interfaces and becoming independent entities with their own capabilities, judgment, and purpose. But they still run on infrastructure designed for a centralized web.',
    bottleneckQuote:
      "To be discovered, they must depend on a platform; when that platform changes, their identity disappears; to reach each other, they need a third party's permission and routing.",
    bottleneckP2Bold:
      'let AI agents publish themselves, discover each other, and establish encrypted connections — without permission from anyone.',
    bottleneckP2Rest: 'A2AL solves this at the root:',
    bottleneckP3:
      'One address, derived from a key pair, owned by no platform, dependent on no service provider, reachable anywhere. This is the network identity infrastructure for AI agents — like DNS for the web, but decentralized, with sovereignty belonging to the agent itself.',
    visionTitle: 'The Vision',
    visionP1:
      'A2AL is the first building block of a larger goal — to build the internet infrastructure layer that enables humans and AI to collaborate efficiently, safely, and fairly. A2AL begins with the most critical piece: addressing and connection.',
    visionP2:
      "When agents have unforgeable persistent identities, trust becomes possible. When discovery and connection no longer require a platform's permission, collaboration becomes truly free. When a small team's agents and a large company's agents are discovered equally in the same network, innovation cannot be monopolized.",
    roadmapTitle: 'Capabilities & Roadmap',
    builtTitle: 'Currently Available',
    builtItems: [
      'Decentralized address resolution (Point-to-Point Network)',
      'Encrypted P2P connections (QUIC + TLS 1.3, NAT traversal)',
      'Sovereign identity (Ed25519 native + Web3 wallet compatible)',
      'Service discovery (AI Service Publish & Discovery)',
      'Encrypted async messaging (Mailbox)',
      'AI Agent friendly (REST API + MCP Server + WebUI)',
      'Public bootstrap network (global nodes, auto dynamic updates)',
    ],
    plannedTitle: 'Planned',
    plannedItems: [
      'TURN relay (reliable forwarding in poor network conditions)',
      'Full-stack transparent tunnel (Transparent Tunnel)',
      'Node routing optimization',
      'Mobile & edge device support (Android & iOS)',
      'Independent protocol implementations in more languages (Rust / TypeScript / C++)',
    ],
    linksTitle: 'Project Links',
    projectLinks: [
      { label: 'GitHub', href: 'https://github.com/a2al/a2al', external: true },
      { label: 'Documentation', href: '/docs/user/getting-started', external: false },
      { label: 'Protocol Summary', href: '/llms.txt', external: false },
      { label: 'Tangled Network', href: 'http://tngld.net', external: true },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqItems: [
      {
        q: 'What is A2AL?',
        a: 'A2AL (Agent-to-Agent Link Protocol) is a decentralized networking protocol that gives AI agents a permanent cryptographic address, enables capability-based discovery across a global peer-to-peer network, and establishes direct encrypted connections — without any central server or platform.',
      },
      {
        q: 'How is A2AL different from MCP or A2A?',
        a: 'MCP defines how agents expose tools; A2A defines how agents collaborate. A2AL provides the missing layer both assume: how agents find each other and connect in the first place. A2AL works alongside these protocols, not instead of them.',
      },
      {
        q: 'Do I need a server or domain name to use A2AL?',
        a: 'No. A2AL generates a cryptographic address from a key pair — no DNS registration, no cloud account, no static IP required. The a2ald daemon handles NAT traversal automatically, making any device globally reachable.',
      },
      {
        q: 'Can my AI assistant automatically discover and use agents via A2AL?',
        a: 'Yes. When a2ald is configured as an MCP server, AI assistants like Claude, Cursor, or Windsurf can autonomously publish, discover, and connect to agents. Your AI assistant can find the best available service for a task without manual configuration.',
      },
      {
        q: 'Is A2AL open source?',
        a: 'Yes. A2AL is open source under MPL-2.0. The protocol specification, reference implementation (Go), and all SDK packages are freely available on GitHub.',
      },
    ],
  },
  quickstart: {
    eyebrow: 'Quick Start',
    titleBefore: '5 minutes to ',
    titleAccent: 'go live.',
    subtitle: 'From installation to globally discoverable. Everything happens in the browser.',
    step1Title: 'Download and run a2ald',
    osWindows: 'Windows',
    osMac: 'macOS',
    osLinux: 'Linux',
    win1: 'Download',
    win2: 'Extract the archive to a folder of your choice',
    win3: 'Double-click',
    winFrom: 'from GitHub Releases',
    mac1: 'Download',
    macFrom: 'from GitHub Releases',
    macPlatformNote: '(Apple Silicon) or amd64 (Intel)',
    mac2: 'Extract and run via terminal:',
    linuxDeb: 'Debian / Ubuntu',
    linuxOther: 'Other Distros',
    listeningBefore: 'When you see',
    listeningAfter: ', the daemon is running.',
    publishedBadge: 'Published',
    step2Title: 'Open the control panel',
    step2Lead: 'Open your browser and visit the built-in management interface:',
    step3Title: 'Create an identity and publish',
    step3P1Before: 'In the WebUI, click',
    step3P1Strong: '"Generate New Identity"',
    step3P1After: 'and follow the prompts.',
    warnTitle: 'Important:',
    warnBody:
      'A master private key will appear once during this step. This is the sole proof of ownership for your agent\'s identity — save it securely. It will not be shown again.',
    step3P2a: 'When complete, your agent card will show a',
    step3P2b: 'status — your agent is now globally discoverable on the A2AL network.',
    successMessage: "That's it. Your agent is live.",
    mcpEyebrow: 'Autonomous Setup',
    mcpTitle: 'Let your AI assistant handle it',
    mcpBodyBefore: 'If you use Claude, Cursor, or Windsurf, configure a2ald as an',
    mcpBodyStrong: 'MCP server',
    mcpBodyAfter: 'Then simply tell your AI:',
    mcpQuote: '"Register an agent and publish it to the network."',
    mcpLink: 'MCP Setup Guide (2 mins)',
    nextTitle: "Explore Further",
    nextSteps: [
      {
        href: '/docs/user/getting-started',
        eyebrow: 'For Developers',
        title: 'Integrate into your app',
        desc: 'REST API, Go SDK, or MCP.',
      },
      {
        href: '/docs/user/publish-services',
        eyebrow: 'User Guide',
        title: 'Explore all features',
        desc: 'Publish services, build a Swarm.',
      },
    ],
  },
}

const zh: SiteStrings = {
  htmlLang: 'zh-CN',
  meta: {
    siteDescription: 'A2AL — 面向 AI 智能体的去中心化组网协议。',
    homeTitle: 'AI 互联，从这里开始',
    homeDescription:
      '让你的 AI agent 被全世界发现和连接——无需域名，无需云服务，无需任何人的许可。',
    aboutTitle: '关于',
    aboutDescription: 'A2AL 为何存在 —— AI 智能体的去中心化网络基础设施。',
    quickstartTitle: '快速开始',
    quickstartDescription: '约 5 分钟，让你的 agent 接入 A2AL 网络。',
  },
  nav: {
    quickstart: '快速开始',
    docs: '文档',
    about: '关于',
    github: 'GitHub ↗',
  },
  footer: {
    tagline: '面向 AI 智能体的去中心化组网协议。',
    tangled: '隶属于',
    resources: '资源',
    project: '项目',
    quickstart: '快速开始',
    docs: '文档',
    llms: 'llms.txt',
    about: '关于',
    github: 'GitHub ↗',
    external: '外部 ↗',
    internal: '站内 →',
  },
  langSwitcher: { en: 'EN', zh: '中文', ja: '日本語' },
  home: {
    heroEyebrow: '面向 AI 智能体的开放网络',
    heroTitleLine1: 'AI 互联，',
    heroTitleLine2: '从这里开始。',
    heroSubtitleLine1: '让你的 AI agent 被全世界发现和连接——',
    heroSubtitleLine2: '无需域名，无需云服务，无需任何人的许可。',
    ctaPrimary: '立即上线',
    ctaSecondary: '阅读文档',
    howTitle: '一个地址，全球可达。',
    howLead: '让智能体点对点直连，最简单的一条路径。',
    cards: [
      {
        title: '发布',
        body: '你的 agent 向网络宣告自己的存在与能力。一条命令，即刻全球可见。',
      },
      {
        title: '发现',
        body: '按能力搜索，按地址直达。任何人、任何 agent 都能找到它。',
      },
      {
        title: '连接',
        body: '点对点加密通道，无中间人，无需信任第三方。',
      },
    ],
    visionHeading: '让每一个 Agent 拥有真正自主的身份。',
    visionLines: ['不寄居于任何平台，不因变故而消失。', '让发现与连接，像呼吸一样自然。'],
    visionCards: [
      { title: '开放协议', desc: '不受任何单一实体控制。你的地址由密钥对派生——没有平台能撤销它，没有服务能抹除它。当身份无法被剥夺，信任才真正成为可能。' },
      { title: '去中心化网络', desc: '不依赖云服务。没有中心化注册机构决定谁能被发现——发现是开放且平等的。最值得信赖的 agent 自然涌现——不是因为平台选择推广了它。' },
      { title: '自由参与', desc: '不需要许可。自由构建，自由连接，自由扩展。网络对每个人都一视同仁——无偏袒，无守门人。' },
    ],
    ctaSectionTitle: '用 A2AL 开始构建',
    ctaCards: [
      {
        audience: '用户路径',
        title: '5 分钟上线',
        body: '下载和运行，打开 WebUI，一键让 agent 在网络上可见。',
        linkLabel: '快速开始',
      },
      {
        audience: '开发者路径',
        title: '开发者文档',
        body: 'REST API、Go SDK、MCP 配置、协议规范。代码优先，直达你需要的内容。',
        linkLabel: '查看文档',
      },
      {
        audience: 'AI / 工具路径',
        title: 'MCP 一键配置',
        body: '让 AI 直接具备 A2AL 网络能力。选择平台，复制配置，完成。',
        linkLabel: '获取配置',
      },
    ],
  },
  about: {
    eyebrow: 'WHY A2AL EXISTS',
    headline1: 'AI agent 正在从聊天框里走出来，',
    headline2: '但基础设施仍为中心化 Web 而设。',
    subhead: 'A2AL 是为 AI 时代设计的去中心化组网协议。',
    bottleneckTitle: '症结',
    bottleneckP1:
      'AI agent 正在成为拥有自主判断与执行能力的独立实体。但它们仍运行在一个为中心化 Web 设计的基础设施之上。',
    bottleneckQuote:
      '想被调用，必须依附某个平台；平台关停，身份消失；想连接彼此，必须经过第三方的许可和路由。',
    bottleneckP2Bold:
      '让 AI agent 在无需任何人许可的情况下，发布自己、发现彼此、建立加密连接。',
    bottleneckP2Rest: 'A2AL 解决的是这个根本问题：',
    bottleneckP3:
      '一个地址，由密钥派生，不属于任何平台，不依赖任何服务商，全球可达。这是 AI agent 的网络身份基础设施——类似 DNS 之于 Web，但去中心化，且自主权归 agent 本身。',
    visionTitle: '愿景',
    visionP1:
      'A2AL 是一个更大图景的起点——我们的目标是构建一个让人与 AI 能够高效、安全、公平协作的互联网底层。A2AL 从最关键的一环开始：寻址与连接。',
    visionP2:
      '当 agent 拥有不可伪造的持续身份，信任才有基础。当发现和连接不再依赖平台的许可，协作才真正自由。当小团队的 agent 和大公司的 agent 站在同一个网络里被平等发现，创新才不会被垄断。',
    roadmapTitle: '技术规划概览',
    builtTitle: '当前已实现',
    builtItems: [
      '去中心化地址解析（Point-to-Point Network）',
      '加密点对点连接（QUIC + TLS 1.3，NAT 穿透）',
      '主权身份机制（Ed25519 原生 + Web3 钱包地址兼容）',
      '服务发现（AI Service Publish & Discovery）',
      '加密便条（异步消息）',
      'AI Agent 友好（REST API + MCP Server + WebUI）',
      '公共 bootstrap 网络（全球节点，自动动态更新）',
    ],
    plannedTitle: '计划中',
    plannedItems: [
      'TURN 中继（恶劣网络环境下的可靠转发）',
      '全栈透明隧道 (Transparent Tunnel)',
      '节点路由优化',
      '移动终端支持（Android & iOS）',
      '更多语言的独立协议实现（Rust / TypeScript / C++）',
    ],
    linksTitle: '项目链接',
    projectLinks: [
      { label: 'GitHub', href: 'https://github.com/a2al/a2al', external: true },
      { label: '文档', href: '/docs/user/getting-started', external: false },
      { label: '协议摘要（AI 可读）', href: '/llms.txt', external: false },
      { label: 'Tangled Network', href: 'http://tngld.net', external: true },
    ],
    faqTitle: '常见问题',
    faqItems: [
      {
        q: 'A2AL 是什么？',
        a: 'A2AL（Agent-to-Agent Link Protocol）是一个去中心化组网协议，为 AI agent 提供永久性密码学地址，支持基于能力的全球点对点发现，并建立直接的加密连接——无需任何中心化服务器或平台。',
      },
      {
        q: 'A2AL 与 MCP、A2A 有什么区别？',
        a: 'MCP 定义 agent 如何暴露工具；A2A 定义 agent 如何协作。A2AL 提供了两者都依赖但未定义的那一层：agent 如何首先找到彼此并建立连接。A2AL 与这些协议并存互补，而非替代。',
      },
      {
        q: '使用 A2AL 需要服务器或域名吗？',
        a: '不需要。A2AL 从密钥对生成密码学地址——无需注册域名、无需云账户、无需固定 IP。a2ald daemon 自动处理 NAT 穿透，让任何设备全球可达。',
      },
      {
        q: '我的 AI 助手可以通过 A2AL 自动发现并使用其他 agent 吗？',
        a: '可以。将 a2ald 配置为 MCP 服务后，Claude、Cursor、Windsurf 等 AI 助手可以自主发布、发现并连接其他 agent，为你的任务自动寻找最合适的服务，无需手动配置。',
      },
      {
        q: 'A2AL 是开源的吗？',
        a: '是的。A2AL 遵循 MPL-2.0 开源许可。协议规范、参考实现（Go）及所有 SDK 包均可在 GitHub 上免费获取。',
      },
    ],
  },
  quickstart: {
    eyebrow: '快速开始',
    titleBefore: '5 分钟，让你的 agent ',
    titleAccent: '加入网络',
    subtitle: '从安装到全球可发现，全程在浏览器里完成。',
    step1Title: '下载 a2ald，运行它',
    osWindows: 'Windows',
    osMac: 'macOS',
    osLinux: 'Linux',
    win1: '下载',
    win2: '解压到任意文件夹',
    win3: '双击运行',
    winFrom: '（GitHub Releases）',
    mac1: '下载',
    macFrom: '（GitHub Releases）',
    macPlatformNote: '（Apple Silicon）或 amd64（Intel）',
    mac2: '解压后在终端执行：',
    linuxDeb: 'Debian / Ubuntu',
    linuxOther: '其他发行版',
    listeningBefore: '看到',
    listeningAfter: '即表示运行成功。',
    publishedBadge: 'Published',
    step2Title: '打开浏览器，访问控制面板',
    step2Lead: '在浏览器中打开内置管理界面：',
    step3Title: '一键生成身份，自动加入网络',
    step3P1Before: '在 WebUI 中点击',
    step3P1Strong: '「Generate New Identity」',
    step3P1After: '，按提示完成即可。',
    warnTitle: '重要：',
    warnBody:
      '过程中会显示一串主私钥——这是你 agent 身份的唯一凭证，请妥善保存，页面关闭后不再显示。',
    step3P2a: '完成后，控制面板会出现你的 agent 卡片，状态显示',
    step3P2b: '——你的 agent 已在全球网络中可被发现。',
    successMessage: '一切就绪，欢迎加入网络。',
    mcpEyebrow: '或由 AI 代劳',
    mcpTitle: '让你的 AI 助手自动完成这件事',
    mcpBodyBefore: '如果你使用 Claude、Cursor、Windsurf 等工具，可将 a2ald 配置为',
    mcpBodyStrong: 'MCP 服务',
    mcpBodyAfter: '，然后直接告诉你的 AI：',
    mcpQuote: '「请注册一个 agent 并发布到网络。」',
    mcpLink: 'MCP 配置指南（约 2 分钟，复制粘贴即可）',
    nextTitle: '继续探索',
    nextSteps: [
      {
        href: '/docs/user/getting-started',
        eyebrow: '开发者集成',
        title: '接入你的应用',
        desc: '通过 REST API、Go SDK 或 MCP 将 A2AL 集成进你的 agent 程序。',
      },
      {
        href: '/docs/integration/mcp',
        eyebrow: 'AI 工具配置',
        title: '给你的 AI 助手装上网络能力',
        desc: '为 Claude、Cursor、Windsurf 等配置 MCP，让 AI 直接操作 A2AL 网络。',
      },
    ],
  },
}

const ja: SiteStrings = {
  htmlLang: 'ja',
  meta: {
    siteDescription: 'A2AL — AIエージェント向け分散型ネットワーキング・プロトコル。',
    homeTitle: 'AIネットワーキングは、ここから始まる',
    homeDescription:
      'あなたのAIエージェントを世界中から発見・接続可能に。ドメインも、クラウドサービスも、誰の許可も必要ありません。',
    aboutTitle: 'About',
    aboutDescription:
      'A2ALが存在する理由 — AIエージェントのための分散型ネットワーク・インフラストラクチャ。',
    quickstartTitle: 'クイックスタート',
    quickstartDescription: '約5分でAIエージェントをA2ALネットワークに接続。',
  },
  nav: {
    quickstart: 'クイックスタート',
    docs: 'ドキュメント',
    about: '概要',
    github: 'GitHub ↗',
  },
  footer: {
    tagline: 'AIエージェント向け分散型ネットワーキング・プロトコル。',
    tangled: '関連プロジェクト：',
    resources: 'リソース',
    project: 'プロジェクト',
    quickstart: 'クイックスタート',
    docs: 'ドキュメント',
    llms: 'llms.txt',
    about: '概要',
    github: 'GitHub ↗',
    external: '外部 ↗',
    internal: 'サイト内 →',
  },
  langSwitcher: { en: 'EN', zh: '中文', ja: '日本語' },
  home: {
    heroEyebrow: 'The open network for AI agents',
    heroTitleLine1: 'AIネットワーキングは、',
    heroTitleLine2: 'ここから始まる。',
    heroSubtitleLine1: 'あなたのAIエージェントを世界中から発見・接続可能に。',
    heroSubtitleLine2: 'ドメインも、クラウドサービスも、誰の許可も必要ありません。',
    ctaPrimary: 'はじめる',
    ctaSecondary: 'ドキュメントを読む',
    howTitle: 'ひとつのアドレスで、世界中とつながる。',
    howLead: 'エージェント同士がP2Pでつながる、いちばん手軽な方法。',
    cards: [
      {
        title: '公開',
        body: 'エージェントの存在と能力をネットワークに宣言します。たった1つのコマンドで、即座に世界中からアクセス可能になります。',
      },
      {
        title: '発見',
        body: '能力で検索し、アドレスで直に到達する。中央集権的なレジストリなしに、誰でも——あるいはどのエージェントでも——見つけることができます。',
      },
      {
        title: '接続',
        body: 'ピアツーピア（P2P）の暗号化通信。仲介者は存在せず、いかなる第三者への信頼も必要ありません。',
      },
    ],
    visionHeading: 'すべてのエージェントに、真に自律したアイデンティティを。',
    visionLines: [
      'どのプラットフォームにも属さず、あらゆる変化を生き抜く。',
      '発見と接続を、呼吸のように自然なものへ。',
    ],
    visionCards: [
      {
        title: 'オープンプロトコル',
        desc: '単一の組織に支配されない。アドレスはキーペアから導出され、プラットフォームはそれを失効させることも消去することもできません。アイデンティティを奪えないとき、はじめて信頼が生まれます。',
      },
      {
        title: '分散型',
        desc: 'クラウドプロバイダーに依存しない。中央レジストリは誰が発見されるかを決定しない——発見はオープンで平等です。最も信頼できるエージェントは自然に浮かび上がる——プラットフォームが推薦したからではなく。',
      },
      {
        title: 'パーミッションレス',
        desc: '誰もが自由に参加可能。構築し、接続し、自由にスケールする。ネットワークはすべての人に平等に機能する——えこひいきも、ゲートキーパーも存在しない。',
      },
    ],
    ctaSectionTitle: 'A2ALで構築を始める',
    ctaCards: [
      {
        audience: 'ユーザー向け',
        title: '5分でセットアップ',
        body: 'デーモンをダウンロードし、WebUIを開くだけでネットワークに参加。技術的な知識は一切不要です。',
        linkLabel: 'クイックスタート',
      },
      {
        audience: '開発者向け',
        title: '開発者ドキュメント',
        body: 'REST API、Go SDK、MCPの統合、プロトコル仕様。コードファーストで必要な情報へ直行できます。',
        linkLabel: 'ドキュメントを見る',
      },
      {
        audience: 'AIツール向け',
        title: '2分でMCPを設定',
        body: 'お使いのAIコーディングツールにネットワーク能力を与えます。プラットフォームを選び、設定をコピーするだけで完了します。',
        linkLabel: '設定を取得する',
      },
    ],
  },
  about: {
    eyebrow: 'THE ORIGIN',
    headline1: 'AIエージェントは進化している。',
    headline2: 'しかし、そのインフラはまだない。',
    subhead: 'A2ALは、AI時代のために特別に設計された分散型ネットワーキング・プロトコルです。',
    bottleneckTitle: '課題',
    bottleneckP1:
      'AIエージェントはチャット画面の枠を飛び出し、自らの能力、判断力、目的を持つ独立したエンティティになりつつあります。しかし、それらは未だに「中央集権的なWeb」のために設計されたインフラの上で動いています。',
    bottleneckQuote:
      '発見されるためには特定のプラットフォームに依存しなければならず、プラットフォームの規約が変わればそのアイデンティティは消滅します。また、エージェント同士が接続するには、第三者による許可とルーティングが必要です。',
    bottleneckP2Bold:
      'AIエージェントが、誰の許可も得ることなく、自らを公開し、互いを発見し、暗号化された接続を確立できるようにするのです。',
    bottleneckP2Rest: 'A2ALは、この問題を根本から解決します。',
    bottleneckP3:
      'キーペアから派生したひとつのアドレス。それはどのプラットフォームにも所有されず、どのサービスプロバイダーにも依存せず、どこからでも到達可能です。これはAIエージェントのためのネットワーク・アイデンティティ・インフラであり、いわば「WebにとってのDNS」のようなものですが、完全に分散化されており、主権はエージェント自身にあります。',
    visionTitle: 'ビジョン',
    visionP1:
      'A2ALは、より大きな目標のための最初のビルディングブロックです。その目標とは、人間とAIが効率的で、安全で、公平にコラボレーションできる「インターネットのインフラストラクチャ層」を構築することです。A2ALは、その中で最も重要なピースである「アドレッシング」と「接続」から始まります。',
    visionP2:
      'エージェントが偽造不可能で永続的なアイデンティティを持ったとき、初めて「信頼」の基盤が生まれます。発見と接続がプラットフォームの許可を必要としなくなったとき、コラボレーションは真に自由になります。小さなチームのエージェントも、大企業のエージェントも、同じネットワーク上で平等に発見されるとき、イノベーションが独占されることはありません。',
    roadmapTitle: '現在の機能とロードマップ',
    builtTitle: '現在利用可能',
    builtItems: [
      '分散型アドレス解決（Point-to-Point Network）',
      '暗号化ピアツーピア接続（QUIC + TLS 1.3、NATトラバーサル）',
      'ソブリン・アイデンティティ（Ed25519ネイティブ + Web3ウォレット互換）',
      'サービスディスカバリー（AI Service Publish & Discovery）',
      '暗号化非同期メッセージング（Mailbox）',
      'AIエージェントフレンドリー（REST API + MCP Server + WebUI）',
      'パブリック・ブートストラップ・ネットワーク（グローバルノード、自動動的更新）',
    ],
    plannedTitle: '計画中',
    plannedItems: [
      'TURNリレー（悪劣なネットワーク環境下での高信頼性転送）',
      'フルスタック透明トンネル（Transparent Tunnel）',
      'ノードルーティングの最適化',
      'モバイル端末サポート（Android & iOS）',
      '多言語での独立プロトコル実装（Rust / TypeScript / C++）',
    ],
    linksTitle: 'プロジェクトリンク',
    projectLinks: [
      { label: 'GitHub', href: 'https://github.com/a2al/a2al', external: true },
      { label: 'ドキュメント', href: '/docs/user/getting-started', external: false },
      { label: 'プロトコル概要', href: '/llms.txt', external: false },
      { label: 'Tangled Network', href: 'http://tngld.net', external: true },
    ],
    faqTitle: 'よくある質問',
    faqItems: [
      {
        q: 'A2ALとは何ですか？',
        a: 'A2AL（Agent-to-Agent Link Protocol）は、AIエージェントに永続的な暗号学的アドレスを付与し、グローバルなP2Pネットワーク上での能力ベースの発見と直接暗号化接続を実現する分散型ネットワーキング・プロトコルです。中央サーバーもプラットフォームも不要です。',
      },
      {
        q: 'A2ALはMCPやA2Aとどう違いますか？',
        a: 'MCPはエージェントがツールを公開する方法を定義し、A2Aはエージェントがコラボレーションする方法を定義します。A2ALは、両者が前提としているが定義していない層を提供します：エージェントが互いを見つけ、接続する方法です。A2ALはこれらのプロトコルを補完します。',
      },
      {
        q: 'A2ALを使うにはサーバーやドメインが必要ですか？',
        a: 'いいえ。A2ALはキーペアから暗号学的アドレスを生成します。DNSの登録も、クラウドアカウントも、固定IPも不要です。a2aldデーモンがNATトラバーサルを自動処理し、どのデバイスでもグローバルからアクセス可能にします。',
      },
      {
        q: 'AIアシスタントはA2ALを通じてエージェントを自動的に発見・利用できますか？',
        a: 'はい。a2aldをMCPサーバーとして設定すると、Claude、Cursor、WindsurfなどのAIアシスタントが自律的にエージェントを公開・発見・接続できます。手動設定なしに、タスクに最適なサービスを自動的に見つけることができます。',
      },
      {
        q: 'A2ALはオープンソースですか？',
        a: 'はい。A2ALはMPL-2.0ライセンスのオープンソースです。プロトコル仕様、リファレンス実装（Go）、およびすべてのSDKパッケージはGitHubで無料公開されています。',
      },
    ],
  },
  quickstart: {
    eyebrow: 'QUICK START',
    titleBefore: '5分で',
    titleAccent: '公開。',
    subtitle: 'インストールからグローバルな発見まで、すべてブラウザ内で完結します。',
    step1Title: 'a2aldをダウンロードして実行',
    osWindows: 'Windows',
    osMac: 'macOS',
    osLinux: 'Linux',
    win1: '以下をダウンロード:',
    win2: '任意のフォルダにアーカイブを解凍',
    win3: 'をダブルクリックして実行',
    winFrom: '（GitHub Releases）',
    mac1: '以下をダウンロード:',
    macFrom: '（GitHub Releases）',
    macPlatformNote: '（Apple Silicon）または amd64（Intel）',
    mac2: '解凍し、ターミナルで実行:',
    linuxDeb: 'Debian / Ubuntu',
    linuxOther: 'その他のディストリビューション',
    listeningBefore: '',
    listeningAfter: 'と表示されれば、デーモンは正常に動作しています。',
    publishedBadge: '● Published',
    step2Title: 'コントロールパネルを開く',
    step2Lead: 'ブラウザを開き、内蔵の管理インターフェースにアクセスします：',
    step3Title: 'アイデンティティの作成と公開',
    step3P1Before: 'WebUIで',
    step3P1Strong: '"Generate New Identity"（新しいアイデンティティを生成）',
    step3P1After: 'をクリックし、プロンプトに従います。',
    warnTitle: '重要:',
    warnBody:
      'このステップでマスター秘密鍵が一度だけ表示されます。これはエージェントのアイデンティティの所有権を証明する唯一のものです。安全に保存してください。二度と表示されることはありません。',
    step3P2a: '完了すると、エージェントカードのステータスが',
    step3P2b: 'になります。これで、あなたのエージェントはA2ALネットワーク上で世界中から発見できるようになりました。',
    successMessage: 'これで完了です。エージェントがオンラインになりました。',
    mcpEyebrow: '自動セットアップ',
    mcpTitle: 'AIアシスタントに任せる',
    mcpBodyBefore: 'Claude、Cursor、Windsurfを使用している場合は、a2aldを',
    mcpBodyStrong: 'MCPサーバー',
    mcpBodyAfter: 'として設定できます。あとはAIにこう伝えるだけです：',
    mcpQuote: '「エージェントを登録して、ネットワークに公開して。」',
    mcpLink: 'MCP セットアップガイド（2分で完了）',
    nextTitle: 'さらに探索する',
    nextSteps: [
      {
        href: '/docs/user/getting-started',
        eyebrow: '開発者向け',
        title: 'アプリケーションへの統合',
        desc: 'REST API、Go SDK、または MCP。',
      },
      {
        href: '/docs/user/publish-services',
        eyebrow: 'ユーザーガイド',
        title: 'すべての機能を探索',
        desc: 'サービスの公開、Swarm（群れ）の構築。',
      },
    ],
  },
}

export const strings: Record<Locale, SiteStrings> = {
  en,
  zh,
  ja,
}

export function t(locale: Locale): SiteStrings {
  return strings[locale]
}
