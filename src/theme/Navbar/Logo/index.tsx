{
  /*
    Chadson v69.1.0
    File: src/theme/Navbar/Logo/index.tsx
    Purpose: Overrides the default Docusaurus logo to use the animated CanvasLogo.
    Project: SUBFROST Documentation
    Date: 2025-07-16
    Task: Replace the static navbar logo with the canvas logo.
  */
}
import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import { useThemeConfig } from '@docusaurus/theme-common';
import type { NavbarLogo } from '@docusaurus/theme-common/internal';
import CanvasLogo from '@site/src/components/CanvasLogo';

export default function NavbarLogo(): ReactNode {
  const { navbar: { title, logo } } = useThemeConfig();

  const { href, target } = logo as NavbarLogo;

  return (
    <Link
      to={href}
      target={target}
      aria-label={title}
      className="navbar__brand">
      <CanvasLogo />
      {title && <b className="navbar__title text--truncate">{title}</b>}
    </Link>
  );
}
