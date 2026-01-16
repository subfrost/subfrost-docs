import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SnowflakeIcon from '@site/src/components/SnowflakeIcon';

export default function NavbarLogo() {
  const { siteConfig } = useDocusaurusContext();
  const { title } = siteConfig;

  return (
    <Link
      href="https://subfrost.io/"
      aria-label={title}
      className="navbar__brand">
      <SnowflakeIcon style={{ width: '29px', height: '29px', marginRight: '0.375em', marginLeft: '0.07em' }} />
      {title && <b className="navbar__title text--truncate">{title}</b>}
    </Link>
  );
}
