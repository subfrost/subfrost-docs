{
  /*
    Chadson v69.69
    File: src/theme/Navbar/Logo/index.tsx
    Purpose: Overrides the default Docusaurus logo to use the animated CanvasLogo.
    Project: SUBFROST Documentation
    Date: 2025-07-25
    Task: Replace the static navbar logo with the canvas logo.
  */
}
import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { useThemeConfig } from '@docusaurus/theme-common';
import type { NavbarLogo } from '@docusaurus/theme-common/internal';
import { FaSnowflake } from 'react-icons/fa';

export default function NavbarLogo(): ReactNode {
  const { navbar: { title, logo } } = useThemeConfig();

  const { href, target } = logo as NavbarLogo;

  return (
    <Link
      to={href}
      target={target}
      aria-label={title}
      className="navbar__brand">
      <FaSnowflake style={{ fontSize: '1.5em', marginRight: '0.375em', marginLeft: '0.07em' }} />
      {title && <b className="navbar__title text--truncate">{title}</b>}
    </Link>
  );
}
