import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'SUBFROST Overview',
      link: {
        type: 'doc',
        id: 'index',
      },
      items: [
        'introduction/1.1-what-is-subfrost',
        'tokens/4.1-fr-btc',
        'tokens/4.2-dx-btc',
        'tokens/4.3-frost-token',
      ],
    },
    {
      type: 'category',
      label: 'Security & Architecture',
      items: [
        'introduction/1.2-technical-overview',
        'core-concepts/2.2-frost-and-roast',
        'developer-guide/proof-of-stake',
        'developer-guide/5.3-subrail',
      ],
    },
    {
      type: 'category',
      label: 'Technical User Guide',
      items: [
        'introduction/1.3-getting-started',
        'core-concepts/2.4-keystore-management',
        'user-guide/wrapping-frbtc',
        'user-guide/building-subrail-programs',
        'developer-guide/5.5-subswap',
      ],
    },
    {
        type: 'category',
        label: 'Supported Bitcoin Ecos',
        items: [
            'core-concepts/2.1-alkanes',
            'developer-guide/BRC 2.0 Metaprotocol',
            'developer-guide/Arch Network',
        ],
    },
    {
        type: 'category',
        label: 'References',
        items: [
            'reference/6.1-subfrost-node-cli-reference',
            'reference/6.2-subfrost-cli-reference',
            'reference/6.2-subrail-cli-reference',
        ],
    }
  ],
};

export default sidebars;