import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './dto';
import { JwtAuthGuard, JwtRefreshGuard } from './guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 가입된 이메일' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '이메일과 비밀번호로 로그인합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공, accessToken/refreshToken 반환' })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 불일치' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '토큰 갱신', description: 'Refresh Token으로 새로운 Access Token을 발급받습니다.' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
  refreshTokens(@Request() req) {
    const { id, email, role } = req.user;
    return this.authService.refreshTokens(id, email, role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '내 정보 조회', description: '현재 로그인한 사용자 정보를 조회합니다.' })
  @ApiResponse({ status: 200, description: '사용자 정보 반환' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getMe(@Request() req) {
    return this.authService.getMe(req.user.id);
  }
}
