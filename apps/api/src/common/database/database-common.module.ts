import { Global, Module } from '@nestjs/common';
import { UNIT_OF_WORK } from './interfaces/unit-of-work.interface';
import { TypeOrmUnitOfWork } from './typeorm-unit-of-work';

@Global()
@Module({
  providers: [
    TypeOrmUnitOfWork,
    {
      provide: UNIT_OF_WORK,
      useClass: TypeOrmUnitOfWork,
    },
  ],
  exports: [TypeOrmUnitOfWork, UNIT_OF_WORK],
})
export class DatabaseCommonModule {}
