import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateStudentReport(studentId: string, res: Response) {
    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      include: {
        middleSchool: true,
        grades: { orderBy: { semester: 'desc' }, take: 10 },
        activities: { orderBy: { startDate: 'desc' }, take: 10 },
        readingLogs: { orderBy: { readDate: 'desc' }, take: 10 },
        targetSchools: {
          include: { school: true },
          take: 5,
        },
        diagnosisResults: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!student) {
      throw new NotFoundException('학생을 찾을 수 없습니다.');
    }

    // PDF 생성
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `${student.name || 'Student'} Report`,
        Author: 'Roadmap',
      },
    });

    // 헤더 설정
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(student.name || 'report')}_report.pdf"`,
    );

    doc.pipe(res);

    // 제목
    doc
      .fontSize(24)
      .text('Student Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Generated: ${new Date().toLocaleDateString('ko-KR')}`, { align: 'right' })
      .moveDown(2);

    // 기본 정보
    doc
      .fontSize(16)
      .text('1. Basic Information', { underline: true })
      .moveDown(0.5);

    doc.fontSize(12);
    doc.text(`Name: ${student.name || 'N/A'}`);
    doc.text(`Email: ${student.email}`);
    if (student.grade) doc.text(`Grade: ${student.grade}`);
    if (student.middleSchool) doc.text(`School: ${student.middleSchool.name}`);
    doc.moveDown(1.5);

    // 성적 정보
    doc
      .fontSize(16)
      .text('2. Academic Record', { underline: true })
      .moveDown(0.5);

    if (student.grades.length === 0) {
      doc.fontSize(12).text('No grades recorded.');
    } else {
      doc.fontSize(12);
      student.grades.forEach((grade) => {
        const writtenAvg = Math.round((grade.written1 + grade.written2) / 2);
        const avgScore = Math.round((writtenAvg + grade.performance) / 2);
        doc.text(
          `- ${grade.subject}: Written1 ${grade.written1}, Written2 ${grade.written2}, Performance ${grade.performance} (Avg ${avgScore}) - ${grade.year}/${grade.semester}`,
        );
      });
    }
    doc.moveDown(1.5);

    // 활동 정보
    doc
      .fontSize(16)
      .text('3. Extracurricular Activities', { underline: true })
      .moveDown(0.5);

    if (student.activities.length === 0) {
      doc.fontSize(12).text('No activities recorded.');
    } else {
      doc.fontSize(12);
      student.activities.forEach((activity) => {
        doc.text(`- ${activity.title} (${activity.type})`);
        if (activity.content) {
          doc.text(`  ${activity.content.substring(0, 100)}...`, {
            indent: 20,
          });
        }
      });
    }
    doc.moveDown(1.5);

    // 독서 정보
    doc
      .fontSize(16)
      .text('4. Reading Log', { underline: true })
      .moveDown(0.5);

    if (student.readingLogs.length === 0) {
      doc.fontSize(12).text('No reading records.');
    } else {
      doc.fontSize(12);
      student.readingLogs.forEach((log) => {
        doc.text(`- ${log.bookTitle} (${log.author || 'Unknown author'})`);
      });
    }
    doc.moveDown(1.5);

    // 목표 학교
    doc
      .fontSize(16)
      .text('5. Target Schools', { underline: true })
      .moveDown(0.5);

    if (student.targetSchools.length === 0) {
      doc.fontSize(12).text('No target schools registered.');
    } else {
      doc.fontSize(12);
      student.targetSchools.forEach((ts, index) => {
        doc.text(`${index + 1}. ${ts.school.name} (Priority: ${ts.priority})`);
      });
    }
    doc.moveDown(1.5);

    // 진단 결과
    if (student.diagnosisResults.length > 0) {
      const diagnosis = student.diagnosisResults[0];
      doc
        .fontSize(16)
        .text('6. Latest Diagnosis', { underline: true })
        .moveDown(0.5);

      doc.fontSize(12);
      doc.text(`Date: ${new Date(diagnosis.createdAt).toLocaleDateString('ko-KR')}`);
      doc.text(`Score: ${diagnosis.score}`);
      doc.text(`Level: ${diagnosis.level}`);
      if (diagnosis.recommendations) {
        doc.text(`Recommendations: ${diagnosis.recommendations}`);
      }
    }

    // 푸터
    doc.moveDown(3);
    doc
      .fontSize(10)
      .fillColor('gray')
      .text('(c) 2025 Roadmap. All rights reserved.', { align: 'center' });

    doc.end();
  }

  async generateDiagnosisReport(diagnosisId: string, res: Response) {
    const diagnosis = await this.prisma.diagnosisResult.findUnique({
      where: { id: diagnosisId },
      include: {
        student: {
          include: { middleSchool: true },
        },
      },
    });

    if (!diagnosis) {
      throw new NotFoundException('진단 결과를 찾을 수 없습니다.');
    }

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="diagnosis_${diagnosisId}.pdf"`,
    );

    doc.pipe(res);

    // 제목
    doc
      .fontSize(24)
      .text('Diagnosis Report', { align: 'center' })
      .moveDown();

    doc
      .fontSize(12)
      .text(`Student: ${diagnosis.student?.name || 'N/A'}`, { align: 'right' })
      .text(`Date: ${new Date(diagnosis.createdAt).toLocaleDateString('ko-KR')}`, {
        align: 'right',
      })
      .moveDown(2);

    // 종합 점수
    doc
      .fontSize(18)
      .text('Overall Assessment', { underline: true })
      .moveDown(0.5);

    doc.fontSize(14);
    doc.text(`Score: ${diagnosis.score}`);
    doc.text(`Level: ${diagnosis.level}`);
    doc.moveDown(1.5);

    // 세부 점수
    doc
      .fontSize(16)
      .text('Detailed Scores', { underline: true })
      .moveDown(0.5);

    doc.fontSize(12);
    if (diagnosis.gradeScore) doc.text(`Academic Score: ${diagnosis.gradeScore}`);
    if (diagnosis.activityScore) doc.text(`Activity Score: ${diagnosis.activityScore}`);
    if (diagnosis.attendanceScore) doc.text(`Attendance Score: ${diagnosis.attendanceScore}`);
    if (diagnosis.volunteerScore) doc.text(`Volunteer Score: ${diagnosis.volunteerScore}`);
    doc.moveDown(1.5);

    // 강점 / 약점
    if (diagnosis.strengths) {
      doc.fontSize(16).text('Strengths', { underline: true }).moveDown(0.5);
      doc.fontSize(12).text(diagnosis.strengths);
      doc.moveDown(1);
    }

    if (diagnosis.weaknesses) {
      doc.fontSize(16).text('Areas for Improvement', { underline: true }).moveDown(0.5);
      doc.fontSize(12).text(diagnosis.weaknesses);
      doc.moveDown(1);
    }

    // 추천사항
    if (diagnosis.recommendations) {
      doc
        .fontSize(16)
        .text('Recommendations', { underline: true })
        .moveDown(0.5);

      doc.fontSize(12);
      doc.text(diagnosis.recommendations);
    }

    // 푸터
    doc.moveDown(3);
    doc
      .fontSize(10)
      .fillColor('gray')
      .text('(c) 2025 Roadmap. All rights reserved.', { align: 'center' });

    doc.end();
  }
}
