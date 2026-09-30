import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InstrumentsService, CACHE_KEY_ALL_INSTRUMENTS, CACHE_TTL_INSTRUMENTS } from './instruments.service';
import { Instrument } from './entities/instrument.entity';
import { CacheService } from '../common/cache';

describe('InstrumentsService (Cache Integration)', () => {
  let service: InstrumentsService;
  let mockInstrumentRepo: any;
  let mockCacheService: any;

  const sampleInstruments = [
    {
      id: 'violin',
      name: 'Violín',
      family: 'strings',
      clef: 'sol',
      transposition: 'do',
      historical_info: 'Cuerdas frotadas',
    },
  ];

  beforeEach(async () => {
    mockInstrumentRepo = {
      find: jest.fn().mockResolvedValue(sampleInstruments),
      findOne: jest.fn(),
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
      delByPattern: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstrumentsService,
        {
          provide: getRepositoryToken(Instrument),
          useValue: mockInstrumentRepo,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<InstrumentsService>(InstrumentsService);
  });

  it('debe retornar datos desde la caché en un cache hit sin consultar la BD', async () => {
    const cachedData = [
      {
        id: 'violin',
        name: 'Violín',
        family: 'Cuerdas',
        icon: '♩',
        clef: 'sol',
        transposition: 'do',
        description: 'Cuerdas frotadas',
      },
    ];

    mockCacheService.get.mockResolvedValue(cachedData);

    const result = await service.findAll();

    expect(result).toEqual(cachedData);
    expect(mockCacheService.get).toHaveBeenCalledWith(CACHE_KEY_ALL_INSTRUMENTS);
    expect(mockInstrumentRepo.find).not.toHaveBeenCalled();
    expect(mockCacheService.set).not.toHaveBeenCalled();
  });

  it('debe consultar la BD y guardar en caché en un cache miss', async () => {
    mockCacheService.get.mockResolvedValue(null);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Violín');
    expect(mockCacheService.get).toHaveBeenCalledWith(CACHE_KEY_ALL_INSTRUMENTS);
    expect(mockInstrumentRepo.find).toHaveBeenCalled();
    expect(mockCacheService.set).toHaveBeenCalledWith(
      CACHE_KEY_ALL_INSTRUMENTS,
      result,
      CACHE_TTL_INSTRUMENTS,
    );
  });
});
