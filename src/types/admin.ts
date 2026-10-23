/**
 * Admin Portal — Type Definitions
 * Types for admin disaster posts, public data feeds, and the published bulletin board.
 */

export type DisasterSeverity = 'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL';
export type DisasterCategory =
  | 'flood'
  | 'cyclone'
  | 'earthquake'
  | 'fire'
  | 'landslide'
  | 'heatwave'
  | 'drought'
  | 'tsunami'
  | 'accident'
  | 'industrial'
  | 'epidemic'
  | 'other';

/** A single admin-authored disaster bulletin */
export interface AdminPost {
  id: string;
  title: string;
  category: DisasterCategory;
  severity: DisasterSeverity;
  location: string;
  state: string;
  latitude?: number;
  longitude?: number;
  description: string;
  source: 'admin' | 'ndma' | 'imd' | 'reuters' | 'pib' | 'public';
  sourceUrl?: string;
  imageDataUrl?: string; // Base64 preview of uploaded image
  publishedAt: string;   // ISO timestamp
  author: string;
  isActive: boolean;     // Whether it shows in the public feed
  tags: string[];
}

/** A fetched public data item (from simulated NDMA/IMD/news sources) */
export interface PublicDataItem {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  summary: string;
  category: DisasterCategory;
  severity: DisasterSeverity;
  location?: string;
}

/** Admin session state */
export interface AdminSession {
  isLoggedIn: boolean;
  username: string;
  loginTime: string;
}
