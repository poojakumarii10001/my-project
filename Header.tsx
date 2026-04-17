import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';

interface HeaderProps {
  onLogoClick: () => void;
  clickCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick, clickCount }) => {
  const { toggleTheme, isDark } = useTheme();
  const { lang, toggleLang, t } = useLang();

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{
      background: isDark
        ? 'linear-gradient(135deg, #070b16 0%, #132347 55%, #070b16 100%)'
        : 'linear-gradient(180deg, #f7f8fc 0%, #f2f4f8 100%)',
      borderBottom: isDark ? '1px solid rgba(251, 191, 36, 0.22)' : '1px solid #dbe3ef',
      boxShadow: isDark ? '0 6px 26px rgba(0, 0, 0, 0.52)' : '0 6px 20px rgba(15, 23, 42, 0.06)'
    }}>
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onLogoClick}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)'
          }}>
            <img src="/icons/icon-512x512.png" alt="Local Finder" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = '🏪'; }} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient-gold leading-tight">Local Finder</h1>
            <p className="text-[10px]" style={{ color: isDark ? 'rgba(253, 230, 138, 0.6)' : '#92400e' }}>
              {t('Your Local Service App', 'आपकी लोकल सर्विस ऐप')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {clickCount > 3 && clickCount < 7 && (
            <span className="text-[10px] text-amber-500/40">{7 - clickCount}</span>
          )}

          {/* Language Toggle — prominent */}
          <button
            onClick={toggleLang}
            className="h-8 px-2.5 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all active:scale-95"
            style={{
              background: isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(180, 83, 9, 0.08)',
              border: isDark ? '1px solid rgba(251, 191, 36, 0.2)' : '1px solid rgba(180, 83, 9, 0.15)',
              color: isDark ? '#fbbf24' : '#92400e',
            }}
            title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            {lang === 'en' ? 'हिंदी' : 'English'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all active:scale-95"
            style={{
              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Notification */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          }}>
            🔔
          </div>
        </div>
      </div>
      <div
        className="h-[2px]"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(0,0,0,0), rgba(251,191,36,0.75), rgba(59,130,246,0.45), rgba(0,0,0,0))'
            : 'linear-gradient(90deg, rgba(0,0,0,0), rgba(217,119,6,0.45), rgba(59,130,246,0.20), rgba(0,0,0,0))',
        }}
      />
    </header>
  );
};
