import { Test, TestingModule } from '@nestjs/testing';
import { CacheService, REDIS_CLIENT_TOKEN } from './cache.service';
import { EventEmitter } from 'events';

describe('CacheService', () => {
  let service: CacheService;
  let mockRedisClient: any;

  beforeEach(async () => {
    mockRedisClient = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      scanStream: undefined,
      keys: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue('OK'),
      on: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: REDIS_CLIENT_TOKEN,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('set & get', () => {
    it('should set and retrieve typed value from cache', async () => {
      const testData = { id: 1, name: 'Test Score' };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(testData));
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('score:1', testData, 60);
      expect(mockRedisClient.set).toHaveBeenCalledWith('score:1', JSON.stringify(testData), 'EX', 60);

      const result = await service.get<{ id: number; name: string }>('score:1');
      expect(result).toEqual(testData);
      expect(mockRedisClient.get).toHaveBeenCalledWith('score:1');
    });

    it('should return null when key does not exist', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('del & delByPattern', () => {
    it('should delete a single key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('score:1');
      expect(mockRedisClient.del).toHaveBeenCalledWith('score:1');
    });

    it('should delete keys matching pattern using scanStream when available', async () => {
      const mockStream = new EventEmitter();
      mockRedisClient.scanStream = jest.fn().mockReturnValue(mockStream);
      mockRedisClient.del.mockResolvedValue(2);

      const promise = service.delByPattern('sheets:*');
      mockStream.emit('data', ['sheets:1', 'sheets:2']);
      mockStream.emit('end');
      await promise;

      expect(mockRedisClient.del).toHaveBeenCalledWith('sheets:1', 'sheets:2');
    });

    it('should delete keys matching pattern using keys fallback when scanStream is absent', async () => {
      mockRedisClient.scanStream = undefined;
      mockRedisClient.keys.mockResolvedValue(['groups:1', 'groups:2']);
      mockRedisClient.del.mockResolvedValue(2);

      await service.delByPattern('groups:*');
      expect(mockRedisClient.del).toHaveBeenCalledWith('groups:1', 'groups:2');
    });
  });

  describe('Fail-Open Resiliency', () => {
    it('should return null and not throw when Redis get fails with error', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('Connection lost'));

      const result = await service.get('score:1');
      expect(result).toBeNull();
    });

    it('should resolve gracefully and not throw when Redis set fails with error', async () => {
      mockRedisClient.set.mockRejectedValue(new Error('Redis full'));

      await expect(service.set('score:1', { data: 'test' })).resolves.not.toThrow();
    });

    it('should trigger Fail-Open when Redis operation times out (>150ms)', async () => {
      mockRedisClient.get.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(JSON.stringify({ slow: true })), 300)),
      );

      const result = await service.get('slow:key');
      expect(result).toBeNull();
    }, 1000);
  });
});
