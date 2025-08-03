{
  /*
    Chadson v69.69
    File: src/theme/Navbar/Logo/index.tsx
    Purpose: Overrides the default Docusaurus logo to use the animated CanvasLogo.
    Project: SUBFROST Documentation
    Date: 2025-08-03
    Task: Increase the size of the snowflake logo by 20%.
  */
}
import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { useThemeConfig } from '@docusaurus/theme-common';
import type { NavbarLogo } from '@docusaurus/theme-common/internal';
import SnowflakeIcon from '@site/src/components/SnowflakeIcon';

export default function NavbarLogo(): ReactNode {
  const { navbar: { title, logo } } = useThemeConfig();

  const { href, target } = logo as NavbarLogo;

  return (
    <Link
      to={href}
      target={target}
      aria-label={title}
      className="navbar__brand">
      <SnowflakeIcon style={{ width: '29px', height: '29px', marginRight: '0.375em', marginLeft: '0.07em' }} />
      {title && <b className="navbar__title text--truncate">{title}</b>}
    </Link>
  );
}
