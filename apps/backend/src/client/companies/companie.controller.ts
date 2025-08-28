import { BadRequestException, Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companie.service'; 
import { CreateCompanyDto } from './dto/create-companie.dto';
import { UpdateCompanyDto } from './dto/update-companie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

type JwtUser = {
  sub: string;                 
  grade: string;
  subscriptionStatus: string;
};

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  // 회원가입
  @Post('api/auth/register')
  async create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.createCompany(dto);
  }

  // 내 정보 조회
  @Get('api/auth/me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request & { user: JwtUser }) {
    const meId = Number(req.user.sub);
    if (!Number.isSafeInteger(meId)) throw new BadRequestException('Invalid user id');

    const row = await this.companiesService.getById(meId);
    return row
      ? {
          id: row.id,
          name: row.name,
          email: row.email,
          grade: row.grade,
          subscriptionStatus: row.subscriptionStatus,
          phone: row.phone,
          ceoName: row.ceoName,
          profileImageUrl: row.profileImageUrl,
          homepageUrl: row.homepageUrl,
          smartAccountAddress: row.smartAccountAddress,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        }
      : null;
  }
  // 내 프로필 수정
  @Patch('api/auth/me')
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @Req() req: Request & { user: JwtUser },
    @Body() dto: UpdateCompanyDto,
  ) {
    const meId = Number(req.user.sub);
    if (!Number.isSafeInteger(meId)) throw new BadRequestException('Invalid user id');

    await this.companiesService.updateCompany(meId, dto);
    return { success: true };
  }
}
