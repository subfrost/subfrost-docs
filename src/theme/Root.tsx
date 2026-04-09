import React, { useState, useEffect } from 'react';
import Head from '@docusaurus/Head';
import FrostBackdrop from '@site/src/components/FrostBackdrop';
import SplashLoader from '@site/src/components/SplashLoader';
import {LanguageProvider} from '@site/src/contexts/LanguageContext';
import TranslationLayer from '@site/src/components/TranslationLayer';

export default function Root({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      <Head>
        {/* Google tag (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-2NV4F5YNHJ"
        />
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2NV4F5YNHJ');
          `}
        </script>
      </Head>
      <SplashLoader loading={loading} />
      <div className="gradient-background"></div>
      <FrostBackdrop loading={loading} />
      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        {children}
      </div>
      <TranslationLayer />
      <div className="social-icons-fixed">
        <a href="https://x.com/SUBFROSTio/" target="_blank" rel="noopener noreferrer" className="header-x-link" aria-label="X (Twitter)" />
        <a href="https://github.com/subfrost/" target="_blank" rel="noopener noreferrer" className="header-github-link" aria-label="GitHub" />
      </div>
    </LanguageProvider>
  );
}
