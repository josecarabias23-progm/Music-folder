import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { EntityTarget } from 'typeorm/common/EntityTarget';
import { GenericTypeOrmRepository } from './generic-typeorm.repository';
import { IBaseRepository } from './interfaces/base-repository.interface';
import { IUnitOfWork, IsolationLevel } from './interfaces/unit-of-work.interface';

@Injectable()
export class TypeOrmUnitOfWork implements IUnitOfWork {
  private readonly logger = new Logger(TypeOrmUnitOfWork.name);
  private activeEntityManager?: EntityManager;
  private postCommitTasks: Array<() => Promise<void> | void> = [];

  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<R>(
    work: (uow: IUnitOfWork) => Promise<R>,
    isolationLevel: IsolationLevel = 'READ COMMITTED',
  ): Promise<R> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);

    const scopedUow = new TypeOrmUnitOfWork(this.dataSource);
    scopedUow.activeEntityManager = queryRunner.manager;

    try {
      const result = await work(scopedUow);
      await queryRunner.commitTransaction();

      // Ejecución segura de tareas Post-Commit una vez confirmado el COMMIT
      await scopedUow.executePostCommitTasks();

      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  getRepository<T extends { id?: string | number }>(entityClass: EntityTarget<T>): IBaseRepository<T> {
    const manager = this.activeEntityManager || this.dataSource.manager;
    return new GenericTypeOrmRepository<T>(manager.getRepository(entityClass));
  }

  getEntityManager(): EntityManager {
    return this.activeEntityManager || this.dataSource.manager;
  }

  registerPostCommitTask(task: () => Promise<void> | void): void {
    this.postCommitTasks.push(task);
  }

  private async executePostCommitTasks(): Promise<void> {
    for (const task of this.postCommitTasks) {
      try {
        await task();
      } catch (err) {
        this.logger.error('Error executing post-commit task:', err);
      }
    }
    this.postCommitTasks = [];
  }
}
