import { db, type PersistedHistoryItem } from './db';
import type { HistoryItem, FileWithPreview } from '../types';

/**
 * Helper to serialize a FileWithPreview into a storable object (Blob).
 */
const serializeFile = (file: FileWithPreview | null): { name: string, type: string, blob: Blob } | null => {
    if (!file) return null;
    return {
        name: file.name,
        type: file.type,
        blob: file // File IS a Blob, so Dexie can store it directly
    };
};

/**
 * Helper to deserialize a stored object back into a FileWithPreview.
 */
const deserializeFile = (data: { name: string, type: string, blob: Blob } | null): FileWithPreview | null => {
    if (!data) return null;
    const file = new File([data.blob], data.name, { type: data.type });
    return Object.assign(file, {
        preview: URL.createObjectURL(file)
    });
};

export const historyService = {
    /**
     * Save a HistoryItem to IndexedDB.
     */
    saveItem: async (item: HistoryItem) => {
        try {
            const persistedItem: PersistedHistoryItem = {
                id: item.id,
                timestamp: item.timestamp,
                outputImage: item.outputImage,
                blueprint: item.blueprint,
                inputs: {
                    ...item.inputs,
                    // [FIX] Handle subjectImages array serialization
                    subjectImages: item.inputs.subjectImages.map(img => serializeFile(img)),
                    sceneImage: serializeFile(item.inputs.sceneImage),
                    referenceImage: serializeFile(item.inputs.referenceImage),
                    outfitImage: serializeFile(item.inputs.outfitImage),
                }
            };
            
            await db.history.put(persistedItem);
            console.log(`[HistoryService] Saved item ${item.id} to DB.`);
        } catch (error) {
            console.error("[HistoryService] Failed to save history item:", error);
        }
    },

    /**
     * Load all history items from IndexedDB, sorted by newest first.
     */
    loadHistory: async (): Promise<HistoryItem[]> => {
        try {
            const persistedItems = await db.history.orderBy('timestamp').reverse().toArray();
            
            const hydratedItems: HistoryItem[] = persistedItems.map(pItem => ({
                id: pItem.id,
                timestamp: pItem.timestamp,
                outputImage: pItem.outputImage,
                blueprint: pItem.blueprint,
                inputs: {
                    ...pItem.inputs,
                    // [FIX] Handle subjectImages array deserialization
                    subjectImages: (pItem.inputs.subjectImages || []).map((img: any) => deserializeFile(img)).filter((img: any) => img !== null) as FileWithPreview[],
                    sceneImage: deserializeFile(pItem.inputs.sceneImage),
                    referenceImage: deserializeFile(pItem.inputs.referenceImage),
                    outfitImage: deserializeFile(pItem.inputs.outfitImage),
                }
            }));

            console.log(`[HistoryService] Loaded ${hydratedItems.length} items from DB.`);
            return hydratedItems;
        } catch (error) {
            console.error("[HistoryService] Failed to load history:", error);
            return [];
        }
    },

    /**
     * Clear all history from DB.
     */
    clearHistory: async () => {
        await db.history.clear();
        console.log("[HistoryService] History cleared.");
    },

    /**
     * Delete a single item.
     */
    deleteItem: async (id: string) => {
        await db.history.delete(id);
    }
};