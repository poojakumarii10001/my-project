import React, { useState } from 'react';
import { storage, Reel } from '../utils/storage';
import { categories } from '../data/categories';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';

const reelReportReasons = [
  { id: 'spam', en: 'Spam', hi: 'स्पैम' },
  { id: 'inappropriate', en: 'Inappropriate content', hi: 'अनुचित सामग्री' },
  { id: 'misleading', en: 'Misleading / Fake', hi: 'भ्रामक / फर्ज़ी' },
  { id: 'offensive', en: 'Offensive / Abusive', hi: 'आपत्तिजनक' },
  { id: 'copyright', en: 'Copyright violation', hi: 'कॉपीराइट उल्लंघन' },
  { id: 'scam', en: 'Scam / Fraud', hi: 'धोखाधड़ी' },
  { id: 'other', en: 'Other', hi: 'अन्य' },
];

export const ReelsPage: React.FC = () => {
  const { t, isHindi } = useLang();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [reels, setReels] = useState<Reel[]>(storage.getReels());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [providerId, setProviderId] = useState('');
  const [success, setSuccess] = useState('');
  const [reportId, setReportId] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'video' | 'photo'>('video');
  const [editReelId, setEditReelId] = useState('');

  const providers = storage.getProviders();
  const activeProviders = providers.filter(p => p.status !== 'suspended' && p.status !== 'rejected');

  // Only show approved reels from non-suspended providers
  const approvedReels = reels.filter(r => {
    if (r.status !== 'approved') return false;
    const provider = providers.find(p => p.id === r.providerId);
    if (provider && provider.status === 'suspended') return false;
    return true;
  });

  const handleUpload = () => {
    if (!title || !providerId || !mediaPreview) {
      alert(t('Please add title, provider and media file', 'कृपया शीर्षक, प्रोवाइडर और मीडिया फ़ाइल चुनें'));
      return;
    }

    if (editReelId) {
      const existing = reels.find(r => r.id === editReelId);
      if (!existing) return;
      const updated: Reel = {
        ...existing,
        providerId,
        title,
        description,
        mediaUrl: mediaPreview,
        mediaType,
        status: 'pending',
        updatedAt: new Date().toISOString(),
      };
      storage.saveReel(updated);
      setReels(storage.getReels());
      setTitle('');
      setDescription('');
      setProviderId('');
      setMediaPreview('');
      setMediaType('video');
      setEditReelId('');
      setSuccess(t('Media updated! Pending admin re-approval.', 'मीडिया अपडेट हो गया! एडमिन री-अप्रूवल लंबित।'));
      setTimeout(() => setSuccess(''), 4000);
      return;
    }

    const reel: Reel = {
      id: `reel_${Date.now()}`,
      providerId,
      title,
      description,
      mediaUrl: mediaPreview,
      mediaType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      likes: 0,
      views: 0,
    };
    storage.saveReel(reel);
    setReels(storage.getReels());
    setTitle('');
    setDescription('');
    setProviderId('');
    setMediaPreview('');
    setMediaType('video');
    setSuccess(t('Reel/Photo uploaded! Pending admin approval.', 'रील/फोटो अपलोड हुई! एडमिन स्वीकृति लंबित।'));
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleEdit = (reel: Reel) => {
    setActiveTab('upload');
    setEditReelId(reel.id);
    setProviderId(reel.providerId);
    setTitle(reel.title);
    setDescription(reel.description || '');
    setMediaPreview(reel.mediaUrl || '');
    setMediaType(reel.mediaType || 'video');
  };

  const handleReport = (reelId: string) => {
    if (!reportReason) {
      alert(t('Please select a reason', 'कृपया कारण चुनें'));
      return;
    }
    const reel = reels.find(r => r.id === reelId);
    if (reel) {
      reel.status = 'reported';
      storage.saveReel(reel);
      setReels(storage.getReels());

      storage.saveReport({
        id: `rep_${Date.now()}`,
        type: 'reel',
        targetId: reel.id,
        targetName: reel.title,
        reason: reportReason,
        details: reportDetails,
        status: 'open',
        createdAt: new Date().toISOString(),
      });

      storage.saveComplaint({
        id: `comp_${Date.now()}`,
        type: 'reel_report',
        targetId: reel.id,
        targetName: reel.title,
        reason: reportReason,
        message: `Reel "${reel.title}" reported: ${reportReason}${reportDetails ? ` - ${reportDetails}` : ''}`,
        status: 'open',
        createdAt: new Date().toISOString(),
      });
    }
    setReportId('');
    setReportReason('');
    setReportDetails('');
    alert(t('Report submitted. Thank you.', 'रिपोर्ट जमा हो गई। धन्यवाद।'));
  };

  const handleLike = (reelId: string) => {
    const reel = reels.find(r => r.id === reelId);
    if (reel) {
      reel.likes++;
      storage.saveReel(reel);
      setReels([...storage.getReels()]);
    }
  };

  const handleMediaPreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) setMediaType('video');
      if (file.type.startsWith('image/')) setMediaType('photo');
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderMedia = (reel: Reel) => {
    if (!reel.mediaUrl) {
      return (
        <div className="text-center px-4">
          <div className="text-6xl mb-3">🎬</div>
          <div className="text-base font-bold text-white">{reel.title}</div>
        </div>
      );
    }

    if (reel.mediaType === 'photo') {
      return <img src={reel.mediaUrl} alt={reel.title} className="w-full h-full object-cover" />;
    }

    return (
      <video
        src={reel.mediaUrl}
        className="w-full h-full object-cover"
        controls
        playsInline
        preload="metadata"
      />
    );
  };

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${
    isDark
      ? 'bg-white/8 text-white placeholder-slate-500 border-white/10 focus:border-amber-400/50'
      : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-amber-500'
  }`;

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gradient-gold">🎬 {t('Reels & Photos', 'रील्स और फोटो')}</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('Watch, scroll and upload business media', 'बिज़नेस मीडिया देखें, स्क्रोल करें और अपलोड करें')}</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex rounded-xl overflow-hidden glass">
        <button
          onClick={() => setActiveTab('browse')}
          className="flex-1 py-3 text-sm font-bold transition-colors"
          style={{ background: activeTab === 'browse' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'transparent', color: activeTab === 'browse' ? '#0f172a' : (isDark ? '#e2e8f0' : '#374151') }}
        >
          🎥 {t('Browse Reels', 'रील्स देखें')}
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className="flex-1 py-3 text-sm font-bold transition-colors"
          style={{ background: activeTab === 'upload' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent', color: activeTab === 'upload' ? '#fff' : (isDark ? '#e2e8f0' : '#374151') }}
        >
          ⬆️ {t('Upload Reel', 'रील अपलोड')}
        </button>
      </div>

      {success && (
        <div className="rounded-xl p-3 text-center text-sm font-bold text-green-400" style={{
          background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          ✅ {success}
        </div>
      )}

       {/* Browse Tab — Scrollable vertical feed */}
      {activeTab === 'browse' && (
        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-1">
          {approvedReels.length > 0 ? (
            approvedReels.map(reel => {
              const provider = providers.find(p => p.id === reel.providerId);
              const cat = categories.find(c => c.id === provider?.category);
              return (
                <div key={reel.id} className="glass rounded-2xl overflow-hidden">
                  {/* Reel Media Area — full width visual */}
                  <div className="relative h-72 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(99,102,241,0.12), rgba(236,72,153,0.08))'
                  }}>
                    {renderMedia(reel)}
                    {/* View count overlay */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/40 text-[10px] text-white font-semibold">
                      👁️ {reel.views} {t('views', 'व्यूज')}
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/50 text-[10px] text-white font-semibold">
                      {reel.mediaType === 'photo' ? `🖼️ ${t('Photo', 'फोटो')}` : `🎬 ${t('Video', 'वीडियो')}`}
                    </div>
                  </div>

                  {/* Reel Info & Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{
                          background: 'linear-gradient(135deg, #fbbf24, #d97706)'
                        }}>
                          {cat?.icon || '🏪'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{provider?.businessName || t('Business', 'व्यापार')}</div>
                          <div className={`text-[11px] ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{reel.title}</div>
                          {reel.description && <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{reel.description}</div>}
                          <div className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                            {new Date(reel.createdAt).toLocaleDateString(isHindi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      {provider?.status === 'verified' && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-bold">✅ {t('Verified', 'सत्यापित')}</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-5">
                      <button onClick={() => handleLike(reel.id)} className="flex items-center gap-1.5 text-xs font-bold text-pink-400 hover:text-pink-300 active:scale-95 transition-transform">
                        ❤️ {reel.likes}
                      </button>
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>👁️ {reel.views}</span>
                      <button
                        onClick={() => { setReportId(reel.id); setReportReason(''); setReportDetails(''); }}
                        className={`text-xs ml-auto font-semibold ${isDark ? 'text-red-400/70 hover:text-red-400' : 'text-red-600'}`}
                      >
                        🚩 {t('Report', 'रिपोर्ट')}
                      </button>
                    </div>

                    {/* Report Modal Inline */}
                    {reportId === reel.id && (
                      <div className="mt-3 p-3 rounded-xl border border-red-500/20 space-y-2 animate-fadeIn" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <div className="text-xs font-bold text-red-400">🚩 {t('Report this reel:', 'इस रील की रिपोर्ट करें:')}</div>
                        <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                          className={inputClass}>
                          <option value="">{t('Select reason', 'कारण चुनें')}</option>
                          {reelReportReasons.map(r => (
                            <option key={r.id} value={r.id}>{isHindi ? r.hi : r.en}</option>
                          ))}
                        </select>
                        <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)}
                          placeholder={t('Details (optional)', 'विवरण (वैकल्पिक)')}
                          className={`${inputClass} min-h-[40px] resize-none`} />
                        <div className="flex gap-2">
                          <button onClick={() => handleReport(reel.id)}
                            className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-500/20 text-red-400 active:scale-95">
                            {t('Submit Report', 'रिपोर्ट जमा करें')}
                          </button>
                          <button onClick={() => { setReportId(''); setReportReason(''); setReportDetails(''); }}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold glass ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {t('Cancel', 'रद्द करें')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="text-5xl mb-3">🎬</div>
              <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t('No reels yet', 'अभी कोई रील नहीं')}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>{t('Be the first to upload!', 'पहले अपलोड करें!')}</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-navy-900 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}
              >
                ⬆️ {t('Upload Now', 'अभी अपलोड करें')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-amber-400">⬆️ {editReelId ? t('Edit Reel/Photo', 'रील/फोटो अपडेट करें') : t('Upload New Reel/Photo', 'नई रील/फोटो अपलोड करें')}</h3>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Select Provider', 'प्रोवाइडर चुनें')} *</label>
            <select value={providerId} onChange={e => setProviderId(e.target.value)} className={inputClass}>
              <option value="">-- {t('Select Provider', 'प्रोवाइडर चुनें')} --</option>
              {activeProviders.map(p => (
                <option key={p.id} value={p.id}>{p.businessName} ({p.mobile})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Title', 'शीर्षक')} *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('Reel/Photo title', 'रील/फोटो शीर्षक')} className={inputClass} />
          </div>

          <div>
            <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Description', 'विवरण')}</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={t('Describe your reel...', 'अपनी रील का विवरण दें...')}
              className={`${inputClass} min-h-[80px] resize-none`} />
          </div>

          <label className="glass rounded-xl p-6 text-center cursor-pointer block hover:bg-white/10 transition-colors">
            {mediaPreview ? (
              <img src={mediaPreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg mb-2 mx-auto" />
            ) : (
              <>
                <div className="text-3xl mb-2">📹</div>
                <div className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Tap to select video/photo', 'वीडियो/फोटो चुनने के लिए टैप करें')}</div>
                <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>MP4, MOV, JPG, PNG (max 50MB)</div>
              </>
            )}
            <input type="file" accept="video/*,image/*" className="hidden" onChange={handleMediaPreview} />
          </label>

          {mediaPreview && (
            <div className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-700'}`}>
              {t('Selected media type:', 'चुना गया मीडिया प्रकार:')} {mediaType === 'photo' ? t('Photo', 'फोटो') : t('Video', 'वीडियो')}
            </div>
          )}

          <button onClick={handleUpload}
            className="w-full py-4 rounded-xl text-base font-bold text-navy-900 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)' }}>
            ⬆️ {editReelId ? t('Update & Submit for Review', 'अपडेट करें और समीक्षा के लिए भेजें') : t('Upload Reel/Photo', 'रील/फोटो अपलोड करें')}
          </button>

          {editReelId && (
            <button
              onClick={() => {
                setEditReelId('');
                setProviderId('');
                setTitle('');
                setDescription('');
                setMediaPreview('');
                setMediaType('video');
              }}
              className={`w-full py-3 rounded-xl text-sm font-bold glass ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              {t('Cancel Edit', 'एडिट रद्द करें')}
            </button>
          )}

          <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div className={`text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-800'}`}>🛠️ {t('Your uploaded media (edit/update)', 'आपका अपलोड किया मीडिया (एडिट/अपडेट)')}</div>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {reels.filter(r => r.providerId === providerId).length === 0 && (
                <div className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-gray-600'}`}>{t('Select provider to see uploaded media.', 'अपलोड मीडिया देखने के लिए प्रोवाइडर चुनें।')}</div>
              )}
              {reels
                .filter(r => r.providerId === providerId)
                .map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleEdit(r)}
                    className="w-full text-left px-3 py-2 rounded-lg glass hover:bg-white/10 transition-colors"
                  >
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{r.title}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {r.mediaType === 'photo' ? t('Photo', 'फोटो') : t('Video', 'वीडियो')} • {t('Status', 'स्थिति')}: {r.status}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <p className="text-[10px] text-amber-400/80 font-semibold">
              ⚠️ {t(
                'Reels are reviewed by admin before being published. No public comments or DMs.',
                'रील्स एडमिन समीक्षा के बाद प्रकाशित होती हैं। कोई पब्लिक कमेंट या DM नहीं।'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
