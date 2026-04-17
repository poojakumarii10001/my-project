import React, { useState } from 'react';
import { plans, Plan } from '../data/plans';
import { storage } from '../utils/storage';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';

export const PlansPage: React.FC = () => {
  const { t } = useLang();
  const { isDark } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'upload' | 'done'>('select');
  const [proofFile, setProofFile] = useState<string>('');
  const [txnId, setTxnId] = useState('');
  const [payMobile, setPayMobile] = useState('');

  const getUpiPayload = (plan: Plan) => {
    const settings = storage.getSettings();
    const adminUpi = settings.upiId || '';
    if (!adminUpi) return null;

    const amount = plan.price.toString();
    const note = `${plan.name} Plan - Local Finder`;
    return {
      adminUpi,
      amount,
      note,
      upiUrl: `upi://pay?pa=${encodeURIComponent(adminUpi)}&pn=${encodeURIComponent('Local Finder')}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`,
    };
  };

  const launchUri = (uri: string) => {
    // Robust deep-link launcher for browser + PWA + webview cases.
    const a = document.createElement('a');
    a.href = uri;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        window.location.assign(uri);
      } catch {
        // Keep silent to avoid interrupting payment flow.
      }
    }, 120);
    setTimeout(() => {
      a.remove();
    }, 500);
  };

  const openUpiPayment = (plan: Plan, app: 'any' | 'gpay' | 'phonepe' | 'paytm' = 'any') => {
    setSelectedPlan(plan);

    const payload = getUpiPayload(plan);
    if (!payload) {
      alert(t('Payment is temporarily unavailable. Admin UPI is not configured yet.', 'भुगतान अभी उपलब्ध नहीं है। एडमिन UPI अभी सेट नहीं है।'));
      return;
    }

    const appIntentMap = {
      any: payload.upiUrl,
      gpay: `intent://upi/pay?pa=${encodeURIComponent(payload.adminUpi)}&pn=${encodeURIComponent('Local Finder')}&am=${payload.amount}&cu=INR&tn=${encodeURIComponent(payload.note)}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`,
      phonepe: `intent://upi/pay?pa=${encodeURIComponent(payload.adminUpi)}&pn=${encodeURIComponent('Local Finder')}&am=${payload.amount}&cu=INR&tn=${encodeURIComponent(payload.note)}#Intent;scheme=upi;package=com.phonepe.app;end`,
      paytm: `intent://upi/pay?pa=${encodeURIComponent(payload.adminUpi)}&pn=${encodeURIComponent('Local Finder')}&am=${payload.amount}&cu=INR&tn=${encodeURIComponent(payload.note)}#Intent;scheme=upi;package=net.one97.paytm;end`,
    };

    launchUri(appIntentMap[app]);

    if (app !== 'any') {
      // Fallback to generic chooser if the specific app is unavailable.
      setTimeout(() => launchUri(payload.upiUrl), 900);
    } else {
      // Backup fallback for strict webviews that block first deep-link call.
      setTimeout(() => launchUri(payload.upiUrl), 700);
    }

    // Show upload screen after enough time for user to complete payment
    setTimeout(() => {
      setPaymentStep('upload');
    }, 2200);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProofFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const closePayment = () => {
    setSelectedPlan(null);
    setPaymentStep('select');
    setProofFile('');
    setTxnId('');
    setPayMobile('');
  };

  const lcSub = () => isDark ? 'text-slate-500' : 'text-gray-500';

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gradient-gold">👑 {t('Plans & Pricing', 'प्लान और कीमत')}</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('Choose a plan that fits your business', 'अपने बिज़नेस के लिए प्लान चुनें')}</p>
      </div>

      {/* Plans Grid */}
      {paymentStep === 'select' && (
        <div className="space-y-4">
          {plans.map((plan, idx) => (
            <div key={plan.id} className="glass rounded-2xl overflow-hidden relative" style={{
              border: `1px solid ${plan.color}33`,
            }}>
              {plan.badge && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white" style={{
                  background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                }}>
                  {plan.badge}
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{
                    background: `linear-gradient(135deg, ${plan.color}33, ${plan.color}11)`,
                  }}>
                    {idx === 0 ? '📦' : idx === 1 ? '⭐' : idx === 2 ? '🔥' : '👑'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name} <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>/ {plan.nameHi}</span></h3>
                    <p className={`text-xs ${lcSub()}`}>{plan.duration}</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black" style={{ color: plan.color }}>₹{plan.price}</span>
                  <span className={`text-xs ${lcSub()}`}>/ {plan.duration}</span>
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-green-400 text-xs mt-0.5 font-bold">✓</span>
                      <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 text-[10px] flex-wrap mb-4">
                  <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                    background: `${plan.color}22`, color: plan.color
                  }}>📷 {plan.limits.photos === 999 ? '∞' : plan.limits.photos} {t('photos', 'फोटो')}</span>
                  <span className="px-2 py-0.5 rounded-full font-semibold" style={{
                    background: `${plan.color}22`, color: plan.color
                  }}>🎬 {plan.limits.reels} {t('reels', 'रील्स')}</span>
                  {plan.limits.verified && <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-semibold">✅ {t('Verified', 'सत्यापित')}</span>}
                  {plan.limits.featured && <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">⭐ {t('Featured', 'विशेष')}</span>}
                  {plan.limits.topPlacement && <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-semibold">🔝 Top</span>}
                  {plan.limits.premiumBadge && <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-semibold">👑 Premium</span>}
                </div>

                {/* One-Click Pay Button — Opens UPI app directly */}
                <button
                  onClick={() => openUpiPayment(plan, 'any')}
                  className="w-full py-3.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-transform"
                  style={{ background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`, boxShadow: `0 4px 20px ${plan.color}33` }}
                >
                  💳 {t(`Pay ₹${plan.price} — Open Any UPI App`, `₹${plan.price} भुगतान — कोई भी UPI ऐप खोलें`)}
                </button>

                {/* Prominent direct app shortcuts */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => openUpiPayment(plan, 'gpay')}
                    className="py-2.5 rounded-xl text-xs font-extrabold bg-white text-slate-900 active:scale-[0.98] transition-transform"
                  >
                    🟢 {t('Open Google Pay', 'Google Pay खोलें')}
                  </button>
                  <button
                    onClick={() => openUpiPayment(plan, 'phonepe')}
                    className="py-2.5 rounded-xl text-xs font-extrabold bg-white text-slate-900 active:scale-[0.98] transition-transform"
                  >
                    🟣 {t('Open PhonePe', 'PhonePe खोलें')}
                  </button>
                  <button
                    onClick={() => openUpiPayment(plan, 'paytm')}
                    className="py-2.5 rounded-xl text-xs font-extrabold bg-white text-slate-900 active:scale-[0.98] transition-transform"
                  >
                    🔵 {t('Open Paytm', 'Paytm खोलें')}
                  </button>
                  <button
                    onClick={() => openUpiPayment(plan, 'any')}
                    className="py-2.5 rounded-xl text-xs font-extrabold bg-amber-300 text-slate-900 active:scale-[0.98] transition-transform"
                  >
                    💠 {t('Open Any UPI', 'कोई भी UPI खोलें')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Proof Upload (after UPI app opens) */}
      {paymentStep === 'upload' && selectedPlan && (
        <div className="animate-slideUp">
          <div className="glass rounded-2xl p-5 space-y-4" style={{
            border: `1px solid ${selectedPlan.color}33`
          }}>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">📎 {t('Upload Payment Proof', 'भुगतान प्रमाण अपलोड करें')}</h3>
              <button onClick={closePayment} className="w-8 h-8 rounded-full glass flex items-center justify-center text-lg hover:bg-white/10">
                ✕
              </button>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: `${selectedPlan.color}10` }}>
              <div className={`text-sm mb-1 font-semibold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{t('Amount to Pay', 'भुगतान राशि')}</div>
              <div className="text-2xl font-black" style={{ color: selectedPlan.color }}>₹{selectedPlan.price}</div>
              <div className={`text-xs font-medium ${lcSub()}`}>{selectedPlan.name} Plan - {selectedPlan.duration}</div>
            </div>

            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}>
              <p className="text-xs text-green-400 font-semibold">
                ✅ {t(
                  'UPI app should open. If not, use buttons below to open Any UPI / Google Pay / PhonePe / Paytm.',
                  'UPI ऐप खुलनी चाहिए। नहीं खुले तो नीचे दिए गए बटन से Any UPI / Google Pay / PhonePe / Paytm खोलें।'
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => openUpiPayment(selectedPlan, 'any')}
                className="py-3 rounded-xl text-xs font-extrabold bg-amber-300 text-slate-900 active:scale-[0.98] transition-transform"
              >
                💠 {t('Open Any UPI', 'कोई भी UPI खोलें')}
              </button>
              <button
                onClick={() => openUpiPayment(selectedPlan, 'gpay')}
                className="py-3 rounded-xl text-xs font-extrabold bg-white text-slate-900 active:scale-[0.98] transition-transform"
              >
                🟢 {t('Open Google Pay', 'Google Pay खोलें')}
              </button>
              <button
                onClick={() => openUpiPayment(selectedPlan, 'phonepe')}
                className="py-3 rounded-xl text-xs font-extrabold bg-white text-slate-900 active:scale-[0.98] transition-transform"
              >
                🟣 {t('Open PhonePe', 'PhonePe खोलें')}
              </button>
              <button
                onClick={() => openUpiPayment(selectedPlan, 'paytm')}
                className="py-3 rounded-xl text-xs font-extrabold bg-white text-slate-900 active:scale-[0.98] transition-transform"
              >
                🔵 {t('Open Paytm', 'Paytm खोलें')}
              </button>
            </div>

            <label className="block glass rounded-xl p-6 text-center cursor-pointer hover:bg-white/10 transition-colors">
              {proofFile ? (
                <img src={proofFile} alt="Proof" className="w-32 h-32 object-contain mx-auto mb-2 rounded-lg" />
              ) : (
                <>
                  <div className="text-4xl mb-2">📸</div>
                  <div className="text-sm text-white font-bold">{t('Upload Screenshot', 'स्क्रीनशॉट अपलोड करें')}</div>
                  <div className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('Payment receipt, UPI confirmation, etc.', 'भुगतान रसीद, UPI कन्फर्मेशन, आदि')}</div>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
            </label>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Transaction ID (Optional)', 'ट्रांजैक्शन आईडी (वैकल्पिक)')}</label>
              <input type="text" value={txnId} onChange={e => setTxnId(e.target.value)} placeholder={t('Enter transaction or reference ID', 'ट्रांजैक्शन या रेफरेंस आईडी डालें')}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${isDark ? 'bg-white/8 text-white placeholder-slate-500 border-white/10 focus:border-amber-400/50' : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-amber-500'}`} />
            </div>

            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Registered Mobile Number *', 'रजिस्टर्ड मोबाइल नंबर *')}</label>
              <input type="tel" value={payMobile} onChange={e => setPayMobile(e.target.value)} placeholder={t('Your registered mobile number', 'आपका रजिस्टर्ड मोबाइल नंबर')} maxLength={10}
                className={`w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${isDark ? 'bg-white/8 text-white placeholder-slate-500 border-white/10 focus:border-amber-400/50' : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-amber-500'}`} />
            </div>

            <button
              onClick={() => {
                if (!payMobile || payMobile.length < 10) {
                  alert(t('Please enter your 10-digit mobile number', 'कृपया 10 अंकों का मोबाइल नंबर डालें'));
                  return;
                }
                setPaymentStep('done');
                const settings = storage.getSettings();
                settings.revenue = (settings.revenue || 0) + selectedPlan.price;
                storage.saveSettings(settings);
              }}
              className="w-full py-4 rounded-xl text-base font-bold text-navy-900 active:scale-[0.98] transition-transform"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)' }}>
              ✅ {t('Submit Payment Proof', 'भुगतान प्रमाण जमा करें')}
            </button>

            <button onClick={closePayment} className={`w-full py-3 rounded-xl text-sm glass font-semibold hover:bg-white/10 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              ← {t('Go Back', 'वापस जाएं')}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {paymentStep === 'done' && selectedPlan && (
        <div className="animate-slideUp">
          <div className="glass rounded-2xl p-8 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-bold text-gradient-gold">{t('Payment Submitted!', 'भुगतान जमा हो गया!')}</h3>
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{t('Your payment proof has been submitted successfully!', 'आपका भुगतान प्रमाण सफलतापूर्वक जमा हो गया!')}</p>
            <div className="rounded-xl p-4 glass">
              <div className={`text-xs mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('Plan', 'प्लान')}</div>
              <div className="text-lg font-bold" style={{ color: selectedPlan.color }}>{selectedPlan.name} - ₹{selectedPlan.price}</div>
              <div className={`text-xs mt-1 font-medium ${lcSub()}`}>{selectedPlan.duration}</div>
            </div>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              {t(
                'Your payment will be verified within 2-4 hours. Plan will be activated after confirmation.',
                'आपका भुगतान 2-4 घंटे में सत्यापित किया जाएगा। पुष्टि के बाद प्लान सक्रिय होगा।'
              )}
            </p>
            <button onClick={closePayment}
              className="px-8 py-3 rounded-xl text-sm font-bold text-navy-900"
              style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)' }}>
              ✅ {t('Done', 'हो गया')}
            </button>
          </div>
        </div>
      )}

      {/* Compare Plans */}
      {paymentStep === 'select' && (
        <div className="glass rounded-2xl p-5 mt-4">
          <h4 className="text-sm font-bold text-white mb-3 text-center">📊 {t('Plan Comparison', 'प्लान तुलना')}</h4>
          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className={`text-left py-2 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{t('Feature', 'फीचर')}</th>
                  {plans.map(p => (
                    <th key={p.id} className="py-2 text-center font-bold" style={{ color: p.color }}>{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: t('Price', 'कीमत'), values: plans.map(p => `₹${p.price}`) },
                  { label: t('Duration', 'अवधि'), values: plans.map(p => p.duration) },
                  { label: t('Photos', 'फोटो'), values: plans.map(p => p.limits.photos === 999 ? '∞' : String(p.limits.photos)) },
                  { label: t('Reels', 'रील्स'), values: plans.map(p => String(p.limits.reels)) },
                  { label: t('Verified', 'सत्यापित'), values: plans.map(p => p.limits.verified ? '✅' : '❌') },
                  { label: t('Featured', 'विशेष'), values: plans.map(p => p.limits.featured ? '✅' : '❌') },
                  { label: t('Top Placement', 'टॉप प्लेसमेंट'), values: plans.map(p => p.limits.topPlacement ? '✅' : '❌') },
                  { label: t('Premium Badge', 'प्रीमियम बैज'), values: plans.map(p => p.limits.premiumBadge ? '✅' : '❌') },
                  { label: t('Priority Support', 'प्राथमिकता सहायता'), values: plans.map(p => p.limits.priority ? '✅' : '❌') },
                  { label: t('Boost', 'बूस्ट'), values: plans.map(p => p.limits.boost ? '✅' : '❌') },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className={`py-2 font-semibold ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-2 text-center text-white font-semibold">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
