import { Module } from '@nestjs/common';
import { MiddleSchoolController } from './middle-school.controller';
import { MiddleSchoolService } from './middle-school.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MiddleSchoolController],
  providers: [MiddleSchoolService],
  exports: [MiddleSchoolService],
})
export class MiddleSchoolModule {}







