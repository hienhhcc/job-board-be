import { IsOptional, IsString } from 'class-validator';

export class InsertJobListingApplicationDto {
  @IsString()
  @IsOptional()
  coverLetter?: string;
}
