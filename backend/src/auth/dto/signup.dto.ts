import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Role } from '../../../generated/prisma';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.STUDENT;

  @IsString()
  @IsOptional()
  schoolName?: string; // 레거시: 수동 입력 학교명

  @IsString()
  @IsOptional()
  middleSchoolId?: string; // 중학교 DB에서 선택한 학교 ID

  @IsInt()
  @Min(1)
  @Max(3)
  @IsOptional()
  grade?: number; // 학년 (1, 2, 3)
}






