import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException } from '@nestjs/common';
import { SheetsService } from './sheets.service';
import { Sheet } from './entities/sheet.entity';
import { StorageService } from '../storage/storage.service';
import { MockRepository, MockUnitOfWork, UNIT_OF_WORK } from '../common/database';

describe('SheetsService (Unit of Work Refactoring)', () => {
  let service: SheetsService;
  let mockUow: MockUnitOfWork;
  let sheetMockRepo: MockRepository<Sheet>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;
  let mockStorageService: jest.Mocked<StorageService>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetsService,
        { provide: UNIT_OF_WORK, useValue: mockUow },
        { provide: getRepositoryToken(Sheet), useValue: {} },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe crear una partitura y emitir el evento post-commit en una transacción exitosa', async () => {
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
  });

  it('debe adjuntar un archivo a una partitura dentro de una transacción', async () => {
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
  });

  it('debe eliminar una partitura y ejecutar la limpieza post-commit del archivo físico', async () => {
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
  });

  it('debe ejecutar rollback y NO emitir eventos ni borrar archivos si falla la transacción', async () => {
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
  });
});
