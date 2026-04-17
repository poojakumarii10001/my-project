import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LangContext';

export type Page = 'home' | 'search' | 'register' | 'reels' | 'plans';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const { isDark } = useTheme();
  const { t } = useLang();

  const navItems: { id: Page; icon: string; labelEn: string; labelHi: string }[] = [
    { id: 'home', icon: '🏠', labelEn: 'Home', labelHi: 'होम' },
    { id: 'search', icon: '🔍', labelEn: 'Search', labelHi: 'खोजें' },
    { id: 'register', icon: '📝', labelEn: 'Register', labelHi: 'रजिस्टर' },
    { id: 'reels', icon: '🎬', labelEn: 'Reels', labelHi: 'रील्स' },
    { id: 'plans', icon: '👑', labelEn: 'Plans', labelHi: 'प्लान' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" style={{
      background: isDark
        ? 'linear-gradient(135deg, #0a0e1a, #162040)'
        : 'linear-gradient(135deg, #ffffff, #f8fafc)',
      borderTop: isDark ? '1px solid rgba(251, 191, 36, 0.12)' : '1px solid rgba(0,0,0,0.08)',
      boxShadow: isDark ? '0 -4px 30px rgba(0, 0, 0, 0.5)' : '0 -2px 16px rgba(0,0,0,0.06)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      <div className="flex items-center justify-around max-w-lg mx-auto py-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200"
            style={{
              background: currentPage === item.id
                ? (isDark ? 'rgba(251, 191, 36, 0.22)' : 'rgba(251, 191, 36, 0.30)')
                : 'transparent',
              border: currentPage === item.id
                ? (isDark ? '1px solid rgba(251, 191, 36, 0.35)' : '1px solid rgba(180, 83, 9, 0.22)')
                : '1px solid transparent',
              transform: currentPage === item.id ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span className="text-xl mb-0.5" style={{
              opacity: currentPage === item.id ? 1 : 0.96,
              filter: currentPage === item.id ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' : 'saturate(110%) drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
            }}>{item.icon}</span>
            <span className="text-[12px] font-bold" style={{
              color: currentPage === item.id
                ? (isDark ? '#fbbf24' : '#7c2d12')
                : (isDark ? '#e2e8f0' : '#1f2937'),
            }}>{t(item.labelEn, item.labelHi)}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
