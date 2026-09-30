import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { IBaseRepository } from '../interfaces/base-repository.interface';
import { IUnitOfWork, IsolationLevel } from '../interfaces/unit-of-work.interface';

export class MockRepository<T extends { id?: string | number }> implements IBaseRepository<T> {
  public store: T[] = [];

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return [...this.store];
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.store[0] || null;
  }

  async findById(id: string): Promise<T | null> {
    return this.store.find((item) => String(item.id) === String(id)) || null;
  }

  create(entityLike: DeepPartial<T>): T {
    return { ...entityLike, id: entityLike.id || `mock-${Date.now()}` } as T;
  }

  async save(entity: T): Promise<T> {
    const existingIndex = this.store.findIndex((item) => item.id === entity.id);
    if (existingIndex >= 0) {
      this.store[existingIndex] = entity;
    } else {
      if (!entity.id) (entity as any).id = `mock-${Date.now()}`;
      this.store.push(entity);
    }
    return entity;
  }

  async saveMany(entities: T[]): Promise<T[]> {
    const saved: T[] = [];
    for (const item of entities) {
      saved.push(await this.save(item));
    }
    return saved;
  }

  async delete(id: string): Promise<boolean> {
    const countBefore = this.store.length;
    this.store = this.store.filter((item) => String(item.id) !== String(id));
    return this.store.length < countBefore;
  }
}

export class MockUnitOfWork implements IUnitOfWork {
  private repositories = new Map<any, IBaseRepository<any>>();
  private postCommitTasks: Array<() => Promise<void> | void> = [];
  public wasCommitted = false;
  public wasRolledBack = false;

  setRepository<T extends { id?: string | number }>(entityClass: EntityTarget<T>, mockRepo: IBaseRepository<T>) {
    this.repositories.set(entityClass, mockRepo);
  }

  async runInTransaction<R>(
    work: (uow: IUnitOfWork) => Promise<R>,
    isolationLevel?: IsolationLevel,
  ): Promise<R> {
    try {
      const result = await work(this);
      this.wasCommitted = true;
      for (const task of this.postCommitTasks) {
        await task();
      }
      this.postCommitTasks = [];
      return result;
    } catch (err) {
      this.wasRolledBack = true;
      throw err;
    }
  }

  getRepository<T extends { id?: string | number }>(entityClass: EntityTarget<T>): IBaseRepository<T> {
    if (!this.repositories.has(entityClass)) {
      this.repositories.set(entityClass, new MockRepository<T>());
    }
    return this.repositories.get(entityClass) as IBaseRepository<T>;
  }

  getEntityManager(): any {
    return {};
  }

  registerPostCommitTask(task: () => Promise<void> | void): void {
    this.postCommitTasks.push(task);
  }
}
