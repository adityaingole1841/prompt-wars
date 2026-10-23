/**
 * Admin Store — localStorage-backed persistence for admin posts.
 * All bulletins are stored in the browser and shown to public users in the feed.
 */

import { AdminPost, PublicDataItem, DisasterCategory, DisasterSeverity } from '../types/admin';

const STORAGE_KEY = 'admin_disaster_posts';
const SESSION_KEY = 'admin_session';

// ─── ADMIN CREDENTIALS (simple in-app gate) ─────────────────────────
// In a real app this would be server-side auth.
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'disaster@2024';

// ─── SESSION ────────────────────────────────────────────────────────
export function loginAdmin(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const session = { isLoggedIn: true, username, loginTime: new Date().toISOString() };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch {}
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
}

export function getAdminSession(): { isLoggedIn: boolean; username: string } {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { isLoggedIn: false, username: '' };
}

// ─── POSTS CRUD ──────────────────────────────────────────────────────
export function getAllPosts(): AdminPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminPost[]) : getSeedPosts();
  } catch {
    return getSeedPosts();
  }
}

export function getPublicPosts(): AdminPost[] {
  return getAllPosts()
    .filter((p) => p.isActive)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function savePost(post: AdminPost): void {
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.id === post.id);
  if (idx >= 0) posts[idx] = post;
  else posts.unshift(post);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch {}
}

export function deletePost(id: string): void {
  const posts = getAllPosts().filter((p) => p.id !== id);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch {}
}

export function togglePostActive(id: string): void {
  const posts = getAllPosts();
  const post = posts.find((p) => p.id === id);
  if (post) {
    post.isActive = !post.isActive;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); } catch {}
  }
}

export function createPost(
  fields: Omit<AdminPost, 'id' | 'publishedAt' | 'isActive'>
): AdminPost {
  return {
    ...fields,
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    publishedAt: new Date().toISOString(),
    isActive: true,
  };
}

// ─── SIMULATED PUBLIC DATA FEED ──────────────────────────────────────
// In a real deployment these would be fetched from NDMA/IMD/GDACS RSS feeds.
export async function fetchPublicDisasterData(): Promise<PublicDataItem[]> {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 1200));

  const now = new Date();
  const hrs = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

  return [
    {
      id: 'ndma_001',
      title: 'Heavy Rainfall Red Alert — Uttarakhand & Himachal Pradesh',
      source: 'NDMA (National Disaster Management Authority)',
      sourceUrl: 'https://ndma.gov.in/Natural-Hazards/Floods',
      publishedAt: hrs(2),
      summary:
        'IMD has issued a Red Alert for heavy to very heavy rainfall across Uttarakhand and Himachal Pradesh. Residents in hilly terrain should avoid river banks. NDRF teams deployed.',
      category: 'flood',
      severity: 'CRITICAL',
      location: 'Uttarakhand, Himachal Pradesh',
    },
    {
      id: 'imd_002',
      title: 'Cyclone Advisory: Deep Depression in Bay of Bengal',
      source: 'IMD (India Meteorological Department)',
      sourceUrl: 'https://mausam.imd.gov.in/national/cyclone_warning_services.php',
      publishedAt: hrs(5),
      summary:
        'A deep depression over central Bay of Bengal is likely to intensify into a cyclonic storm over the next 48 hours. Coastal districts of Andhra Pradesh and Odisha are on alert.',
      category: 'cyclone',
      severity: 'WARNING',
      location: 'Andhra Pradesh, Odisha coast',
    },
    {
      id: 'pib_003',
      title: 'NDRF Teams Deployed: Assam Floods Update',
      source: 'PIB (Press Information Bureau)',
      sourceUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=1900000',
      publishedAt: hrs(8),
      summary:
        `14 NDRF teams have been pre-deployed across Assam's 15 flood-affected districts. Over 2.5 lakh people affected. Relief camps established at 320 locations. Air Force helicopters on standby.`,
      category: 'flood',
      severity: 'CRITICAL',
      location: 'Assam',
    },
    {
      id: 'imd_004',
      title: 'Heatwave Alert: Central India Districts (MP, CG, Maharashtra)',
      source: 'IMD (India Meteorological Department)',
      sourceUrl: 'https://mausam.imd.gov.in/',
      publishedAt: hrs(12),
      summary:
        'Severe heatwave conditions expected for the next 3 days with temperatures exceeding 44°C in parts of Madhya Pradesh, Chhattisgarh and Vidarbha. Avoid outdoor activities between 11AM–4PM.',
      category: 'heatwave',
      severity: 'WARNING',
      location: 'Madhya Pradesh, Chhattisgarh, Vidarbha',
    },
    {
      id: 'ndma_005',
      title: 'Forest Fire Outbreak: Uttarakhand Nainital Range',
      source: 'Forest Survey of India',
      sourceUrl: 'https://fsi.nic.in/',
      publishedAt: hrs(18),
      summary:
        'Multiple forest fire alerts reported in Nainital and Almora districts. Fire fighting operations underway. Tourists and trekkers advised not to venture into affected forest zones.',
      category: 'fire',
      severity: 'WARNING',
      location: 'Nainital, Almora, Uttarakhand',
    },
    {
      id: 'reuters_006',
      title: 'Road Accident — NH-48 Near Pune: 12 Injured',
      source: 'PTI / ANI Newswire',
      sourceUrl: 'https://www.aninews.in/',
      publishedAt: hrs(3),
      summary:
        'A multi-vehicle collision on NH-48 near Khopoli (Pune-Mumbai Expressway) has injured 12 people. Rescue operations in progress. Traffic diverted. Nearest hospital: Khopoli Civil Hospital.',
      category: 'accident',
      severity: 'WATCH',
      location: 'Khopoli, Pune, Maharashtra',
    },
    {
      id: 'ndma_007',
      title: 'Earthquake: 4.2 Magnitude Near Kutch, Gujarat',
      source: 'National Centre for Seismology',
      sourceUrl: 'https://seismo.gov.in/',
      publishedAt: hrs(6),
      summary:
        'A 4.2 magnitude earthquake struck near Bhuj, Kutch at 03:14 IST. No damage reported. NCS monitoring for aftershocks. Citizens in the region advised to remain cautious.',
      category: 'earthquake',
      severity: 'INFO',
      location: 'Bhuj, Kutch, Gujarat',
    },
    {
      id: 'imd_008',
      title: 'Landslide Warning: Western Ghats — Kerala & Karnataka',
      source: 'KSEB / District Collector Office',
      sourceUrl: 'https://sdma.kerala.gov.in/',
      publishedAt: hrs(10),
      summary:
        'Landslide warnings issued for 8 districts in Kerala and 4 in Karnataka following continuous rainfall. Residents in hilltop areas and near riverbeds urged to move to relief camps.',
      category: 'landslide',
      severity: 'WARNING',
      location: 'Wayanad, Idukki, Kodagu',
    },
  ];
}

