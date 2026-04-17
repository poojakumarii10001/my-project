import React, { useState } from 'react';
import { categories } from '../data/categories';
import { Provider, storage } from '../utils/storage';

interface BusinessProfileProps {
  provider: Provider;
  onClose: () => void;
}

const reportReasons = [
  { id: 'fake', en: 'Fake business', hi: 'फर्ज़ी बिज़नेस' },
  { id: 'wrong-phone', en: 'Wrong phone number', hi: 'गलत फोन नंबर' },
  { id: 'scam', en: 'Scam / Fraud', hi: 'धोखाधड़ी' },
  { id: 'duplicate', en: 'Duplicate listing', hi: 'डुप्लीकेट लिस्टिंग' },
  { id: 'offensive', en: 'Offensive content', hi: 'आपत्तिजनक सामग्री' },
  { id: 'wrong-category', en: 'Wrong category', hi: 'गलत श्रेणी' },
  { id: 'closed', en: 'Closed business', hi: 'बंद व्यापार' },
  { id: 'other', en: 'Other', hi: 'अन्य' },
];

export const BusinessProfile: React.FC<BusinessProfileProps> = ({ provider, onClose }) => {
  const category = categories.find(c => c.id === provider.category);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const isOpenNow = (hours: string): boolean | null => {
    if (!hours) return null;
    const lower = hours.toLowerCase();
    if (lower.includes('24') || lower.includes('always')) return true;
    const match = lower.match(/(\d{1,2})\s*(am|pm)?\s*[-–to]+\s*(\d{1,2})\s*(am|pm)?/i);
    if (!match) return null;
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

  const openStatus = isOpenNow(provider.businessHours);

  const getStatusBadge = () => {
    switch (provider.status) {
      case 'verified':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">✅ Verified / सत्यापित</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">📋 Approved / स्वीकृत</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400">⏳ Pending Review / समीक्षा लंबित</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-400">📋 Listed</span>;
    }
  };

  const handleReportSubmit = () => {
    if (!reportReason) {
      alert('Please select a reason / कृपया कारण चुनें');
      return;
    }
    storage.saveReport({
      id: `rep_${Date.now()}`,
      type: 'listing',
      targetId: provider.id,
      targetName: provider.businessName,
      reason: reportReason,
      details: reportDetails,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    storage.saveComplaint({
      id: `comp_${Date.now()}`,
      type: 'listing_report',
      targetId: provider.id,
      targetName: provider.businessName,
      reason: reportReason,
      message: `Listing "${provider.businessName}" reported: ${reportReason}${reportDetails ? ` - ${reportDetails}` : ''}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    });
    setReportSubmitted(true);
    setShowReport(false);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl animate-slideUp"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cover Photo */}
        <div className="h-40 relative flex items-center justify-center" style={{
          background: provider.coverUrl
            ? `url(${provider.coverUrl}) center/cover`
            : 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(59,130,246,0.2), rgba(236,72,153,0.1))'
        }}>
          {!provider.coverUrl && <div className="text-6xl">{category?.icon || '🏪'}</div>}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white text-lg hover:bg-black/70"
          >
            ✕
          </button>
          {provider.plan === 'premium' && (
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-pink-500 to-rose-600">
              👑 Premium
            </span>
          )}
        </div>

        {/* Profile Info */}
        <div className="px-5 pb-8 -mt-8 relative">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg overflow-hidden" style={{
            background: provider.photoUrl ? 'transparent' : 'linear-gradient(135deg, #fbbf24, #d97706)',
            border: '4px solid #0f172a'
          }}>
            {provider.photoUrl ? (
              <img src={provider.photoUrl} alt={provider.businessName} className="w-full h-full object-cover" />
            ) : (
              category?.icon || '🏪'
            )}
          </div>

          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-white">{provider.businessName}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{provider.fullName}</p>
            <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
              {getStatusBadge()}
              <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/20 text-amber-400">
                {category?.en || provider.category}
              </span>
              {openStatus !== null && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${openStatus ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {openStatus ? '🟢 Open Now' : '🔴 Closed Now'}
                </span>
              )}
            </div>
          </div>

          {/* Contact Actions */}
          <div className="grid grid-cols-4 gap-2 mb-5">
            <a href={`tel:${provider.mobile}`}
              className="glass rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
              <div className="text-xl mb-1">📞</div>
              <div className="text-[10px] text-slate-300">Call</div>
            </a>
            <a href={`https://wa.me/91${provider.whatsapp || provider.mobile}`} target="_blank" rel="noreferrer"
              className="rounded-xl p-3 text-center hover:bg-green-500/30 transition-colors" style={{
                background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
              <div className="text-xl mb-1">💬</div>
              <div className="text-[10px] text-green-400">WhatsApp</div>
            </a>
            <button onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: provider.businessName,
                  text: `Check out ${provider.businessName} on Local Finder`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(`${provider.businessName} - ${provider.mobile}`);
                alert('Copied to clipboard! / कॉपी हो गया!');
              }
            }}
              className="glass rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
              <div className="text-xl mb-1">📤</div>
              <div className="text-[10px] text-slate-300">Share</div>
            </button>
            <button
              onClick={() => setShowReport(!showReport)}
              className="glass rounded-xl p-3 text-center hover:bg-red-500/10 transition-colors"
            >
              <div className="text-xl mb-1">🚩</div>
              <div className="text-[10px] text-red-400">Report</div>
            </button>
          </div>

          {/* Report Submitted Confirmation */}
          {reportSubmitted && (
            <div className="mb-4 rounded-xl p-3 text-center text-xs font-semibold text-green-400 animate-fadeIn" style={{
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)'
            }}>
              ✅ Report submitted. Admin will review. / रिपोर्ट जमा। एडमिन समीक्षा करेंगे।
            </div>
          )}

          {/* Report Form */}
          {showReport && !reportSubmitted && (
            <div className="mb-4 rounded-xl p-4 border border-red-500/20 animate-fadeIn" style={{ background: 'rgba(239,68,68,0.05)' }}>
              <h4 className="text-xs font-bold text-red-400 mb-2">🚩 Report this listing / रिपोर्ट करें</h4>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)}
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/10 mb-2">
                <option value="">Select reason / कारण चुनें</option>
                {reportReasons.map(r => (
                  <option key={r.id} value={r.id}>{r.en} / {r.hi}</option>
                ))}
              </select>
              <textarea value={reportDetails} onChange={e => setReportDetails(e.target.value)}
                placeholder="Additional details (optional) / अतिरिक्त विवरण"
                className="w-full bg-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none border border-white/10 min-h-[50px] resize-none mb-2" />
              <div className="flex gap-2">
                <button onClick={handleReportSubmit} className="flex-1 py-2 rounded-lg text-xs font-bold bg-red-500/20 text-red-400">Submit Report</button>
                <button onClick={() => { setShowReport(false); setReportReason(''); setReportDetails(''); }} className="flex-1 py-2 rounded-lg text-xs glass text-slate-400">Cancel</button>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 mb-2">📋 Business Details / व्यापार विवरण</h4>

            {provider.description && (
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-1">About / विवरण</div>
                <p className="text-xs text-slate-300 leading-relaxed">{provider.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">📂 Category</div>
                <div className="text-xs text-white">{category?.en || provider.category}</div>
                <div className="text-[10px] text-amber-400/60">{category?.hi}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">🕐 Hours</div>
                <div className="text-xs text-white">{provider.businessHours || 'Not specified'}</div>
                {openStatus !== null && (
                  <div className={`text-[10px] mt-0.5 ${openStatus ? 'text-green-400' : 'text-red-400'}`}>
                    {openStatus ? '🟢 Currently Open' : '🔴 Currently Closed'}
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-xl p-3">
              <div className="text-[10px] text-slate-500 mb-0.5">📍 Address / पता</div>
              <div className="text-xs text-white">{provider.address || provider.locality}</div>
              {provider.landmark && <div className="text-[10px] text-slate-400">Near: {provider.landmark}</div>}
              <div className="text-xs text-slate-400">{provider.city}{provider.pincode ? ` - ${provider.pincode}` : ''}{provider.state ? `, ${provider.state}` : ''}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">👤 Contact Person</div>
                <div className="text-xs text-white">{provider.fullName}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">📱 Mobile</div>
                <div className="text-xs text-white">{provider.mobile}</div>
              </div>
            </div>

            {provider.whatsapp && (
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">💬 WhatsApp</div>
                <div className="text-xs text-white">{provider.whatsapp}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">🔧 Service Type</div>
                <div className="text-xs text-white capitalize">{
                  provider.serviceType === 'both' ? 'Shop & Home' :
                  provider.serviceType === 'home-visit' ? 'Home Service' :
                  provider.serviceType || 'Not specified'
                }</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">📏 Service Area/Radius</div>
                <div className="text-xs text-white">{provider.serviceRadius || 'Not specified'}</div>
              </div>
            </div>

            {provider.googleMaps && (
              <a href={provider.googleMaps} target="_blank" rel="noreferrer"
                className="block glass rounded-xl p-3 text-center hover:bg-white/10 transition-colors">
                <span className="text-lg">🗺️</span>
                <span className="text-xs text-blue-400 ml-2">Open in Google Maps</span>
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">📅 Registered</div>
                <div className="text-xs text-white">{new Date(provider.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}</div>
              </div>
              <div className="glass rounded-xl p-3">
                <div className="text-[10px] text-slate-500 mb-0.5">🔄 Last Updated</div>
                <div className="text-xs text-white">{provider.updatedAt
                  ? new Date(provider.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'N/A'
                }</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-5">
            <a href={`tel:${provider.mobile}`}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold text-navy-900 text-center active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              📞 Call Now
            </a>
            <a href={`https://wa.me/91${provider.whatsapp || provider.mobile}`} target="_blank" rel="noreferrer"
              className="flex-1 py-3.5 rounded-xl text-sm font-bold text-white text-center active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
              💬 WhatsApp
            </a>
          </div>

          <button onClick={onClose} className="w-full mt-3 py-3 rounded-xl text-sm glass text-slate-400 hover:bg-white/10">
            ← Close / बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
