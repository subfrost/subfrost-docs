import React, {type ReactNode} from 'react';
import {useLanguage} from '@site/src/contexts/LanguageContext';

export default function LocaleDropdownNavbarItem(): ReactNode {
  const {isChinese, toggleLocale} = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: isChinese ? '#1E3A8A' : '#9ca3af',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        lineHeight: 1,
      }}
      aria-label={`Switch to ${isChinese ? 'English' : 'Chinese'}`}
    >
      文
    </button>
  );
}