// ─── SEED DATA (first-run defaults) ─────────────────────────────────
function getSeedPosts(): AdminPost[] {
  const seed: AdminPost[] = [
    {
      id: 'seed_001',
      title: 'Mega Mock Drill: National Earthquake Preparedness Day',
      category: 'earthquake',
      severity: 'INFO',
      location: 'Pan India (All States)',
      state: 'National',
      description:
        'The National Disaster Management Authority is conducting a nationwide mock earthquake drill on November 15. All citizens are encouraged to practice Drop-Cover-Hold. Schools and offices to conduct evacuation drills.',
      source: 'admin',
      publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      author: 'Admin',
      isActive: true,
      tags: ['drill', 'earthquake', 'preparedness', 'NDMA'],
    },
    {
      id: 'seed_002',
      title: '⚠️ Flood Warning: Brahmaputra River Reaches Danger Level',
      category: 'flood',
      severity: 'CRITICAL',
      location: 'Guwahati, Assam',
      state: 'Assam',
      description:
        'The Brahmaputra River has reached a danger level of 49.60m at Guwahati. District administration has issued evacuation orders for low-lying areas. Please move to nearest relief camp. Helpline: 1800-345-3613.',
      source: 'admin',
      publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      author: 'Admin',
      isActive: true,
      tags: ['flood', 'Assam', 'Brahmaputra', 'evacuation'],
    },
  ];

  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch {}
  return seed;
}

// ─── HELPERS ─────────────────────────────────────────────────────────
export const SEVERITY_CONFIG: Record<
  DisasterSeverity,
  { label: string; color: string; bg: string; border: string }
> = {
  INFO:     { label: 'INFO',     color: '#0369a1', bg: '#e0f2fe', border: '#0ea5e9' },
  WATCH:    { label: 'WATCH',    color: '#92400e', bg: '#fef3c7', border: '#f59e0b' },
  WARNING:  { label: 'WARNING',  color: '#9a3412', bg: '#ffedd5', border: '#f97316' },
  CRITICAL: { label: 'CRITICAL', color: '#7f1d1d', bg: '#fee2e2', border: '#ef4444' },
};

export const CATEGORY_ICONS: Record<DisasterCategory, string> = {
  flood: '🌊',
  cyclone: '🌀',
  earthquake: '🏔️',
  fire: '🔥',
  landslide: '⛰️',
  heatwave: '☀️',
  drought: '🏜️',
  tsunami: '🌊',
  accident: '🚨',
  industrial: '🏭',
  epidemic: '🦠',
  other: '⚠️',
};

export const INDIA_STATES = [
  'National', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman & Nicobar',
  'Chandigarh', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Lakshadweep',
  'Puducherry',
];
