import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useColorMode} from '@docusaurus/theme-common';

export default function NavbarLogo() {
  const { siteConfig } = useDocusaurusContext();
  const { title } = siteConfig;
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const lightLogo = useBaseUrl('/img/logotype_dark.svg');
  const darkLogo = useBaseUrl('/img/logotype_light.svg');

  return (
    <Link
      href="https://subfrost.io/"
      aria-label={title}
      className="navbar__brand">
      <img src={isDark ? darkLogo : lightLogo} alt={title} className="navbar__logo" />
    </Link>
  );
}
