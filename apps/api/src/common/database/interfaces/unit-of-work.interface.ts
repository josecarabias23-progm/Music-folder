import { EntityManager } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { IBaseRepository } from './base-repository.interface';

export type IsolationLevel = 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';

export const UNIT_OF_WORK = Symbol('UNIT_OF_WORK');

export interface IUnitOfWork {
  runInTransaction<R>(
    work: (uow: IUnitOfWork) => Promise<R>,
    isolationLevel?: IsolationLevel,
  ): Promise<R>;

  getRepository<T extends { id?: string | number }>(entityClass: EntityTarget<T>): IBaseRepository<T>;
  getEntityManager(): EntityManager;
  registerPostCommitTask(task: () => Promise<void> | void): void;
}
