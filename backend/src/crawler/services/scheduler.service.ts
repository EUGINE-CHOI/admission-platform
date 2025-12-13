import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as cron from 'node-cron';
import { CrawlerService } from '../crawler.service';

export interface ScheduledTask {
  name: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private taskConfigs: Map<string, ScheduledTask> = new Map();

  constructor(private crawlerService: CrawlerService) {}

  onModuleInit() {
    this.initializeScheduledTasks();
    this.logger.log('크롤링 스케줄러 초기화 완료');
  }

  onModuleDestroy() {
    this.stopAllTasks();
    this.logger.log('크롤링 스케줄러 종료');
  }

  /**
   * 스케줄 작업 초기화
   */
  private initializeScheduledTasks() {
    // 매일 새벽 2시에 학교 정보 크롤링
    this.registerTask('school-daily', '0 2 * * *', async () => {
      this.logger.log('[스케줄] 학교 정보 일일 크롤링 시작');
      await this.crawlerService.crawlSchools('sample');
    }, false); // 기본적으로 비활성화

    // 매주 월요일 새벽 3시에 입시 전형 크롤링
    this.registerTask('admission-weekly', '0 3 * * 1', async () => {
      this.logger.log('[스케줄] 입시 전형 주간 크롤링 시작');
      await this.crawlerService.crawlAdmissions('sample');
    }, false);

    // 매일 새벽 4시에 입시 일정 크롤링
    this.registerTask('schedule-daily', '0 4 * * *', async () => {
      this.logger.log('[스케줄] 입시 일정 일일 크롤링 시작');
      await this.crawlerService.crawlSchedules('sample');
    }, false);

    // 매주 일요일 자정에 전체 크롤링
    this.registerTask('full-weekly', '0 0 * * 0', async () => {
      this.logger.log('[스케줄] 전체 주간 크롤링 시작');
      await this.crawlerService.crawlSchools('sample');
      await this.crawlerService.crawlAdmissions('sample');
      await this.crawlerService.crawlSchedules('sample');
    }, false);
  }

  /**
   * 스케줄 작업 등록
   */
  private registerTask(
    name: string,
    schedule: string,
    task: () => Promise<void>,
    enabled: boolean = true,
  ) {
    const taskConfig: ScheduledTask = {
      name,
      schedule,
      enabled,
      nextRun: this.getNextRunTime(schedule),
    };
    this.taskConfigs.set(name, taskConfig);

    if (enabled) {
      const scheduledTask = cron.schedule(schedule, async () => {
        taskConfig.lastRun = new Date();
        taskConfig.nextRun = this.getNextRunTime(schedule);
        this.taskConfigs.set(name, taskConfig);
        
        try {
          await task();
        } catch (error) {
          this.logger.error(`[스케줄] ${name} 작업 실패: ${error.message}`);
        }
      });
      this.tasks.set(name, scheduledTask);
      this.logger.log(`스케줄 작업 등록: ${name} (${schedule})`);
    }
  }

  /**
   * 작업 시작
   */
  startTask(name: string): boolean {
    const config = this.taskConfigs.get(name);
    if (!config) {
      this.logger.warn(`알 수 없는 작업: ${name}`);
      return false;
    }

    if (config.enabled) {
      this.logger.warn(`이미 실행 중인 작업: ${name}`);
      return false;
    }

    const scheduledTask = cron.schedule(config.schedule, async () => {
      config.lastRun = new Date();
      config.nextRun = this.getNextRunTime(config.schedule);
      this.taskConfigs.set(name, config);
      
      await this.executeTask(name);
    });

    this.tasks.set(name, scheduledTask);
    config.enabled = true;
    config.nextRun = this.getNextRunTime(config.schedule);
    this.taskConfigs.set(name, config);

    this.logger.log(`스케줄 작업 시작: ${name}`);
    return true;
  }

  /**
   * 작업 중지
   */
  stopTask(name: string): boolean {
    const task = this.tasks.get(name);
    const config = this.taskConfigs.get(name);

    if (!task || !config) {
      return false;
    }

    task.stop();
    this.tasks.delete(name);
    config.enabled = false;
    this.taskConfigs.set(name, config);

    this.logger.log(`스케줄 작업 중지: ${name}`);
    return true;
  }

  /**
   * 모든 작업 중지
   */
  stopAllTasks() {
    for (const [name, task] of this.tasks) {
      task.stop();
      const config = this.taskConfigs.get(name);
      if (config) {
        config.enabled = false;
        this.taskConfigs.set(name, config);
      }
    }
    this.tasks.clear();
    this.logger.log('모든 스케줄 작업 중지됨');
  }

  /**
   * 즉시 실행
   */
  async executeTask(name: string): Promise<boolean> {
    try {
      switch (name) {
        case 'school-daily':
          await this.crawlerService.crawlSchools('sample');
          break;
        case 'admission-weekly':
          await this.crawlerService.crawlAdmissions('sample');
          break;
        case 'schedule-daily':
          await this.crawlerService.crawlSchedules('sample');
          break;
        case 'full-weekly':
          await this.crawlerService.crawlSchools('sample');
          await this.crawlerService.crawlAdmissions('sample');
          await this.crawlerService.crawlSchedules('sample');
          break;
        default:
          this.logger.warn(`알 수 없는 작업: ${name}`);
          return false;
      }

      const config = this.taskConfigs.get(name);
      if (config) {
        config.lastRun = new Date();
        this.taskConfigs.set(name, config);
      }

      return true;
    } catch (error) {
      this.logger.error(`작업 실행 실패 (${name}): ${error.message}`);
      return false;
    }
  }

  /**
   * 모든 스케줄 작업 상태 조회
   */
  getAllTasks(): ScheduledTask[] {
    return Array.from(this.taskConfigs.values());
  }

  /**
   * 특정 작업 상태 조회
   */
  getTaskStatus(name: string): ScheduledTask | null {
    return this.taskConfigs.get(name) || null;
  }

  /**
   * 다음 실행 시간 계산
   */
  private getNextRunTime(schedule: string): Date {
    // 간단한 계산 (실제로는 cron-parser 라이브러리 사용 권장)
    const now = new Date();
    const parts = schedule.split(' ');
    
    if (parts.length >= 5) {
      const minute = parseInt(parts[0]) || 0;
      const hour = parseInt(parts[1]) || 0;
      
      const next = new Date(now);
      next.setHours(hour, minute, 0, 0);
      
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    }
    
    return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 기본 24시간 후
  }
}


