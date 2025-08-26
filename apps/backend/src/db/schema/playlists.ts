import { pgTable, bigserial, text, timestamp, bigint } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { companies } from './companies'
import { musics } from './musics'

export const playlists = pgTable('playlists', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  company_id: bigint('company_id', { mode: 'number' }).notNull(),
  music_id: bigint('music_id', { mode: 'number' }).notNull(),
  name: text('name').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const playlistsRelations = relations(playlists, ({ one }) => ({
  company: one(companies, {
    fields: [playlists.company_id],
    references: [companies.id],
  }),
  music: one(musics, {
    fields: [playlists.music_id],
    references: [musics.id],
  }),
}))