import { IsNotEmpty, IsString } from 'class-validator';

export class RevisionRequestDto {
  @IsString()
  @IsNotEmpty()
  comment: string;
}









