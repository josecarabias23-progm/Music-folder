import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { User } from '../auth/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { MockRepository, MockUnitOfWork, UNIT_OF_WORK } from '../common/database';

describe('GroupsService (Unit of Work Refactoring)', () => {
  let service: GroupsService;
  let mockUow: MockUnitOfWork;
  let userMockRepo: MockRepository<User>;
  let groupMockRepo: MockRepository<Group>;
  let memberMockRepo: MockRepository<GroupMember>;

  beforeEach(async () => {
    mockUow = new MockUnitOfWork();
    userMockRepo = new MockRepository<User>();
    groupMockRepo = new MockRepository<Group>();
    memberMockRepo = new MockRepository<GroupMember>();

    mockUow.setRepository(User, userMockRepo);
    mockUow.setRepository(Group, groupMockRepo);
    mockUow.setRepository(GroupMember, memberMockRepo);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: UNIT_OF_WORK,
          useValue: mockUow,
        },
        { provide: getRepositoryToken(Group), useValue: {} },
        { provide: getRepositoryToken(GroupMember), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Notification), useValue: {} },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe crear un grupo y la membresía del director atómicamente dentro de la transacción', async () => {
    const directorUser: User = {
      id: 'director-1',
      email: 'director@orquesta.com',
      first_name: 'Sofía',
      last_name: 'Rossi',
      role: 'Director de Orquesta',
    } as any;
    userMockRepo.store.push(directorUser);

    const payload = {
      name: 'Orquesta Filarmónica',
      description: 'Grupo principal',
      type: 'ensemble',
      visibility: 'private',
      ownerId: 'director-1',
    };

    const created = await service.createGroup(payload);

    expect(created).toBeDefined();
    expect(created.name).toBe('Orquesta Filarmónica');
    expect(created.join_code).toBeDefined();
    expect(mockUow.wasCommitted).toBe(true);
    expect(groupMockRepo.store.length).toBe(1);
    expect(memberMockRepo.store.length).toBe(1);
    expect(memberMockRepo.store[0].role).toBe('director');
  });

  it('debe lanzar NotFoundException si el usuario no existe y no persistir nada', async () => {
    await expect(
      service.createGroup({
        name: 'Ensamble Violines',
        ownerId: 'invalido-999',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(groupMockRepo.store.length).toBe(0);
    expect(memberMockRepo.store.length).toBe(0);
  });

  it('debe lanzar ForbiddenException si el usuario no tiene rol de director', async () => {
    const studentUser: User = {
      id: 'musico-1',
      email: 'musico@orquesta.com',
      role: 'Músico',
    } as any;
    userMockRepo.store.push(studentUser);

    await expect(
      service.createGroup({
        name: 'Grupo Músico',
        ownerId: 'musico-1',
      }),
    ).rejects.toThrow(ForbiddenException);

    expect(groupMockRepo.store.length).toBe(0);
  });

  it('debe ejecutar rollback y lanzar error si falla la creación de la membresía inicial', async () => {
    const directorUser: User = {
      id: 'director-2',
      email: 'dir2@orquesta.com',
      role: 'Director',
    } as any;
    userMockRepo.store.push(directorUser);

    // Simular error al guardar la membresía
    jest.spyOn(memberMockRepo, 'save').mockRejectedValueOnce(new Error('DB Constraint Violation'));

    await expect(
      service.createGroup({
        name: 'Cámara Falla',
        ownerId: 'director-2',
      }),
    ).rejects.toThrow('DB Constraint Violation');

    expect(mockUow.wasRolledBack).toBe(true);
  });
});
