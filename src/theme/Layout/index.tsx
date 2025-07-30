{
  /*
    Chadson v69.1.0
    File: src/theme/Layout/index.tsx
    Purpose: Main layout component for the Docusaurus site. Integrates the splash loader and sticky footer.
    Project: SUBFROST Documentation
    Date: 2025-07-16
    Task: Implement sticky footer.
  */
}
import React, { useState, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
  PageMetadata,
  SkipToContentFallbackId,
  ThemeClassNames,
} from '@docusaurus/theme-common';
import { useKeyboardNavigation } from '@docusaurus/theme-common/internal';
import SkipToContent from '@theme/SkipToContent';
import AnnouncementBar from '@theme/AnnouncementBar';
import Navbar from '@theme/Navbar';
import Footer from '@theme/Footer';
import LayoutProvider from '@theme/Layout/Provider';
import ErrorPageContent from '@theme/ErrorPageContent';
import type { Props } from '@theme/Layout';
import styles from './styles.module.css';
import FrostBackdrop from '@site/src/components/FrostBackdrop';
import SplashLoader from '@site/src/components/SplashLoader';

export default function Layout(props: Props): ReactNode {
  const {
    children,
    noFooter,
    wrapperClassName,
    // Not really layout-related, but kept for convenience/retro-compatibility
    title,
    description,
  } = props;

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2 seconds delay

    return () => clearTimeout(timer);
  }, []);

  useKeyboardNavigation();

  return (
    <LayoutProvider>
      <SplashLoader loading={loading} />
      <div className="gradient-background"></div>
      <FrostBackdrop />
      <div className={clsx(styles.layout, { [styles.layoutHidden]: loading })}>
        <PageMetadata title={title} description={description} />

        <SkipToContent />

        <AnnouncementBar />

        <Navbar />

        <div
          id={SkipToContentFallbackId}
          className={clsx(
            ThemeClassNames.layout.main.container,
            ThemeClassNames.wrapper.main,
            styles.mainWrapper,
            wrapperClassName,
          )}>
          <ErrorBoundary fallback={(params) => <ErrorPageContent {...params} />}>
            {children}
          </ErrorBoundary>
        </div>

        {!noFooter && <Footer />}
      </div>
    </LayoutProvider>
  );
}
