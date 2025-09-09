<<<<<<< HEAD
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< HEAD
  
  // CORS 설정 추가
  app.enableCors({
    origin: [
      'http://localhost:4001',  // 프론트엔드 개발 서버
    ],
    credentials: true,  // 쿠키/인증 헤더 허용
  });
  
=======

  // CORS 설정 (개발 환경에서는 모든 origin 허용)
  app.enableCors({
    origin: true,  // 개발 환경에서는 모든 origin 허용
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'User-Agent'],
    credentials: true,
  });

  // 전역 Validation Pipe 설정
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 전역 프리픽스 설정
  app.setGlobalPrefix('api', {
    exclude: ['/health', '/']
  });

>>>>>>> contract
  await app.listen(process.env.PORT ?? 3001);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3001}`);
}

void bootstrap();
=======
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

import express from 'express';              
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const UPLOAD_ROOT = join(process.cwd(), 'uploads');
  if (!existsSync(UPLOAD_ROOT)) mkdirSync(UPLOAD_ROOT, { recursive: true });
  app.use('/uploads', express.static(UPLOAD_ROOT));

  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.use((req: any, _res, next) => {
    if (req.originalUrl?.startsWith('/me')) {
      console.log('[REQ /me]', {
        url: req.originalUrl,
        hasAuthHeader: Boolean(req.headers.authorization),
        hasCookie_mps_at: Boolean(req.cookies?.mps_at),
      });
    }
    next();
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
>>>>>>> client
