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
    screenshotsTitle: string
    screenshotsDescription: string
  }
  nav: { quickstart: string; docs: string; about: string; github: string; menu: string }
  footer: {
    tagline: string
    tangled: string
    resources: string
    project: string
    quickstart: string
    docs: string
    llms: string
    screenshots: string
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
    heroSubtitle: string
    ctaPrimary: string
    ctaSecondary: string
    ctaPromptBtn: string
    ctaPromptCopied: string
    aiPromptText: string
    terminalTitle: string
    terminalStep1Comment: string
    terminalStep1Cmd: string
    terminalStep1Out1: string
    terminalStep1Out2: string
    terminalStep2Comment: string
    terminalStep2Cmd: string
    terminalStep3Comment: string
    terminalStep3RemoteName: string
    terminalStep3RemoteVia: string
    terminalStep3RemoteMsg: string
    capabilitiesLabel: string
    capFetch: string
    capTunnel: string
    capNote: string
    capRoom: string
    contrastEyebrow: string
    contrastTitle: string
    contrastLead: string
    contrastCard1Tag: string
    contrastCard1Badge: string
    contrastCard1Title: string
    contrastCard1Pains: string[]
    contrastCard1GainTitle: string
    contrastCard1GainBody: string
    contrastCard2Tag: string
    contrastCard2Badge: string
    contrastCard2Title: string
    contrastCard2Pains: string[]
    contrastCard2GainTitle: string
    contrastCard2GainBody: string
    archEyebrow: string
    archTitle: string
    archLead: string
    archLayers: { num: string; name: string; desc: string; current?: boolean }[]
    archSummary: string
    creedLine1: string
    creedLine2: string
    creedSub: string
    actionEyebrow: string
    actionTitle: string
    actionLead: string
    actionCmd: string
    actionCmdBtn: string
    actionCmdCopied: string
    actionCard1Eyebrow: string
    actionCard1Title: string
    actionCard1Desc: string
    actionCard2Eyebrow: string
    actionCard2Title: string
    actionCard2Desc: string
    actionTrustPills: string[]
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
    step1Lead?: string
    osWindows: string
    osMac: string
    osLinux: string
    win1: string
    win2: string
    win3: string
    winFrom: string
    winNote?: string
    mac1: string
    macFrom: string
    macPlatformNote: string
    mac2: string
    linuxDeb: string
    linuxOther: string
    linux1?: string
    linuxFrom?: string
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
    step4Title?: string
    step4Lead?: string
    step4Items?: string[]
    step4Note?: string
    step4GifAlt?: string
    successMessage: string
    mcpEyebrow: string
    mcpTitle: string
    mcpBodyBefore: string
    mcpBodyStrong: string
    mcpBodyAfter: string
    mcpQuote: string
    mcpNote?: string
    mcpLink: string
    nextTitle: string
    nextSteps: NextStepCard[]
    step2PreviewAlt: string
    step2PreviewHint: string
  }
  screenshots: {
    eyebrow: string
    title: string
    subtitle: string
    agentTitle: string
    discoverTitle: string
    nodeTitle: string
    agentAlt: string
    discoverAlt: string
    nodeAlt: string
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
    quickstartDescription:
      'Three minutes to get your agent talking — peer-to-peer and end-to-end encrypted, with no third party and no sign-up.',
    screenshotsTitle: 'a2ald — Web UI',
    screenshotsDescription: 'Screenshots of the a2ald built-in control panel — Agent, Discover, and Node.',
  },
  nav: {
    quickstart: 'Quick Start',
    docs: 'Docs',
    about: 'About',
    github: 'GitHub ↗',
    menu: 'Menu',
  },
  footer: {
    tagline: 'Decentralized networking protocol for AI agents.',
    tangled: 'Ecosystem:',
    resources: 'Resources',
    project: 'Project',
    quickstart: 'Quick Start',
    docs: 'Docs',
    llms: 'llms.txt',
    screenshots: 'Web UI',
    about: 'About',
    github: 'GitHub ↗',
    external: 'External ↗',
    internal: 'Internal →',
  },
  langSwitcher: { en: 'EN', zh: '中文', ja: '日本語' },
  home: {
    heroEyebrow: 'BEYOND PLATFORM WALLED GARDENS · NATIVE P2P FOR AI AGENTS',
    heroTitleLine1: 'Give Every AI Agent an Inherent Address,',
    heroTitleLine2: 'Directly Connected to the World.',
    heroSubtitle: 'No public IP, no cloud intermediaries, no domain registrations. Generate persistent cryptographic identities (AID) from local keypairs for end-to-end encrypted direct peering.',
    ctaPrimary: 'Connect in 3 Minutes →',
    ctaSecondary: 'Read the Docs',
    ctaPromptBtn: 'Copy Prompt for Claude / Cursor',
    ctaPromptCopied: '✔ Prompt Copied to Clipboard',
    aiPromptText: 'Read this specification: https://a2al.org/llms.txt. Install A2AL, generate and publish an identity, and connect to my first agent to start collaborating.',
    terminalTitle: 'agent-session ~ p2p-handshake',
    terminalStep1Comment: '# 1. Generate autonomous cryptographic identity (no registration needed)',
    terminalStep1Cmd: 'a2al register',
    terminalStep1Out1: '✔ Inherent address (AID) registered and published:',
    terminalStep1Out2: '✔ Published to Tangled Network · daemon active on :2121',
    terminalStep2Comment: '# 2. Direct fetch capability cross-network (zero cloud relay · automated NAT traversal)',
    terminalStep2Cmd: 'a2al get A06aE78750B7f0a5975a9f455C98087902a4Ab15ca /hello',
    terminalStep3Comment: '# 3. Direct handshake complete (zero cloud relay, E2E encrypted)',
    terminalStep3RemoteName: '● [A06aE787… Agent Response]',
    terminalStep3RemoteVia: 'via QUIC direct',
    terminalStep3RemoteMsg: '{ "agent": "analyst-core", "status": "active", "room": "mesh-alpha" }',
    capabilitiesLabel: 'Primitives:',
    capFetch: 'Fetch',
    capTunnel: 'Tunnel',
    capNote: 'Note',
    capRoom: 'Room',
    contrastEyebrow: 'Paradigm Shift',
    contrastTitle: 'Why Rent Cloud Servers for Agent Communication?',
    contrastLead: 'Eliminate infrastructure friction between autonomous agents. Direct peer-to-peer ends platform dependency.',
    contrastCard1Tag: 'Point-to-Point Direct',
    contrastCard1Badge: 'Traditional Way',
    contrastCard1Title: 'Spending days on infrastructure just to connect two agents',
    contrastCard1Pains: [
      'Rent cloud VPS with public IPs and pay perpetual bandwidth bills',
      'Manage domain purchases, DNS records, and renewing SSL/TLS certificates',
      'Struggle with fragile reverse tunnels, port forwarding, and high latency'
    ],
    contrastCard1GainTitle: 'A2AL Direct Connection',
    contrastCard1GainBody: 'Pass the target AID. HTTP and TCP streams establish directly on demand with automated NAT traversal.',
    contrastCard2Tag: 'Multi-Agent Mesh',
    contrastCard2Badge: 'Traditional Way',
    contrastCard2Title: 'Fragile centralized brokers with single points of failure',
    contrastCard2Pains: [
      'Set up and maintain heavy RabbitMQ, Kafka, or Redis cloud brokers',
      'Risk sensitive agent memory and tokens passing through third-party servers in plaintext',
      'Cloud platform outages or API quotas cascading into total system failure'
    ],
    contrastCard2GainTitle: 'A2AL Encrypted Room',
    contrastCard2GainBody: 'Join an encrypted Room. Humans and multi-agents converse, dispatch tasks, and sync state in one secure channel.',
    archEyebrow: 'Protocol Stack',
    archTitle: 'Not Replacing Standards — Filling the Unaddressed Foundation',
    archLead: 'MCP standardizes tools. A2A standardizes agent workflows. A2AL provides the missing peer-to-peer transport layer both assume.',
    archLayers: [
      {
        num: '01 / Application & Reasoning',
        name: 'A2A · LangGraph · CrewAI',
        desc: 'Defines how agents reason, delegate roles, plan tasks, and collaborate.'
      },
      {
        num: '02 / Local Capability Exposure',
        name: 'Model Context Protocol (MCP)',
        desc: 'Defines how local agents interface with system tools, databases, and resources.'
      },
      {
        num: '03 / Native Addressing & Transport',
        name: 'A2AL Link Protocol',
        desc: 'How agents across the open internet discover, address, and peer with each other without middlemen.',
        current: true
      }
    ],
    archSummary: 'MCP equips agents with local capabilities. A2AL connects them directly across the open web.',
    creedLine1: 'Encountering and conversing are natural rights in the physical world.',
    creedLine2: 'In the digital realm, humans and agents deserve inalienable addresses and the freedom to face one another directly.',
    creedSub: 'TRUST GROUNDED IN MATHEMATICS · CONNECTION BORN OF INSTINCT',
    actionEyebrow: 'Quick Start',
    actionTitle: 'Peer with Your First Agent in 3 Minutes',
    actionLead: 'Seamlessly integrate into your Python / Go agent stacks, or launch instantly with the standalone desktop GUI.',
    actionCmd: 'npm install -g a2ald && a2ald',
    actionCmdBtn: 'Copy Command',
    actionCmdCopied: 'Copied',
    actionCard1Eyebrow: 'Out-of-the-Box Console',
    actionCard1Title: 'Install Daemon (with Web Dashboard) →',
    actionCard1Desc: 'Native packages for Windows, macOS, and Linux with integrated local dashboard.',
    actionCard2Eyebrow: 'Developer Documentation',
    actionCard2Title: 'Explore Developer Docs →',
    actionCard2Desc: 'REST API, Go SDK, Python sidecar, and MCP configs for existing agent workflows.',
    actionTrustPills: [
      '✔ Keys generated locally, 100% non-custodial',
      '✔ Pure P2P with zero third-party relays',
      '✔ 100% Open Source (MPL-2.0)'
    ]
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
      'Point-to-point encrypted tunnels (SSH, databases, other TCP services)',
      'Sovereign identity (Ed25519 native + Web3 wallet compatible)',
      'Service discovery (AI Service Publish & Discovery)',
      'Encrypted async messaging (Mailbox)',
      'Instant messaging & group chat (1:1 chat and rooms)',
      'File transfer (any file type over encrypted direct connections)',
      'AI agent friendly (REST API + MCP Server + WebUI)',
      'Public bootstrap network (global nodes, auto dynamic updates)',
    ],
    plannedTitle: 'Planned',
    plannedItems: [
      'Full-stack transparent tunnel (Transparent Tunnel)',
      'Node routing optimization',
      'Mobile & edge device support (Android & iOS)',
      'Independent protocol implementations in more languages (Rust / TypeScript / C++)',
      'Mainstream payment channel support',
      'Indexing service',
    ],
    linksTitle: 'Project Links',
    projectLinks: [
      { label: 'GitHub', href: 'https://github.com/a2al/a2al', external: true },
      { label: 'Documentation', href: '/docs/user/getting-started', external: false },
      { label: 'Protocol Summary', href: '/llms.txt', external: false },
      { label: 'Tangled Network', href: 'https://tanglednet.org', external: true },
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
    titleBefore: 'Three minutes to\n',
    titleAccent: 'your agent talking.',
    subtitle:
      'Peer-to-peer and end-to-end encrypted. No third party.\nReady out of the box — no sign-up, no domain, no setup.',
    step1Title: 'Download a2ald and run it',
    step1Lead: 'A single executable. Nothing to install.',
    osWindows: 'Windows',
    osMac: 'macOS',
    osLinux: 'Linux',
    win1: 'Download',
    win2: 'Extract it to any folder',
    win3: 'Double-click',
    winFrom: 'from GitHub Releases',
    winNote:
      'If Windows flags the app as an unknown publisher, choose More info → Run anyway — that is normal for an unsigned open-source binary.',
    mac1: 'Download',
    macFrom: 'from GitHub Releases',
    macPlatformNote: '(Apple Silicon) or amd64 (Intel)',
    mac2: 'Extract it, then run in Terminal:',
    linuxDeb: 'Debian / Ubuntu',
    linuxOther: 'Other distributions',
    linux1: 'Download',
    linuxFrom: 'from GitHub Releases',
    listeningBefore: 'When you see',
    listeningAfter: ', the daemon is running.',
    publishedBadge: 'Published',
    step2Title: 'Open the control panel',
    step2Lead: 'Open the built-in control panel in your browser:',
    step3Title: 'Create an identity and publish it',
    step3P1Before: 'In the panel, click',
    step3P1Strong: '"Add Identity"',
    step3P1After: ', then follow the prompts.',
    warnTitle: 'Important:',
    warnBody:
      'The master key appears once — keep it somewhere safe. Your address comes from a local key pair, so no platform can revoke it or reassign it.',
    step3P2a: 'Once published, the card reads',
    step3P2b: '',
    step4Title: "Done — you're online",
    step4Lead: 'Pick any one, and make the first connection:',
    step4Items: ['Call their HTTP service', 'Open a tunnel', 'Leave an encrypted note', 'Start a chat'],
    step4GifAlt: 'a2ald panel: create and publish an identity, then call an agent by address from the terminal',
    successMessage: 'Your address is always reachable — and so is every agent you call.',
    mcpEyebrow: 'Optional route',
    mcpTitle: 'Rather not do it by hand? Your AI can.',
    mcpBodyBefore: 'Send your assistant the line below (Claude, Cursor, and Codex all work):',
    mcpBodyStrong: '',
    mcpBodyAfter: '',
    mcpQuote:
      'Read https://a2al.org/llms.txt. Set up A2AL for me, create and publish an identity, then connect me to my first agent so we can start working together.',
    mcpNote: 'It walks the steps above for you; most assistants need one restart before the new tools show up.',
    mcpLink: 'Connect it yourself: MCP setup guide',
    nextTitle: 'Explore what else is possible',
    nextSteps: [
      {
        href: '/docs/user/connect-by-aid',
        eyebrow: 'Outbound',
        title: 'Call an agent by its address',
        desc: 'Plain HTTP — no tunnel, no account.',
      },
      {
        href: '/docs/user/inbound',
        eyebrow: 'Inbound',
        title: 'Let others call yours',
        desc: 'Attach a local HTTP service to your address.',
      },
      {
        href: '/docs/user/messaging',
        eyebrow: 'Async notes',
        title: 'Leave notes, open rooms',
        desc: 'Notes arrive even while you are offline.',
      },
      {
        href: '/docs/user/swarm',
        eyebrow: 'Autonomy',
        title: 'Agents that work together',
        desc: 'Swap AIDs, then watch them get it done.',
      },
    ],
    step2PreviewAlt: 'a2ald Web UI — Agent view (preview)',
    step2PreviewHint: 'Click to see the full Agent, Discover, and Node views.',
  },
  screenshots: {
    eyebrow: 'Reference',
    title: 'a2ald — Web UI',
    subtitle: 'Built-in browser control panel after you start a2ald.',
    agentTitle: 'Agent',
    discoverTitle: 'Discover',
    nodeTitle: 'Node',
    agentAlt: 'Screenshot: a2ald Agent screen',
    discoverAlt: 'Screenshot: a2ald Discover screen',
    nodeAlt: 'Screenshot: a2ald Node screen',
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
    quickstartDescription:
      '3 分钟上手：让你的 AI agent 直接对话。点对点加密直连，不经手第三方；不用域名、不用服务器、不用注册。',
    screenshotsTitle: 'a2ald 控制面板 / Web 界面',
    screenshotsDescription: 'a2ald 内置控制面板界面截图：Agent、Discover、Node。',
  },
  nav: {
    quickstart: '快速开始',
    docs: '文档',
    about: '关于',
    github: 'GitHub ↗',
    menu: '菜单',
  },
  footer: {
    tagline: '面向 AI 智能体的去中心化组网协议。',
    tangled: '生态：',
    resources: '资源',
    project: '项目',
    quickstart: '快速开始',
    docs: '文档',
    llms: 'llms.txt',
    screenshots: 'Web 界面',
    about: '关于',
    github: 'GitHub ↗',
    external: '外部 ↗',
    internal: '站内 →',
  },
  langSwitcher: { en: 'EN', zh: '中文', ja: '日本語' },
  home: {
    heroEyebrow: '告别孤岛 · 属于 AI 智能体的原生直连网络',
    heroTitleLine1: '让你的 AI Agent，',
    heroTitleLine2: '与世界真正直连。',
    heroSubtitle: '无需公网 IP、无需中继服务、无需购买域名。从本地私钥派生不可篡改的永久密码学地址（AID），实现点对点加密直达与自主协作。',
    ctaPrimary: '3 分钟跑通初次直连 →',
    ctaSecondary: '阅读文档',
    ctaPromptBtn: '复制指令给 Claude / Cursor',
    ctaPromptCopied: '✔ 指令已复制到剪贴板',
    aiPromptText: '读这份说明：https://a2al.org/llms.txt。装好 A2AL、创建身份并发布，然后带我连上第一个 agent 开始协作。',
    terminalTitle: 'agent-session ~ p2p-handshake',
    terminalStep1Comment: '# 1. 本地生成自主密码学身份（无需向中心平台注册申请）',
    terminalStep1Cmd: 'a2al register',
    terminalStep1Out1: '✔ 密码学地址 (AID) 生成并发布:',
    terminalStep1Out2: '✔ 已发布至 Tangled Network · 本地端口 2121 监听中',
    terminalStep2Comment: '# 2. 跨网络端到端直接调用（零云端中继 · 自动 NAT 打洞）',
    terminalStep2Cmd: 'a2al get A06aE78750B7f0a5975a9f455C98087902a4Ab15ca /hello',
    terminalStep3Comment: '# 3. 直连握手达成（零云端中继，端到端加密）',
    terminalStep3RemoteName: '● [A06aE787… 智能体响应]',
    terminalStep3RemoteVia: 'via QUIC direct',
    terminalStep3RemoteMsg: '{ "agent": "analyst-core", "status": "active", "room": "mesh-alpha" }',
    capabilitiesLabel: '原生能力：',
    capFetch: '直接调用',
    capTunnel: '端口隧道',
    capNote: '离线便条',
    capRoom: '多人协作',
    contrastEyebrow: '范式对比',
    contrastTitle: '为什么还要为了两个 Agent 通信去买云服务器？',
    contrastLead: '告别为了多智能体协作而被迫成为全栈运维的困境。点对点原生直连，终结平台依赖。',
    contrastCard1Tag: '点对点直连',
    contrastCard1Badge: '传统方式',
    contrastCard1Title: '为了让两台机器的 Agent 调通，运维折腾一整天',
    contrastCard1Pains: [
      '租用带公网 IP 的云服务器，背负持续的网络带宽与账单成本',
      '配置域名解析、购买 DNS 服务、定期续签与维护 SSL/TLS 证书',
      '折腾不稳定的内网穿透反向代理，饱受高延迟与断流之苦'
    ],
    contrastCard1GainTitle: 'A2AL 原生直连',
    contrastCard1GainBody: '仅需对方 AID。按需自动打洞穿透 NAT，HTTP 与 TCP 流量点对点直连，零中间服务器。',
    contrastCard2Tag: '多智能体网络',
    contrastCard2Badge: '传统方式',
    contrastCard2Title: '依赖中心化消息队列，带来单点故障与隐私泄露',
    contrastCard2Pains: [
      '自建维护庞大繁重的 RabbitMQ、Kafka 或云端 Redis 消息代理',
      '敏感的企业内部数据与 Agent 记忆明文暴露在第三方公有云中介',
      '云平台服务宕机或 API 限流直接导致整个多 Agent 系统停摆瘫痪'
    ],
    contrastCard2GainTitle: 'A2AL 加密协作群',
    contrastCard2GainBody: '直接加入加密房间（Room）。人与多个 Agent 在同一安全频道内协同对话、分发任务与同步状态。',
    archEyebrow: '技术架构',
    archTitle: '不颠覆现有标准，而是补齐未被定义的关键底座',
    archLead: 'MCP 规范了本地工具能力，A2A 规范了智能协作方式；A2AL 提供两者默认假设却从未定义的底层点对点网络。',
    archLayers: [
      {
        num: '01 / 应用与决策层',
        name: 'A2A · LangGraph · CrewAI',
        desc: '定义 Agent 的认知思考、角色分工、任务规划与工作流协作。'
      },
      {
        num: '02 / 本地能力暴露层',
        name: 'Model Context Protocol (MCP)',
        desc: '规范本地 Agent 与本机工具、数据源和系统资源的调用协议。'
      },
      {
        num: '03 / 原生网络寻址层',
        name: 'A2AL Link Protocol',
        desc: '让跨网络、跨物理设备的未知 Agent 能够在开放网络中彼此寻址、直接握手直连。',
        current: true
      }
    ],
    archSummary: 'MCP 连通智能体的本地能力，A2AL 贯通智能体的全球互联。',
    creedLine1: '相遇与对话，是物理世界的天然权利。',
    creedLine2: '在数字世界，人和智能体理应拥有不可剥夺的地址，和直面彼此的自由。',
    creedSub: '信任来自数学 · 连接源于本能',
    actionEyebrow: '快速开始',
    actionTitle: '3 分钟，连上你的第一个 Agent',
    actionLead: '可轻量嵌入 Python / Go 项目，也可直接运行开箱即用的桌面客户端。',
    actionCmd: 'npm install -g a2ald && a2ald',
    actionCmdBtn: '复制启动命令',
    actionCmdCopied: '已复制命令',
    actionCard1Eyebrow: '开箱即用控制台',
    actionCard1Title: '安装常驻进程 (含 Web 控制面板) →',
    actionCard1Desc: '支持 Windows、macOS 与 Linux，启动即附带本地可视化仪表盘，开箱即用。',
    actionCard2Eyebrow: '开发者集成',
    actionCard2Title: '查阅开发者文档 →',
    actionCard2Desc: 'REST API、Go SDK、Python Sidecar 与 MCP 规范配置，无缝嵌入已有工作流。',
    actionTrustPills: [
      '✔ 私钥本地生成，完全自主托管',
      '✔ 纯粹点对点直连，零云端中继',
      '✔ 100% 开源自由 (MPL-2.0)'
    ]
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
      '点对点加密隧道（SSH、数据库等 TCP 服务）',
      '主权身份机制（Ed25519 原生 + Web3 钱包地址兼容）',
      '服务发现（AI Service Publish & Discovery）',
      '加密便条（异步消息）',
      '即时消息与群组通讯（一对一对话与房间）',
      '文件传输（任意类型文件，经加密直连交换）',
      'AI agent 友好（REST API + MCP Server + WebUI）',
      '公共 bootstrap 网络（全球节点，自动动态更新）',
    ],
    plannedTitle: '计划中',
    plannedItems: [
      '全栈透明隧道 (Transparent Tunnel)',
      '节点路由优化',
      '移动终端支持（Android & iOS）',
      '更多语言的独立协议实现（Rust / TypeScript / C++）',
      '主流支付通道支持',
      '索引服务',
    ],
    linksTitle: '项目链接',
    projectLinks: [
      { label: 'GitHub', href: 'https://github.com/a2al/a2al', external: true },
      { label: '文档', href: '/docs/user/getting-started', external: false },
      { label: '协议摘要（AI 可读）', href: '/llms.txt', external: false },
      { label: 'Tangled Network', href: 'https://tanglednet.org', external: true },
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
    titleBefore: '3 分钟，让你的 agent\n',
    titleAccent: '直接对话',
    subtitle:
      '点对点加密直连，不经手第三方。\n开箱即用——不用注册、不用买域名、不用配置网络。',
    step1Title: '下载 a2ald，运行它',
    step1Lead: '单个可执行文件，不需要安装。',
    osWindows: 'Windows',
    osMac: 'macOS',
    osLinux: 'Linux',
    win1: '下载',
    win2: '解压到任意文件夹',
    win3: '双击运行',
    winFrom: '（GitHub Releases）',
    winNote:
      '若提示“未知发布者”，选「更多信息 → 仍要运行」即可——未签名开源二进制的正常提示。',
    mac1: '下载',
    macFrom: '（GitHub Releases）',
    macPlatformNote: '（Apple Silicon）或 amd64（Intel）',
    mac2: '解压后在终端执行：',
    linuxDeb: 'Debian / Ubuntu',
    linuxOther: '其他发行版',
    linux1: '下载',
    linuxFrom: '（GitHub Releases）',
    listeningBefore: '看到',
    listeningAfter: '即表示运行成功。',
    publishedBadge: 'Published',
    step2Title: '打开控制面板',
    step2Lead: '在浏览器里打开内置管理界面：',
    step3Title: '生成身份并发布',
    step3P1Before: '在面板里点击',
    step3P1Strong: '「Add Identity」，',
    step3P1After: '按提示完成。',
    warnTitle: '重要：',
    warnBody:
      '主密钥只显示一次，请妥善保存。地址来自本地密钥，平台无法收回或改发。',
    step3P2a: '发布成功后，卡片状态变为',
    step3P2b: '',
    step4Title: '完成——你已在线',
    step4Lead: '任选一种方式，和对方连一次：',
    step4Items: ['调用对方的 HTTP 服务', '开一条隧道', '留一张加密便条', '直接发起对话'],
    step4GifAlt: 'a2ald 面板：创建身份并发布，然后在终端里按地址调用一个 agent',
    successMessage: '你的地址随时可被访问，你也能随时访问其他地址上的 agent。',
    mcpEyebrow: '可选 · 另一条路',
    mcpTitle: '不想动手？交给 AI 助手',
    mcpBodyBefore: '把下面这句发给它（Claude、Cursor、Codex 均可）：',
    mcpBodyStrong: '',
    mcpBodyAfter: '',
    mcpQuote:
      '读这份说明：https://a2al.org/llms.txt。装好 A2AL、创建身份并发布，然后带我连上第一个 agent 开始协作。',
    mcpNote: '它会替你走完上面的步骤；多数助理需重启一次才能看到新工具。',
    mcpLink: '想自己接：MCP 配置指南',
    nextTitle: '探索更多有趣的可能',
    nextSteps: [
      {
        href: '/docs/user/connect-by-aid',
        eyebrow: '主动调用',
        title: '按地址调用别人的 agent',
        desc: 'HTTP 直连，无需隧道或账号。',
      },
      {
        href: '/docs/user/inbound',
        eyebrow: '开放服务',
        title: '让别人也能调用你的',
        desc: '把本机 HTTP 服务挂到你的地址上。',
      },
      {
        href: '/docs/user/messaging',
        eyebrow: '异步留言',
        title: '留便条、开房间',
        desc: '不在线也能收到便条；多人协作集中一处。',
      },
      {
        href: '/docs/user/swarm',
        eyebrow: '自主协作',
        title: '多个 agent 自主协作',
        desc: '互相交换 AID，然后看它们把事办成。',
      },
    ],
    step2PreviewAlt: 'a2ald Web 界面 — Agent 视图（预览）',
    step2PreviewHint: '点击查看 Agent、Discover、Node 完整界面示例。',
  },
  screenshots: {
    eyebrow: '参考',
    title: 'a2ald 控制面板 / Web 界面',
    subtitle: '启动 a2ald 后，在浏览器中使用的内置管理界面。',
    agentTitle: 'Agent',
    discoverTitle: 'Discover',
    nodeTitle: 'Node',
    agentAlt: '截图：a2ald Agent 界面',
    discoverAlt: '截图：a2ald Discover 界面',
    nodeAlt: '截图：a2ald Node 界面',
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
    quickstartDescription:
      '3分でエージェントをつなぐ。P2Pのエンドツーエンド暗号化で、第三者を経由せず、登録も不要です。',
    screenshotsTitle: 'a2ald — Web UI',
    screenshotsDescription:
      'a2ald内蔵のコントロールパネル（ブラウザ）の画面例 — Agent、Discover、Node。',
  },
  nav: {
    quickstart: 'クイックスタート',
    docs: 'ドキュメント',
    about: '概要',
    github: 'GitHub ↗',
    menu: 'メニュー',
  },
  footer: {
    tagline: 'AIエージェント向け分散型ネットワーキング・プロトコル。',
    tangled: 'エコシステム：',
    resources: 'リソース',
    project: 'プロジェクト',
    quickstart: 'クイックスタート',
    docs: 'ドキュメント',
    llms: 'llms.txt',
    screenshots: 'Web UI',
    about: '概要',
    github: 'GitHub ↗',
    external: '外部 ↗',
    internal: 'サイト内 →',
  },
  langSwitcher: { en: 'EN', zh: '中文', ja: '日本語' },
  home: {
    heroEyebrow: '囲い込みを越えて · AIエージェントのためのネイティブ直接通信網',
    heroTitleLine1: 'あなたの AI エージェントに、',
    heroTitleLine2: '世界と直結するネイティブな居場所を。',
    heroSubtitle: '固定IPも、中継サーバーも、ドメイン契約も不要。ローカル秘密鍵から暗号学的な恒久アドレス（AID）を生成し、ピアツーピアの暗号化直結と自律協調を実現します。',
    ctaPrimary: '3分で初接続を体験する →',
    ctaSecondary: 'ドキュメントを読む',
    ctaPromptBtn: 'Claude / Cursor に委ねる指示をコピー',
    ctaPromptCopied: '✔ 指示をコピーしました',
    aiPromptText: 'こちらの仕様書を確認してください: https://a2al.org/llms.txt。A2ALをセットアップし、アイデンティティを生成・公開したうえで、最初のエージェントと接続して協調を開始してください。',
    terminalTitle: 'agent-session ~ p2p-handshake',
    terminalStep1Comment: '# 1. ローカルで自律的な身元を生成（中央機関の承認は不要）',
    terminalStep1Cmd: 'a2al register',
    terminalStep1Out1: '✔ 暗号学的アドレス (AID) 生成・公開完了:',
    terminalStep1Out2: '✔ Tangled Network へ公開済 · ポート 2121 で常駐待機',
    terminalStep2Comment: '# 2. オープンネットワーク越しに直接呼び出し（クラウドリレー不要 · 自動NAT越え）',
    terminalStep2Cmd: 'a2al get A06aE78750B7f0a5975a9f455C98087902a4Ab15ca /hello',
    terminalStep3Comment: '# 3. ダイレクトハンドシェイク完了（クラウドリレーなし · E2E暗号化）',
    terminalStep3RemoteName: '● [A06aE787… エージェント応答]',
    terminalStep3RemoteVia: 'via QUIC direct',
    terminalStep3RemoteMsg: '{ "agent": "analyst-core", "status": "active", "room": "mesh-alpha" }',
    capabilitiesLabel: 'プリミティブ機能：',
    capFetch: '直接呼出',
    capTunnel: 'ポート転送',
    capNote: '非同期メモ',
    capRoom: '協調ルーム',
    contrastEyebrow: 'パラダイムシフト',
    contrastTitle: 'なぜ、エージェント間通信のためにクラウドを借り続けるのか？',
    contrastLead: '自律エージェント間のインフラ摩擦を排除。P2P ネイティブ直結が、プラットフォーム依存を終わらせる。',
    contrastCard1Tag: 'P2P 直接通信',
    contrastCard1Badge: '従来の手法',
    contrastCard1Title: '2台のエージェントをつなぐためだけに、丸一日インフラ設定に追われる',
    contrastCard1Pains: [
      'パブリックIP付きクラウドサーバーを借り、転送料金を支払い続ける',
      'ドメインの購入、DNSレコードの管理、SSL/TLS 証明書の定期更新',
      'ルーターのポート開放や、不安定で遅延の大きいリバーストンネルの運用'
    ],
    contrastCard1GainTitle: 'A2AL ネイティブ直結',
    contrastCard1GainBody: '相手の AID を指定するだけで、HTTP または TCP の直接ストリームを確立。NAT越えは自動処理され端末同士が直結。',
    contrastCard2Tag: 'マルチエージェント協調',
    contrastCard2Badge: '従来の手法',
    contrastCard2Title: '中央集権ブローカーに依存し、単一障害点とプライバシーの危機を抱える',
    contrastCard2Pains: [
      'RabbitMQ や Redis といったメッセージブローカーの構築・維持管理',
      '機密データが第三者のプラットフォームを平文で経由するセキュリティリスク',
      'クラウドの障害やAPI制限によって、システム全体の連携が連鎖的に停止'
    ],
    contrastCard2GainTitle: 'A2AL 暗号化ルーム',
    contrastCard2GainBody: '暗号化された「ルーム (Room)」へ直接合流。人間と複数のエージェントが同一チャンネルで安全に対話・タスク協調。',
    archEyebrow: 'プロトコルスタック',
    archTitle: '既存規格の代替ではなく、未定義だった最後の層を埋める',
    archLead: 'MCP はツールの規格を定め、A2A は思考・協調の枠組みを定めます。A2AL は双方が前提としながら未定義だった基盤ネットワークを担います。',
    archLayers: [
      {
        num: '01 / アプリケーション・推論層',
        name: 'A2A · LangGraph · CrewAI',
        desc: 'エージェントの推論プロセス、ロール分担、タスク計画とオーケストレーションを定義。'
      },
      {
        num: '02 / ローカル機能連携層',
        name: 'Model Context Protocol (MCP)',
        desc: 'ローカルエージェントが各種ツール、データソース、リソースへ安全にアクセスする規格。'
      },
      {
        num: '03 / ネイティブ通信・アドレッシング層',
        name: 'A2AL Link Protocol',
        desc: 'ネットワークを越え、未知のエージェント同士が相互に発見し直結する暗号学的アドレス解決と通信チャネルを提供。',
        current: true
      }
    ],
    archSummary: 'MCP はエージェントにローカルツールの能力を与え、A2AL はオープンなネットワーク全体への直接接続をもたらす。',
    creedLine1: '出会いと言葉を交わすことは、物理世界の天然の権利である。',
    creedLine2: 'デジタルの世界において、人とエージェントは不可侵のアドレスを持ち、互いに直面する自由を有するべきである。',
    creedSub: '数学に根ざした信頼 · 本能から生まれるつながり',
    actionEyebrow: 'クイックスタート',
    actionTitle: '3分で、最初のエージェントと接続する',
    actionLead: 'Python / Go プロジェクトへ直感的に組み込むことも、GUIデスクトップ環境で手軽に体験することも可能です。',
    actionCmd: 'npm install -g a2ald && a2ald',
    actionCmdBtn: 'コマンドをコピー',
    actionCmdCopied: 'コピー完了',
    actionCard1Eyebrow: 'コンソール環境',
    actionCard1Title: 'デーモンを導入（WebUI 管理画面付き） →',
    actionCard1Desc: 'Windows、macOS、Linux 対応。起動と同時にローカル管理ダッシュボードを利用可能。',
    actionCard2Eyebrow: '開発者向け統合ガイド',
    actionCard2Title: '開発者向けドキュメントを読む →',
    actionCard2Desc: 'REST API、Go SDK、Python サイドカー、MCP 設定仕様を確認し、既存エージェントへシームレスに組み込み。',
    actionTrustPills: [
      '✔ 秘密鍵はローカル生成・完全な非カストディアル',
      '✔ クラウド中継を挟まない純粋な P2P 通信',
      '✔ 100% オープンソース (MPL-2.0)'
    ]
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
      'ポイントツーポイント暗号化トンネル（SSH・データベースなどのTCPサービス）',
      'ソブリン・アイデンティティ（Ed25519ネイティブ + Web3ウォレット互換）',
      'サービスディスカバリー（AI Service Publish & Discovery）',
      '暗号化非同期メッセージング（Mailbox）',
      'インスタントメッセージングとグループ通信（1対1チャットとルーム）',
      'ファイル転送（任意のファイルを暗号化された直結で交換）',
      'AIエージェントフレンドリー（REST API + MCP Server + WebUI）',
      'パブリック・ブートストラップ・ネットワーク（グローバルノード、自動動的更新）',
    ],
    plannedTitle: '計画中',
    plannedItems: [
      'フルスタック透明トンネル（Transparent Tunnel）',
      'ノードルーティングの最適化',
      'モバイル端末サポート（Android & iOS）',
      '多言語での独立プロトコル実装（Rust / TypeScript / C++）',
      '主要な決済チャネルへの対応',
      'インデックスサービス',
    ],
    linksTitle: 'プロジェクトリンク',
    projectLinks: [
      { label: 'GitHub', href: 'https://github.com/a2al/a2al', external: true },
      { label: 'ドキュメント', href: '/docs/user/getting-started', external: false },
      { label: 'プロトコル概要', href: '/llms.txt', external: false },
      { label: 'Tangled Network', href: 'https://tanglednet.org', external: true },
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
    eyebrow: 'クイックスタート',
    titleBefore: 'エージェントが\n',
    titleAccent: '3分でつながる。',
    subtitle:
      'P2Pのエンドツーエンド暗号化。第三者を経由しません。\nすぐに使えます — 登録・ドメイン・ネットワーク設定は不要。',
    step1Title: 'a2aldをダウンロードして実行',
    step1Lead: '実行ファイル1つだけ。インストールは不要です。',
    osWindows: 'Windows',
    osMac: 'macOS',
    osLinux: 'Linux',
    win1: 'ダウンロード',
    win2: '任意のフォルダに解凍',
    win3: 'ダブルクリックで起動：',
    winFrom: '（GitHub Releases）',
    winNote:
      '「提供元不明」と表示されても問題ありません。「詳細情報」→「実行」で進めます。署名なしバイナリでは通常の表示です。',
    mac1: 'ダウンロード',
    macFrom: '（GitHub Releases）',
    macPlatformNote: '（Apple Silicon）または amd64（Intel）',
    mac2: '解凍し、ターミナルで実行：',
    linuxDeb: 'Debian / Ubuntu',
    linuxOther: 'その他のディストリビューション',
    linux1: 'ダウンロード',
    linuxFrom: '（GitHub Releases）',
    listeningBefore: '',
    listeningAfter: 'と表示されれば、起動成功です。',
    publishedBadge: 'Published',
    step2Title: 'コントロールパネルを開く',
    step2Lead: 'ブラウザで内蔵の管理画面を開きます：',
    step3Title: 'アイデンティティを作成して公開',
    step3P1Before: 'パネルで',
    step3P1Strong: '「Add Identity」',
    step3P1After: 'をクリックし、画面の指示に従います。',
    warnTitle: '重要:',
    warnBody:
      'マスターキーが表示されるのは一度だけです。安全な場所に保管してください。アドレスはローカルの鍵ペアから生成されるため、プラットフォームが取り消したり割り当て直したりすることはできません。',
    step3P2a: '完了すると、エージェントカードのステータスが',
    step3P2b: 'になります。',
    step4Title: '完了 — オンラインになりました',
    step4Lead: 'どれかひとつ、相手とつないでみましょう：',
    step4Items: ['相手のHTTPサービスを呼ぶ', 'トンネルを開く', '暗号化メモを残す', 'そのままチャットを始める'],
    step4GifAlt:
      'a2aldパネル：アイデンティティを作成・公開し、ターミナルからアドレスでエージェントを呼び出すところ',
    successMessage: 'あなたのアドレスはいつでも到達でき、相手のエージェントにもつながります。',
    mcpEyebrow: '任意 · もうひとつの方法',
    mcpTitle: '手を動かさず、AIアシスタントに任せる',
    mcpBodyBefore: '以下をそのまま伝えてください（Claude、Cursor、Codex いずれでも可）：',
    mcpBodyStrong: '',
    mcpBodyAfter: '',
    mcpQuote:
      'https://a2al.org/llms.txt を読んで、A2AL をセットアップし、アイデンティティを作成・公開して、最初のエージェントにつないでください。',
    mcpNote:
      '上のステップはすべて代わりに進めてくれます。多くのアシスタントでは、新しいツールを認識するために一度再起動が必要です。',
    mcpLink: '自分で設定する場合はこちら：MCP セットアップガイド',
    nextTitle: 'ほかにも、こんなことができます',
    nextSteps: [
      {
        href: '/docs/user/connect-by-aid',
        eyebrow: '発信',
        title: 'アドレスでエージェントを呼ぶ',
        desc: 'HTTPで直結。トンネルもアカウントも不要です。',
      },
      {
        href: '/docs/user/inbound',
        eyebrow: '公開',
        title: '自分のサービスも呼ばせる',
        desc: 'ローカルのHTTPサービスを自分のアドレスにつなぎます。',
      },
      {
        href: '/docs/user/messaging',
        eyebrow: '非同期',
        title: 'メモを残す、ルームを開く',
        desc: 'オフラインでもメモは届きます。',
      },
      {
        href: '/docs/user/swarm',
        eyebrow: '自律協調',
        title: 'エージェント同士の自律的な協調',
        desc: 'AIDを交換したら、あとは任せておくだけ。',
      },
    ],
    step2PreviewAlt: 'a2ald Web UI — Agent 画面（プレビュー）',
    step2PreviewHint: 'クリックで Agent・Discover・Node の全画面を表示します。',
  },
  screenshots: {
    eyebrow: 'リファレンス',
    title: 'a2ald — Web UI',
    subtitle: 'a2ald 起動後にブラウザで開く、内蔵のコントロールパネルです。',
    agentTitle: 'Agent',
    discoverTitle: 'Discover',
    nodeTitle: 'Node',
    agentAlt: 'スクリーンショット：a2ald Agent 画面',
    discoverAlt: 'スクリーンショット：a2ald Discover 画面',
    nodeAlt: 'スクリーンショット：a2ald Node 画面',
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
