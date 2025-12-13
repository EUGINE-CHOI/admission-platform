import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards';

@ApiTags('Family')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('family')
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: '가족 생성' })
  async createFamily(@Request() req, @Body() dto: { name?: string }) {
    return this.familyService.createFamily(req.user.id, dto.name);
  }

  @Get()
  @ApiOperation({ summary: '내 가족 정보 조회' })
  async getMyFamily(@Request() req) {
    return this.familyService.getMyFamily(req.user.id);
  }

  @Patch('name')
  @ApiOperation({ summary: '가족 이름 변경' })
  async updateFamilyName(@Request() req, @Body() dto: { name: string }) {
    return this.familyService.updateFamilyName(req.user.id, dto.name);
  }

  @Post('invite-code')
  @ApiOperation({ summary: '초대 코드 생성' })
  async createInviteCode(@Request() req) {
    return this.familyService.createInviteCode(req.user.id);
  }

  @Post('join')
  @ApiOperation({ summary: '초대 코드로 가족 참여' })
  async joinFamily(@Request() req, @Body() dto: { code: string }) {
    return this.familyService.joinFamilyByCode(req.user.id, dto.code);
  }

  @Delete('leave')
  @ApiOperation({ summary: '가족 탈퇴' })
  async leaveFamily(@Request() req) {
    return this.familyService.leaveFamily(req.user.id);
  }

  @Get('children')
  @ApiOperation({ summary: '자녀 목록 조회 (학부모용)' })
  async getChildren(@Request() req) {
    return this.familyService.getChildren(req.user.id);
  }

  @Get('children/:childId')
  @ApiOperation({ summary: '자녀 상세 정보 조회 (학부모용)' })
  async getChildDetail(@Request() req, @Param('childId') childId: string) {
    return this.familyService.getChildDetail(req.user.id, childId);
  }
}
