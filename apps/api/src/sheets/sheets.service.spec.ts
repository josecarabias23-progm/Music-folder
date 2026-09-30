import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { SheetsService, CACHE_KEY_SHEETS_ALL, CACHE_NAMESPACE_SHEETS, CACHE_TTL_SHEETS } from './sheets.service';
import { Sheet } from './entities/sheet.entity';
import { StorageService } from '../storage/storage.service';
import { MockRepository, MockUnitOfWork, UNIT_OF_WORK } from '../common/database';
import { CacheService } from '../common/cache';

describe('SheetsService (Cache & Unit of Work Integration)', () => {
  let service: SheetsService;
  let mockUow: MockUnitOfWork;
  let sheetMockRepo: MockRepository<Sheet>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;
  let mockStorageService: jest.Mocked<StorageService>;
  let mockCacheService: any;

  beforeEach(async () => {
    mockUow = new MockUnitOfWork();
    sheetMockRepo = new MockRepository<Sheet>();

    mockUow.setRepository(Sheet, sheetMockRepo);

    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    mockStorageService = {
      deleteFile: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetsService,
        { provide: UNIT_OF_WORK, useValue: mockUow },
        { provide: getRepositoryToken(Sheet), useValue: sheetMockRepo },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: StorageService, useValue: mockStorageService },
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Cache-Aside en Lectura (findAll)', () => {
    it('debe retornar datos desde la caché en un cache hit sin consultar el repositorio', async () => {
      const cachedSheets = [
        {
          id: 'sheet-1',
          title: 'Obra Cacheada',
          composer: 'Mozart',
          ensemble: 'Orquesta',
          category: 'Orquesta',
        },
      ];
      mockCacheService.get.mockResolvedValue(cachedSheets);
      const findSpy = jest.spyOn(sheetMockRepo, 'find');

      const result = await service.findAll();

      expect(result).toEqual(cachedSheets);
      expect(mockCacheService.get).toHaveBeenCalledWith(CACHE_KEY_SHEETS_ALL);
      expect(findSpy).not.toHaveBeenCalled();
      expect(mockCacheService.set).not.toHaveBeenCalled();
    });

    it('debe consultar la BD y guardar en caché en un cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const sheet = sheetMockRepo.create({
        id: 'sheet-2',
        title: 'Obra de BD',
        composer: 'Bach',
      });
      sheetMockRepo.store.push(sheet);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Obra de BD');
      expect(mockCacheService.get).toHaveBeenCalledWith(CACHE_KEY_SHEETS_ALL);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        CACHE_KEY_SHEETS_ALL,
        result,
        CACHE_TTL_SHEETS,
      );
    });
  });

  describe('Invalidación de Caché Post-Commit en Mutaciones', () => {
    it('debe crear una partitura y purgar la caché post-commit en una transacción exitosa', async () => {
      const payload = {
        title: 'Sinfonía N° 5',
        composer: 'Beethoven',
        ensemble: 'Orquesta completa',
      };

      const result = await service.create(payload);

      expect(result).toBeDefined();
      expect(result.title).toBe('Sinfonía N° 5');
      expect(mockUow.wasCommitted).toBe(true);
      expect(sheetMockRepo.store.length).toBe(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sheet.uploaded', expect.anything());
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(CACHE_NAMESPACE_SHEETS);
    });

    it('debe actualizar una partitura e invalidar la caché post-commit', async () => {
      const sheet = sheetMockRepo.create({
        id: 'sheet-10',
        title: 'Título Viejo',
      });
      sheetMockRepo.store.push(sheet);

      const updated = await service.update('sheet-10', { title: 'Título Nuevo' });

      expect(updated.title).toBe('Título Nuevo');
      expect(mockUow.wasCommitted).toBe(true);
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(CACHE_NAMESPACE_SHEETS);
    });

    it('debe adjuntar un archivo a una partitura y purgar la caché post-commit', async () => {
      const sheet = sheetMockRepo.create({
        id: 'sheet-100',
        title: 'Danzón N° 2',
        composer: 'Arturo Márquez',
      });
      sheetMockRepo.store.push(sheet);

      const updated = await service.attachFile('sheet-100', 'https://storage.local/danzon2.pdf', 2048000, 'pdf');

      expect(updated).toBeDefined();
      expect(mockUow.wasCommitted).toBe(true);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('sheet.uploaded', expect.anything());
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(CACHE_NAMESPACE_SHEETS);
    });

    it('debe eliminar una partitura e invalidar la caché post-commit junto a la eliminación física', async () => {
      const sheet = sheetMockRepo.create({
        id: 'sheet-200',
        title: 'Suite Holberg',
        file_url: 'uploads/holberg.pdf',
      });
      sheetMockRepo.store.push(sheet);

      const res = await service.remove('sheet-200');

      expect(res.success).toBe(true);
      expect(mockUow.wasCommitted).toBe(true);
      expect(sheetMockRepo.store.length).toBe(0);
      expect(mockStorageService.deleteFile).toHaveBeenCalledWith('uploads/holberg.pdf');
      expect(mockCacheService.delByPattern).toHaveBeenCalledWith(CACHE_NAMESPACE_SHEETS);
    });

    it('debe ejecutar rollback y NO purgar la caché si la transacción falla', async () => {
      const sheet = sheetMockRepo.create({
        id: 'sheet-300',
        title: 'Concierto Aranjuez',
        file_url: 'uploads/aranjuez.pdf',
      });
      sheetMockRepo.store.push(sheet);

      jest.spyOn(sheetMockRepo, 'delete').mockRejectedValueOnce(new Error('DB Delete Failure'));

      await expect(service.remove('sheet-300')).rejects.toThrow('DB Delete Failure');

      expect(mockUow.wasRolledBack).toBe(true);
      expect(mockStorageService.deleteFile).not.toHaveBeenCalled();
      expect(mockCacheService.delByPattern).not.toHaveBeenCalled();
    });
  });
});
