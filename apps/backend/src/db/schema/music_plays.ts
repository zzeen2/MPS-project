import { pgTable, bigserial, bigint, boolean, text, timestamp } from 'drizzle-orm/pg-core';
import { musics } from './musics';
import { companies } from './companies';

export const musicPlays = pgTable('music_plays', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  musicId: bigint('music_id', { mode: 'number' }).references(() => musics.id, { onDelete: 'restrict' }).notNull(),
  usingCompanyId: bigint('using_company_id', { mode: 'number' }).references(() => companies.id, { onDelete: 'restrict' }).notNull(),
  isValidPlay: boolean('is_valid_play').notNull().default(false),
  chainTxHash: text('chain_tx_hash'),
  playedAt: timestamp('played_at', { withTimezone: true }).defaultNow().notNull(),
}); 