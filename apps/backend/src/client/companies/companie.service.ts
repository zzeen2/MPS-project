import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CompaniesRepository, CompanyRow } from './companies.repository';
import { CreateCompanyDto } from './dto/create-companie.dto';
import { UpdateCompanyDto } from './dto/update-companie.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly repo: CompaniesRepository) {}


  // 회원가입 
  async createCompany(dto: CreateCompanyDto): Promise<{ id: number }> {
    
    if (await this.repo.findByEmail(dto.email)) {
      throw new ConflictException('Email already in use');
    }
    if (await this.repo.findByBusinessNumber(dto.businessNumber)) {
      throw new ConflictException('Business number already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const created = await this.repo.insert({
      name: dto.name,
      email: dto.email,
      passwordHash,
      businessNumber: dto.businessNumber,
      phone: dto.phone ?? null,
      ceoName: dto.ceoName ?? null,
      profileImageUrl: dto.profileImageUrl ?? null,
      homepageUrl: dto.homepageUrl ?? null,
      smartAccountAddress: dto.smartAccountAddress ?? null,
      // grade/subscriptionStatus는 스키마 default 사용 (grade=free)
    });

    return { id: created.id };
  }

  // 이메일 확인 
  async validateByEmailPassword(email: string, password: string): Promise<CompanyRow | null> {
    const company = await this.repo.findByEmail(email);
    if (!company) return null;
    const ok = await bcrypt.compare(password, company.passwordHash);
    return ok ? company : null;
  }

   // 정보 수정 
  async updateCompany(meId: number, patch: UpdateCompanyDto): Promise<void> {
    const me = await this.repo.findById(meId);
    if (!me) throw new NotFoundException('Company not found');

    await this.repo.updatePartial(meId, {
      name: patch.name ?? undefined,
      phone: patch.phone ?? undefined,
      ceoName: patch.ceoName ?? undefined,
      profileImageUrl: patch.profileImageUrl ?? undefined,
      homepageUrl: patch.homepageUrl ?? undefined,
      smartAccountAddress: patch.smartAccountAddress ?? undefined,
    });
  }

  // 비밀번호 변경 
  async changePassword(meId: number, dto: UpdatePasswordDto): Promise<void> {
    const me = await this.repo.findById(meId);
    if (!me) throw new NotFoundException('Company not found');

    const ok = await bcrypt.compare(dto.currentPassword, me.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is wrong');

    const hash = await bcrypt.hash(dto.newPassword, 12);
    await this.repo.setPasswordHash(meId, hash);
  }

  getById(id: number): Promise<CompanyRow | null> {
    return this.repo.findById(id);
  }
}
