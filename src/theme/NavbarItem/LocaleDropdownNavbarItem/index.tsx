import React, {type ReactNode} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';
import {useColorMode} from '@docusaurus/theme-common';

// This swizzle replaces the native locale dropdown with two icon buttons: the
// theme toggle (the native one is swizzled away, so this is the only way to
// reach dark mode) and 文 for the language.
//
// 文 links to the SAME PAGE IN THE OTHER LOCALE, which is what Docusaurus i18n
// actually is. It used to call a custom context that only flipped React state,
// and a separate layer then tried to swap `article.innerHTML` out of
// static/translations.json — a file covering fourteen legacy routes. Nothing
// written since the docs restructure was in it, so on every current page the
// button did nothing at all, while the real zh-Hans build sat at /zh-Hans/
// with nothing linking to it.

const ACTIVE_COLOR = '#EC4521';
const INACTIVE_COLOR = '#A7C6DC';
const ZH = 'zh-Hans';

const buttonStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.1rem',
  fontWeight: 600,
  color,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  lineHeight: 1,
  textDecoration: 'none',
});

function SunIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

/** The same page under the other locale. `baseUrl` is `/`, so the whole rule is
 *  "carry, or do not carry, the /zh-Hans prefix".
 *
 *  Written out rather than delegated to `useAlternatePageUtils().createUrl`,
 *  which returned the page's OWN url when asked for `en` from inside the
 *  zh-Hans build: it derives the suffix by stripping `siteConfig.baseUrl`,
 *  which is `/zh-Hans/` in that build, and the result did not survive the
 *  round trip. Stripping the prefix explicitly is correct whether or not the
 *  pathname carries it. */
export function alternateLocaleHref(
  pathname: string,
  toChinese: boolean,
  search = '',
  hash = '',
): string {
  const bare = pathname === `/${ZH}` || pathname.startsWith(`/${ZH}/`)
    ? pathname.slice(`/${ZH}`.length) || '/'
    : pathname;
  return `${toChinese ? `/${ZH}${bare === '/' ? '' : bare}` : bare}${search}${hash}`;
}

export default function LocaleDropdownNavbarItem(): ReactNode {
  const {
    i18n: {currentLocale},
  } = useDocusaurusContext();
  const {pathname, search, hash} = useLocation();
  const {colorMode, setColorMode} = useColorMode();

  const isDark = colorMode === 'dark';
  const isChinese = currentLocale === ZH;
  const href = alternateLocaleHref(pathname, !isChinese, search, hash);

  return (
    <>
      <button
        onClick={() => setColorMode(isDark ? 'light' : 'dark')}
        type="button"
        className="navbarIconToggle"
        style={buttonStyle(isDark ? INACTIVE_COLOR : ACTIVE_COLOR)}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <SunIcon />
      </button>
      {/* A plain anchor on purpose. Each locale is a separate build, so the
          switch has to be a full page load; and `@docusaurus/Link` treats a
          `pathname://` url as external and adds target="_blank", which would
          open the translation in a new tab. */}
      <a
        href={href}
        className="navbarIconToggle"
        style={buttonStyle(isChinese ? ACTIVE_COLOR : INACTIVE_COLOR)}
        aria-label={isChinese ? 'Switch to English' : '切换到中文'}
        lang={isChinese ? 'en' : ZH}
      >
        文
      </a>
    </>
  );
}
