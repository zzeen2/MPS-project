import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CompaniesService } from '../companies/companie.service';
import type { CompanyRow } from '../companies/companies.repository';

type AccessPayload = {
  sub: string;
  grade: CompanyRow['grade'];
  subscriptionStatus: CompanyRow['subscriptionStatus'];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly companies: CompaniesService,
    private readonly jwt: JwtService,
  ) {}
  async validate(email: string, password: string): Promise<CompanyRow | null> {
    return this.companies.validateByEmailPassword(email, password);
  }

  async login(email: string, password: string) {
    const company = await this.companies.validateByEmailPassword(email, password);
    if (!company) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.jwt.signAsync(
      {
        sub: String(company.id),             
        grade: company.grade,
        subscriptionStatus: company.subscriptionStatus,
      } satisfies AccessPayload,
      { expiresIn: '1h' },                 
    );

    return {
      tokenType: 'Bearer',
      accessToken,
      expiresIn: 3600,
    };
  }
}
