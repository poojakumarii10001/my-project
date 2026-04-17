export interface Plan {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  duration: string;
  color: string;
  gradient: string;
  badge?: string;
  features: string[];
  limits: {
    photos: number;
    reels: number;
    boost: boolean;
    verified: boolean;
    priority: boolean;
    featured: boolean;
    topPlacement: boolean;
    premiumBadge: boolean;
  };
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    nameHi: 'बेसिक',
    price: 99,
    duration: '30 Days',
    color: '#64748b',
    gradient: 'from-slate-500 to-slate-700',
    features: [
      'Basic business listing',
      'Show in category search',
      'Up to 3 photos upload',
      'Business name & address display',
      'Mobile number visible',
      'Standard review (3-5 days)',
      'Basic profile page',
      'Listed in local search',
    ],
    limits: {
      photos: 3,
      reels: 0,
      boost: false,
      verified: false,
      priority: false,
      featured: false,
      topPlacement: false,
      premiumBadge: false,
    },
  },
  {
    id: 'silver',
    name: 'Silver',
    nameHi: 'सिल्वर',
    price: 499,
    duration: '90 Days',
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    badge: '⭐ Popular',
    features: [
      'Everything in Basic +',
      'Up to 10 photos upload',
      'Upload 2 Reels / videos',
      'WhatsApp button on profile',
      'Google Maps link support',
      'Verified badge support',
      'Priority review (1-2 days)',
      'Better search visibility',
      'Social sharing enabled',
      'Business hours display',
    ],
    limits: {
      photos: 10,
      reels: 2,
      boost: false,
      verified: true,
      priority: true,
      featured: false,
      topPlacement: false,
      premiumBadge: false,
    },
  },
  {
    id: 'gold',
    name: 'Gold',
    nameHi: 'गोल्ड',
    price: 799,
    duration: '180 Days',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    badge: '🔥 Best Value',
    features: [
      'Everything in Silver +',
      'Up to 25 photos upload',
      'Upload 5 Reels / videos',
      'Featured in category page',
      'Highlighted listing card',
      'Priority customer support',
      'Cover photo on profile',
      'Service area radius display',
      'Auto-renewed visibility boost',
      'Detailed analytics access',
      'Multi-category listing',
      'Review (within 24 hours)',
    ],
    limits: {
      photos: 25,
      reels: 5,
      boost: true,
      verified: true,
      priority: true,
      featured: true,
      topPlacement: false,
      premiumBadge: false,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    nameHi: 'प्रीमियम',
    price: 1499,
    duration: '365 Days',
    color: '#ec4899',
    gradient: 'from-pink-500 to-rose-600',
    badge: '👑 Premium',
    features: [
      'Everything in Gold +',
      'Unlimited photo uploads',
      'Upload 15 Reels / videos',
      'Top placement in all searches',
      'Premium verified badge ✅',
      'Premium profile design',
      'Homepage spotlight feature',
      'Dedicated account manager',
      'Instant review & approval',
      'Ad-free premium listing',
      'Custom business page URL',
      'Priority complaint resolution',
      'Exclusive promotional events',
      'Full analytics dashboard',
      'Multi-location support',
    ],
    limits: {
      photos: 999,
      reels: 15,
      boost: true,
      verified: true,
      priority: true,
      featured: true,
      topPlacement: true,
      premiumBadge: true,
    },
  },
];
