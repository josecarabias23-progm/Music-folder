import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { User } from '../auth/entities/user.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { MockRepository, MockUnitOfWork, UNIT_OF_WORK } from '../common/database';
import { CacheService } from '../common/cache';

describe('GroupsService (Unit of Work Refactoring & Join Group)', () => {
  let service: GroupsService;
  let mockUow: MockUnitOfWork;
  let userMockRepo: MockRepository<User>;
  let groupMockRepo: MockRepository<Group>;
  let memberMockRepo: MockRepository<GroupMember>;
  let notificationMockRepo: MockRepository<Notification>;
  let mockCacheService: { get: jest.Mock; set: jest.Mock; del: jest.Mock; delByPattern: jest.Mock };

  beforeEach(async () => {
    mockUow = new MockUnitOfWork();
    userMockRepo = new MockRepository<User>();
    groupMockRepo = new MockRepository<Group>();
    memberMockRepo = new MockRepository<GroupMember>();
    notificationMockRepo = new MockRepository<Notification>();
    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn().mockResolvedValue(1),
    };

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
        { provide: getRepositoryToken(Group), useValue: groupMockRepo },
        { provide: getRepositoryToken(GroupMember), useValue: memberMockRepo },
        { provide: getRepositoryToken(User), useValue: userMockRepo },
        { provide: getRepositoryToken(Notification), useValue: notificationMockRepo },
        { provide: CacheService, useValue: mockCacheService },
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
    expect(mockCacheService.delByPattern).toHaveBeenCalledWith('group:*');
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

  it('debe unirse a un grupo mediante código normalizado (trim y toUpperCase) y purgar caché Redis', async () => {
    const studentUser: User = { id: 'student-1', email: 'alumno@orquesta.com', first_name: 'Carlos' } as any;
    const ownerUser: User = { id: 'director-1', email: 'director@orquesta.com' } as any;
    const group: Group = { id: 'group-1', name: 'Orquesta', join_code: 'CODE123', is_join_code_active: true, owner: ownerUser } as any;

    userMockRepo.store.push(studentUser);
    groupMockRepo.store.push(group);

    const member = await service.joinGroupByCode('student-1', '  code123  ');

    expect(member).toBeDefined();
    expect(member.group.id).toBe('group-1');
    expect(member.user.id).toBe('student-1');
    expect(member.role).toBe('student');
    expect(mockCacheService.delByPattern).toHaveBeenCalledWith('group:*');
    expect(mockCacheService.delByPattern).toHaveBeenCalledWith('user:*');
  });

  it('debe lanzar BadRequestException si el código está vacío o inactivo', async () => {
    const studentUser: User = { id: 'student-2', email: 'alumno2@orquesta.com' } as any;
    userMockRepo.store.push(studentUser);

    await expect(service.joinGroupByCode('student-2', '   ')).rejects.toThrow(BadRequestException);
    await expect(service.joinGroupByCode('student-2', 'INVALID_CODE')).rejects.toThrow(BadRequestException);
  });

  it('debe lanzar ForbiddenException en assertDirectorAccess si el usuario no es director ni admin', async () => {
    const studentUser: User = { id: 'student-3', role: 'student' } as any;
    const group: Group = { id: 'group-2', owner: { id: 'director-2' } } as any;
    const membership: GroupMember = { user: studentUser, group, role: 'student', status: 'active' } as any;

    userMockRepo.store.push(studentUser);
    groupMockRepo.store.push(group);
    memberMockRepo.store.push(membership);

    await expect(service.assertDirectorAccess('student-3', 'group-2')).rejects.toThrow(ForbiddenException);
  });
});

