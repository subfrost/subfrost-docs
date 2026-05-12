import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function NavbarLogo() {
  const { siteConfig } = useDocusaurusContext();
  const { title } = siteConfig;

  return (
    <Link
      href="https://subfrost.io/"
      aria-label={title}
      className="navbar__brand">
      {title && <b className="navbar__title text--truncate">{title}</b>}
    </Link>
  );
}
