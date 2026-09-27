import {themes as prismThemes} from 'prism-react-renderer';
import type {Config, PluginConfig} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Docusaurus loads this config once per locale and sets this variable first.
const isDefaultLocale = (process.env.DOCUSAURUS_CURRENT_LOCALE ?? 'en') === 'en';

const config: Config = {
  title: 'SUBFROST',
  tagline: 'SUBFROST is the issuer of frBTC & dxBTC. The SUBFROST protocol operates as a decentralized custodian that enables a trustless DeFi ecosystem on Bitcoin L1.',
  
 
  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },
 
  // Set the production url of your site here
  url: 'https://docs.subfrost.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // Cloudflare Pages serves `page/index.html` at `/page/` and 308-redirects
  // `/page` to it; it serves `page.html` at `/page` and 308-redirects `/page/`
  // to it. With trailing-slash URLs the browser resolves
  // the relative links in the docs (`../protocol/x`) one folder too deep on
  // click, so every page is emitted as `page.html` and served without a slash.
  trailingSlash: false,

  // Docusaurus reads `favicon` HERE, at the top level of the config. There was
  // a `favicon` key inside `themeConfig` instead, which is not a thing it looks
  // at, so the site shipped with no <link rel="icon"> at all.
  favicon: 'favicon-96x96.png',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'subfrost', // Usually your GitHub org/user name.
  projectName: 'subfrost-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  markdown: {
    format: 'detect',
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en-US',
      },
      'zh-Hans': {
        label: '中文',
        htmlLang: 'zh-Hans',
      },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Set docs as the root
          
        },
        blog: false,
        // search.html marks itself noindex with <meta property="robots"> (not
        // name=), so the sitemap plugin keeps it; robots.txt disallows it, and
        // a disallowed URL in the sitemap gets flagged by Search Console.
        sitemap: {
          ignorePatterns: ['/search', '/zh-Hans/search'],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Social card. 1200x630 is what X renders for summary_large_image; anything
    // squarer gets letterboxed. The filename is versioned because X caches one card
    // per image URL, so a new path is the only way to invalidate an old card.
    image: '/og/subfrost-docs-1200x630-v1.png',
    metadata: [
      {name: 'keywords', content: 'bitcoin, staking, yield, defi, alkanes, metaprotocol, amm, frost, subfrost'},
      {name: 'description', content: 'SUBFROST is the issuer of frBTC & dxBTC. The SUBFROST protocol operates as a decentralized custodian that enables a trustless DeFi ecosystem on Bitcoin L1.'},
    ],
    og: {
      title: 'SUBFROST | Bitcoin Staking & Yield',
      description: 'SUBFROST is the issuer of frBTC & dxBTC. The SUBFROST protocol operates as a decentralized custodian that enables a trustless DeFi ecosystem on Bitcoin L1.',
      image: '/og/subfrost-docs-1200x630-v1.png',
    },
    navbar: {
      title: 'SUBFROST',
      logo: {
        alt: 'SUBFROST Logo',
        src: 'img/logotype_dark.svg',
        href: 'https://subfrost.io',
      },
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Subzero Research Inc.`,
    },
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      // Gabe asked for dark-mode colours (#000000 background, #f5f5f5 text) on
      // 2026-07-28. Those are only meaningful if a reader can reach dark mode,
      // so the toggle is enabled. Light stays the default.
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    algolia: {
      appId: '828A36RRFA',
      apiKey: '1d544d5ae2a793a8c24381689a059590',
      indexName: 'Crawler: docs.subfrost.io',
      contextualSearch: true,
      insights: true,
      translations: {
        button: {
          buttonText: 'Search',
        },
      },
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    // Redirects (the docs root and the retired legacy URLs) are HTTP 301s in
    // static/_redirects, served by Cloudflare Pages. They used to come from
    // @docusaurus/plugin-client-redirects, which emitted 200 pages with a meta
    // refresh that crawlers and AI fetchers do not follow.
    //
    // llms.txt, llms-full.txt, llms-api.txt and a .md twin of every doc page
    // (https://llmstxt.org). The plugin reads the English sources in docs/
    // only, so it is registered for the default locale alone; otherwise the
    // zh-Hans build would publish the English text under /zh-Hans/.
    ...(isDefaultLocale
      ? [
          [
            'docusaurus-plugin-llms',
            {
              docsDir: 'docs',
              // routeBasePath is '/', so the docs/ folder is not part of any URL:
              // pathTransformation.ignorePaths strips it from the link URLs.
              // (preserveDirectoryStructure: false is effectively a no-op here;
              // the .md twins already land at build/<route>.md.)
              pathTransformation: {ignorePaths: ['docs']},
              preserveDirectoryStructure: false,
              title: 'SUBFROST Documentation',
              description:
                'Official docs for SUBFROST on Bitcoin L1: frBTC, frUSD, DIESEL, FIRE, the Alkanes metaprotocol, the SUBFROST API and alkanes-cli.',
              generateLLMsTxt: true,
              generateLLMsFullTxt: true,
              generateMarkdownFiles: true,
              excludeImports: true,
              removeDuplicateHeadings: true,
              includeOrder: [
                'start-here/**',
                'using-subfrost/**',
                'tokens-economics/**',
                'tokens/**',
                'protocol/**',
                'build/**',
                'api-reference/**',
                'reference/**',
              ],
              // minting-dxBTC contradicts the dxBTC status elsewhere in the docs;
              // kept out of the LLM files until the content fix lands.
              // diesel is `unlisted: true` (hidden from nav, search and sitemap,
              // URL kept), and this plugin does not read `unlisted`. The plugin
              // runs for the default locale only, so the zh-Hans copy never
              // reaches the LLM files.
              ignoreFiles: ['tokens/minting-dxBTC.mdx', 'tokens-economics/diesel.md'],
              customLLMFiles: [
                {
                  filename: 'llms-api.txt',
                  includePatterns: ['api-reference/**'],
                  fullContent: true,
                  title: 'SUBFROST API, CLI and SDK reference',
                  description: 'JSON-RPC, REST, Lua, mempool, orderbook and alkanes-cli reference.',
                },
              ],
            },
          ] satisfies PluginConfig,
        ]
      : []),
  ],
  
};

export default config;
