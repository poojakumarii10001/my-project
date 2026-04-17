import React, { useState, useCallback, useRef, useMemo } from 'react';
import { categories } from '../data/categories';
import { storage, Provider } from '../utils/storage';
import { useLang } from '../context/LangContext';
import type { Page } from './BottomNav';

interface SearchPageProps {
  onViewProvider: (provider: Provider) => void;
  onNavigate?: (page: Page) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onViewProvider, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(5);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [homeServiceOnly, setHomeServiceOnly] = useState(false);
  const [gpsConfirm, setGpsConfirm] = useState(false);
  const [voiceConfirm, setVoiceConfirm] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, isHindi } = useLang();

  const recentSearches = storage.getRecentSearches();
  const allProviders = storage.getProviders().filter(p => p.status === 'approved' || p.status === 'verified');

  const isOpenNow = (hours: string): boolean => {
    if (!hours) return false;
    const lower = hours.toLowerCase();
    if (lower.includes('24') || lower.includes('always')) return true;
    const match = lower.match(/(\d{1,2})\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})\s*(am|pm)?/i);
    if (!match) return false;
    let startH = parseInt(match[1]);
    const startP = match[2]?.toLowerCase();
    let endH = parseInt(match[3]);
    const endP = match[4]?.toLowerCase();
    if (startP === 'pm' && startH < 12) startH += 12;
    if (startP === 'am' && startH === 12) startH = 0;
    if (endP === 'pm' && endH < 12) endH += 12;
    if (endP === 'am' && endH === 12) endH = 0;
    if (!startP && !endP) { if (startH < 7) startH += 12; if (endH <= startH) endH += 12; }
    const now = new Date().getHours();
    return now >= startH && now < endH;
  };

  // Autocomplete suggestions — triggers on 1+ chars
  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const q = query.toLowerCase();
    const catMatches = categories
      .filter(c => c.en.toLowerCase().includes(q) || c.hi.includes(query) || c.id.includes(q))
      .slice(0, 8)
      .map(c => ({ type: 'category' as const, text: isHindi ? c.hi : c.en, icon: c.icon, id: c.id }));
    const provMatches = allProviders
      .filter(p => p.businessName.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.locality.toLowerCase().includes(q))
      .slice(0, 5)
      .map(p => ({ type: 'provider' as const, text: p.businessName, icon: categories.find(c => c.id === p.category)?.icon || '🏪', id: p.id, provider: p }));
    return [...catMatches, ...provMatches];
  }, [query, allProviders, isHindi]);

  const filteredProviders = allProviders.filter(p => {
    const q = query.toLowerCase();
    const matchesQuery = !q ||
      p.businessName.toLowerCase().includes(q) ||
      p.fullName.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.locality.toLowerCase().includes(q) ||
      p.pincode.includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (categories.find(c => c.id === p.category)?.en.toLowerCase().includes(q)) ||
      (categories.find(c => c.id === p.category)?.hi.includes(query));
    const matchesCat = !selectedCat || p.category === selectedCat;
    const matchesVerified = !verifiedOnly || p.status === 'verified';
    const matchesOpenNow = !openNowOnly || isOpenNow(p.businessHours);
    const matchesHomeService = !homeServiceOnly || p.serviceType === 'home-visit' || p.serviceType === 'both';
    return matchesQuery && matchesCat && matchesVerified && matchesOpenNow && matchesHomeService;
  });

  const filteredCategories = categories.filter(c => {
    const q = query.toLowerCase();
    return !q || c.en.toLowerCase().includes(q) || c.hi.includes(query) || c.id.includes(q);
  });

  const handleSearch = useCallback(() => {
    if (query.trim()) {
      storage.addRecentSearch(query.trim());
    }
    setShowSuggestions(false);
  }, [query]);

  const handleGPS = () => {
    if (!gpsConfirm) {
      setGpsConfirm(true);
      return;
    }
    setGpsConfirm(false);
    setGpsStatus(t('📍 Detecting location...', '📍 लोकेशन खोज रहे हैं...'));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsStatus(`📍 Location found: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setTimeout(() => setGpsStatus(t('✅ GPS location set', '✅ GPS लोकेशन सेट')), 1500);
        },
        (err) => {
          if (err.code === 1) {
            setGpsStatus(t('❌ Location permission denied. Please enable in Settings.', '❌ लोकेशन अनुमति नहीं दी गई। सेटिंग्स में सक्षम करें।'));
          } else {
            setGpsStatus(t('❌ Location unavailable. Try manual search.', '❌ लोकेशन उपलब्ध नहीं। मैन्युअल सर्च करें।'));
          }
        },
        { timeout: 10000 }
      );
    } else {
      setGpsStatus(t('❌ GPS not available on this device', '❌ GPS इस डिवाइस पर उपलब्ध नहीं'));
    }
  };

  const handleVoice = () => {
    if (!voiceConfirm) {
      setVoiceConfirm(true);
      return;
    }
    setVoiceConfirm(false);
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert(t('Voice search is not supported on this browser', 'वॉइस सर्च इस ब्राउज़र पर सपोर्टेड नहीं है'));
      return;
    }
    const recognition = new SR();
    recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      setShowSuggestions(true);
    };
    recognition.onerror = () => {
      alert(t('Voice search failed. Please try again.', 'वॉइस सर्च विफल। कृपया फिर से प्रयास करें।'));
    };
    recognition.start();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'verified') return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">✅ {t('Verified', 'सत्यापित')}</span>;
    return <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">📋 {t('Listed', 'सूचीबद्ध')}</span>;
  };

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Search Bar */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                onFocus={() => query.length >= 1 && setShowSuggestions(true)}
                placeholder={t('Service, business, city, pincode...', 'सर्विस, बिज़नेस, शहर, पिनकोड...')}
                className="w-full bg-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-400 outline-none border border-white/10 focus:border-amber-400/50 transition-colors"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔍</span>
            </div>
            <button
              onClick={handleVoice}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-lg glass hover:bg-white/10 transition-colors"
              title="Voice Search"
            >
              🎙️
            </button>
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-30 glass-strong rounded-xl overflow-hidden max-h-64 overflow-y-auto animate-fadeIn" style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.type}-${s.id}-${idx}`}
                  onClick={() => {
                    if (s.type === 'category') {
                      setQuery(s.text);
                      setSelectedCat(s.id);
                      setShowSuggestions(false);
                      handleSearch();
                    } else if (s.type === 'provider' && 'provider' in s) {
                      setShowSuggestions(false);
                      onViewProvider(s.provider as Provider);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                >
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{s.text}</div>
                    <div className="text-[10px] text-slate-500">{s.type === 'category' ? t('Category', 'श्रेणी') : t('Business', 'व्यापार')}</div>
                  </div>
                  <span className="text-[10px] text-slate-500">→</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Voice Permission Confirm */}
        {voiceConfirm && (
          <div className="rounded-xl p-3 border border-amber-500/30 animate-fadeIn" style={{ background: 'rgba(251,191,36,0.08)' }}>
            <p className="text-xs text-amber-300 mb-2">🎙️ {t('Voice search needs microphone access.', 'वॉइस सर्च के लिए माइक्रोफोन ज़रूरी है।')}</p>
            <div className="flex gap-2">
              <button onClick={handleVoice} className="flex-1 py-2 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400">{t('Allow & Search', 'अनुमति दें')}</button>
              <button onClick={() => setVoiceConfirm(false)} className="flex-1 py-2 rounded-lg text-xs glass text-slate-400">{t('Cancel', 'रद्द करें')}</button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleGPS}
            className="flex-1 py-2 rounded-xl text-xs font-medium glass hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
          >
            📍 {t('Near Me', 'मेरे पास')}
          </button>
          <button
            onClick={handleSearch}
            className="flex-1 py-2 rounded-xl text-xs font-bold text-navy-900"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
          >
            🔍 {t('Search', 'खोजें')}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
          >
            ⚙️
          </button>
        </div>

        {/* GPS Permission Confirm */}
        {gpsConfirm && (
          <div className="rounded-xl p-3 border border-blue-500/30 animate-fadeIn" style={{ background: 'rgba(59,130,246,0.08)' }}>
            <p className="text-xs text-blue-300 mb-2">📍 {t('Local Finder wants to use your location to find nearby services.', 'आसपास की सर्विसेज़ खोजने के लिए लोकेशन का उपयोग किया जाएगा।')}</p>
            <div className="flex gap-2">
              <button onClick={handleGPS} className="flex-1 py-2 rounded-lg text-xs font-bold bg-blue-500/20 text-blue-400">{t('Allow', 'अनुमति दें')}</button>
              <button onClick={() => setGpsConfirm(false)} className="flex-1 py-2 rounded-lg text-xs glass text-slate-400">{t('Cancel', 'रद्द करें')}</button>
            </div>
          </div>
        )}

        {gpsStatus && (
          <div className="text-xs text-amber-400 text-center py-1">{gpsStatus}</div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="space-y-3 pt-2 border-t border-white/10 animate-fadeIn">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t('Search Radius', 'सर्च रेडियस')}: {radius} km</label>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                className="w-full accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>1 km</span><span>25 km</span><span>50 km</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">{t('Category', 'श्रेणी')}</label>
              <select
                value={selectedCat}
                onChange={e => setSelectedCat(e.target.value)}
                className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none border border-white/10"
              >
                <option value="">{t('All Categories', 'सभी श्रेणियाँ')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {isHindi ? c.hi : c.en}</option>
                ))}
              </select>
            </div>
            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${verifiedOnly ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'glass text-slate-400'}`}
              >
                ✅ {t('Verified Only', 'केवल सत्यापित')}
              </button>
              <button
                onClick={() => setOpenNowOnly(!openNowOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${openNowOnly ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'glass text-slate-400'}`}
              >
                🕐 {t('Open Now', 'अभी खुला')}
              </button>
              <button
                onClick={() => setHomeServiceOnly(!homeServiceOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${homeServiceOnly ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'glass text-slate-400'}`}
              >
                🏠 {t('Home Service', 'होम सर्विस')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !query && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-400">🕒 {t('Recent Searches', 'हाल की खोजें')}</h4>
            <button onClick={() => { storage.clearRecentSearches(); }} className="text-[10px] text-red-400">{t('Clear', 'हटाएं')}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); setShowSuggestions(true); }}
                className="px-3 py-1.5 rounded-full glass text-xs text-slate-300 hover:bg-white/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Verified */}
      {!query && allProviders.filter(p => p.status === 'verified').length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-2">✅ {t('Nearby Verified Businesses', 'पास के सत्यापित व्यवसाय')}</h4>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {allProviders.filter(p => p.status === 'verified').slice(0, 8).map(prov => (
              <button
                key={prov.id}
                onClick={() => onViewProvider(prov)}
                className="flex-shrink-0 glass rounded-xl p-3 text-center w-24 hover:bg-white/10 transition-colors"
              >
                <div className="text-xl mb-1">{categories.find(c => c.id === prov.category)?.icon || '🏪'}</div>
                <div className="text-[10px] text-white truncate">{prov.businessName}</div>
                <div className="text-[8px] text-green-400">✅ {t('Verified', 'सत्यापित')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Chips */}
      {!query && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-2">📂 {t('Browse Categories', 'श्रेणियाँ ब्राउज़ करें')}</h4>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 30).map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCat(cat.id); setQuery(isHindi ? cat.hi : cat.en); setShowSuggestions(false); }}
                className="px-3 py-1.5 rounded-full glass text-xs text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-1"
              >
                <span>{cat.icon}</span>
                <span>{(isHindi ? cat.hi : cat.en).split('/')[0].split('(')[0].trim()}</span>
              </button>
            ))}
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 py-1.5 rounded-full text-xs text-amber-400 border border-amber-400/30"
            >
              +{categories.length - 30} {t('more', 'और')}
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-2">
            📋 {t('Results', 'नतीजे')} ({filteredProviders.length} {t('providers', 'प्रोवाइडर')}, {filteredCategories.length} {t('categories', 'श्रेणियाँ')})
          </h4>

          {/* Matching Categories */}
          {filteredCategories.length > 0 && filteredCategories.length <= 20 && (
            <div className="mb-3">
              <div className="text-[10px] text-slate-500 mb-1">{t('Matching Categories:', 'मिलती श्रेणियाँ:')}</div>
              <div className="flex flex-wrap gap-1.5">
                {filteredCategories.slice(0, 10).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className="px-2.5 py-1 rounded-lg glass text-[11px] text-slate-300 flex items-center gap-1 hover:bg-white/10"
                  >
                    {cat.icon} {(isHindi ? cat.hi : cat.en).split('/')[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Provider Results */}
          {filteredProviders.length > 0 ? (
            <div className="space-y-2">
              {filteredProviders.map(prov => {
                const cat = categories.find(c => c.id === prov.category);
                const openStatus = isOpenNow(prov.businessHours);
                return (
                  <button
                    key={prov.id}
                    onClick={() => onViewProvider(prov)}
                    className="w-full glass rounded-xl p-4 flex items-center gap-3 text-left hover:bg-white/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(59,130,246,0.2))'
                    }}>
                      {cat?.icon || '🏪'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{prov.businessName}</div>
                      <div className="text-xs text-slate-300 truncate font-medium">{prov.fullName}</div>
                       <div className="text-[10px] text-slate-400 font-medium">{prov.locality}, {prov.city}{prov.pincode ? ` - ${prov.pincode}` : ''}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {getStatusBadge(prov.status)}
                        {prov.businessHours && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${openStatus ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {openStatus ? `🟢 ${t('Open', 'खुला')}` : `🔴 ${t('Closed', 'बंद')}`}
                          </span>
                        )}
                        {(prov.serviceType === 'home-visit' || prov.serviceType === 'both') && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400">🏠 {t('Home', 'घर')}</span>
                        )}
                         <span className="text-[9px] text-amber-400 font-medium">
                           {isHindi ? (cat?.hi || prov.category) : (cat?.en || prov.category)}
                         </span>
                      </div>
                    </div>
                    <span className="text-slate-500 text-lg">→</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm text-slate-400">{t('No results found', 'कोई रिज़ल्ट नहीं मिला')}</p>
              <p className="text-xs text-slate-500 mt-1">{t('Try a different search term or category', 'कोई और सर्च टर्म या श्रेणी आज़माएं')}</p>
              <div className="flex flex-col gap-2 mt-4">
                {verifiedOnly && (
                  <button onClick={() => setVerifiedOnly(false)} className="text-xs text-amber-400 underline">{t('Remove "Verified Only" filter', '"केवल सत्यापित" फ़िल्टर हटाएं')}</button>
                )}
                {openNowOnly && (
                  <button onClick={() => setOpenNowOnly(false)} className="text-xs text-amber-400 underline">{t('Remove "Open Now" filter', '"अभी खुला" फ़िल्टर हटाएं')}</button>
                )}
                <button
                  onClick={() => { setQuery(''); setSelectedCat(''); setVerifiedOnly(false); setOpenNowOnly(false); setHomeServiceOnly(false); }}
                  className="text-xs text-blue-400 underline"
                >
                  {t('Clear all filters', 'सभी फ़िल्टर हटाएं')}
                </button>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('register')}
                    className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-navy-900 mx-auto"
                    style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
                  >
                    📋 {t('Register Your Business', 'अपना बिज़नेस रजिस्टर करें')}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
