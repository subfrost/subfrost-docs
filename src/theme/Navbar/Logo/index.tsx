import React from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function NavbarLogo() {
  const { siteConfig } = useDocusaurusContext();
  const { title } = siteConfig;
  const logoUrl = useBaseUrl('/img/logotype_dark.svg');

  return (
    <Link
      href="https://subfrost.io/"
      aria-label={title}
      className="navbar__brand">
      <img src={logoUrl} alt={title} className="navbar__logo" />
    </Link>
  );
}
