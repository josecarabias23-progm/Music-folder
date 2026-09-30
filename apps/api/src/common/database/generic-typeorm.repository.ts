import { DeepPartial, FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { IBaseRepository } from './interfaces/base-repository.interface';

export class GenericTypeOrmRepository<T extends { id?: string | number }> implements IBaseRepository<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async find(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id: id as any } } as FindOneOptions<T>);
  }

  create(entityLike: DeepPartial<T>): T {
    return this.repository.create(entityLike);
  }

  async save(entity: T): Promise<T> {
    return this.repository.save(entity as any);
  }

  async saveMany(entities: T[]): Promise<T[]> {
    return this.repository.save(entities as any[]);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
