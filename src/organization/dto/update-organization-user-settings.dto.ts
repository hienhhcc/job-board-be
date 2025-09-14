import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrganizationUserSettingsDto {
  @IsOptional()
  @IsInt()
  minimumRating: number | null;

  @IsOptional()
  @IsBoolean()
  newApplicationEmailNotifications: boolean;
}
