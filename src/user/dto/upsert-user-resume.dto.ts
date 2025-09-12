import { IsNotEmpty, IsString } from 'class-validator';

export class UpsertUserResumeDto {
  @IsString()
  @IsNotEmpty()
  resumeFileKey: string;

  @IsString()
  @IsNotEmpty()
  resumeFileUrl: string;
}
