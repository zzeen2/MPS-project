import {
  pgTable,
  bigserial,
  text,
  integer,
  timestamp,
  numeric,
  uniqueIndex,
  index,
  boolean,
  bigint,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const musicCategories = pgTable(
  'music_categories',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
  },
  (table) => ({
    uqName: uniqueIndex('music_categories_name_uq').on(table.name),
  }),
);

export const musics = pgTable(
  'musics',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    title: text('title').notNull(),
    artist: text('artist'),                       // 아티스트 명
    lyricsText: text('lyrics_text'),              // 가사 텍스트
    lyricsFile: text('lyrics_file'),              // 가사 파일 경로(txt)

    durationSec: integer('duration_sec'),         // 재생 길이(초)
    coverImageUrl: text('cover_image_url'),       // 커버 이미지
    streamEndpoint: text('stream_endpoint'),      // 스트림/파일 엔드포인트

    // (보류) 활성/비활성 — 필요 시 default(true)로 바꿔도 됨
    isValid: boolean('is_valid'),

    // (MVP) 건당 단가 — KRW 정수면 scale:0, 소수 필요하면 2 등으로 조정
    pricePerPlay: numeric('price_per_play', { precision: 12, scale: 0 }),

    // 구독 음원일 때만 의미 있음(검증은 서비스 레벨에서 처리)
    rewardAmount: integer('reward_amount'),
    rewardCount: integer('reward_count'),

    // 단일 카테고리 FK
    categoryId: bigint('category_id', { mode: 'number' })
      .references(() => musicCategories.id, { onDelete: 'restrict', onUpdate: 'cascade' }),

    // 0: 프리, 1: 구독
    grade: integer('grade').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // 권장 인덱스
    ixTitle: index('musics_title_idx').on(table.title),
    ixCreatedAt: index('musics_created_at_idx').on(table.createdAt),

    // grade 값 제약(0,1만 허용)
    ckGrade: sql`CHECK (${table.grade} IN (0,1))`,
  }),
);
