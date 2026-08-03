import React from 'react';
import Head from '@docusaurus/Head';

// LanguageProvider and TranslationLayer are gone. They were a second,
// home-grown translation mechanism that swapped `article.innerHTML` out of
// static/translations.json for fourteen legacy routes, and the docs restructure
// left every current page outside that set. Language is now Docusaurus i18n:
// the 文 button links to the same page under /zh-Hans/.

export default function Root({ children }) {
  return (
    <>
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
      <div className="social-icons-fixed">
        <a href="https://x.com/gabe_subfrost/" target="_blank" rel="noopener noreferrer" className="header-x-link" aria-label="X (Twitter)" />
        <a href="https://github.com/subfrost/" target="_blank" rel="noopener noreferrer" className="header-github-link" aria-label="GitHub" />
      </div>
    </>
  );
}
