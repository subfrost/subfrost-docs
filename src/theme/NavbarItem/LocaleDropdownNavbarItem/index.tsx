import React, {type ReactNode} from 'react';
import {useLanguage} from '@site/src/contexts/LanguageContext';
import {useColorMode} from '@docusaurus/theme-common';

const ACTIVE_COLOR = '#EC4521';
const INACTIVE_COLOR = '#A7C6DC';

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

export default function LocaleDropdownNavbarItem(): ReactNode {
  const {isChinese, toggleLocale} = useLanguage();
  const {colorMode, setColorMode} = useColorMode();
  const isDark = colorMode === 'dark';
  const toggleTheme = () => setColorMode(isDark ? 'light' : 'dark');

  return (
    <>
      <button
        onClick={toggleTheme}
        type="button"
        style={buttonStyle(isDark ? INACTIVE_COLOR : ACTIVE_COLOR)}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      >
        <SunIcon />
      </button>
      <button
        onClick={toggleLocale}
        type="button"
        style={buttonStyle(isChinese ? ACTIVE_COLOR : INACTIVE_COLOR)}
        aria-label={`Switch to ${isChinese ? 'English' : 'Chinese'}`}
      >
        文
      </button>
    </>
  );
}
