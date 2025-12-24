/**
 * src/services/styleEmbeddingCache.ts
 * Cache for style embeddings. This implementation uses the generic
 * hybrid cacheService to store and retrieve style embeddings persistently.
 */
import { cacheService } from './cacheService';
import type { StyleEmbedding } from '../types';

const EMBEDDING_CACHE_PREFIX = 'style_embedding_';

/**
 * Caches a style embedding using the generic cache service.
 * The embedding object must have an 'id' property to be used as a key.
 * @param embedding The style embedding object to cache.
 */
export async function cacheStyleEmbedding(embedding: StyleEmbedding): Promise<void> {
    if (!embedding.id) {
        console.warn("[StyleEmbeddingCache] Attempted to cache an embedding without an ID. Skipping.");
        return;
    }
    const key = EMBEDDING_CACHE_PREFIX + embedding.id;
    cacheService.set(key, embedding);
}

/**
 * Retrieves a style embedding from the cache by its ID.
 * @param id The ID (cache key) of the embedding.
 * @returns The cached StyleEmbedding or null if not found.
 */
export async function getStyleEmbedding(id: string): Promise<StyleEmbedding | null> {
    const key = EMBEDDING_CACHE_PREFIX + id;
    return cacheService.get<StyleEmbedding>(key);
}
