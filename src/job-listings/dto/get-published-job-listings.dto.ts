import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsEnum } from 'class-validator';
import type {
  LocationRequirement,
  ExperienceLevel,
  JobListingType,
} from 'drizzle/schema';
import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
} from 'drizzle/schema';

export class GetPublishedJobListingQuery {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(locationRequirements)
  @IsOptional()
  locationRequirement?: LocationRequirement;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsEnum(experienceLevels)
  @IsOptional()
  experience?: ExperienceLevel;

  @IsEnum(jobListingTypes)
  @IsOptional()
  type?: JobListingType;

  @IsString()
  @IsOptional()
  jobListingId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      return [value];
    }
    return [];
  })
  jobIds?: string[];
}
