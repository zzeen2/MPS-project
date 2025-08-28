import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { ClientModule } from './client/client.module';

@Module({
  // imports: [UserModule],
  controllers: [AppController],
  providers: [AppService],
  imports: [AdminModule, ClientModule],
})
export class AppModule {}
