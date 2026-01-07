import React, { useState, useEffect } from 'react';
import Head from '@docusaurus/Head';
import FrostBackdrop from '@site/src/components/FrostBackdrop';
import SplashLoader from '@site/src/components/SplashLoader';

export default function Root({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

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
      <SplashLoader loading={loading} />
      <div className="gradient-background"></div>
      <FrostBackdrop loading={loading} />
      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        {children}
      </div>
    </>
  );
}
