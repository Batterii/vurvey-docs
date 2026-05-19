import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Vurvey Documentation',
  description: 'User onboarding and feature documentation for Vurvey - AI Powered by People',
  base: '/vurvey-docs/',  // GitHub Pages path: batterii.github.io/vurvey-docs/

  head: [
    ['link', { rel: 'icon', href: '/vurvey-docs/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'Vurvey Documentation' }],
    ['meta', { name: 'og:description', content: 'User onboarding and feature documentation for Vurvey' }],
  ],

  lastUpdated: true,

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Vurvey Docs',

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Features', link: '/guide/home' },
      {
        text: 'Links',
        items: [
          { text: 'Vurvey App', link: 'https://staging.vurvey.dev' },
          { text: 'Vurvey.com', link: 'https://vurvey.com' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Logging In', link: '/guide/login' },
            { text: 'Account & Profile', link: '/guide/account' },
            { text: 'Survey-Taking Experience', link: '/guide/survey-taking' },
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Home', link: '/guide/home' },
            { text: 'Agents', link: '/guide/agents' },
            { text: 'People', link: '/guide/people' },
            { text: 'Concept Simulations', link: '/guide/concept-simulations' },
            { text: 'Campaigns', link: '/guide/campaigns' },
            { text: 'Topic Graph (Insights)', link: '/guide/topic-graph' },
            { text: 'Datasets', link: '/guide/datasets' },
            { text: 'Workflow (Beta)', link: '/guide/workflows' },
            { text: 'Capabilities', link: '/guide/capabilities' },
            { text: 'Output Studio', link: '/guide/output-studio' },
            { text: 'Prompt Form Canvas', link: '/guide/prompt-form-canvas' },
          ]
        },
        {
          text: 'Platform',
          collapsed: true,
          items: [
            { text: 'Settings', link: '/guide/settings' },
            { text: 'Canvas & Image Studio', link: '/guide/canvas-and-image-studio' },
            { text: 'Branding', link: '/guide/branding' },
            { text: 'Brand Companions', link: '/guide/brand-companions' },
            { text: 'Forecast', link: '/guide/forecast' },
            { text: 'Rewards', link: '/guide/rewards' },
            { text: 'Integrations', link: '/guide/integrations' },
            { text: 'Mentions', link: '/guide/mentions' },
            { text: 'Reels', link: '/guide/reels' },
            { text: 'Implementation', link: '/guide/implementation' },
            { text: 'Admin (Enterprise)', link: '/guide/admin' },
          ]
        },
        {
          text: 'Reference',
          items: [
            { text: 'Quick Reference', link: '/guide/quick-reference' },
            { text: 'Common Recipes', link: '/guide/recipes' },
            { text: 'Glossary', link: '/guide/glossary' },
            { text: "What's New", link: '/guide/whats-new' },
            { text: 'Platform Architecture', link: '/guide/architecture' },
            { text: 'Developer & API Reference', link: '/guide/developer-reference' },
            { text: 'Sources & Citations', link: '/guide/sources-and-citations' },
            { text: 'Permissions & Sharing', link: '/guide/permissions-and-sharing' },
            { text: 'About This Documentation', link: '/guide/automation-and-qa' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Batterii/vurvey-docs' }
    ],

    footer: {
      message: 'Documentation auto-updated nightly',
      copyright: `Copyright ${new Date().getFullYear()} Vurvey Labs`
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/Batterii/vurvey-docs/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    lastUpdatedText: 'Last updated',

    outline: {
      level: [2, 3]
    }
  }
})
