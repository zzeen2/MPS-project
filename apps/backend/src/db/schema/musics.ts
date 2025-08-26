import { pgTable, bigserial, text, timestamp, integer, numeric, boolean, date, varchar, decimal, bigint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { music_categories } from './music_categories'
import { music_tags } from './music_tags'
import { music_plays } from './music_plays'
import { rewards } from './rewards'

export const musics = pgTable('musics', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  lyrics_text: text('lyrics_text'),
  lyrics_file: text('lyrics_file'),
  duration_sec: integer('duration_sec'),
  release_date: date('release_date'),
  cover_image_url: text('cover_image_url'),
  stream_endpoint: text('stream_endpoint'),
  price_per_play: numeric('price_per_play'),
  lyrics_price: numeric('lyrics_price'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  reward_amount: integer('reward_amount'),
  reward_count: integer('reward_count'),
  category_id: integer('category_id'),
  genre: varchar('genre', { length: 100 }),
  grade: integer('grade').notNull().default(0),
  is_active: boolean('is_active').default(true),
  play_count: bigint('play_count', { mode: 'number' }).default(0),
  total_revenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  last_played_at: timestamp('last_played_at', { withTimezone: true }),
})

export const musicsRelations = relations(musics, ({ many, one }) => ({
  category: one(music_categories, {
    fields: [musics.category_id],
    references: [music_categories.id],
  }),
  tags: many(music_tags),
  plays: many(music_plays),
  rewards: many(rewards),
}))