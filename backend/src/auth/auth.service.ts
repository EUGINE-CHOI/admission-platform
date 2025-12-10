import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto } from './dto';
import { Role, ConsultantStatus } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일입니다');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const consultantStatus =
      dto.role === Role.CONSULTANT ? ConsultantStatus.PENDING : null;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || Role.STUDENT,
        consultantStatus,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        consultantStatus: true,
        createdAt: true,
      },
    });

    const message =
      dto.role === Role.CONSULTANT
        ? '회원가입 완료. 관리자 승인 후 이용 가능합니다'
        : '회원가입 완료';

    return {
      message,
      user,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다');
    }

    if (
      user.role === Role.CONSULTANT &&
      user.consultantStatus === ConsultantStatus.PENDING
    ) {
      throw new ForbiddenException('관리자 승인 대기 중입니다');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      message: '로그인 성공',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, email: string, role: Role) {
    const tokens = await this.generateTokens(userId, email, role);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      message: '토큰 갱신 성공',
      ...tokens,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        familyId: true,
        schoolName: true,
        grade: true,
        createdAt: true,
      },
    });

    return { user };
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
        expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
        expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}


