import React, { useState } from 'react';
import { categories } from '../data/categories';
import { storage, Provider } from '../utils/storage';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Chandigarh', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
];

export const RegisterPage: React.FC = () => {
  const { t, isHindi } = useLang();
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'register' | 'edit'>('register');
  const [editMobile, setEditMobile] = useState('');
  const [editFound, setEditFound] = useState(false);
  const [success, setSuccess] = useState('');
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [confirmOwnership, setConfirmOwnership] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [idPreview, setIdPreview] = useState<string>('');
  const [useCustomCat, setUseCustomCat] = useState(false);
  const [customCatName, setCustomCatName] = useState('');

  const emptyForm: Omit<Provider, 'id' | 'status' | 'createdAt'> = {
    fullName: '', businessName: '', mobile: '', whatsapp: '', category: '',
    locality: '', address: '', landmark: '', city: '', pincode: '', state: '',
    businessHours: '', serviceType: '', serviceRadius: '', googleMaps: '',
    description: '', plan: '',
  };

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEditLookup = () => {
    const providers = storage.getProviders();
    const found = providers.find(p => p.mobile === editMobile);
    if (found) {
      setForm({
        fullName: found.fullName, businessName: found.businessName, mobile: found.mobile,
        whatsapp: found.whatsapp, category: found.category, locality: found.locality,
        address: found.address, landmark: found.landmark, city: found.city,
        pincode: found.pincode, state: found.state, businessHours: found.businessHours,
        serviceType: found.serviceType, serviceRadius: found.serviceRadius,
        googleMaps: found.googleMaps, description: found.description, plan: found.plan,
      });
      setEditId(found.id);
      setEditFound(true);
      // Check if category is custom
      if (!categories.find(c => c.id === found.category)) {
        setUseCustomCat(true);
        setCustomCatName(found.category);
      }
    } else {
      alert(t('No profile found with this mobile number', 'इस नंबर से कोई प्रोफाइल नहीं मिली'));
    }
  };

  const handleOtpSend = () => {
    if (!form.mobile || form.mobile.length < 10) {
      alert(t('Please enter a valid 10-digit mobile number', 'कृपया सही 10 अंकों का मोबाइल नंबर डालें'));
      return;
    }
    setOtpSent(true);
    alert(t('OTP sent to ' + form.mobile + ' (Demo: use 1234)', 'OTP भेजा गया ' + form.mobile + ' पर (डेमो: 1234 डालें)'));
  };

  const handleOtpVerify = () => {
    if (otpValue === '1234') {
      setOtpVerified(true);
      alert(t('Mobile verified successfully!', 'मोबाइल सफलतापूर्वक सत्यापित!'));
    } else {
      alert(t('Invalid OTP. Try again. (Demo: 1234)', 'गलत OTP। फिर प्रयास करें। (डेमो: 1234)'));
    }
  };

  const handleFilePreview = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!form.fullName || !form.businessName || !form.mobile || !form.city) {
      alert(t('Please fill all required fields', 'कृपया सभी आवश्यक फ़ील्ड भरें'));
      return;
    }
    if (!form.category && !customCatName) {
      alert(t('Please select or type a category', 'कृपया एक श्रेणी चुनें या टाइप करें'));
      return;
    }
    if (!confirmTerms || !confirmAccuracy || !confirmOwnership) {
      alert(t('Please accept all three confirmations', 'कृपया तीनों शर्तें स्वीकार करें'));
      return;
    }

    const finalCategory = useCustomCat ? customCatName.trim() : form.category;

    const provider: Provider = {
      ...form,
      category: finalCategory,
      id: editId || `prov_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      createdAt: editId ? storage.getProviders().find(p => p.id === editId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      otpVerified,
      photoUrl: photoPreview || undefined,
      coverUrl: coverPreview || undefined,
      idProofUrl: idPreview || undefined,
      confirmOwnership: confirmOwnership,
      confirmListingRules: confirmTerms,
    };

    storage.saveProvider(provider);
    setSuccess(editId
      ? t('Profile updated successfully! Pending review.', 'प्रोफाइल अपडेट हो गई! समीक्षा लंबित।')
      : t('Registration successful! Pending admin review.', 'रजिस्ट्रेशन सफल! एडमिन समीक्षा लंबित।')
    );
    if (!editId) {
      setForm(emptyForm);
      setConfirmTerms(false);
      setConfirmAccuracy(false);
      setConfirmOwnership(false);
      setOtpSent(false);
      setOtpValue('');
      setOtpVerified(false);
      setPhotoPreview('');
      setCoverPreview('');
      setIdPreview('');
      setUseCustomCat(false);
      setCustomCatName('');
    }
    setTimeout(() => setSuccess(''), 5000);
  };

  const inputClass = `w-full rounded-xl px-4 py-3 text-sm outline-none border transition-colors ${
    isDark
      ? 'bg-white/8 text-white placeholder-slate-500 border-white/10 focus:border-amber-400/50'
      : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-amber-500'
  }`;
  const labelClass = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-gray-700'}`;

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gradient-gold">📋 {t('Provider Registration', 'प्रोवाइडर रजिस्ट्रेशन')}</h2>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('Register your business on Local Finder', 'अपना बिज़नेस Local Finder पर रजिस्टर करें')}</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-xl overflow-hidden glass">
        <button
          onClick={() => { setMode('register'); setEditFound(false); setEditId(''); setForm(emptyForm); setOtpSent(false); setOtpVerified(false); setUseCustomCat(false); setCustomCatName(''); }}
          className="flex-1 py-3 text-sm font-semibold transition-colors"
          style={{ background: mode === 'register' ? 'linear-gradient(135deg, #fbbf24, #d97706)' : 'transparent', color: mode === 'register' ? '#0f172a' : (isDark ? '#94a3b8' : '#6b7280') }}
        >
          📝 {t('New Registration', 'नया रजिस्ट्रेशन')}
        </button>
        <button
          onClick={() => { setMode('edit'); setEditFound(false); setForm(emptyForm); }}
          className="flex-1 py-3 text-sm font-semibold transition-colors"
          style={{ background: mode === 'edit' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent', color: mode === 'edit' ? '#fff' : (isDark ? '#94a3b8' : '#6b7280') }}
        >
          ✏️ {t('Edit Profile', 'प्रोफाइल संपादित करें')}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-xl p-4 text-center text-sm font-semibold text-green-400" style={{
          background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)'
        }}>
          ✅ {success}
        </div>
      )}

      {/* Edit Lookup */}
      {mode === 'edit' && !editFound && (
        <div className="glass rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-white">🔍 {t('Find Your Profile', 'अपनी प्रोफाइल खोजें')}</h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('Enter your registered mobile number', 'अपना रजिस्टर्ड मोबाइल नंबर डालें')}</p>
          <input
            type="tel"
            value={editMobile}
            onChange={e => setEditMobile(e.target.value)}
            placeholder={t('Mobile number', 'मोबाइल नंबर')}
            className={inputClass}
            maxLength={10}
          />
          <button onClick={handleEditLookup} className="w-full py-3 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            🔍 {t('Search Profile', 'प्रोफाइल खोजें')}
          </button>
        </div>
      )}

      {/* Registration Form */}
      {(mode === 'register' || editFound) && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold" style={{ color: '#f59e0b' }}>
            {mode === 'edit' ? `✏️ ${t('Update Your Profile', 'अपनी प्रोफाइल अपडेट करें')}` : `📋 ${t('Business Details', 'व्यापार विवरण')}`}
          </h3>

          <div>
            <label className={labelClass}>{t('Full Name', 'पूरा नाम')} *</label>
            <input type="text" value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} placeholder={t('Your full name', 'आपका पूरा नाम')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('Business Name', 'व्यापार का नाम')} *</label>
            <input type="text" value={form.businessName} onChange={e => handleChange('businessName', e.target.value)} placeholder={t('Your business or shop name', 'आपकी दुकान या बिज़नेस का नाम')} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('Mobile Number', 'मोबाइल नंबर')} *</label>
              <input type="tel" value={form.mobile} onChange={e => handleChange('mobile', e.target.value)} placeholder={t('10 digit mobile', '10 अंक का मोबाइल')} className={inputClass} maxLength={10} />
              {!otpVerified && form.mobile.length === 10 && (
                <div className="mt-1.5">
                  {!otpSent ? (
                    <button onClick={handleOtpSend} className="text-[10px] font-bold text-amber-400 underline">
                      📲 {t('Verify OTP', 'OTP सत्यापित करें')}
                    </button>
                  ) : (
                    <div className="flex gap-1.5 items-center">
                      <input type="text" value={otpValue} onChange={e => setOtpValue(e.target.value.replace(/\D/g,'').slice(0,4))}
                        placeholder="OTP" className="flex-1 bg-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none border border-white/10" maxLength={4} inputMode="numeric" />
                      <button onClick={handleOtpVerify} className="px-2 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400">{t('Verify', 'सत्यापित')}</button>
                    </div>
                  )}
                </div>
              )}
              {otpVerified && <div className="text-[10px] text-green-400 mt-1">✅ {t('Mobile Verified', 'मोबाइल सत्यापित')}</div>}
            </div>
            <div>
              <label className={labelClass}>{t('WhatsApp Number', 'व्हाट्सएप नंबर')}</label>
              <input type="tel" value={form.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} placeholder={t('WhatsApp number', 'व्हाट्सएप नंबर')} className={inputClass} maxLength={10} />
            </div>
          </div>

          {/* Service Category with custom option */}
          <div>
            <label className={labelClass}>{t('Service Category', 'सेवा श्रेणी')} *</label>
            {!useCustomCat ? (
              <>
                <select value={form.category} onChange={e => handleChange('category', e.target.value)} className={inputClass}>
                  <option value="">-- {t('Select Category', 'श्रेणी चुनें')} --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {isHindi ? c.hi : c.en}</option>
                  ))}
                </select>
                <button onClick={() => setUseCustomCat(true)} className="text-[10px] text-amber-400 mt-1 underline">
                  {t('Category not found? Type your own →', 'श्रेणी नहीं मिली? अपनी खुद की टाइप करें →')}
                </button>
              </>
            ) : (
              <>
                <input
                  type="text"
                  value={customCatName}
                  onChange={e => setCustomCatName(e.target.value)}
                  placeholder={t('Type your service/business category', 'अपनी सेवा/व्यापार श्रेणी टाइप करें')}
                  className={inputClass}
                />
                <button onClick={() => { setUseCustomCat(false); setCustomCatName(''); }} className="text-[10px] text-blue-400 mt-1 underline">
                  {t('← Back to category list', '← श्रेणी सूची पर वापस')}
                </button>
              </>
            )}
          </div>

          <div>
            <label className={labelClass}>{t('Locality / Area', 'इलाका / क्षेत्र')}</label>
            <input type="text" value={form.locality} onChange={e => handleChange('locality', e.target.value)} placeholder={t('Mohalla, colony, sector...', 'मोहल्ला, कॉलोनी, सेक्टर...')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('Full Address', 'पूरा पता')}</label>
            <textarea value={form.address} onChange={e => handleChange('address', e.target.value)} placeholder={t('Complete address with house/shop number', 'पूरा पता दुकान/मकान नंबर सहित')} className={`${inputClass} min-h-[80px] resize-none`} />
          </div>

          <div>
            <label className={labelClass}>{t('Landmark', 'लैंडमार्क')}</label>
            <input type="text" value={form.landmark} onChange={e => handleChange('landmark', e.target.value)} placeholder={t('Near temple, school, market...', 'मंदिर, स्कूल, बाज़ार के पास...')} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('City', 'शहर')} *</label>
              <input type="text" value={form.city} onChange={e => handleChange('city', e.target.value)} placeholder={t('City name', 'शहर का नाम')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('Pincode', 'पिनकोड')}</label>
              <input type="text" value={form.pincode} onChange={e => handleChange('pincode', e.target.value)} placeholder={t('6 digit', '6 अंक')} className={inputClass} maxLength={6} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('State', 'राज्य')}</label>
            <select value={form.state} onChange={e => handleChange('state', e.target.value)} className={inputClass}>
              <option value="">-- {t('Select State', 'राज्य चुनें')} --</option>
              {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t('Business Hours', 'व्यापार का समय')}</label>
              <input type="text" value={form.businessHours} onChange={e => handleChange('businessHours', e.target.value)} placeholder="9 AM - 9 PM" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t('Service Type', 'सेवा प्रकार')}</label>
              <select value={form.serviceType} onChange={e => handleChange('serviceType', e.target.value)} className={inputClass}>
                <option value="">{t('Select', 'चुनें')}</option>
                <option value="shop">{t('Shop Visit', 'दुकान पर आएं')}</option>
                <option value="home-visit">{t('Home Service', 'घर पर सेवा')}</option>
                <option value="both">{t('Both', 'दोनों')}</option>
                <option value="online">{t('Online', 'ऑनलाइन')}</option>
                <option value="stall">{t('Stall / Cart', 'ठेला / स्टॉल')}</option>
                <option value="freelance">{t('Freelance', 'फ्रीलांस')}</option>
                <option value="office">{t('Office', 'कार्यालय')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>{t('Service Radius / Area', 'सेवा क्षेत्र')}</label>
            <select value={form.serviceRadius} onChange={e => handleChange('serviceRadius', e.target.value)} className={inputClass}>
              <option value="">{t('Select radius', 'रेडियस चुनें')}</option>
              <option value="1km">1 km</option>
              <option value="3km">3 km</option>
              <option value="5km">5 km</option>
              <option value="10km">10 km</option>
              <option value="25km">25 km</option>
              <option value="50km">50+ km</option>
              <option value="citywide">{t('Citywide', 'पूरे शहर में')}</option>
              <option value="statewide">{t('Statewide', 'पूरे राज्य में')}</option>
              <option value="nationwide">{t('Nationwide', 'पूरे भारत में')}</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>{t('Google Maps Link (Optional)', 'गूगल मैप लिंक (वैकल्पिक)')}</label>
            <input type="url" value={form.googleMaps} onChange={e => handleChange('googleMaps', e.target.value)} placeholder={t('Paste your Google Maps URL', 'अपना Google Maps URL पेस्ट करें')} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>{t('Description / Bio', 'विवरण / बायो')}</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder={t('Tell customers about your business, experience, specialties...', 'ग्राहकों को अपने बिज़नेस, अनुभव, विशेषताओं के बारे में बताएं...')} className={`${inputClass} min-h-[100px] resize-none`} />
          </div>

          {/* File Uploads */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>📎 {t('Uploads', 'अपलोड')}</h4>
            <div className="grid grid-cols-3 gap-2">
              <label className="glass rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition-colors">
                {photoPreview ? (
                  <img src={photoPreview} alt="Photo" className="w-10 h-10 rounded-lg mx-auto mb-1 object-cover" />
                ) : (
                  <div className="text-2xl mb-1">📷</div>
                )}
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('Photo/Logo', 'फोटो/लोगो')}</div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFilePreview(e, setPhotoPreview)} />
              </label>
              <label className="glass rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition-colors">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-10 h-10 rounded-lg mx-auto mb-1 object-cover" />
                ) : (
                  <div className="text-2xl mb-1">🖼️</div>
                )}
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('Cover Photo', 'कवर फोटो')}</div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFilePreview(e, setCoverPreview)} />
              </label>
              <label className="glass rounded-xl p-3 text-center cursor-pointer hover:bg-white/10 transition-colors">
                {idPreview ? (
                  <img src={idPreview} alt="ID" className="w-10 h-10 rounded-lg mx-auto mb-1 object-cover" />
                ) : (
                  <div className="text-2xl mb-1">🪪</div>
                )}
                <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('ID Proof', 'पहचान पत्र')}</div>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleFilePreview(e, setIdPreview)} />
              </label>
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={confirmAccuracy} onChange={e => setConfirmAccuracy(e.target.checked)}
                className="mt-1 accent-amber-400 w-4 h-4" />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {t(
                  'I confirm that all information provided is accurate and truthful. False information may lead to rejection, suspension, or removal.',
                  'मैं पुष्टि करता/करती हूँ कि सभी जानकारी सही और सत्य है। गलत जानकारी से अस्वीकृति, निलंबन, या हटाने की कार्यवाही हो सकती है।'
                )}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={confirmOwnership} onChange={e => setConfirmOwnership(e.target.checked)}
                className="mt-1 accent-amber-400 w-4 h-4" />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {t(
                  'I confirm this is my own business and I am authorized to register it.',
                  'मैं पुष्टि करता/करती हूँ कि यह मेरा अपना व्यापार है और मैं इसे रजिस्टर करने के लिए अधिकृत हूँ।'
                )}
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={confirmTerms} onChange={e => setConfirmTerms(e.target.checked)}
                className="mt-1 accent-amber-400 w-4 h-4" />
              <span className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                {t(
                  'I accept the Terms of Service, Privacy Policy & Listing Rules.',
                  'मैं सेवा शर्तों, गोपनीयता नीति और लिस्टिंग नियमों से सहमत हूँ।'
                )}
                {' '}<a href="/privacy.html" className="text-amber-400 underline" target="_blank">{t('View', 'देखें')}</a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl text-base font-bold text-navy-900 active:scale-[0.98] transition-transform"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', boxShadow: '0 4px 20px rgba(251, 191, 36, 0.3)' }}
          >
            {mode === 'edit'
              ? `✏️ ${t('Update Profile', 'प्रोफाइल अपडेट करें')}`
              : `📋 ${t('Register Now', 'अभी रजिस्टर करें')}`
            }
          </button>

          <p className={`text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            ⏳ {t(
              'Your listing will be reviewed by admin before publishing. No auto-publish.',
              'आपकी लिस्टिंग पब्लिश होने से पहले एडमिन द्वारा समीक्षित की जाएगी। कोई ऑटो-पब्लिश नहीं।'
            )}
          </p>
        </div>
      )}
    </div>
  );
};
