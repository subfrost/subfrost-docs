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

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'subfrost', // Usually your GitHub org/user name.
  projectName: 'subfrost-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/', // Set docs as the root
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/subfrost//tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: '/Logo.png',
    metadata: [
      {name: 'keywords', content: 'bitcoin, staking, yield, defi, alkanes, metaprotocol, amm, frost, subfrost'},
      {name: 'description', content: 'SUBFROST is the issuer of frBTC & dxBTC. The SUBFROST protocol operates as a decentralized custodian that enables a trustless DeFi ecosystem on Bitcoin L1. SUBFROST is a Layer 0 system, building fraud proofs as ZK circuits to ensure the integrity of its operations.'},
    ],
    og: {
      title: 'SUBFROST | Bitcoin Staking & Yield',
      description: 'SUBFROST is the issuer of frBTC & dxBTC. The SUBFROST protocol operates as a decentralized custodian that enables a trustless DeFi ecosystem on Bitcoin L1. SUBFROST is a Layer 0 system, building fraud proofs as ZK circuits to ensure the integrity of its operations.',
      image: '/Logo.png',
    },
    navbar: {
      title: 'SUBFROST',
      logo: {
        alt: 'SUBFROST Logo',
        src: 'img/logo.svg', // This will be replaced by the CanvasLogo component
        href: 'https://subfrost.io',
      },
      items: [
        {
          href: 'https://x.com/SUBFROSTio/',
          position: 'right',
          className: 'header-x-link',
        },
        {
          href: 'https://github.com/subfrost/',
          position: 'right',
          className: 'header-github-link',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Subzero Research Inc.`,
    },
    favicon: 'Logo.png',
    prism: {
      theme: prismThemes.dracula,
      darkTheme: prismThemes.dracula,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
  } satisfies Preset.ThemeConfig,

  plugins: [],
};

export default config;
