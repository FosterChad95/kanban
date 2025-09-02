# Caching Strategy for Kanban Task Manager

## Overview

This document outlines recommended caching strategies for the Kanban Task Manager project, considering the real-time collaborative nature, data access patterns, and existing technology stack.

## Recommended Multi-Tiered Caching Architecture

### 1. **Redis for Application-Level Caching** (Primary Recommendation)

**Why Redis:**
- **Real-time collaboration**: Works seamlessly with existing Pusher setup for real-time updates
- **Multi-instance support**: Cache invalidation across multiple server instances
- **Complex data structures**: Native support for JSON, lists, sets - perfect for board/task relationships
- **TTL support**: Automatic expiration for user sessions and temporary data
- **Pub/Sub capabilities**: Can integrate with Pusher for coordinated cache invalidation

**Implementation Example:**
```typescript
// src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const CacheKeys = {
  USER_BOARDS: (userId: string) => `user:${userId}:boards`,
  BOARD_FULL: (boardId: string) => `board:${boardId}:full`,
  USER_TEAMS: (userId: string) => `user:${userId}:teams`,
  BOARD_MEMBERS: (boardId: string) => `board:${boardId}:members`,
  USER_PERMISSIONS: (userId: string, boardId: string) => `user:${userId}:board:${boardId}:perms`,
} as const;

export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  static async set(key: string, value: any, ttl = 300): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value));
  }
  
  static async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  }
  
  static async invalidateUserData(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}:*`);
  }
  
  static async invalidateBoardData(boardId: string): Promise<void> {
    await this.invalidatePattern(`*:board:${boardId}:*`);
  }
}
```

### 2. **Next.js Built-in Caching** (Secondary Layer)

**Why Next.js Caching:**
- **Zero configuration**: Already built into Next.js 15 setup
- **Edge optimization**: Works exceptionally well with Vercel deployment
- **Request deduplication**: Automatic for identical requests within same render
- **Revalidation strategies**: Time-based and tag-based invalidation

**Implementation Example:**
```typescript
// src/lib/cached-queries.ts
import { unstable_cache } from 'next/cache';
import { getBoardsForUser, getBoardById, getAllTeams } from '../queries';

// Cache semi-static data that doesn't change frequently
export const getCachedUserBoards = unstable_cache(
  async (userId: string, userRole: string) => 
    getBoardsForUser({ id: userId, role: userRole }),
  ['user-boards'],
  { 
    revalidate: 300, // 5 minutes
    tags: ['boards', 'user-data'] 
  }
);

export const getCachedBoard = unstable_cache(
  async (boardId: string) => getBoardById(boardId),
  ['board-detail'],
  { 
    revalidate: 60, // 1 minute for active boards
    tags: ['board', 'board-detail'] 
  }
);

export const getCachedTeams = unstable_cache(
  async () => getAllTeams(),
  ['teams'],
  { 
    revalidate: 900, // 15 minutes
    tags: ['teams', 'admin-data'] 
  }
);

// Utility for manual cache invalidation
export async function revalidateUserData(userId: string) {
  revalidateTag('user-data');
  revalidateTag(`user-${userId}`);
}
```

### 3. **Client-Side Caching with TanStack Query** (React Query)

**Why TanStack Query:**
- **Background refetching**: Keeps data fresh automatically without user intervention
- **Optimistic updates**: Perfect for real-time collaborative features
- **Request deduplication**: Multiple components can safely request the same data
- **Offline support**: Graceful degradation when connection is poor
- **Stale-while-revalidate**: Shows cached data immediately, updates in background

**Implementation Example:**
```typescript
// src/hooks/queries/useBoards.ts
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Board } from '@/types';

export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: () => fetch('/api/boards').then(r => r.json()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 30, // 30 seconds for active collaboration
  });
}

export function useBoard(boardId: string) {
  return useQuery({
    queryKey: ['board', boardId],
    queryFn: () => fetch(`/api/boards/${boardId}`).then(r => r.json()),
    staleTime: 1000 * 30, // 30 seconds
    enabled: !!boardId,
  });
}

