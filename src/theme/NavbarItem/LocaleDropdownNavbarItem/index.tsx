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
        color: isChinese ? '#EC4521' : '#A7C6DC',
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
