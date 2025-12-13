import { Module } from '@nestjs/common';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisAnalyzerService } from './diagnosis-analyzer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DiagnosisController],
  providers: [DiagnosisService, DiagnosisAnalyzerService],
  exports: [DiagnosisService, DiagnosisAnalyzerService],
})
export class DiagnosisModule {}