export function useBoardOptimisticUpdates() {
  const queryClient = useQueryClient();
  
  return {
    updateBoardOptimistically: (boardId: string, updates: Partial<Board>) => {
      queryClient.setQueryData(['board', boardId], (old: Board | undefined) => 
        old ? { ...old, ...updates } : undefined
      );
    },
    
    updateTaskOptimistically: (boardId: string, taskId: string, updates: any) => {
      queryClient.setQueryData(['board', boardId], (old: Board | undefined) => {
        if (!old) return undefined;
        
        return {
          ...old,
          columns: old.columns.map(col => ({
            ...col,
            tasks: col.tasks.map(task => 
              task.id === taskId ? { ...task, ...updates } : task
            )
          }))
        };
      });
    }
  };
}

// Hook for real-time integration
export function useBoardRealTimeSync(boardId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!boardId) return;
    
    const channel = pusher.subscribe(`board-${boardId}`);
    
    channel.bind('task-updated', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    });
    
    channel.bind('board-updated', (data: any) => {
      queryClient.setQueryData(['board', boardId], data.board);
    });
    
    return () => pusher.unsubscribe(`board-${boardId}`);
  }, [boardId, queryClient]);
}
```

## Caching Strategy by Data Type

### **Frequently Accessed, Rarely Changed Data**
- **User profiles and preferences**
  - Redis: 30 minutes TTL
  - Next.js: 15 minutes revalidate
- **Team memberships and roles**
  - Redis: 15 minutes TTL
  - Next.js: 10 minutes revalidate
- **Board access permissions**
  - Redis: 10 minutes TTL
  - Client: 5 minutes stale time

### **Real-time Collaborative Data**
- **Active board state (columns, tasks)**
  - Client-side: 30 seconds stale time + optimistic updates
  - Redis: 2 minutes TTL as fallback
  - Real-time: Pusher invalidation triggers
- **Task positions and status**
  - Client-side: Immediate optimistic updates
  - Real-time: Pusher broadcasts to all connected clients
- **Currently active users on board**
  - Redis: 5 minutes TTL
  - Real-time: Pusher presence channel

### **Static/Reference Data**
- **User dropdown options**
  - Next.js: 1 hour revalidate
  - Client: 30 minutes stale time
- **Team lists for admin**
  - Next.js: 30 minutes revalidate
  - Redis: 20 minutes TTL
- **Application constants and configuration**
  - Build-time static compilation
  - Environment-based configuration caching

## Implementation Phases

### Phase 1: Quick Wins (Immediate Implementation)

**Enhanced Query Layer with Basic Caching:**
```typescript
// src/queries/cached-board-queries.ts
import { CacheService, CacheKeys } from '../lib/cache';
import { getBoardsForUser, getBoardById } from './boardQueries';

export async function getBoardsForUserCached(user: { id: string; role: string }) {
  const cacheKey = CacheKeys.USER_BOARDS(user.id);
  
  // Try cache first
  const cached = await CacheService.get(cacheKey);
  if (cached) return cached;
  
  // Fallback to database
  const boards = await getBoardsForUser(user);
  
  // Cache for 5 minutes
  await CacheService.set(cacheKey, boards, 300);
  
  return boards;
}

export async function getBoardByIdCached(boardId: string) {
  const cacheKey = CacheKeys.BOARD_FULL(boardId);
  
  const cached = await CacheService.get(cacheKey);
  if (cached) return cached;
  
  const board = await getBoardById(boardId);
  if (board) {
    // Cache active boards for 2 minutes
    await CacheService.set(cacheKey, board, 120);
  }
  
  return board;
}
```

**Cache Invalidation Hooks:**
```typescript
// src/hooks/useCache.ts
import { CacheService } from '../lib/cache';

export function useCache() {
  const invalidateUserData = async (userId: string) => {
    await CacheService.invalidateUserData(userId);
    // Also invalidate client-side cache
    queryClient.invalidateQueries({ 
      predicate: query => query.queryKey.includes(userId) 
    });
  };
  
  const invalidateBoardData = async (boardId: string) => {
    await CacheService.invalidateBoardData(boardId);
    queryClient.invalidateQueries({ queryKey: ['board', boardId] });
  };
  
  return { invalidateUserData, invalidateBoardData };
}
```

### Phase 2: Advanced Features

**Pusher Integration for Real-time Cache Synchronization:**
```typescript
// src/lib/cache-sync.ts
import { CacheService } from './cache';
import { pusher } from './pusher';

