import { pgTable, bigserial, bigint, text, timestamp, pgEnum, numeric } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { musics } from './musics';
import { musicPlays } from './music_plays';

export const rewardStatus = pgEnum('reward_status', ['pending', 'paid']);

export const rewards = pgTable('rewards', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  companyId: bigint('company_id', { mode: 'number' }).references(() => companies.id, { onDelete: 'restrict' }).notNull(),
  musicId: bigint('music_id', { mode: 'number' }).references(() => musics.id, { onDelete: 'restrict' }).notNull(),
  playId: bigint('play_id', { mode: 'number' }).references(() => musicPlays.id, { onDelete: 'set null' }),
  amount: numeric('amount').notNull(),
  status: rewardStatus('status').notNull().default('pending'),
  payoutTxHash: text('payout_tx_hash'),
  period: text('period'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}); 