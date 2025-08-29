import { pgTable, bigserial, text, timestamp, integer, numeric, boolean, date, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { music_categories } from './music_categories'
import { music_tags } from './music_tags'
import { music_plays } from './music_plays'
import { rewards } from './rewards'
import { playlist_items } from './playlist_items'

export const musics = pgTable('musics', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  file_path: varchar('file_path', { length: 255 }).notNull().unique(),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  composer: text('composer'),
  music_arranger: text('music_arranger'),
  lyricist: text('lyricist'),
  lyrics_text: text('lyrics_text'),
  lyrics_file: text('lyrics_file'),
  inst: boolean('inst').notNull().default(false), // true: instrumental, false: with vocal. 가사가 없으면 true
  isrc: text('isrc').unique(),
  duration_sec: integer('duration_sec'),
  release_date: date('release_date'),
  cover_image_url: text('cover_image_url'),
  price_per_play: numeric('price_per_play'),
  lyrics_price: numeric('lyrics_price'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  reward_amount: integer('reward_amount'),
  reward_count: integer('reward_count'),
  category_id: integer('category_id'),
  grade: integer('grade').notNull().default(0),
  is_active: boolean('is_active').default(true),
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
  playlist_items: many(playlist_items),
}))