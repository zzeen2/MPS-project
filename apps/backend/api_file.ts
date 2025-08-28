// NestJS 컨트롤러 (music.controller.js)
import { Controller, Get, Param, Headers, HttpException, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { MusicService } from './music.service';
import { ApiKeyService } from './api-key.service';
import { TrackingService } from './tracking.service';

@Controller('api/music')
export class MusicController {
  constructor(
    private readonly musicService: MusicService,
    private readonly apiKeyService: ApiKeyService,
    private readonly trackingService: TrackingService,
  ) {}

  @Get(':music_id/play')
  async playMusic(
    @Param('music_id') musicId: string,
    @Headers('x-api-key') apiKey: string,
    @Headers('user-agent') userAgent: string,
    @Res() response: Response,
  ) {
    try {
      // 1. API 키 검증
      const company = await this.validateApiKey(apiKey);
      if (!company) {
        throw new HttpException('유효하지 않은 API 키입니다.', HttpStatus.UNAUTHORIZED);
      }

      // 2. 음원 정보 조회
      const music = await this.musicService.findById(musicId);
      if (!music) {
        throw new HttpException('음원을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
      }

      // 3. 회사 등급별 재생 권한 확인
      const canPlay = await this.checkPlayPermission(company, music);
      if (!canPlay) {
        throw new HttpException('재생 권한이 없습니다.', HttpStatus.FORBIDDEN);
      }

      // 4. 음원 스트리밍 데이터 준비
      const musicStream = await this.musicService.getMusicStream(music.filePath);
      
      // 5. HTTP 응답 헤더 설정
      response.setHeader('Content-Type', 'audio/mpeg');
      response.setHeader('Content-Length', music.fileSize);
      response.setHeader('Accept-Ranges', 'bytes');
      response.setHeader('Cache-Control', 'no-cache');

      // 6. 스트리밍 시작 전 기록 준비
      const playSession = {
        musicId: music.id,
        companyId: company.id,
        startTime: new Date(),
        userAgent,
        isValidPlay: false // 완전히 재생되면 true로 변경
      };

      // 7. 음원 스트리밍 응답
      musicStream.pipe(response);

      // 8. 스트리밍 완료 후 처리
      musicStream.on('end', async () => {
        playSession.isValidPlay = true;
        playSession.endTime = new Date();
        
        // 음원 사용 기록 함수 호출
        await this.recordMusicUsage(playSession);
      });

      // 9. 스트리밍 중단 시 처리
      musicStream.on('error', async (error) => {
        console.error('스트리밍 에러:', error);
        playSession.isValidPlay = false;
        playSession.endTime = new Date();
        playSession.errorMessage = error.message;
        
        await this.recordMusicUsage(playSession);
      });

      // 10. 클라이언트 연결 해제 시 처리
      response.on('close', async () => {
        if (!playSession.endTime) {
          playSession.isValidPlay = false;
          playSession.endTime = new Date();
          playSession.errorMessage = '클라이언트 연결 해제';
          
          await this.recordMusicUsage(playSession);
        }
      });

    } catch (error) {
      console.error('음원 재생 에러:', error);
      throw new HttpException(
        error.message || '음원 재생 중 오류가 발생했습니다.',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // API 키 검증 메서드
  private async validateApiKey(apiKey: string) {
    if (!apiKey) {
      throw new HttpException('API 키가 필요합니다.', HttpStatus.UNAUTHORIZED);
    }

    const company = await this.apiKeyService.validateApiKey(apiKey);
    return company;
  }

  // 재생 권한 확인 메서드
  private async checkPlayPermission(company, music) {
    // 회사 등급에 따른 월간 재생 횟수 제한 확인
    const monthlyUsage = await this.trackingService.getMonthlyUsage(company.id);
    const limit = this.getPlayLimitByGrade(company.grade);
    
    if (monthlyUsage >= limit) {
      return false;
    }

    return true;
  }

  // 등급별 재생 제한 반환
  private getPlayLimitByGrade(grade: string): number {
    const limits = {
      'FREE': 1000,
      'STANDARD': 10000,
      'BUSINESS': 100000
    };
    return limits[grade] || 0;
  }

  // 음원 사용 기록 함수
  private async recordMusicUsage(playSession) {
    try {
      // 1. 데이터베이스에 재생 기록 저장
      await this.trackingService.createPlayRecord(playSession);

      // 2. 유효 재생인 경우 리워드 처리
      if (playSession.isValidPlay) {
        await this.processReward(playSession);
      }

      // 3. 실시간 통계 업데이트
      await this.trackingService.updateRealTimeStats(playSession);

      console.log(`음원 사용 기록 완료: ${playSession.musicId} by ${playSession.companyId}`);
    } catch (error) {
      console.error('음원 사용 기록 에러:', error);
    }
  }

  // 리워드 처리 메서드
  private async processReward(playSession) {
    const music = await this.musicService.findById(playSession.musicId);
    
    // 리워드가 있는 음원이고, 리워드 잔량이 있는 경우
    if (music.isRewardMusic && music.rewardCount > 0) {
      // 리워드 지급 처리
      await this.trackingService.addReward({
        musicId: music.id,
        companyId: playSession.companyId,
        rewardAmount: music.rewardAmount,
        playSessionId: playSession.id
      });

      // 음원 리워드 잔량 차감
      await this.musicService.decreaseRewardCount(music.id);
    }
  }
}

// API 키 서비스 (api-key.service.js)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { ApiKey } from './entities/api-key.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async validateApiKey(apiKey: string): Promise<Company | null> {
    const apiKeyRecord = await this.apiKeyRepository.findOne({
      where: { 
        key: apiKey, 
        isActive: true 
      },
      relations: ['company']
    });

    if (!apiKeyRecord) {
      return null;
    }

    // API 키 만료 확인
    if (apiKeyRecord.expiresAt && apiKeyRecord.expiresAt < new Date()) {
      return null;
    }

    // 마지막 사용 시간 업데이트
    apiKeyRecord.lastUsedAt = new Date();
    await this.apiKeyRepository.save(apiKeyRecord);

    return apiKeyRecord.company;
  }

  async generateApiKey(companyId: string): Promise<string> {
    const crypto = require('crypto');
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const newApiKey = this.apiKeyRepository.create({
      key: apiKey,
      companyId,
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1년 후 만료
    });

    await this.apiKeyRepository.save(newApiKey);
    return apiKey;
  }
}

// 음원 서비스 (music.service.js)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Music } from './entities/music.entity';
import { createReadStream } from 'fs';
import { join } from 'path';

@Injectable()
export class MusicService {
  constructor(
    @InjectRepository(Music)
    private musicRepository: Repository<Music>,
  ) {}

  async findById(musicId: string): Promise<Music | null> {
    return await this.musicRepository.findOne({
      where: { id: musicId }
    });
  }

  async getMusicStream(filePath: string) {
    const fullPath = join(process.env.MUSIC_STORAGE_PATH, filePath);
    return createReadStream(fullPath);
  }

  async decreaseRewardCount(musicId: string) {
    await this.musicRepository.update(
      { id: musicId },
      { rewardCount: () => 'reward_count - 1' }
    );
  }
}

// 트래킹 서비스 (tracking.service.js)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayRecord } from './entities/play-record.entity';
import { RewardRecord } from './entities/reward-record.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(PlayRecord)
    private playRecordRepository: Repository<PlayRecord>,
    @InjectRepository(RewardRecord)
    private rewardRecordRepository: Repository<RewardRecord>,
  ) {}

  async createPlayRecord(playSession) {
    const playRecord = this.playRecordRepository.create({
      musicId: playSession.musicId,
      companyId: playSession.companyId,
      startTime: playSession.startTime,
      endTime: playSession.endTime,
      isValidPlay: playSession.isValidPlay,
      userAgent: playSession.userAgent,
      errorMessage: playSession.errorMessage
    });

    return await this.playRecordRepository.save(playRecord);
  }

  async getMonthlyUsage(companyId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await this.playRecordRepository.count({
      where: {
        companyId,
        startTime: {
          gte: startOfMonth
        },
        isValidPlay: true
      }
    });

    return count;
  }

  async addReward(rewardData) {
    const rewardRecord = this.rewardRecordRepository.create(rewardData);
    return await this.rewardRecordRepository.save(rewardRecord);
  }

  async updateRealTimeStats(playSession) {
    // 실시간 통계 업데이트 로직
    // Redis 등을 활용하여 실시간 통계 데이터 업데이트
  }
}