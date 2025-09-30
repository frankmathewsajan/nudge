// Gemini Cache - Smart caching and session management
// Max 80 lines, caching logic only

import { CacheEntry, UserSession } from './geminiTypes';

export class SmartCache {
  private cache = new Map<string, CacheEntry>();
  private sessions = new Map<string, UserSession>();
  private readonly CACHE_TTL = 1000 * 60 * 15; // 15 minutes
  private readonly SESSION_TTL = 1000 * 60 * 60; // 1 hour
  private readonly MAX_CONTEXT_LENGTH = 5; // Keep last 5 interactions

  // Generate cache key from input
  private generateKey(input: string): string {
    return btoa(input).substring(0, 32); // Base64 hash, first 32 chars
  }

  // Get from cache if valid
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.result as T;
    }
    if (entry) {
      this.cache.delete(key); // Remove expired entry
    }
    return null;
  }

  // Set cache entry
  set<T>(key: string, result: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      key,
      result,
      timestamp: Date.now(),
      ttl
    });
  }

  // Smart validation caching
  isValidationCached(input: string): boolean | null {
    const key = this.generateKey(input);
    const cached = this.get<boolean>(`validation_${key}`);
    return cached;
  }

  cacheValidation(input: string, isValid: boolean): void {
    const key = this.generateKey(input);
    this.set(`validation_${key}`, isValid, this.CACHE_TTL);
  }

  // Session management
  getSession(userId: string = 'default'): UserSession {
    let session = this.sessions.get(userId);
    if (!session || Date.now() - session.lastInteraction > this.SESSION_TTL) {
      session = {
        userId,
        context: [],
        lastInteraction: Date.now(),
        preferences: {},
        validationCache: new Map()
      };
      this.sessions.set(userId, session);
    }
    return session;
  }

  updateSession(userId: string, context: string): void {
    const session = this.getSession(userId);
    session.context.push(context);
    session.lastInteraction = Date.now();
    
    // Keep only recent context
    if (session.context.length > this.MAX_CONTEXT_LENGTH) {
      session.context = session.context.slice(-this.MAX_CONTEXT_LENGTH);
    }
  }

  // Utility methods
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const smartCache = new SmartCache();