import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'en-US',
  title: 'MCP-UI',
  description: 'Interactive UI for MCP - Build rich, dynamic interfaces with MCP-UI',
  base: '/',
  cleanUrls: true,

  head: [
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    [
      'meta',
      {
        name: 'og:title',
        content: 'MCP-UI | Interactive UI Components for MCP',
      },
    ],
    ['meta', { name: 'og:site_name', content: 'MCP-UI' }],
    ['meta', { name: 'og:image', content: 'https://mcpui.dev/og-image.png' }],
    ['meta', { name: 'og:url', content: 'https://mcpui.dev/' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@idosal1' }],
    ['meta', { name: 'twitter:url', content: 'https://mcpui.dev/' }],
    ['meta', { name: 'twitter:domain', content: 'mcpui.dev' }],
    ['meta', { name: 'twitter:image', content: 'https://mcpui.dev/og-image.png' }],
    [
      'meta',
      {
        name: 'twitter:description',
        content: 'Interactive UI for MCP - Build rich, dynamic interfaces with MCP-UI',
      },
    ],
    ['link', { rel: 'icon', type: 'image/png', href: '/logo.png' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  ],

  vite: {
    plugins: [],
    optimizeDeps: {
      include: ['vue', '@vue/shared'],
    },
  },

  themeConfig: {
    logo: {
      light: '/logo-black.png',
      dark: '/logo.png',
      alt: 'MCP-UI Logo',
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Team', link: '/team' },
      {
        text: 'Examples',
        items: [
          {
            text: 'Live Demo',
            link: 'https://scira-mcp-chat-git-main-idosals-projects.vercel.app/',
          },
          {
            text: 'UI Inspector',
            link: 'https://github.com/idosal/ui-inspector',
          },
          { text: 'Server Examples', link: '/guide/server/usage-examples' },
          { text: 'Client Examples', link: '/guide/client/usage-examples' },
        ],
      },
      {
        text: 'Packages',
        items: [
          {
            text: '@mcp-ui/client',
            link: 'https://www.npmjs.com/package/@mcp-ui/client',
          },
          {
            text: '@mcp-ui/server',
            link: 'https://www.npmjs.com/package/@mcp-ui/server',
          },
          {
            text: 'mcp_ui_server Gem',
            link: 'https://rubygems.org/gems/mcp_ui_server',
          },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Installation', link: '/guide/getting-started' },
            { text: 'Core Concepts', link: '/guide/protocol-details' },
            { text: 'Embeddable UI', link: '/guide/embeddable-ui' },
          ],
        },
        {
          text: 'Server SDKs',
          collapsed: false,
          items: [
            {
              text: 'TypeScript',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/guide/server/typescript/overview' },
                { text: 'Walkthrough', link: '/guide/server/typescript/walkthrough' },
                { text: 'Usage & Examples', link: '/guide/server/typescript/usage-examples' },
              ],
            },
            {
              text: 'Ruby',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/guide/server/ruby/overview' },
                { text: 'Walkthrough', link: '/guide/server/ruby/walkthrough' },
                { text: 'Usage & Examples', link: '/guide/server/ruby/usage-examples' },
              ],
            },
          ],
        },
        {
          text: 'Client SDK',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/client/overview' },
            {
              text: 'UIResourceRenderer',
              items: [
                {
                  text: 'Overview',
                  link: '/guide/client/resource-renderer',
                },
                {
                  text: 'React Usage & Examples',
                  link: '/guide/client/react-usage-examples'
                },
                {
                  text: 'Web Component Usage & Examples',
                  link: '/guide/client/wc-usage-examples',
                }
              ],
            },
            {
              text: 'Custom Component Libraries',
              link: '/guide/client/custom-component-libraries',
            },
            {
              text: 'Using a Proxy',
              link: '/guide/client/using-a-proxy',
            }
          ],
        },
      ],
    },

    editLink: {
      pattern: 'https://github.com/idosal/mcp-ui/edit/main/docs/src/:path',
      text: 'Edit this page on GitHub',
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search',
              },
              modal: {
                displayDetails: 'Display detailed list',
                resetButtonTitle: 'Reset search',
                backButtonTitle: 'Close search',
                noResultsText: 'No results for',
                footer: {
                  selectText: 'to select',
                  navigateText: 'to navigate',
                  closeText: 'to close',
                },
              },
            },
          },
        },
      },
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/idosal/mcp-ui' },
      { icon: 'discord', link: 'https://discord.gg/CEAG4KW7ZH' },
      { icon: 'npm', link: 'https://www.npmjs.com/package/@mcp-ui/server' },
      {
        icon: {
          svg: '<svg viewBox="0 0 256 293" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet"><g fill="currentColor"><path d="M76.748 97.434l-.163-.163-36.11 36.11 87.674 87.512 36.11-35.948 51.564-51.563-36.11-36.11v-.164H76.584l.163.326z"/><path d="M127.823.976L.135 74.173v146.395l127.688 73.197 127.689-73.197V74.173L127.823.976zm103.29 205.603l-103.29 59.534-103.29-59.534V87.837l103.29-59.534 103.29 59.534v118.742z"/></g></svg>',
        },
        link: 'https://rubygems.org/gems/mcp_ui_server',
      },
    ],

    footer: {
      message:
        'Released under the <a href="https://github.com/idosal/mcp-ui/blob/main/LICENSE">Apache 2.0 License</a>.',
      copyright: 'Copyright © 2025-present <a href="https://github.com/idosal">Ido Salomon</a>',
    },

    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },

    outline: {
      level: [2, 3],
      label: 'On this page',
    },

    docFooter: {
      prev: 'Previous page',
      next: 'Next page',
    },

    darkModeSwitchLabel: 'Appearance',
    lightModeSwitchTitle: 'Switch to light theme',
    darkModeSwitchTitle: 'Switch to dark theme',
    sidebarMenuLabel: 'Menu',
    returnToTopLabel: 'Return to top',
    langMenuLabel: 'Change language',

    externalLinkIcon: true,
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
    config: (md) => {
      // Add any markdown-it plugins here
    },
  },

  sitemap: {
    hostname: 'https://mcp-ui.dev',
  },
});
