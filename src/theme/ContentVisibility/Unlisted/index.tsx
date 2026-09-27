import React, {type ReactNode} from 'react';
import {UnlistedMetadata} from '@docusaurus/theme-common';

// Ejected from @docusaurus/theme-classic 3.9.2 and cut down on purpose.
// `unlisted: true` pages (today only tokens-economics/diesel, which the product
// owner wants out of search, the sitemap and the LLM files but still reachable
// at its URL) keep the <meta name="robots" content="noindex, nofollow"> that
// UnlistedMetadata emits; that tag is also what drops them from the sitemap.
// The stock component additionally shows a yellow "Unlisted page" admonition
// to every reader in production builds, which we do not want, so it is gone.
export default function Unlisted(): ReactNode {
  return <UnlistedMetadata />;
}
