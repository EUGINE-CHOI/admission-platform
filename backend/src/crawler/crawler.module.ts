import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { CrawlerController } from './crawler.controller';
import { SchoolCrawlerService } from './services/school-crawler.service';
import { AdmissionCrawlerService } from './services/admission-crawler.service';
import { SchedulerService } from './services/scheduler.service';
import { RealSchoolCrawlerService } from './services/real-school-crawler.service';
import { ClubCrawlerService } from './services/club-crawler.service';
import { SeoulOpenDataService } from './services/seoul-opendata.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    SchoolCrawlerService,
    AdmissionCrawlerService,
    SchedulerService,
    RealSchoolCrawlerService,
    ClubCrawlerService,
    SeoulOpenDataService,
  ],
  exports: [CrawlerService, RealSchoolCrawlerService, ClubCrawlerService, SeoulOpenDataService],
})
export class CrawlerModule {}

