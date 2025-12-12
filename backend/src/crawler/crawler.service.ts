import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SchoolCrawlerService } from './services/school-crawler.service';
import { AdmissionCrawlerService } from './services/admission-crawler.service';
import { PublishStatus, SchoolType, AdmissionType, ScheduleType } from '@prisma/client';

export interface CrawlResult {
  success: boolean;
  source: string;
  itemsCrawled: number;
  itemsSaved: number;
  errors: string[];
  duration: number;
}

export interface CrawlJob {
  id: string;
  type: 'SCHOOL' | 'ADMISSION' | 'SCHEDULE';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  source: string;
  startedAt?: Date;
  completedAt?: Date;
  result?: CrawlResult;
}

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private jobs: Map<string, CrawlJob> = new Map();

  constructor(
    private prisma: PrismaService,
    private schoolCrawler: SchoolCrawlerService,
    private admissionCrawler: AdmissionCrawlerService,
  ) {}

  /**
   * 학교 정보 크롤링 실행
   */
  async crawlSchools(source: string = 'sample'): Promise<CrawlResult> {
    const jobId = `school-${Date.now()}`;
    const job: CrawlJob = {
      id: jobId,
      type: 'SCHOOL',
      status: 'RUNNING',
      source,
      startedAt: new Date(),
    };
    this.jobs.set(jobId, job);

    const startTime = Date.now();
    const errors: string[] = [];
    let itemsCrawled = 0;
    let itemsSaved = 0;

    try {
      this.logger.log(`학교 정보 크롤링 시작: ${source}`);

      // 소스에 따른 크롤링 실행
      const schools = await this.schoolCrawler.crawl(source);
      itemsCrawled = schools.length;

      // 데이터베이스에 저장 (중복 체크)
      for (const school of schools) {
        try {
          const existing = await this.prisma.school.findFirst({
            where: { name: school.name, region: school.region },
          });

          if (!existing) {
            await this.prisma.school.create({
              data: {
                name: school.name,
                type: school.type,
                region: school.region,
                address: school.address,
                website: school.website,
                features: school.features ? JSON.stringify(school.features) : undefined,
                publishStatus: PublishStatus.DRAFT, // 관리자 승인 전까지 DRAFT
              },
            });
            itemsSaved++;
          }
        } catch (error) {
          errors.push(`학교 저장 실패 (${school.name}): ${error.message}`);
        }
      }

      job.status = 'COMPLETED';
      this.logger.log(`학교 정보 크롤링 완료: ${itemsSaved}/${itemsCrawled} 저장됨`);
    } catch (error) {
      job.status = 'FAILED';
      errors.push(`크롤링 실패: ${error.message}`);
      this.logger.error(`학교 정보 크롤링 실패: ${error.message}`);
    }

    const result: CrawlResult = {
      success: job.status === 'COMPLETED',
      source,
      itemsCrawled,
      itemsSaved,
      errors,
      duration: Date.now() - startTime,
    };

    job.completedAt = new Date();
    job.result = result;
    this.jobs.set(jobId, job);

    // 크롤링 로그 저장
    await this.saveCrawlLog('SCHOOL', source, result);

    return result;
  }

  /**
   * 입시 전형 정보 크롤링 실행
   */
  async crawlAdmissions(source: string = 'sample'): Promise<CrawlResult> {
    const jobId = `admission-${Date.now()}`;
    const job: CrawlJob = {
      id: jobId,
      type: 'ADMISSION',
      status: 'RUNNING',
      source,
      startedAt: new Date(),
    };
    this.jobs.set(jobId, job);

    const startTime = Date.now();
    const errors: string[] = [];
    let itemsCrawled = 0;
    let itemsSaved = 0;

    try {
      this.logger.log(`입시 전형 크롤링 시작: ${source}`);

      const admissions = await this.admissionCrawler.crawl(source);
      itemsCrawled = admissions.length;

      for (const admission of admissions) {
        try {
          // 학교 ID 찾기
          const school = await this.prisma.school.findFirst({
            where: { name: admission.schoolName },
          });

          if (school) {
            const existing = await this.prisma.admission.findFirst({
              where: {
                schoolId: school.id,
                year: admission.year,
                type: admission.type,
                name: admission.name,
              },
            });

            if (!existing) {
              await this.prisma.admission.create({
                data: {
                  schoolId: school.id,
                  year: admission.year,
                  type: admission.type,
                  name: admission.name,
                  quota: admission.quota,
                  requirements: admission.requirements,
                  competitionRate: admission.competitionRate,
                  publishStatus: PublishStatus.DRAFT,
                },
              });
              itemsSaved++;
            }
          } else {
            errors.push(`학교를 찾을 수 없음: ${admission.schoolName}`);
          }
        } catch (error) {
          errors.push(`전형 저장 실패: ${error.message}`);
        }
      }

      job.status = 'COMPLETED';
      this.logger.log(`입시 전형 크롤링 완료: ${itemsSaved}/${itemsCrawled} 저장됨`);
    } catch (error) {
      job.status = 'FAILED';
      errors.push(`크롤링 실패: ${error.message}`);
      this.logger.error(`입시 전형 크롤링 실패: ${error.message}`);
    }

    const result: CrawlResult = {
      success: job.status === 'COMPLETED',
      source,
      itemsCrawled,
      itemsSaved,
      errors,
      duration: Date.now() - startTime,
    };

    job.completedAt = new Date();
    job.result = result;
    this.jobs.set(jobId, job);

    await this.saveCrawlLog('ADMISSION', source, result);

    return result;
  }

  /**
   * 입시 일정 크롤링 실행
   */
  async crawlSchedules(source: string = 'sample'): Promise<CrawlResult> {
    const jobId = `schedule-${Date.now()}`;
    const job: CrawlJob = {
      id: jobId,
      type: 'SCHEDULE',
      status: 'RUNNING',
      source,
      startedAt: new Date(),
    };
    this.jobs.set(jobId, job);

    const startTime = Date.now();
    const errors: string[] = [];
    let itemsCrawled = 0;
    let itemsSaved = 0;

    try {
      this.logger.log(`입시 일정 크롤링 시작: ${source}`);

      const schedules = await this.admissionCrawler.crawlSchedules(source);
      itemsCrawled = schedules.length;

      for (const schedule of schedules) {
        try {
          const school = await this.prisma.school.findFirst({
            where: { name: schedule.schoolName },
          });

          if (school) {
            const existing = await this.prisma.admissionSchedule.findFirst({
              where: {
                schoolId: school.id,
                type: schedule.type,
                startDate: schedule.startDate,
              },
            });

            if (!existing) {
              await this.prisma.admissionSchedule.create({
                data: {
                  schoolId: school.id,
                  year: schedule.year,
                  type: schedule.type,
                  title: schedule.title,
                  startDate: schedule.startDate,
                  endDate: schedule.endDate,
                  note: schedule.note,
                  publishStatus: PublishStatus.DRAFT,
                },
              });
              itemsSaved++;
            }
          }
        } catch (error) {
          errors.push(`일정 저장 실패: ${error.message}`);
        }
      }

      job.status = 'COMPLETED';
      this.logger.log(`입시 일정 크롤링 완료: ${itemsSaved}/${itemsCrawled} 저장됨`);
    } catch (error) {
      job.status = 'FAILED';
      errors.push(`크롤링 실패: ${error.message}`);
      this.logger.error(`입시 일정 크롤링 실패: ${error.message}`);
    }

    const result: CrawlResult = {
      success: job.status === 'COMPLETED',
      source,
      itemsCrawled,
      itemsSaved,
      errors,
      duration: Date.now() - startTime,
    };

    job.completedAt = new Date();
    job.result = result;
    this.jobs.set(jobId, job);

    await this.saveCrawlLog('SCHEDULE', source, result);

    return result;
  }

  /**
   * 크롤링 작업 상태 조회
   */
  getJobStatus(jobId: string): CrawlJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * 모든 크롤링 작업 목록 조회
   */
  getAllJobs(): CrawlJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0),
    );
  }

  /**
   * 크롤링 로그 저장
   */
  private async saveCrawlLog(
    type: string,
    source: string,
    result: CrawlResult,
  ): Promise<void> {
    try {
      // CrawlLog 테이블이 있다면 저장
      // 없으면 콘솔 로그만 기록
      this.logger.log(
        `[CrawlLog] ${type} from ${source}: ${result.itemsSaved}/${result.itemsCrawled} saved in ${result.duration}ms`,
      );
    } catch (error) {
      this.logger.error(`크롤링 로그 저장 실패: ${error.message}`);
    }
  }

  /**
   * 미승인 데이터 조회 (관리자용)
   */
  async getPendingData(): Promise<{
    schools: any[];
    admissions: any[];
    schedules: any[];
  }> {
    const [schools, admissions, schedules] = await Promise.all([
      this.prisma.school.findMany({
        where: { publishStatus: PublishStatus.DRAFT },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admission.findMany({
        where: { publishStatus: PublishStatus.DRAFT },
        include: { school: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.admissionSchedule.findMany({
        where: { publishStatus: PublishStatus.DRAFT },
        include: { school: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { schools, admissions, schedules };
  }
}
