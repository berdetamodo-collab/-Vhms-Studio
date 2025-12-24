
import Dexie, { type Table } from 'dexie';

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
}

export interface PersistedHistoryItem {
  id: string;
  timestamp: number;
  outputImage: string; // Base64 Data URL
  inputs: any; // Serialized inputs with Blobs
  blueprint: any;
}

export class VhmsDexie extends Dexie {
  cache!: Table<CacheEntry, string>; 
  history!: Table<PersistedHistoryItem, string>; 

  constructor() {
    super('vhmsCacheDB');
    // Version 1: Cache only
    (this as Dexie).version(1).stores({
      cache: '&key, timestamp' 
    });
    
    // Version 2: Add History table
    (this as Dexie).version(2).stores({
      cache: '&key, timestamp',
      history: '&id, timestamp'
    });
  }
}

export const db = new VhmsDexie();
