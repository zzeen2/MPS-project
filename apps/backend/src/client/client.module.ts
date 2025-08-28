import { Module } from '@nestjs/common';
import { CompanieModule } from './companies/companie.module';
import { AuthModule } from './auth/auth.module';

@Module({

  imports: [CompanieModule, AuthModule]
})
export class ClientModule {}
