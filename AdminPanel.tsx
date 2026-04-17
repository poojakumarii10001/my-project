import React, { useState, useEffect } from 'react';
import { storage, Provider, Reel, Complaint, Report } from '../utils/storage';
import { plans } from '../data/plans';

interface AdminPanelProps {
  onClose: () => void;
}

type AdminTab = 'dashboard' | 'queues' | 'providers' | 'revenue' | 'complaints' | 'reports' | 'content' | 'legal' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [providers, setProviders] = useState<Provider[]>(storage.getProviders());
  const [reels, setReels] = useState<Reel[]>(storage.getReels());
  const [complaints, setComplaints] = useState<Complaint[]>(storage.getComplaints());
  const [reports, setReports] = useState<Report[]>(storage.getReports());
  const [settings, setSettingsState] = useState(storage.getSettings());
  const [newPin, setNewPin] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [actionTarget, setActionTarget] = useState('');
  const [actionType, setActionType] = useState<'reject' | 'suspend' | ''>('');

  const refreshData = () => {
    setProviders(storage.getProviders());
    setReels(storage.getReels());
    setComplaints(storage.getComplaints());
    setReports(storage.getReports());
    setSettingsState(storage.getSettings());
  };

  useEffect(() => { refreshData(); }, [activeTab]);

  const tabs: { id: AdminTab; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'queues', icon: '📋', label: 'Queues' },
    { id: 'providers', icon: '🏪', label: 'Providers' },
    { id: 'revenue', icon: '💰', label: 'Revenue' },
    { id: 'reports', icon: '🚩', label: 'Reports' },
    { id: 'complaints', icon: '📢', label: 'Complaints' },
    { id: 'content', icon: '🎬', label: 'Content' },
    { id: 'legal', icon: '⚖️', label: 'Legal' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ];

  const updateProviderStatus = (id: string, status: Provider['status'], reason?: string) => {
    const prov = providers.find(p => p.id === id);
    if (prov) {
      prov.status = status;
      if (status === 'rejected') prov.rejectionReason = reason || '';
      if (status === 'suspended') prov.suspensionReason = reason || '';
      prov.updatedAt = new Date().toISOString();
      storage.saveProvider(prov);
      refreshData();
    }
  };

  const updateReelStatus = (id: string, status: Reel['status']) => {
    const reel = reels.find(r => r.id === id);
    if (reel) {
      reel.status = status;
      storage.saveReel(reel);
      refreshData();
    }
  };

  const deleteProvider = (id: string) => {
    if (confirm('Delete this provider permanently? / इस प्रोवाइडर को स्थायी रूप से हटाएं?')) {
      storage.deleteProvider(id);
      refreshData();
    }
  };

  const deleteReel = (id: string) => {
    if (confirm('Delete this reel?')) {
      storage.deleteReel(id);
      refreshData();
    }
  };

  const resolveComplaint = (id: string) => {
    const comp = complaints.find(c => c.id === id);
    if (comp) {
      comp.status = 'resolved';
      storage.saveComplaint(comp);
      refreshData();
    }
  };

  const updateReportStatus = (id: string, status: Report['status']) => {
    storage.updateReportStatus(id, status);
    refreshData();
  };

  const [newUpiId, setNewUpiId] = useState(settings.upiId || '');

  const handlePinUpdate = () => {
    if (newPin.length < 4 || newPin.length > 8) { alert('PIN must be 4-8 characters (letters, numbers, symbols allowed)'); return; }
    const s = storage.getSettings();
    s.adminPin = newPin;
    storage.saveSettings(s);
    setNewPin('');
    setSettingsState(storage.getSettings());
    alert('PIN updated successfully!');
  };

  const handleUpiUpdate = () => {
    if (!newUpiId.trim()) { alert('Please enter a valid UPI ID'); return; }
    const s = storage.getSettings();
    s.upiId = newUpiId.trim();
    storage.saveSettings(s);
    setSettingsState(storage.getSettings());
    alert('UPI ID updated successfully!');
  };

  // Queue counts
  const pendingProviders = providers.filter(p => p.status === 'pending');
  const pendingDocs = providers.filter(p => p.status === 'pending' && !p.otpVerified);
  const pendingPayments = providers.filter(p => p.plan && p.status === 'pending');
  const reportedListings = reports.filter(r => r.type === 'listing' && r.status === 'open');
  const reportedReels = reports.filter(r => r.type === 'reel' && r.status === 'open');
  const suspendedProviders = providers.filter(p => p.status === 'suspended');
  const rejectedProviders = providers.filter(p => p.status === 'rejected');
  const pendingReels = reels.filter(r => r.status === 'pending');

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-400',
      approved: 'bg-blue-500/20 text-blue-400',
      verified: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      suspended: 'bg-red-600/20 text-red-500',
    };
    return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || 'bg-slate-500/20 text-slate-400'}`}>{status}</span>;
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1e2e 100%)'
    }}>
      {/* Admin Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{
        background: 'linear-gradient(135deg, #dc2626, #991b1b)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🔐</span>
          <div>
            <h2 className="text-sm font-bold text-white">Admin Panel</h2>
            <p className="text-[10px] text-red-200">Hidden Control Center</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-lg font-bold hover:bg-white/30">
          ✕
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex overflow-x-auto hide-scrollbar px-2 py-2 gap-1" style={{
        background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap relative"
            style={{
              background: activeTab === tab.id ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : '#94a3b8',
            }}
          >
            {tab.icon} {tab.label}
            {tab.id === 'queues' && pendingProviders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center">{pendingProviders.length}</span>
            )}
            {tab.id === 'reports' && reportedListings.length + reportedReels.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center">{reportedListings.length + reportedReels.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reject/Suspend Reason Modal */}
      {actionTarget && actionType && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6" onClick={() => { setActionTarget(''); setActionType(''); }}>
          <div className="w-full max-w-sm glass-strong rounded-2xl p-5 space-y-3 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-white">{actionType === 'reject' ? '❌ Rejection Reason' : '🚫 Suspension Reason'}</h3>
            <textarea
              value={actionType === 'reject' ? rejectReason : suspendReason}
              onChange={e => actionType === 'reject' ? setRejectReason(e.target.value) : setSuspendReason(e.target.value)}
              placeholder="Enter reason..."
              className="w-full bg-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none border border-white/10 min-h-[60px] resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => {
                updateProviderStatus(actionTarget, actionType === 'reject' ? 'rejected' : 'suspended', actionType === 'reject' ? rejectReason : suspendReason);
                setActionTarget(''); setActionType(''); setRejectReason(''); setSuspendReason('');
              }} className={`flex-1 py-2 rounded-lg text-xs font-bold ${actionType === 'reject' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                Confirm
              </button>
              <button onClick={() => { setActionTarget(''); setActionType(''); }}
                className="flex-1 py-2 rounded-lg text-xs glass text-slate-400">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white">📊 Dashboard Overview</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🏪', label: 'Total Providers', value: providers.length, color: '#3b82f6' },
                { icon: '✅', label: 'Verified', value: providers.filter(p => p.status === 'verified').length, color: '#22c55e' },
                { icon: '📋', label: 'Approved', value: providers.filter(p => p.status === 'approved').length, color: '#3b82f6' },
                { icon: '⏳', label: 'Pending', value: pendingProviders.length, color: '#f59e0b' },
                { icon: '❌', label: 'Rejected', value: rejectedProviders.length, color: '#ef4444' },
                { icon: '🚫', label: 'Suspended', value: suspendedProviders.length, color: '#dc2626' },
                { icon: '🎬', label: 'Total Reels', value: reels.length, color: '#8b5cf6' },
                { icon: '📢', label: 'Open Complaints', value: complaints.filter(c => c.status === 'open').length, color: '#ec4899' },
                { icon: '🚩', label: 'Open Reports', value: reports.filter(r => r.status === 'open').length, color: '#f97316' },
                { icon: '💰', label: 'Revenue', value: `₹${settings.revenue || 0}`, color: '#fbbf24' },
              ].map(stat => (
                <div key={stat.label} className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{stat.icon}</span>
                    <span className="text-[10px] text-slate-400">{stat.label}</span>
                  </div>
                  <div className="text-xl font-black" style={{ color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Queues Tab */}
        {activeTab === 'queues' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white">📋 Admin Queues</h3>
            {[
              { icon: '⏳', label: 'Pending Registrations', count: pendingProviders.length, color: '#f59e0b' },
              { icon: '📄', label: 'Pending Document Review', count: pendingDocs.length, color: '#6366f1' },
              { icon: '💳', label: 'Pending Payment Verification', count: pendingPayments.length, color: '#ec4899' },
              { icon: '🚩', label: 'Reported Listings', count: reportedListings.length, color: '#ef4444' },
              { icon: '🎬', label: 'Reported Reels', count: reportedReels.length, color: '#f97316' },
              { icon: '🎥', label: 'Pending Reels Approval', count: pendingReels.length, color: '#8b5cf6' },
              { icon: '🚫', label: 'Suspended Providers', count: suspendedProviders.length, color: '#dc2626' },
              { icon: '❌', label: 'Rejected Providers', count: rejectedProviders.length, color: '#991b1b' },
            ].map(q => (
              <div key={q.label} className="glass rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">{q.icon}</span>
                <div className="flex-1">
                  <div className="text-sm text-white font-semibold">{q.label}</div>
                </div>
                <span className="text-lg font-black" style={{ color: q.color }}>{q.count}</span>
              </div>
            ))}

            {/* Quick actions for pending registrations */}
            {pendingProviders.length > 0 && (
              <div className="space-y-2 mt-4">
                <h4 className="text-xs font-bold text-amber-400">⏳ Pending Registrations:</h4>
                {pendingProviders.map(p => (
                  <div key={p.id} className="glass rounded-xl p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{p.businessName}</div>
                        <div className="text-[10px] text-slate-400">{p.fullName} | {p.mobile}</div>
                        <div className="text-[10px] text-slate-500">{p.city} | {p.category}</div>
                        {p.otpVerified && <div className="text-[9px] text-green-400 mt-0.5">✅ OTP Verified</div>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => updateProviderStatus(p.id, 'approved')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400">✅ Approve</button>
                      <button onClick={() => updateProviderStatus(p.id, 'verified')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400">🛡️ Verify</button>
                      <button onClick={() => { setActionTarget(p.id); setActionType('reject'); }} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400">❌ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-base font-bold text-white">🏪 Manage Providers</h3>
            {providers.length === 0 && (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm text-slate-400">No providers yet</p>
              </div>
            )}
            {providers.map(prov => (
              <div key={prov.id} className="glass rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{prov.businessName}</div>
                    <div className="text-xs text-slate-400">{prov.fullName} | {prov.mobile}</div>
                    <div className="text-[10px] text-slate-500">{prov.locality}, {prov.city} - {prov.pincode}</div>
                    <div className="text-[10px] text-amber-400/60 mt-1">{prov.category} | {prov.serviceType || 'N/A'}</div>
                    {prov.otpVerified && <div className="text-[9px] text-green-400 mt-0.5">📲 OTP Verified</div>}
                    {prov.rejectionReason && <div className="text-[9px] text-red-400 mt-0.5">Reason: {prov.rejectionReason}</div>}
                    {prov.suspensionReason && <div className="text-[9px] text-orange-400 mt-0.5">Suspended: {prov.suspensionReason}</div>}
                    {prov.plan && <div className="text-[9px] text-purple-400 mt-0.5">Plan: {plans.find(pl => pl.id === prov.plan)?.name || prov.plan}</div>}
                  </div>
                  {getStatusBadge(prov.status)}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => updateProviderStatus(prov.id, 'approved')}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                    ✅ Approve
                  </button>
                  <button onClick={() => updateProviderStatus(prov.id, 'verified')}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30">
                    🛡️ Verify
                  </button>
                  <button onClick={() => { setActionTarget(prov.id); setActionType('reject'); }}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30">
                    ❌ Reject
                  </button>
                  <button onClick={() => { setActionTarget(prov.id); setActionType('suspend'); }}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-orange-500/20 text-orange-400 hover:bg-orange-500/30">
                    🚫 Suspend
                  </button>
                  {prov.status === 'suspended' && (
                    <button onClick={() => updateProviderStatus(prov.id, 'approved')}
                      className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-teal-500/20 text-teal-400 hover:bg-teal-500/30">
                      🔄 Restore
                    </button>
                  )}
                  <button onClick={() => deleteProvider(prov.id)}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-500/20 text-slate-400 hover:bg-slate-500/30">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white">💰 Revenue Dashboard</h3>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-xs text-slate-400 mb-1">Total Revenue</div>
              <div className="text-3xl font-black text-gradient-gold">₹{settings.revenue || 0}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Active Plans</div>
                <div className="text-xl font-bold text-blue-400">{providers.filter(p => p.plan).length}</div>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-1">Pending Payments</div>
                <div className="text-xl font-bold text-amber-400">{pendingPayments.length}</div>
              </div>
            </div>
            {/* Plan breakdown */}
            <div className="glass rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-400">Plan Distribution:</h4>
              {plans.map(plan => {
                const count = providers.filter(p => p.plan === plan.id).length;
                return (
                  <div key={plan.id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{plan.name} (₹{plan.price})</span>
                    <span className="font-bold" style={{ color: plan.color }}>{count} users</span>
                  </div>
                );
              })}
            </div>
            {/* Payment verification quick actions */}
            {pendingPayments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-400">💳 Pending Payment Verification:</h4>
                {pendingPayments.map(p => (
                  <div key={p.id} className="glass rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white">{p.businessName}</div>
                      <div className="text-[10px] text-slate-400">{p.mobile} | Plan: {p.plan}</div>
                    </div>
                    <button onClick={() => updateProviderStatus(p.id, 'approved')} className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400">
                      ✅ Verify Payment
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-base font-bold text-white">🚩 Reports & Moderation</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-red-400">{reports.filter(r => r.status === 'open').length}</div>
                <div className="text-[10px] text-slate-400">Open</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{reports.filter(r => r.status === 'reviewed').length}</div>
                <div className="text-[10px] text-slate-400">Reviewed</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-green-400">{reports.filter(r => r.status === 'actioned' || r.status === 'dismissed').length}</div>
                <div className="text-[10px] text-slate-400">Resolved</div>
              </div>
            </div>
            {reports.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-slate-400">No reports yet</p>
              </div>
            ) : (
              reports.map(r => (
                <div key={r.id} className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{r.type === 'listing' ? '🏪' : '🎬'} {r.targetName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.status === 'open' ? 'bg-red-500/20 text-red-400' : r.status === 'reviewed' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">Reason: {r.reason}</div>
                  {r.details && <div className="text-[10px] text-slate-500">Details: {r.details}</div>}
                  <div className="text-[10px] text-slate-600">{new Date(r.createdAt).toLocaleString('en-IN')}</div>
                  {r.status === 'open' && (
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => updateReportStatus(r.id, 'reviewed')} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-400">📋 Mark Reviewed</button>
                      <button onClick={() => updateReportStatus(r.id, 'actioned')} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400">✅ Action Taken</button>
                      <button onClick={() => updateReportStatus(r.id, 'dismissed')} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-500/20 text-slate-400">❌ Dismiss</button>
                      {r.type === 'listing' && (
                        <button onClick={() => { setActionTarget(r.targetId); setActionType('suspend'); }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400">🚫 Suspend</button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-base font-bold text-white">📢 Complaints & Feedback</h3>
            {complaints.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-slate-400">No complaints yet</p>
              </div>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="glass rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{c.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{c.message}</p>
                  <div className="text-[10px] text-slate-600">{new Date(c.createdAt).toLocaleString('en-IN')}</div>
                  {c.status === 'open' && (
                    <button onClick={() => resolveComplaint(c.id)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400">
                      ✅ Mark Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <div className="space-y-3 animate-fadeIn">
            <h3 className="text-base font-bold text-white">🎬 Content Moderation</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-blue-400">{reels.length}</div>
                <div className="text-[10px] text-slate-400">Total</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-amber-400">{reels.filter(r => r.status === 'pending').length}</div>
                <div className="text-[10px] text-slate-400">Pending</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-red-400">{reels.filter(r => r.status === 'reported').length}</div>
                <div className="text-[10px] text-slate-400">Reported</div>
              </div>
            </div>
            {reels.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">🎬</div>
                <p className="text-sm text-slate-400">No content to moderate</p>
              </div>
            ) : (
              reels.map(reel => {
                const provider = providers.find(p => p.id === reel.providerId);
                const providerSuspended = provider?.status === 'suspended';
                return (
                  <div key={reel.id} className={`glass rounded-xl p-4 space-y-2 ${providerSuspended ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{reel.title}</div>
                        {provider && <div className="text-[10px] text-slate-400">by {provider.businessName}</div>}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${reel.status === 'approved' ? 'bg-green-500/20 text-green-400' : reel.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : reel.status === 'reported' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {reel.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{reel.description}</div>
                    {providerSuspended && <div className="text-[9px] text-red-400">⚠️ Provider suspended - reel hidden from public</div>}
                    <div className="flex gap-1.5 flex-wrap">
                      <button onClick={() => updateReelStatus(reel.id, 'approved')}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-400">✅ Approve</button>
                      <button onClick={() => updateReelStatus(reel.id, 'rejected')}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-400">❌ Reject</button>
                      <button onClick={() => deleteReel(reel.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-slate-500/20 text-slate-400">🗑️ Remove</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Legal Tab */}
        {activeTab === 'legal' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white">⚖️ Legal & Compliance</h3>
            {[
              { icon: '📄', title: 'Privacy Policy', desc: 'Last updated: Jan 2026', link: '/privacy.html' },
              { icon: '📋', title: 'Terms of Service', desc: 'Standard T&C for platform usage' },
              { icon: '🛡️', title: 'Data Protection', desc: 'GDPR / Indian IT Act compliance' },
              { icon: '📝', title: 'Content Policy', desc: 'Prohibited content & listing rules' },
              { icon: '🗑️', title: 'Takedown / Removal Policy', desc: 'Content removal & DMCA process' },
              { icon: '🚨', title: 'Emergency Disclaimer', desc: 'App is not an emergency authority' },
              { icon: '🔍', title: 'Discovery Platform Disclaimer', desc: 'App is a discovery platform, not a direct service provider' },
              { icon: '📞', title: 'Grievance / Contact', desc: 'User grievance redressal info' },
            ].map((item, i) => (
              <div key={i} className="glass rounded-xl p-4 space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" className="text-xs text-amber-400">View →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-base font-bold text-white">⚙️ Admin Settings</h3>

            {/* UPI ID Management */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="text-sm font-semibold text-white">💳 UPI ID for Payments</div>
              <p className="text-[10px] text-slate-400">This UPI ID is used for payment collection only. It is NEVER shown to any user. Admin can update anytime.</p>
              {settings.upiId && (
                <div className="text-xs text-green-400">Current: {settings.upiId}</div>
              )}
              <input type="text" placeholder="yourname@upi or mobile@paytm" value={newUpiId}
                onChange={e => setNewUpiId(e.target.value)}
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none border border-white/10" />
              <button onClick={handleUpiUpdate} className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30">
                💳 Update UPI ID
              </button>
            </div>

            {/* PIN Management */}
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="text-sm font-semibold text-white">🔐 Change Admin PIN</div>
              <p className="text-[10px] text-slate-400">4-8 characters: letters, numbers, symbols all allowed</p>
              <input type="password" placeholder="New PIN (4-8 chars)" maxLength={8} value={newPin}
                onChange={e => setNewPin(e.target.value.slice(0, 8))}
                className="w-full bg-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none border border-white/10" />
              <button onClick={handlePinUpdate} className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30">
                🔐 Update PIN
              </button>
            </div>
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="text-sm font-semibold text-white">Database Actions</div>
              <button onClick={() => {
                if (confirm('Clear all data? This cannot be undone! / सभी डेटा हटाएं? यह पूर्ववत नहीं किया जा सकता!')) {
                  localStorage.clear();
                  refreshData();
                }
              }} className="w-full py-2.5 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30">
                🗑️ Clear All Data
              </button>
              <button onClick={() => {
                const data = {
                  providers: storage.getProviders(),
                  reels: storage.getReels(),
                  complaints: storage.getComplaints(),
                  reports: storage.getReports(),
                  settings: storage.getSettings(),
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `localfinder_backup_${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }} className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">
                📥 Export Backup
              </button>
              <label className="block">
                <div className="w-full py-2.5 rounded-xl text-sm font-bold bg-green-500/20 text-green-400 hover:bg-green-500/30 text-center cursor-pointer">
                  📤 Import Backup
                </div>
                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const data = JSON.parse(reader.result as string);
                        if (data.providers) localStorage.setItem('lf_providers', JSON.stringify(data.providers));
                        if (data.reels) localStorage.setItem('lf_reels', JSON.stringify(data.reels));
                        if (data.complaints) localStorage.setItem('lf_complaints', JSON.stringify(data.complaints));
                        if (data.reports) localStorage.setItem('lf_reports', JSON.stringify(data.reports));
                        if (data.settings) localStorage.setItem('lf_settings', JSON.stringify(data.settings));
                        refreshData();
                        alert('Backup imported successfully!');
                      } catch {
                        alert('Invalid backup file');
                      }
                    };
                    reader.readAsText(file);
                  }
                }} />
              </label>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-xs text-slate-400 space-y-1">
                <div>App Version: 1.0.0</div>
                <div>Build: Production PWA</div>
                <div>Platform: Android / Web</div>
                <div>Storage Used: {(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</div>
                <div>Providers: {providers.length} | Reels: {reels.length} | Reports: {reports.length}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
