export interface Provider {
  id: string;
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp: string;
  category: string;
  locality: string;
  address: string;
  landmark: string;
  city: string;
  pincode: string;
  state: string;
  businessHours: string;
  serviceType: string;
  serviceRadius: string;
  googleMaps: string;
  description: string;
  plan: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended' | 'verified';
  rejectionReason?: string;
  suspensionReason?: string;
  createdAt: string;
  updatedAt?: string;
  photoUrl?: string;
  coverUrl?: string;
  idProofUrl?: string;
  otpVerified?: boolean;
  planExpiry?: string;
  confirmOwnership?: boolean;
  confirmListingRules?: boolean;
}

export interface Reel {
  id: string;
  providerId: string;
  title: string;
  description: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'photo';
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  createdAt: string;
  updatedAt?: string;
  likes: number;
  views: number;
}

export interface Complaint {
  id: string;
  type: string;
  targetId?: string;
  targetName?: string;
  reason?: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface Report {
  id: string;
  type: 'listing' | 'reel';
  targetId: string;
  targetName: string;
  reason: string;
  details?: string;
  status: 'open' | 'reviewed' | 'actioned' | 'dismissed';
  createdAt: string;
}

const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
};

export const storage = {
  getProviders: (): Provider[] => getItem('lf_providers', []),
  saveProvider: (provider: Provider) => {
    const providers = getItem<Provider[]>('lf_providers', []);
    const idx = providers.findIndex(p => p.id === provider.id);
    if (idx >= 0) providers[idx] = provider;
    else providers.push(provider);
    setItem('lf_providers', providers);
  },
  deleteProvider: (id: string) => {
    const providers = getItem<Provider[]>('lf_providers', []);
    setItem('lf_providers', providers.filter(p => p.id !== id));
  },

  getReels: (): Reel[] => getItem('lf_reels', []),
  saveReel: (reel: Reel) => {
    const reels = getItem<Reel[]>('lf_reels', []);
    const idx = reels.findIndex(r => r.id === reel.id);
    if (idx >= 0) reels[idx] = reel;
    else reels.push(reel);
    setItem('lf_reels', reels);
  },
  deleteReel: (id: string) => {
    const reels = getItem<Reel[]>('lf_reels', []);
    setItem('lf_reels', reels.filter(r => r.id !== id));
  },

  getComplaints: (): Complaint[] => getItem('lf_complaints', []),
  saveComplaint: (complaint: Complaint) => {
    const complaints = getItem<Complaint[]>('lf_complaints', []);
    const idx = complaints.findIndex(c => c.id === complaint.id);
    if (idx >= 0) complaints[idx] = complaint;
    else complaints.push(complaint);
    setItem('lf_complaints', complaints);
  },

  getReports: (): Report[] => getItem('lf_reports', []),
  saveReport: (report: Report) => {
    const reports = getItem<Report[]>('lf_reports', []);
    const idx = reports.findIndex(r => r.id === report.id);
    if (idx >= 0) reports[idx] = report;
    else reports.push(report);
    setItem('lf_reports', reports);
  },
  updateReportStatus: (id: string, status: Report['status']) => {
    const reports = getItem<Report[]>('lf_reports', []);
    const idx = reports.findIndex(r => r.id === id);
    if (idx >= 0) {
      reports[idx].status = status;
      setItem('lf_reports', reports);
    }
  },

  getRecentSearches: (): string[] => getItem('lf_recent_searches', []),
  addRecentSearch: (query: string) => {
    const searches = getItem<string[]>('lf_recent_searches', []);
    const filtered = searches.filter(s => s !== query);
    filtered.unshift(query);
    setItem('lf_recent_searches', filtered.slice(0, 10));
  },
  clearRecentSearches: () => setItem('lf_recent_searches', []),

  getSettings: () => getItem('lf_settings', { adminPin: '12345678', approved: 0, revenue: 0, upiId: '' }),
  saveSettings: (settings: any) => setItem('lf_settings', settings),
};
