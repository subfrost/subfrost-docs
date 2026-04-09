import React, {createContext, useContext, useState, useCallback} from 'react';

type LanguageContextType = {
  locale: 'en' | 'zh-Hans';
  isChinese: boolean;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  isChinese: false,
  toggleLocale: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [locale, setLocale] = useState<'en' | 'zh-Hans'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('subfrost-locale') as 'en' | 'zh-Hans') || 'en';
    }
    return 'en';
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === 'en' ? 'zh-Hans' : 'en';
      if (typeof window !== 'undefined') {
        localStorage.setItem('subfrost-locale', next);
      }
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{locale, isChinese: locale === 'zh-Hans', toggleLocale}}>
      {children}
    </LanguageContext.Provider>
  );
}
