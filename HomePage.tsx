import React, { useState } from 'react';
import { categories, emergencyHelplines } from '../data/categories';
import { storage, Provider } from '../utils/storage';
import { useLang } from '../context/LangContext';
import type { Page } from './BottomNav';

interface HomePageProps {
  onNavigate: (page: Page) => void;
  onViewProvider: (provider: Provider) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onViewProvider }) => {
  const [showAllCats, setShowAllCats] = useState(false);
  const [callConfirm, setCallConfirm] = useState<{ name: string; nameHi?: string; number: string } | null>(null);
  const { t, isHindi } = useLang();

  const allProviders = storage.getProviders();
  const providers = allProviders.filter(p => p.status === 'approved' || p.status === 'verified');
  const verifiedProviders = providers.filter(p => p.status === 'verified');
  const providerStat = allProviders.length > 0 ? `${allProviders.length}+` : t('Growing', 'विकास में');
  const displayCats = showAllCats ? categories : categories.slice(0, 24);
  const popularCats = categories.filter((_, i) => [0, 6, 12, 18, 24, 30, 36, 42].includes(i));

  const handleEmergencyCall = (name: string, nameHi: string | undefined, number: string) => {
    setCallConfirm({ name, nameHi, number });
  };

  const confirmCall = () => {
    if (callConfirm) {
      window.location.href = `tel:${callConfirm.number}`;
      setCallConfirm(null);
    }
  };

  return (
    <div className="animate-fadeIn space-y-5">
      {/* Hero Banner */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{
        background: 'radial-gradient(circle at 88% 18%, rgba(255, 199, 82, 0.22), transparent 38%), linear-gradient(160deg, #2a4f8f 0%, #22457f 45%, #17366b 100%)',
        border: '1px solid rgba(251, 191, 36, 0.34)',
        boxShadow: '0 12px 26px rgba(10, 14, 26, 0.26)'
      }}>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1 hero-on-dark">
            {t('Find Local Services 🔍', 'लोकल सर्विसेज़ खोजें 🔍')}
            <br/>
            <span className="text-base font-semibold hero-accent-on-dark">
              {t('Find services near you', 'अपने आसपास की सर्विसेज़ खोजें')}
            </span>
          </h2>
          <p className="text-sm font-semibold mb-4 hero-sub-on-dark">
            {t('Trusted local businesses near you', 'आपके पास की विश्वसनीय सर्विसेज़')}
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-navy-900 flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 6px 16px rgba(245, 158, 11, 0.45)' }}
          >
            🔍 {t('Search Now', 'अभी खोजें')}
          </button>
        </div>
        <div className="absolute -right-4 -bottom-4 text-7xl opacity-20">🏪</div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: '📦', num: `${categories.length}+`, label: t('Categories', 'श्रेणियाँ') },
          { icon: '👥', num: providerStat, label: t('Providers', 'प्रोवाइडर') },
          { icon: '📍', num: '500+', label: t('Cities', 'शहर') },
        ].map(s => (
          <div key={s.label} className="glass rounded-xl p-3 text-center" style={{ border: '1px solid rgba(251, 191, 36, 0.22)' }}>
            <div className="text-2xl mb-1" style={{ filter: 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.25))' }}>{s.icon}</div>
            <div className="text-lg font-bold text-gradient-gold">{s.num}</div>
            <div className="text-[10px] text-slate-300 font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Verified Providers Spotlight */}
      {verifiedProviders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">✅ {t('Verified Businesses', 'सत्यापित व्यवसाय')}</h3>
            <button onClick={() => onNavigate('search')} className="text-xs text-amber-400">{t('View All →', 'सभी देखें →')}</button>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {verifiedProviders.slice(0, 8).map(prov => (
              <button
                key={prov.id}
                onClick={() => onViewProvider(prov)}
                className="flex-shrink-0 glass rounded-xl p-3 text-center w-24 hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl mb-1">{categories.find(c => c.id === prov.category)?.icon || '🏪'}</div>
                <div className="text-[10px] text-white truncate">{prov.businessName}</div>
                <div className="text-[8px] text-green-400">✅ {t('Verified', 'सत्यापित')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">🌟 {t('Popular Categories', 'लोकप्रिय श्रेणियाँ')}</h3>
          <button onClick={() => onNavigate('search')} className="text-xs text-amber-400">{t('View All →', 'सभी देखें →')}</button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {popularCats.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('search')}
              className="flex-shrink-0 glass rounded-xl p-3 text-center w-20 hover:bg-white/10 transition-colors"
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-[10px] text-slate-300 truncate">{isHindi ? cat.hi.split('/')[0].split('(')[0].trim() : cat.en.split('/')[0].split('(')[0].trim()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* All Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">📂 {t('All Categories', 'सभी श्रेणियाँ')}</h3>
          <span className="text-[10px] text-slate-500">{categories.length} {t('categories', 'श्रेणियाँ')}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {displayCats.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigate('search')}
              className="glass rounded-xl p-2.5 text-center hover:bg-white/10 transition-colors"
            >
              <div className="text-xl mb-0.5">{cat.icon}</div>
              <div className="text-[10px] text-slate-300 leading-tight truncate font-semibold">{isHindi ? cat.hi.split('/')[0].split('(')[0].trim() : cat.en.split('/')[0].split('(')[0].trim()}</div>
              <div className="text-[9px] text-amber-400 truncate font-semibold">{isHindi ? cat.en.split('/')[0].split('(')[0].trim() : cat.hi.split('/')[0].split('(')[0].trim()}</div>
            </button>
          ))}
        </div>
        {!showAllCats && (
          <button
            onClick={() => setShowAllCats(true)}
            className="w-full mt-3 py-3 rounded-xl glass text-sm font-semibold text-amber-400 hover:bg-white/10 transition-colors"
          >
            {t(`Show All ${categories.length} Categories ↓`, `सभी ${categories.length} श्रेणियाँ देखें ↓`)}
          </button>
        )}
        {showAllCats && (
          <button
            onClick={() => setShowAllCats(false)}
            className="w-full mt-3 py-3 rounded-xl glass text-sm font-semibold text-slate-400 hover:bg-white/10 transition-colors"
          >
            {t('Show Less ↑', 'कम देखें ↑')}
          </button>
        )}
      </div>

      {/* Featured Providers */}
      {providers.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-white mb-3">⭐ {t('Featured Providers', 'विशेष प्रोवाइडर')}</h3>
          <div className="space-y-2">
            {providers.slice(0, 5).map(prov => (
              <button
                key={prov.id}
                onClick={() => onViewProvider(prov)}
                className="w-full glass rounded-xl p-4 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(59,130,246,0.2))'
                }}>
                  {categories.find(c => c.id === prov.category)?.icon || '🏪'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{prov.businessName}</div>
                  <div className="text-xs text-slate-400 truncate">{prov.locality}, {prov.city}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {prov.status === 'verified' ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">✅ {t('Verified', 'सत्यापित')}</span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">📋 {t('Listed', 'सूचीबद्ध')}</span>
                    )}
                    <span className="text-[10px] text-amber-400 font-medium">
                      {isHindi ? (categories.find(c => c.id === prov.category)?.hi || prov.category) : (categories.find(c => c.id === prov.category)?.en || prov.category)}
                    </span>
                  </div>
                </div>
                <span className="text-slate-500">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Register CTA */}
      <div className="rounded-2xl p-5" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
        border: '1px solid rgba(99, 102, 241, 0.2)'
      }}>
        <h3 className="text-lg font-bold text-white mb-1">📋 {t('Register Your Business', 'अपना बिज़नेस रजिस्टर करें')}</h3>
        <p className="text-xs text-slate-400 mb-3">{t('Get discovered by local customers in your area', 'अपने क्षेत्र के लोकल ग्राहकों से जुड़ें')}</p>
        <button
          onClick={() => onNavigate('register')}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {t('Register Now →', 'अभी रजिस्टर करें →')}
        </button>
      </div>

      {/* Emergency Helplines */}
      <div>
        <h3 className="text-base font-bold text-white mb-2">🚨 {t('Emergency Helplines', 'आपातकालीन नंबर')}</h3>
        <div className="rounded-xl p-2.5 mb-3" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.24)' }}>
          <p className="text-[10px] text-red-400/80 text-center">
            ⚠️ {t(
              'These are informational shortcuts only. Local Finder is not an emergency authority or service provider.',
              'ये केवल सूचनात्मक शॉर्टकट हैं। Local Finder आपातकालीन प्राधिकरण या सेवा प्रदाता नहीं है।'
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {emergencyHelplines.map((h, idx) => (
            <button
              key={`${h.number}-${idx}`}
              onClick={() => handleEmergencyCall(h.name, h.nameHi, h.number)}
              className="glass rounded-xl p-3 flex items-center gap-2 hover:bg-white/10 transition-colors text-left"
              style={{ borderLeft: '3px solid rgba(239, 68, 68, 0.55)' }}
            >
              <span className="text-xl">{h.icon}</span>
              <div>
                <div className="text-xs font-bold text-white">{isHindi ? (h.nameHi || h.name) : h.name}</div>
                <div className="text-sm font-black text-amber-400 tracking-wide">
                  {h.number}
                  {(h as any).altNumber && <span className="text-amber-400/70"> / {(h as any).altNumber}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Call Confirmation */}
      {callConfirm && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setCallConfirm(null)}>
          <div className="w-full max-w-sm glass-strong rounded-2xl p-6 space-y-4 animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-2">📞</div>
              <h3 className="text-lg font-bold text-white">{t(`Call ${callConfirm.name}?`, `${callConfirm.nameHi || callConfirm.name} को कॉल करें?`)}</h3>
              <p className="text-2xl font-black text-amber-400 mt-1">{callConfirm.number}</p>
              <p className="text-[10px] text-slate-400 mt-2">{t('This will open your phone dialer.', 'यह आपका फोन डायलर खोलेगा।')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmCall}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-navy-900"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                📞 {t('Call Now', 'अभी कॉल करें')}
              </button>
              <button onClick={() => setCallConfirm(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold glass text-slate-400 hover:bg-white/10">
                {t('Cancel', 'रद्द करें')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="glass rounded-2xl p-5 text-center space-y-3">
        <div className="text-2xl">🏪</div>
        <h4 className="text-sm font-bold text-gradient-gold">Local Finder</h4>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          {t(
            "India's trusted local service discovery platform.",
            'भारत का भरोसेमंद लोकल सर्विस प्लेटफॉर्म।'
          )}
        </p>
        <p className="text-[9px] text-slate-500 leading-relaxed">
          {t(
            'Local Finder is a discovery platform only. We do not directly provide any service. We are not responsible for transactions between users and providers.',
            'Local Finder केवल एक खोज प्लेटफॉर्म है। हम सीधे कोई सेवा प्रदान नहीं करते। उपयोगकर्ताओं और प्रदाताओं के बीच लेनदेन के लिए हम ज़िम्मेदार नहीं हैं।'
          )}
        </p>
        <div className="flex justify-center gap-4 pt-2 flex-wrap">
          <a href="/privacy.html" className="text-[10px] text-amber-400 underline">{t('Privacy Policy', 'गोपनीयता नीति')}</a>
          <span className="text-slate-600">|</span>
          <a href="/privacy.html" className="text-[10px] text-amber-400 underline">{t('Terms', 'शर्तें')}</a>
          <span className="text-slate-600">|</span>
          <a href="/privacy.html" className="text-[10px] text-amber-400 underline">{t('Contact', 'संपर्क')}</a>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-500">v1.0.0</span>
        </div>
        <p className="text-[9px] text-slate-600">© 2026 Local Finder. All rights reserved.</p>
      </div>
    </div>
  );
};
