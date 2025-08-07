export interface FilterSettings {
  enabled: boolean;
  filterMode: 'blur' | 'remove';
  strictness: 'relaxed' | 'moderate' | 'strict';
  whitelist: string[];
  keywords: string[];
}

export interface DetectionResult {
  shouldFilter: boolean;
  reason?: string;
  confidence: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface UserClassification {
  username: string;
  isFiltered: boolean;
  reason: string;
  checkedAt: number;
}