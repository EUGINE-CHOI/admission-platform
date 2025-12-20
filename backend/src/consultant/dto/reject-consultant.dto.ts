import { IsString, IsOptional } from 'class-validator';

export class RejectConsultantDto {
  @IsString()
  @IsOptional()
  reason?: string;
}









