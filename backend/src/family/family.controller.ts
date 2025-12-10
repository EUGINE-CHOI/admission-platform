import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { JoinFamilyDto } from './dto';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';
import { Role } from '../../generated/prisma';

@ApiTags('Family')
@ApiBearerAuth('access-token')
@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private familyService: FamilyService) {}

  @Post('invite-code')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  createInviteCode(@Request() req) {
    return this.familyService.createInviteCode(req.user.id);
  }

  @Post('join')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  joinFamily(@Request() req, @Body() dto: JoinFamilyDto) {
    return this.familyService.joinFamily(req.user.id, dto);
  }

  @Get('children')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildren(@Request() req) {
    return this.familyService.getChildren(req.user.id);
  }

  @Get('children/:childId')
  @UseGuards(RolesGuard)
  @Roles(Role.PARENT)
  getChildProfile(@Request() req, @Param('childId') childId: string) {
    return this.familyService.getChildProfile(req.user.id, childId);
  }
}



