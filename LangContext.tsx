import React, { createContext, useContext, useState } from 'react';

type Lang = 'en' | 'hi';

interface LangContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (en: string, hi: string) => string;
  isHindi: boolean;
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: (en: string) => en,
  isHindi: false,
});

export const useLang = () => useContext(LangContext);

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('lf_lang') as Lang) || 'en';
    } catch {
      return 'en';
    }
  });

  const isHindi = lang === 'hi';

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      try { localStorage.setItem('lf_lang', next); } catch {}
      return next;
    });
  };

  const t = (en: string, hi: string) => lang === 'hi' ? hi : en;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t, isHindi }}>
      {children}
    </LangContext.Provider>
  );
};
