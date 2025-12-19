import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PersonalStatementController } from './personal-statement.controller';
import { PersonalStatementService } from './personal-statement.service';
import { AdmissionPredictionController } from './admission-prediction.controller';
import { AdmissionPredictionService } from './admission-prediction.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AiController, PersonalStatementController, AdmissionPredictionController],
  providers: [AiService, PersonalStatementService, AdmissionPredictionService],
  exports: [AiService, PersonalStatementService, AdmissionPredictionService],
})
export class AiModule {}









