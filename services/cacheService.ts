
// services/cacheService.ts
import type { FileWithPreview } from '../src/types';

/**
 * Generates a unique key for a set of files based on their names and sizes.
 * This is a simple but effective way to cache based on file identity for a session.
 * @param files - An array of files used for caching.
 * @returns A string key.
 */
export const generateFileCacheKey = (files: (FileWithPreview | null)[]): string => {
  return files
    .filter((file): file is FileWithPreview => file !== null)
    .map(file => `${file.name}-${file.size}-${file.lastModified}`)
    .sort()
    .join('|');
};

/**
 * A simple in-memory cache service for the current session.
 * Implements the "Persistent Analysis Cache Engine" feature with a more modular approach.
 */
class CacheService {
  private cache: Map<string, any>;

  constructor() {
    this.cache = new Map();
    console.log("Persistent Analysis Cache Engine initialized for this session.");
  }

  // --- [NEW ARCHITECTURE] Generic Cache ---
  public get<T>(key: string): T | null {
      const data = this.cache.get(key);
      if (data) {
          console.log(`[CacheService] HIT: Found data for key: ${key}`);
          return data as T;
      }
      return null;
  }
  public set<T>(key: string, data: T): void {
      this.cache.set(key, data);
      console.log(`[CacheService] SET: Stored data for key: ${key}`);
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
    console.log("[CacheService] Cache cleared.");
  }
}

export const cacheService = new CacheService();
