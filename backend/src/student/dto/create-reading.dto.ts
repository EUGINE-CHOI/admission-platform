import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateReadingDto {
  @IsString()
  @IsNotEmpty()
  bookTitle: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsDateString()
  readDate: string;

  @IsString()
  @IsOptional()
  review?: string;
}

export class UpdateReadingDto {
  @IsString()
  @IsOptional()
  bookTitle?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsDateString()
  @IsOptional()
  readDate?: string;

  @IsString()
  @IsOptional()
  review?: string;
}








