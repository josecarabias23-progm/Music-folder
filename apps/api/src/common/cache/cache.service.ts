import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Optional, Inject } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

export const REDIS_CLIENT_TOKEN = 'REDIS_CLIENT';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private redisClient?: Redis;
  private isEnabled: boolean = true;
  private defaultTtl: number = 300;
  private readonly timeoutMs: number = 150;

  constructor(
    @Optional() @Inject(REDIS_CLIENT_TOKEN) injectedClient?: Redis,
  ) {
    if (injectedClient) {
      this.redisClient = injectedClient;
    }
    this.isEnabled = process.env.CACHE_ENABLED !== 'false';
    const ttlEnv = process.env.CACHE_DEFAULT_TTL;
    if (ttlEnv) {
      const parsed = parseInt(ttlEnv, 10);
      if (!isNaN(parsed) && parsed > 0) {
        this.defaultTtl = parsed;
      }
    }
  }

  onModuleInit() {
    if (!this.isEnabled) {
      this.logger.log('Cache is disabled via CACHE_ENABLED environment variable');
      return;
    }

    if (this.redisClient) {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL;
      const host = process.env.REDIS_HOST || 'localhost';
      const port = parseInt(process.env.REDIS_PORT || '6379', 10);
      const password = process.env.REDIS_PASSWORD || undefined;

      const options: RedisOptions = {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        enableOfflineQueue: false,
      };

      if (redisUrl) {
        this.redisClient = new Redis(redisUrl, options);
      } else {
        this.redisClient = new Redis({
          host,
          port,
          password,
          ...options,
        });
      }

      this.redisClient.on('error', (err) => {
        this.logger.warn(`Redis client warning/error: ${err.message}`);
      });

      this.redisClient.connect().catch((err) => {
        this.logger.warn(`Failed to connect to Redis: ${err.message}. Cache operations will fail open.`);
      });
    } catch (err: any) {
      this.logger.warn(`Error initializing Redis client: ${err?.message || err}`);
    }
  }

  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.quit().catch(() => {});
    }
  }

  /**
   * Fail-Open wrapper that executes a Redis operation with a strict timeout (150ms).
   * If Redis fails, throws an error, or times out, it logs a warning and returns fallback.
   */
  private async failOpenWrapper<T>(
    operation: () => Promise<T>,
    fallback: T,
    operationName: string,
  ): Promise<T> {
    if (!this.isEnabled || !this.redisClient) {
      return fallback;
    }

    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Redis operation '${operationName}' timed out after ${this.timeoutMs}ms`));
      }, this.timeoutMs);
    });

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      if (timeoutId) clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      if (timeoutId) clearTimeout(timeoutId);
      this.logger.warn(`Cache Fail-Open triggered on '${operationName}': ${error?.message || error}`);
      return fallback;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    return this.failOpenWrapper<T | null>(
      async () => {
        const data = await this.redisClient!.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      },
      null,
      `get(${key})`,
    );
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    const serialized = JSON.stringify(value);
    await this.failOpenWrapper<void>(
      async () => {
        if (ttl > 0) {
          await this.redisClient!.set(key, serialized, 'EX', ttl);
        } else {
          await this.redisClient!.set(key, serialized);
        }
      },
      undefined,
      `set(${key})`,
    );
  }

  async del(key: string): Promise<void> {
    await this.failOpenWrapper<void>(
      async () => {
        await this.redisClient!.del(key);
      },
      undefined,
      `del(${key})`,
    );
  }

  async delByPattern(pattern: string): Promise<void> {
    await this.failOpenWrapper<void>(
      async () => {
        if (typeof this.redisClient!.scanStream === 'function') {
          const stream = this.redisClient!.scanStream({ match: pattern, count: 100 });
          const keysToDelete: string[] = [];

          await new Promise<void>((resolve, reject) => {
            stream.on('data', (resultKeys: string[]) => {
              keysToDelete.push(...resultKeys);
            });
            stream.on('end', () => resolve());
            stream.on('error', (err) => reject(err));
          });

          if (keysToDelete.length > 0) {
            const chunkSize = 500;
            for (let i = 0; i < keysToDelete.length; i += chunkSize) {
              const chunk = keysToDelete.slice(i, i + chunkSize);
              await this.redisClient!.del(...chunk);
            }
          }
        } else {
          // Fallback if scanStream is not available (e.g., in some mock clients)
          const keys = await this.redisClient!.keys(pattern);
          if (keys && keys.length > 0) {
            await this.redisClient!.del(...keys);
          }
        }
      },
      undefined,
      `delByPattern(${pattern})`,
    );
  }
}
