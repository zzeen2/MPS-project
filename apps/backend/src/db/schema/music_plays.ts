import {
  pgTable,
  bigserial,
  bigint,
  integer,
  numeric,
  text,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { musics } from './musics';
import { companies } from './companies';

export const musicPlays = pgTable(
  'music_plays',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    musicId: bigint('music_id', { mode: 'number' })
      .references(() => musics.id, { onDelete: 'restrict', onUpdate: 'cascade' })
      .notNull(),

    companyId: bigint('company_id', { mode: 'number' })
      .references(() => companies.id, { onDelete: 'restrict', onUpdate: 'cascade' })
      .notNull(),

    rewardAmount: numeric('reward_amount', { precision: 12, scale: 0 }),

    transactionHash: text('transaction_hash'),

    apiLatency: integer('api_latency'),

    rewardCode: integer('reward_code').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    ixMusic: index('music_plays_music_id_idx').on(table.musicId),
    ixCompany: index('music_plays_company_id_idx').on(table.companyId),
    ixCreatedAt: index('music_plays_created_at_idx').on(table.createdAt),
    ixRewardCode: index('music_plays_reward_code_idx').on(table.rewardCode),

    // enum(0,1,2,3) 요구사항은 정수 + CHECK로 안전하게 강제
    ckRewardCode: check(
      'music_plays_reward_code_ck',
      sql`${table.rewardCode} IN (0, 1, 2, 3)`,
    ),
  }),
);
