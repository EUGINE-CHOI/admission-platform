import { Module } from '@nestjs/common';
import { TaskController, EventController, TimelineController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  controllers: [TaskController, EventController, TimelineController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}









