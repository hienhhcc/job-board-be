import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsEnum,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  type WageInterval,
  type LocationRequirement,
  type ExperienceLevel,
  type JobListingStatus,
  type JobListingType,
  wageIntervals,
  locationRequirements,
  experienceLevels,
  jobListingStatuses,
  jobListingTypes,
} from 'drizzle/schema'; // adjust path if needed

export class InsertJobListingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsInt()
  wage?: number;

  @IsOptional()
  @IsEnum(wageIntervals)
  wageInterval?: WageInterval;

  @IsOptional()
  @IsString()
  stateAbbreviation?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean = false;

  @IsEnum(locationRequirements)
  locationRequirement: LocationRequirement;

  @IsEnum(experienceLevels)
  experienceLevel: ExperienceLevel;

  @IsOptional()
  @IsEnum(jobListingStatuses)
  status: JobListingStatus = 'draft';

  @IsEnum(jobListingTypes)
  type: JobListingType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  postedAt?: Date;
}
