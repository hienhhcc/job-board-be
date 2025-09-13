import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class ResendService {
  public resend;

  constructor(private readonly config: ConfigService) {
    this.resend = new Resend(this.config.get('RESEND_API_KEY'));
  }
  public buildDailyJobListingEmail(
    userName: string,
    jobListings: any[],
    serverUrl: string,
  ): string {
    const listingsHtml = jobListings
      .map(
        (job) => `
        <div style="background:#fff;border:1px solid #ccc;border-radius:8px;padding:16px;margin-bottom:16px;">
          <h2 style="margin:0;font-size:18px;">${job.title}</h2>
          <p style="margin:4px 0;color:#666;">${job.organizationName}</p>
          <div style="margin:8px 0;">
            ${this.getBadges(job)
              .map(
                (badge) =>
                  `<span style="display:inline-block;border:1px solid #ccc;border-radius:4px;padding:4px 8px;font-size:12px;margin:2px;">${badge}</span>`,
              )
              .join('')}
          </div>
          <a href="${serverUrl}/job-listings/${job.id}" 
             style="display:inline-block;background:#2563eb;color:#fff;padding:8px 12px;border-radius:4px;font-size:14px;text-decoration:none;">
             View Details
          </a>
        </div>
      `,
      )
      .join('');

    return `
      <div style="font-family:Arial, sans-serif;">
        <h1>New Job Listings!</h1>
        <p>Hi ${userName}, here are all the new job listings that meet your criteria:</p>
        ${listingsHtml}
      </div>
    `;
  }

  private getBadges(job: any): string[] {
    const badges: string[] = [];

    if (job.wage && job.wageInterval) {
      badges.push(`${job.wage.toLocaleString()} / ${job.wageInterval}`);
    }

    if (job.city || job.stateAbbreviation) {
      badges.push([job.city, job.stateAbbreviation].filter(Boolean).join(', '));
    }

    badges.push(job.type, job.experienceLevel, job.locationRequirement);

    return badges;
  }
}
