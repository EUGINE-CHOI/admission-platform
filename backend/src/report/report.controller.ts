import { Controller, Get, Param, UseGuards, Req, Res, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { ReportService } from './report.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Report')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportController {
  constructor(
    private reportService: ReportService,
    private prisma: PrismaService,
  ) {}

  @Get('student/:studentId/pdf')
  @Roles(Role.STUDENT, Role.PARENT, Role.CONSULTANT, Role.ADMIN)
  @ApiOperation({ summary: '학생 리포트 PDF 다운로드' })
  async downloadStudentReport(
    @Param('studentId') studentId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as { id: string; role: Role };
    const userId = user.id;
    const userRole = user.role;

    // 권한 확인
    if (userRole === Role.STUDENT && userId !== studentId) {
      throw new ForbiddenException('본인의 리포트만 다운로드할 수 있습니다.');
    }

    if (userRole === Role.PARENT) {
      // 부모인 경우 연결된 자녀인지 확인
      const parent = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });
      const student = await this.prisma.user.findUnique({
        where: { id: studentId },
        select: { familyId: true },
      });
      if (!parent?.familyId || parent.familyId !== student?.familyId) {
        throw new ForbiddenException('연결된 자녀의 리포트만 다운로드할 수 있습니다.');
      }
    }

    return this.reportService.generateStudentReport(studentId, res);
  }

  @Get('diagnosis/:diagnosisId/pdf')
  @Roles(Role.STUDENT, Role.PARENT, Role.CONSULTANT, Role.ADMIN)
  @ApiOperation({ summary: '진단 결과 PDF 다운로드' })
  async downloadDiagnosisReport(
    @Param('diagnosisId') diagnosisId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as { id: string; role: Role };
    const userId = user.id;
    const userRole = user.role;

    // 진단 결과 소유자 확인
    const diagnosis = await this.prisma.diagnosisResult.findUnique({
      where: { id: diagnosisId },
      select: { studentId: true, student: { select: { familyId: true } } },
    });

    if (!diagnosis) {
      throw new ForbiddenException('진단 결과를 찾을 수 없습니다.');
    }

    if (userRole === Role.STUDENT && userId !== diagnosis.studentId) {
      throw new ForbiddenException('본인의 진단 리포트만 다운로드할 수 있습니다.');
    }

    if (userRole === Role.PARENT) {
      const parent = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { familyId: true },
      });
      if (!parent?.familyId || parent.familyId !== diagnosis.student?.familyId) {
        throw new ForbiddenException('연결된 자녀의 진단 리포트만 다운로드할 수 있습니다.');
      }
    }

    return this.reportService.generateDiagnosisReport(diagnosisId, res);
  }

  @Get('my/pdf')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: '내 리포트 PDF 다운로드' })
  async downloadMyReport(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: string };
    return this.reportService.generateStudentReport(user.id, res);
  }
}

