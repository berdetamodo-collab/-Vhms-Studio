
import type { HistoryItem, FileWithPreview } from '../types';
import { db } from './db';

/**
 * Generates a unique key for a set of files.
 * [UPGRADED v12.10] Supports mode-specific namespacing to prevent logic leaks.
 */
export const generateFileCacheKey = (files: (FileWithPreview | null | undefined)[], namespace: string = ""): string => {
  const fileKey = files
    .filter((file): file is FileWithPreview => !!file)
    .map(file => `${file.name}-${file.size}-${file.lastModified}`)
    .sort()
    .join('|');
  
  return namespace ? `${namespace}:${fileKey}` : fileKey;
};

const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours

class CacheService {
  constructor() {
    this.cleanupExpired();
    console.log("[CacheEngine] Initialized Zero-Leakage PACE System.");
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const entry = await db.cache.get(key);
      if (entry && (Date.now() - entry.timestamp < EXPIRY_MS)) {
        console.log(`[CacheEngine] HIT: ${key.substring(0, 50)}...`);
        return entry.value as T;
      }
      if (entry) await db.cache.delete(key);
    } catch (e) {
      console.warn("[CacheEngine] IndexedDB Read Fail", e);
    }
    return null;
  }

  public async set<T>(key: string, data: T): Promise<void> {
    try {
      await db.cache.put({
        key,
        value: data,
        timestamp: Date.now()
      });
      console.log(`[CacheEngine] SET: ${key.substring(0, 50)}...`);
    } catch (e) {
      console.warn("[CacheEngine] IndexedDB Write Fail", e);
    }
  }
  
  private async cleanupExpired(): Promise<void> {
    try {
        const expiryTime = Date.now() - EXPIRY_MS;
        await db.cache.where('timestamp').below(expiryTime).delete();
    } catch (e) {
        console.warn("[CacheEngine] Cleanup fail", e);
    }
  }

  public async clear(): Promise<void> {
    try {
        await db.cache.clear();
        console.log("[CacheEngine] PACE Cache Purged.");
    } catch(e) {
        console.error("[CacheEngine] Purge fail", e);
    }
  }
}

export const cacheService = new CacheService();
