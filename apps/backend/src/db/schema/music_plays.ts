import { pgTable, bigserial, bigint, numeric, text, integer, pgEnum, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { musics } from './musics'
import { companies } from './companies'
import { playlists } from './playlists'

export const rewardCodeEnum = pgEnum('reward_code', ['0', '1', '2', '3'])
export const useCaseEnum = pgEnum('use_case', ['0', '1', '2'])

export const music_plays = pgTable('music_plays', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  music_id: bigint('music_id', { mode: 'number' }).notNull(),
  using_company_id: bigint('using_company_id', { mode: 'number' }).notNull(),
  reward_amount: numeric('reward_amount').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  transaction_hash: text('transaction_hash'),
  api_latency: integer('api_latency'),
  reward_code: rewardCodeEnum('reward_code').notNull(),
  use_case: useCaseEnum('use_case').notNull(),
  use_price: numeric('use_price'),
  played_at: timestamp('played_at', { withTimezone: true }),
  playlist_id: bigint('playlist_id', { mode: 'number' }),
  is_valid_play: boolean('is_valid_play').default(true),
  play_duration_sec: integer('play_duration_sec'),
})

export const music_playsRelations = relations(music_plays, ({ one }) => ({
  music: one(musics, {
    fields: [music_plays.music_id],
    references: [musics.id],
  }),
  company: one(companies, {
    fields: [music_plays.using_company_id],
    references: [companies.id],
  }),
  playlist: one(playlists, {
    fields: [music_plays.playlist_id],
    references: [playlists.id],
  }),
})) 