import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/guards/roles.decorator';
import { Role } from '../../generated/prisma';

@ApiTags('Gamification')
@ApiBearerAuth('access-token')
@Controller('v1/gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  // ??ë±ƒì? ?”ì•½ ì¡°íšŒ
  @Get('badges/summary')
  async getMyBadgeSummary(@Request() req) {
    return this.gamificationService.getUserBadgeSummary(req.user.id);
  }

  // ?„ì²´ ë±ƒì? ëª©ë¡ ì¡°íšŒ (?ë“ ?¬ë? ?¬í•¨)
  @Get('badges')
  async getAllBadges(@Request() req) {
    return this.gamificationService.getAllBadges(req.user.id);
  }

  // ë±ƒì? ?œë“œ ?°ì´???ì„± (Admin ?„ìš©)
  @Post('badges/seed')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async seedBadges() {
    return this.gamificationService.seedBadges();
  }

  // ?¹ì • ?´ë²¤?¸ì— ?€??ë±ƒì? ì²´í¬ (?ŒìŠ¤?¸ìš©)
  @Post('check/:eventType')
  async checkBadges(@Request() req, @Param('eventType') eventType: string) {
    return this.gamificationService.checkAndAwardBadges(req.user.id, eventType);
  }
}

