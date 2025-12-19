import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionSimulatorService, SimulationInput } from './admission-simulator.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role, DiagnosisLevel } from '../../generated/prisma';

@ApiTags('Admission Simulator')
@ApiBearerAuth('access-token')
@Controller('v1/simulator')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdmissionSimulatorController {
  constructor(private simulatorService: AdmissionSimulatorService) {}

  // ?��??�이???�행
  @Post('run')
  @Roles(Role.STUDENT)
  async runSimulation(@Request() req, @Body() input: SimulationInput) {
    return this.simulatorService.runSimulation(req.user.id, input);
  }

  // ?�나리오 비교
  @Get('compare/:schoolId')
  @Roles(Role.STUDENT, Role.PARENT)
  async compareScenarios(@Request() req, @Param('schoolId') schoolId: string) {
    const studentId = req.user.role === Role.STUDENT ? req.user.id : req.user.studentId;
    return this.simulatorService.compareScenarios(studentId, schoolId);
  }

  // 개선 계획 조회
  @Get('improvement/:schoolId')
  @Roles(Role.STUDENT)
  async getImprovementPlan(
    @Request() req,
    @Param('schoolId') schoolId: string,
  ) {
    return this.simulatorService.getImprovementPlan(req.user.id, schoolId, DiagnosisLevel.FIT);
  }

  // 목표 ?�교�??��??�이???�번???�행
  @Get('targets')
  @Roles(Role.STUDENT)
  async simulateAllTargets(@Request() req) {
    const targetSchools = await this.simulatorService['prisma'].targetSchool.findMany({
      where: { studentId: req.user.id },
      include: { school: true },
    });

    const results = await Promise.all(
      targetSchools.map(async target => {
        const result = await this.simulatorService.runSimulation(req.user.id, {
          schoolId: target.schoolId,
        });
        return {
          ...result,
          schoolId: target.schoolId,
          schoolName: target.school.name,  // Override result.schoolName with target school name
          priority: target.priority,
        };
      })
    );

    return results.sort((a, b) => a.priority - b.priority);
  }
}

