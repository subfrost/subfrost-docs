import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'SUBFROST',
  tagline: 'Bitcoin Staking, Bitcoin Yield, and Trustless DeFi on the Alkanes Metaprotocol.',
  
 
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
          routeBasePath: '/', // Serve the docs at the site's root
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/subfrost/subfrost/tree/main/',
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
    image: 'web-app-manifest-512x512.png',
    metadata: [
      {name: 'keywords', content: 'bitcoin, staking, yield, defi, alkanes, metaprotocol, amm, frost, subfrost'},
      {name: 'description', content: 'SUBFROST is a decentralized custodian that enables Bitcoin staking and Bitcoin yield through a trustless DeFi ecosystem on the Alkanes Metaprotocol.'},
    ],
    og: {
      title: 'SUBFROST | Bitcoin Staking & Yield',
      description: 'A decentralized custodian for trustless DeFi on Bitcoin.',
      image: 'web-app-manifest-512x512.png',
    },
    navbar: {
      title: 'SUBFROST',
      logo: {
        alt: 'SUBFROST Logo',
        src: 'img/logo.svg', // This will be replaced by the CanvasLogo component
        href: '/',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
          className: 'header-docs-link', // Custom class for styling
        },
        {
          href: 'https://github.com/subfrost/subfrost',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
      copyright: `Copyright © ${new Date().getFullYear()} Subzero Research Inc.`,
    },
    favicon: 'img/favicon.ico',
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
};

export default config;
