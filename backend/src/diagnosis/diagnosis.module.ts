import { Module } from '@nestjs/common';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisAnalyzerService } from './diagnosis-analyzer.service';
import { AdmissionSimulatorController } from './admission-simulator.controller';
import { AdmissionSimulatorService } from './admission-simulator.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DiagnosisController, AdmissionSimulatorController],
  providers: [DiagnosisService, DiagnosisAnalyzerService, AdmissionSimulatorService],
  exports: [DiagnosisService, DiagnosisAnalyzerService, AdmissionSimulatorService],
})
export class DiagnosisModule {}







