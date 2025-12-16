import { IsNotEmpty, IsOptional, IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateVolunteerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  organization: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @Min(0)
  hours: number;

  @IsString()
  @IsOptional()
  description?: string;
}








