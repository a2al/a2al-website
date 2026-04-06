import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
  site: 'https://a2al.org',
  integrations: [
    tailwind({
      // Apply Tailwind base styles, but let Starlight manage its own styles in /docs
      applyBaseStyles: false,
    }),
    starlight({
      title: 'A2AL Docs',
      description: 'Documentation for A2AL — the decentralized networking protocol for AI agents.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: true,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/a2al/a2al' },
      ],
      customCss: ['./src/styles/starlight.css'],
      sidebar: [
        {
          label: 'User Guide',
          items: [
            { label: 'Getting Started', slug: 'docs/user/getting-started' },
            { label: 'Publish Service Capabilities', slug: 'docs/user/publish-services' },
            { label: 'Discover & Connect Agents', slug: 'docs/user/discover-connect' },
            { label: 'Send & Receive Messages', slug: 'docs/user/messaging' },
            { label: 'AI-Autonomous Identity', slug: 'docs/user/ai-autonomous' },
            { label: 'Build an AI Swarm', slug: 'docs/user/swarm' },
            { label: 'Cross-Device Deployment', slug: 'docs/user/cross-device' },
            { label: 'Mobile & Edge Devices', slug: 'docs/user/edge' },
          ],
        },
        {
          label: 'Integration',
          items: [
            { label: 'Architecture Overview', slug: 'docs/integration/overview' },
            { label: 'MCP Setup', slug: 'docs/integration/mcp' },
            { label: 'REST API Quickstart', slug: 'docs/integration/rest' },
            { label: 'Go SDK', slug: 'docs/integration/go-sdk' },
            { label: 'Python Sidecar', slug: 'docs/integration/python' },
          ],
        },
        {
          label: 'API Reference',
          items: [
            { label: 'REST API', slug: 'docs/reference/rest-api' },
            { label: 'Go Packages', slug: 'docs/reference/go-packages' },
          ],
        },
        {
          label: 'Operations',
          items: [
            { label: 'Configuration', slug: 'docs/ops/config' },
            { label: 'Deploy with systemd', slug: 'docs/ops/systemd' },
            { label: 'Deploy with Docker', slug: 'docs/ops/docker' },
          ],
        },
        {
          label: 'Protocol',
          items: [
            { label: 'Protocol Specification', slug: 'docs/spec/protocol' },
            { label: 'Contributing', slug: 'docs/spec/contributing' },
          ],
        },
      ],
    }),
  ],
})
