import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGradeDto,
  UpdateGradeDto,
  CreateActivityDto,
  UpdateActivityDto,
  CreateReadingDto,
  UpdateReadingDto,
  CreateAttendanceDto,
  UpdateAttendanceDto,
  CreateVolunteerDto,
  UpdateProfileDto,
} from './dto';
import { ApprovalStatus } from '../../generated/prisma';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  // ========== 성적 관리 ==========
  async createGrade(studentId: string, dto: CreateGradeDto) {
    const existing = await this.prisma.grade.findUnique({
      where: {
        studentId_subject_year_semester: {
          studentId,
          subject: dto.subject,
          year: dto.year,
          semester: dto.semester,
        },
      },
    });

    if (existing) {
      throw new ConflictException('이미 등록된 성적입니다');
    }

    const grade = await this.prisma.grade.create({
      data: {
        studentId,
        subject: dto.subject,
        year: dto.year,
        semester: dto.semester,
        written: dto.written,
        performance: dto.performance,
        rank: dto.rank,
      },
    });

    return {
      message: '성적이 저장되었습니다',
      grade,
    };
  }

  async getGrades(studentId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }, { subject: 'asc' }],
    });
    return { grades };
  }

  async updateGrade(studentId: string, gradeId: string, dto: UpdateGradeDto) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('성적을 찾을 수 없습니다');
    }

    if (grade.studentId !== studentId) {
      throw new ForbiddenException('본인의 성적만 수정할 수 있습니다');
    }

    const updated = await this.prisma.grade.update({
      where: { id: gradeId },
      data: {
        ...dto,
        status: ApprovalStatus.PENDING,
      },
    });

    return {
      message: '성적이 수정되었습니다',
      grade: updated,
    };
  }

  async deleteGrade(studentId: string, gradeId: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('성적을 찾을 수 없습니다');
    }

    if (grade.studentId !== studentId) {
      throw new ForbiddenException('본인의 성적만 삭제할 수 있습니다');
    }

    await this.prisma.grade.delete({
      where: { id: gradeId },
    });

    return { message: '성적이 삭제되었습니다' };
  }

  // ========== 활동 관리 ==========
  async createActivity(studentId: string, dto: CreateActivityDto) {
    const activity = await this.prisma.activity.create({
      data: {
        studentId,
        type: dto.type,
        title: dto.title,
        content: dto.content,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });

    return {
      message: '활동이 저장되었습니다',
      activity,
    };
  }

  async getActivities(studentId: string) {
    const activities = await this.prisma.activity.findMany({
      where: { studentId },
      orderBy: { startDate: 'desc' },
    });
    return { activities };
  }

  async updateActivity(
    studentId: string,
    activityId: string,
    dto: UpdateActivityDto,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('활동을 찾을 수 없습니다');
    }

    if (activity.studentId !== studentId) {
      throw new ForbiddenException('본인의 활동만 수정할 수 있습니다');
    }

    const updateData: any = { ...dto };
    if (dto.startDate) updateData.startDate = new Date(dto.startDate);
    if (dto.endDate) updateData.endDate = new Date(dto.endDate);
    updateData.status = ApprovalStatus.PENDING;
    updateData.comment = null;

    const updated = await this.prisma.activity.update({
      where: { id: activityId },
      data: updateData,
    });

    return {
      message: '활동이 수정되었습니다',
      activity: updated,
    };
  }

  async deleteActivity(studentId: string, activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('활동을 찾을 수 없습니다');
    }

    if (activity.studentId !== studentId) {
      throw new ForbiddenException('본인의 활동만 삭제할 수 있습니다');
    }

    await this.prisma.activity.delete({
      where: { id: activityId },
    });

    return { message: '활동이 삭제되었습니다' };
  }

  // ========== 독서 기록 관리 ==========
  async createReading(studentId: string, dto: CreateReadingDto) {
    const readDate = new Date(dto.readDate);
    const existing = await this.prisma.readingLog.findUnique({
      where: {
        studentId_bookTitle_readDate: {
          studentId,
          bookTitle: dto.bookTitle,
          readDate,
        },
      },
    });

    if (existing) {
      throw new ConflictException('이미 등록된 독서 기록입니다');
    }

    const reading = await this.prisma.readingLog.create({
      data: {
        studentId,
        bookTitle: dto.bookTitle,
        author: dto.author,
        readDate,
        review: dto.review,
      },
    });

    return {
      message: '독서 기록이 저장되었습니다',
      reading,
    };
  }

  async getReadings(studentId: string) {
    const readings = await this.prisma.readingLog.findMany({
      where: { studentId },
      orderBy: { readDate: 'desc' },
    });
    return { readings };
  }

  async updateReading(
    studentId: string,
    readingId: string,
    dto: UpdateReadingDto,
  ) {
    const reading = await this.prisma.readingLog.findUnique({
      where: { id: readingId },
    });

    if (!reading) {
      throw new NotFoundException('독서 기록을 찾을 수 없습니다');
    }

    if (reading.studentId !== studentId) {
      throw new ForbiddenException('본인의 독서 기록만 수정할 수 있습니다');
    }

    const updateData: any = { ...dto };
    if (dto.readDate) updateData.readDate = new Date(dto.readDate);
    updateData.status = ApprovalStatus.PENDING;

    const updated = await this.prisma.readingLog.update({
      where: { id: readingId },
      data: updateData,
    });

    return {
      message: '독서 기록이 수정되었습니다',
      reading: updated,
    };
  }

  async deleteReading(studentId: string, readingId: string) {
    const reading = await this.prisma.readingLog.findUnique({
      where: { id: readingId },
    });

    if (!reading) {
      throw new NotFoundException('독서 기록을 찾을 수 없습니다');
    }

    if (reading.studentId !== studentId) {
      throw new ForbiddenException('본인의 독서 기록만 삭제할 수 있습니다');
    }

    await this.prisma.readingLog.delete({
      where: { id: readingId },
    });

    return { message: '독서 기록이 삭제되었습니다' };
  }

  // ========== 출결 관리 ==========
  async createAttendance(studentId: string, dto: CreateAttendanceDto) {
    const existing = await this.prisma.attendance.findUnique({
      where: {
        studentId_year_semester: {
          studentId,
          year: dto.year,
          semester: dto.semester,
        },
      },
    });

    if (existing) {
      throw new ConflictException('해당 학기 출결 기록이 이미 존재합니다');
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        studentId,
        ...dto,
      },
    });

    return {
      message: '출결 기록이 저장되었습니다',
      attendance,
    };
  }

  async getAttendances(studentId: string) {
    const attendances = await this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });
    return { attendances };
  }

  async updateAttendance(
    studentId: string,
    attendanceId: string,
    dto: UpdateAttendanceDto,
  ) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException('출결 기록을 찾을 수 없습니다');
    }

    if (attendance.studentId !== studentId) {
      throw new ForbiddenException('본인의 출결 기록만 수정할 수 있습니다');
    }

    const updated = await this.prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        ...dto,
        status: ApprovalStatus.PENDING,
      },
    });

    return {
      message: '출결 기록이 수정되었습니다',
      attendance: updated,
    };
  }

  // ========== 봉사활동 관리 ==========
  async createVolunteer(studentId: string, dto: CreateVolunteerDto) {
    const volunteer = await this.prisma.volunteer.create({
      data: {
        studentId,
        title: dto.title,
        organization: dto.organization,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        hours: dto.hours,
        description: dto.description,
      },
    });

    return {
      message: '봉사활동이 저장되었습니다',
      volunteer,
    };
  }

  async getVolunteers(studentId: string) {
    const volunteers = await this.prisma.volunteer.findMany({
      where: { studentId },
      orderBy: { startDate: 'desc' },
    });
    const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
    return { volunteers, totalHours };
  }

  async deleteVolunteer(studentId: string, volunteerId: string) {
    const volunteer = await this.prisma.volunteer.findUnique({
      where: { id: volunteerId },
    });

    if (!volunteer) {
      throw new NotFoundException('봉사활동을 찾을 수 없습니다');
    }

    if (volunteer.studentId !== studentId) {
      throw new ForbiddenException('본인의 봉사활동만 삭제할 수 있습니다');
    }

    await this.prisma.volunteer.delete({
      where: { id: volunteerId },
    });

    return { message: '봉사활동이 삭제되었습니다' };
  }

  // ========== 프로필 관리 ==========
  async getProfile(studentId: string) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        email: true,
        name: true,
        schoolName: true,
        grade: true,
        createdAt: true,
      },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다');
    }

    return { profile: student };
  }

  async updateProfile(studentId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: studentId },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        schoolName: true,
        grade: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: '프로필이 업데이트되었습니다',
      profile: updated,
    };
  }

  // ========== 학부모용 조회 ==========
  async getChildGrades(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    const grades = await this.prisma.grade.findMany({
      where: { studentId: childId },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }, { subject: 'asc' }],
    });
    return { grades };
  }

  async getChildActivities(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    const activities = await this.prisma.activity.findMany({
      where: { studentId: childId },
      orderBy: { createdAt: 'desc' },
    });
    return { activities };
  }

  async getChildReadings(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    const readings = await this.prisma.readingLog.findMany({
      where: { studentId: childId },
      orderBy: { readDate: 'desc' },
    });
    return { readings };
  }

  async getChildAttendances(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    const attendances = await this.prisma.attendance.findMany({
      where: { studentId: childId },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });
    return { attendances };
  }

  async getChildVolunteers(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    const volunteers = await this.prisma.volunteer.findMany({
      where: { studentId: childId },
      orderBy: { startDate: 'desc' },
    });
    const totalHours = volunteers.reduce((sum, v) => sum + v.hours, 0);
    return { volunteers, totalHours };
  }

  // ========== 학부모 승인/수정요청 ==========
  async approveGrade(parentId: string, gradeId: string) {
    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('성적을 찾을 수 없습니다');
    }

    await this.validateFamilyRelation(parentId, grade.studentId);

    const updated = await this.prisma.grade.update({
      where: { id: gradeId },
      data: { status: ApprovalStatus.APPROVED, comment: null },
    });

    return {
      message: '성적이 승인되었습니다',
      grade: updated,
    };
  }

  async requestGradeRevision(
    parentId: string,
    gradeId: string,
    comment: string,
  ) {
    if (!comment || comment.trim() === '') {
      throw new BadRequestException('수정 요청 사유를 입력해주세요');
    }

    const grade = await this.prisma.grade.findUnique({
      where: { id: gradeId },
    });

    if (!grade) {
      throw new NotFoundException('성적을 찾을 수 없습니다');
    }

    await this.validateFamilyRelation(parentId, grade.studentId);

    const updated = await this.prisma.grade.update({
      where: { id: gradeId },
      data: { status: ApprovalStatus.REJECTED, comment },
    });

    return {
      message: '수정 요청이 전송되었습니다',
      grade: updated,
    };
  }

  async approveActivity(parentId: string, activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('활동을 찾을 수 없습니다');
    }

    await this.validateFamilyRelation(parentId, activity.studentId);

    const updated = await this.prisma.activity.update({
      where: { id: activityId },
      data: { status: ApprovalStatus.APPROVED },
    });

    return {
      message: '활동이 승인되었습니다',
      activity: updated,
    };
  }

  async requestActivityRevision(
    parentId: string,
    activityId: string,
    comment: string,
  ) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('활동을 찾을 수 없습니다');
    }

    await this.validateFamilyRelation(parentId, activity.studentId);

    const updated = await this.prisma.activity.update({
      where: { id: activityId },
      data: {
        status: ApprovalStatus.REJECTED,
        comment,
      },
    });

    return {
      message: '수정 요청이 전송되었습니다',
      activity: updated,
    };
  }

  async approveReading(parentId: string, readingId: string) {
    const reading = await this.prisma.readingLog.findUnique({
      where: { id: readingId },
    });

    if (!reading) {
      throw new NotFoundException('독서 기록을 찾을 수 없습니다');
    }

    await this.validateFamilyRelation(parentId, reading.studentId);

    const updated = await this.prisma.readingLog.update({
      where: { id: readingId },
      data: { status: ApprovalStatus.APPROVED, comment: null },
    });

    return {
      message: '독서 기록이 승인되었습니다',
      reading: updated,
    };
  }

  async requestReadingRevision(
    parentId: string,
    readingId: string,
    comment: string,
  ) {
    if (!comment || comment.trim() === '') {
      throw new BadRequestException('수정 요청 사유를 입력해주세요');
    }

    const reading = await this.prisma.readingLog.findUnique({
      where: { id: readingId },
    });

    if (!reading) {
      throw new NotFoundException('독서 기록을 찾을 수 없습니다');
    }

    await this.validateFamilyRelation(parentId, reading.studentId);

    const updated = await this.prisma.readingLog.update({
      where: { id: readingId },
      data: { status: ApprovalStatus.REJECTED, comment },
    });

    return {
      message: '수정 요청이 전송되었습니다',
      reading: updated,
    };
  }

  // ========== 학생 요약 정보 ==========
  async getStudentSummary(studentId: string) {
    const profile = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        schoolName: true,
        grade: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('학생을 찾을 수 없습니다');
    }

    const grades = await this.prisma.grade.findMany({
      where: {
        studentId,
        status: ApprovalStatus.APPROVED,
      },
      orderBy: [{ year: 'desc' }, { semester: 'desc' }],
    });

    const gradesWithRank = grades.filter((g) => g.rank !== null);
    const averageRank =
      gradesWithRank.length > 0
        ? gradesWithRank.reduce((sum, g) => sum + (g.rank || 0), 0) /
          gradesWithRank.length
        : null;

    const activities = await this.prisma.activity.findMany({
      where: {
        studentId,
        status: ApprovalStatus.APPROVED,
      },
    });

    const activitySummary = activities.reduce(
      (acc: any, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1;
        acc.total++;
        return acc;
      },
      { total: 0 },
    );

    const readings = await this.prisma.readingLog.findMany({
      where: {
        studentId,
        status: ApprovalStatus.APPROVED,
      },
    });

    const attendances = await this.prisma.attendance.findMany({
      where: {
        studentId,
        status: ApprovalStatus.APPROVED,
      },
    });

    const attendanceSummary = attendances.reduce(
      (acc, a) => {
        acc.absenceTotal += a.absenceDisease + a.absenceUnexcused + a.absenceOther;
        acc.latenessTotal += a.latenessCount;
        acc.earlyLeaveTotal += a.earlyLeaveCount;
        return acc;
      },
      { absenceTotal: 0, latenessTotal: 0, earlyLeaveTotal: 0 },
    );

    const volunteers = await this.prisma.volunteer.findMany({
      where: {
        studentId,
        status: ApprovalStatus.APPROVED,
      },
    });

    const totalVolunteerHours = volunteers.reduce((sum, v) => sum + v.hours, 0);

    return {
      profile,
      grades: {
        count: grades.length,
        averageRank,
        subjects: [...new Set(grades.map((g) => g.subject))],
      },
      activities: activitySummary,
      readings: {
        count: readings.length,
      },
      attendance: attendanceSummary,
      volunteer: {
        count: volunteers.length,
        totalHours: totalVolunteerHours,
      },
    };
  }

  async getChildSummary(parentId: string, childId: string) {
    await this.validateFamilyRelation(parentId, childId);
    return this.getStudentSummary(childId);
  }

  // ========== 유틸리티 ==========
  private async validateFamilyRelation(parentId: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { id: parentId },
      select: { familyId: true },
    });

    const child = await this.prisma.user.findUnique({
      where: { id: childId },
      select: { familyId: true },
    });

    if (
      !parent?.familyId ||
      !child?.familyId ||
      parent.familyId !== child.familyId
    ) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
  }
}






