import { Module } from '@nestjs/common';
import { CompaniesService } from './companie.service';
import { CompaniesController } from './companie.controller';
import { CompaniesRepository } from './companies.repository';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesRepository, CompaniesService],
  exports: [CompaniesRepository, CompaniesService],
})
export class CompanieModule {}
