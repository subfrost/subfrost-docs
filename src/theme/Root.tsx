import React from 'react';
import Head from '@docusaurus/Head';
import {LanguageProvider} from '@site/src/contexts/LanguageContext';
import TranslationLayer from '@site/src/components/TranslationLayer';

export default function Root({ children }) {
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
      <div className="gradient-background"></div>
      {children}
      <TranslationLayer />
      <div className="social-icons-fixed">
        <a href="https://x.com/gabe_subfrost/" target="_blank" rel="noopener noreferrer" className="header-x-link" aria-label="X (Twitter)" />
        <a href="https://github.com/subfrost/" target="_blank" rel="noopener noreferrer" className="header-github-link" aria-label="GitHub" />
      </div>
    </LanguageProvider>
  );
}
