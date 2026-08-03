import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

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
    // The docs root used to be introduction/subfrost-overview, which carried
    // `slug: /`. Gabe asked for that page to be killed on 2026-07-28, which
    // left `/` with nothing to serve. Redirecting instead of moving the slug
    // onto What is SUBFROST keeps every existing relative link working: a slug
    // change moves the page's route, and the links around the site are
    // URL-relative, not file-relative.
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          {from: '/', to: '/start-here/what-is-subfrost'},
          // The SUBFROST Networking section was removed on 2026-07-29 at
          // flex's request. All six pages were live and served 200, so they
          // are redirected rather than left to 404. There is no equivalent
          // page to land on, so they point at the docs root.
          {from: '/subfrost-networking/introduction-to-subp2p', to: '/start-here/what-is-subfrost'},
          {from: '/subfrost-networking/subrelay', to: '/start-here/what-is-subfrost'},
          {from: '/subfrost-networking/subproxy', to: '/start-here/what-is-subfrost'},
          {from: '/subfrost-networking/subtun', to: '/start-here/what-is-subfrost'},
          {from: '/subfrost-networking/gossipsub-and-encrypted-communication', to: '/start-here/what-is-subfrost'},
          {from: '/subfrost-networking/building-microservices-on-subp2p', to: '/start-here/what-is-subfrost'},
          // The frBTC roadmap page was merged INTO the frBTC overview on
          // 2026-07-29 at Gabe's request. Its content now lives under the
          // "frBTC is live on Alkanes and BRC2.0" paragraph there.
          {from: '/tokens/frBTC-roadmap', to: '/tokens/frBTC-overview'},

          // Everything below is the retirement of the legacy tree. Each of
          // these fourteen routes serves 200 on docs.subfrost.io TODAY
          // (measured 2026-07-31, following the nginx trailing-slash 301), and
          // none of them survives the restructure, so without these entries
          // shipping this branch converts fourteen live pages into 404s. They
          // are the pages linked from X posts and picked up by search, which is
          // exactly the traffic that never comes back from a 404.

          // The app section moved wholesale: subfrost-app/* -> using-subfrost/*.
          {from: '/subfrost-app/fire-vault', to: '/using-subfrost/fire-vault'},
          {from: '/subfrost-app/futures', to: '/using-subfrost/futures'},
          {from: '/subfrost-app/lending', to: '/using-subfrost/lending'},
          {from: '/subfrost-app/swap', to: '/using-subfrost/swap'},
          {from: '/subfrost-app/wallet', to: '/using-subfrost/wallets'},
          // "DeFi Vaults on Bitcoin" was the automated-yield page; the FIRE
          // Vault is the only vault that actually exists, so it lands there
          // rather than on a section index.
          {from: '/subfrost-app/vaults', to: '/using-subfrost/fire-vault'},
          // Both overview pages were feature tours of an app that was "in
          // development". Get Started is the page that now does that job.
          {from: '/subfrost-app/overview', to: '/start-here/get-started'},
          {from: '/introduction/subfrost-app-overview', to: '/start-here/get-started'},
          // Technical Overview was the conceptual tour of FROST, Alkanes and
          // the p2p layer. Key Concepts replaced it.
          {from: '/introduction/technical-overview', to: '/start-here/key-concepts'},
          // This one was a stub that pointed at api.subfrost.io/docs. The API
          // reference is now a first-class section in this site.
          {from: '/introduction/subfrost-api-docs', to: '/api-reference/getting-started/overview'},
          // PoS described signers staking FUEL and frBTC to sign for the peg.
          {from: '/key-components/proof-of-stake', to: '/protocol/signing-and-keys'},
          // The three CLI reference pages collapsed into the CLI/SDK section.
          {from: '/reference/subfrost-cli-reference', to: '/api-reference/cli-sdk/overview'},
          {from: '/reference/subfrost-node-cli-reference', to: '/api-reference/cli-sdk/overview'},
          {from: '/reference/subrail-cli-reference', to: '/api-reference/cli-sdk/overview'},
        ],
      },
    ],
  ],
  
};

export default config;
