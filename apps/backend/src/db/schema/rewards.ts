import { pgTable, bigserial, bigint, numeric, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { companies } from './companies'
import { musics } from './musics'
import { music_plays } from './music_plays'

export const rewardStatusEnum = pgEnum('reward_status', ['pending', 'paid'])

export const rewards = pgTable('rewards', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  company_id: bigint('company_id', { mode: 'number' }).notNull(),
  music_id: bigint('music_id', { mode: 'number' }).notNull(),
  play_id: bigint('play_id', { mode: 'number' }).notNull(),
  amount: numeric('amount').notNull(),
  status: rewardStatusEnum('status').notNull().default('pending'),
  payout_tx_hash: text('payout_tx_hash'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const rewardsRelations = relations(rewards, ({ one }) => ({
  company: one(companies, {
    fields: [rewards.company_id],
    references: [companies.id],
  }),
  music: one(musics, {
    fields: [rewards.music_id],
    references: [musics.id],
  }),
  play: one(music_plays, {
    fields: [rewards.play_id],
    references: [music_plays.id],
  }),
})) 