export class CacheSyncService {
  static async broadcastCacheInvalidation(pattern: string, data?: any) {
    // Invalidate local cache
    await CacheService.invalidatePattern(pattern);
    
    // Broadcast to all connected clients
    await pusher.trigger('cache-invalidation', 'pattern-invalidated', {
      pattern,
      timestamp: Date.now(),
      data
    });
  }
  
  static setupCacheInvalidationListener() {
    const channel = pusher.subscribe('cache-invalidation');
    
    channel.bind('pattern-invalidated', async (data: any) => {
      await CacheService.invalidatePattern(data.pattern);
    });
  }
}
```

**Background Cache Warming:**
```typescript
// src/lib/cache-warming.ts
export class CacheWarmingService {
  static async warmUserCache(userId: string) {
    // Pre-load frequently accessed data
    const userBoards = await getBoardsForUserCached({ id: userId, role: 'USER' });
    const userTeams = await getTeamsForUserCached(userId);
    
    // Warm individual board caches for user's active boards
    const recentBoards = userBoards.slice(0, 3); // Top 3 most recent
    await Promise.all(
      recentBoards.map(board => getBoardByIdCached(board.id))
    );
  }
  
  static async warmPopularBoardsCache() {
    // Background job to warm cache for most active boards
    const popularBoardIds = await getPopularBoardIds();
    await Promise.all(
      popularBoardIds.map(id => getBoardByIdCached(id))
    );
  }
}
```

### Phase 3: Monitoring and Analytics

**Cache Performance Monitoring:**
```typescript
// src/lib/cache-metrics.ts
export class CacheMetrics {
  static trackCacheHit(key: string, source: 'redis' | 'nextjs' | 'client') {
    // Track cache hit rates
  }
  
  static trackCacheMiss(key: string, reason: string) {
    // Track cache miss reasons
  }
  
  static async getCacheStats() {
    return {
      hitRate: await this.calculateHitRate(),
      avgResponseTime: await this.calculateAvgResponseTime(),
      popularKeys: await this.getMostAccessedKeys(),
    };
  }
}
```

## Budget-Conscious Alternative

If infrastructure budget is limited, start with this minimal setup:

### **Client-Side Only Approach:**
- **TanStack Query** for all client-side caching
- **Next.js built-in caching** for API routes
- **Optimistic updates** for real-time feel

**Benefits:**
- 80% of performance improvements
- Zero additional infrastructure costs
- Easy to upgrade to full Redis setup later

### **Implementation:**
```typescript
// Minimal setup - just enhance existing hooks
export function useBoards() {
  return useQuery({
    queryKey: ['boards'],
    queryFn: fetchBoards,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
}
```

## Infrastructure Requirements

### **Redis Setup (Production):**
- **Development**: Local Redis or Redis Cloud free tier
- **Production**: Redis Cloud, AWS ElastiCache, or Railway Redis
- **Estimated cost**: $10-50/month depending on usage
- **Memory requirements**: Start with 256MB, scale based on active users

### **Monitoring:**
- Redis memory usage
- Cache hit/miss rates
- Query response times
- Client-side cache performance

## Migration Strategy

1. **Week 1**: Implement TanStack Query client-side caching
2. **Week 2**: Add Next.js caching to existing API routes
3. **Week 3**: Set up Redis and basic server-side caching
4. **Week 4**: Integrate Pusher with cache invalidation
5. **Week 5**: Add cache warming and performance monitoring

## Performance Expectations

### **Expected Improvements:**
- **API Response Time**: 200ms → 50ms (75% reduction)
- **Page Load Time**: 2s → 800ms (60% reduction)
- **Real-time Updates**: Near-instant with optimistic updates
- **Database Load**: 60% reduction in query volume
- **User Experience**: Smoother interactions, offline capability

### **Metrics to Track:**
- Cache hit rate (target: >80%)
- Average response time (target: <100ms)
- Database query reduction (target: >50%)
- User engagement improvements

---

**Decision Points:**
1. Start with Phase 1 for immediate benefits?
2. Full Redis implementation or budget-conscious approach?
3. Priority on real-time performance vs. cost optimization?
4. Timeline for implementation phases?