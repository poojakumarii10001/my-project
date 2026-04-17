import { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { BottomNav, Page } from './components/BottomNav';
import { HomePage } from './components/HomePage';
import { SearchPage } from './components/SearchPage';
import { RegisterPage } from './components/RegisterPage';
import { ReelsPage } from './components/ReelsPage';
import { PlansPage } from './components/PlansPage';
import { AdminPanel } from './components/AdminPanel';
import { BusinessProfile } from './components/BusinessProfile';
import { Provider } from './utils/storage';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isDark } = useTheme();

  const handleLogoClick = useCallback(() => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setLogoClicks(0), 3000);

    if (newCount >= 7) {
      setLogoClicks(0);
      setShowAdminPin(true);
      setAdminPin('');
    }
  }, [logoClicks]);

  const handleAdminPinSubmit = () => {
    const settings = JSON.parse(localStorage.getItem('lf_settings') || '{"adminPin":"12345678"}');
    if (adminPin === (settings.adminPin || '12345678')) {
      setShowAdminPin(false);
      setShowAdmin(true);
      setAdminPin('');
    } else {
      alert('Incorrect PIN! / गलत पिन!');
      setAdminPin('');
    }
  };

  const handleViewProvider = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} onViewProvider={handleViewProvider} />;
      case 'search':
        return <SearchPage onViewProvider={handleViewProvider} onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage />;
      case 'reels':
        return <ReelsPage />;
      case 'plans':
        return <PlansPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} onViewProvider={handleViewProvider} />;
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: isDark
        ? 'linear-gradient(180deg, #060a14 0%, #0b1222 30%, #101c33 60%, #0a0e1a 100%)'
        : 'linear-gradient(180deg, #f7f8fc 0%, #f2f5fa 22%, #eef2f8 62%, #f4f7fb 100%)'
    }}>
      <Header onLogoClick={handleLogoClick} clickCount={logoClicks} />

      {/* Main Content */}
      <main className="pt-[68px] pb-[80px] px-4 max-w-lg mx-auto">
        {renderPage()}
      </main>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Admin PIN Modal — 8 character PIN */}
      {showAdminPin && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowAdminPin(false)}>
          <div className="w-full max-w-sm glass-strong rounded-2xl p-6 space-y-5 animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-3">🔐</div>
              <h3 className="text-lg font-bold text-white">Admin Access</h3>
              <p className="text-xs text-slate-400 mt-1">Enter 8-character PIN to continue</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Letters, numbers & symbols allowed</p>
            </div>

            <div className="flex justify-center gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                <div
                  key={i}
                  className="w-8 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{
                    background: adminPin[i] ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${adminPin[i] ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
                    color: '#fbbf24',
                  }}
                >
                  {adminPin[i] ? '●' : ''}
                </div>
              ))}
            </div>

            <input
              type="password"
              value={adminPin}
              onChange={e => {
                const val = e.target.value.slice(0, 8);
                setAdminPin(val);
              }}
              placeholder="Enter PIN"
              className="w-full bg-white/10 rounded-xl px-4 py-3 text-center text-lg text-white placeholder-slate-500 outline-none border border-white/10 focus:border-amber-400/50 tracking-[0.3em]"
              autoFocus
              maxLength={8}
              onKeyDown={e => { if (e.key === 'Enter' && adminPin.length >= 4) handleAdminPinSubmit(); }}
            />

            <div className="flex gap-3">
              <button
                onClick={handleAdminPinSubmit}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-navy-900 active:scale-[0.98] transition-transform"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
              >
                🔓 Enter
              </button>
              <button
                onClick={() => { setShowAdminPin(false); setAdminPin(''); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold glass text-slate-400 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-600">Default PIN: 12345678</p>
          </div>
        </div>
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {/* Business Profile Modal */}
      {selectedProvider && (
        <BusinessProfile provider={selectedProvider} onClose={() => setSelectedProvider(null)} />
      )}
    </div>
  );
}
