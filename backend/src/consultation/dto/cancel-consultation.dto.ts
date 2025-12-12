import { IsString, IsOptional } from 'class-validator';

export class CancelConsultationDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class RejectConsultationDto {
  @IsString()
  @IsOptional()
  reason?: string;
}





