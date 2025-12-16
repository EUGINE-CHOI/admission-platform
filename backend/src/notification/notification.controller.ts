import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '내 알림 목록 조회' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyNotifications(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getMyNotifications(req.user.id, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Post(':id/read')
  @ApiOperation({ summary: '알림 읽음 처리' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    await this.notificationService.markAsRead(req.user.id, id);
    return { success: true, message: '알림을 읽음 처리했습니다' };
  }

  @Post('read-all')
  @ApiOperation({ summary: '모든 알림 읽음 처리' })
  async markAllAsRead(@Request() req) {
    await this.notificationService.markAllAsRead(req.user.id);
    return { success: true, message: '모든 알림을 읽음 처리했습니다' };
  }

  @Delete(':id')
  @ApiOperation({ summary: '알림 삭제' })
  async delete(@Request() req, @Param('id') id: string) {
    await this.notificationService.delete(req.user.id, id);
    return { success: true, message: '알림을 삭제했습니다' };
  }

  @Delete('read/all')
  @ApiOperation({ summary: '읽은 알림 전체 삭제' })
  async deleteAllRead(@Request() req) {
    const result = await this.notificationService.deleteAllRead(req.user.id);
    return { success: true, message: `${result.count}개의 알림을 삭제했습니다` };
  }
}


