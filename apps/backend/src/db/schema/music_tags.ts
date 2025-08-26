import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { musics } from './musics'

export const music_tags = pgTable('music_tags', {
  id: serial('id').primaryKey(),
  music_id: integer('music_id').notNull(),
  text: text('text').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const music_tagsRelations = relations(music_tags, ({ one }) => ({
  music: one(musics, {
    fields: [music_tags.music_id],
    references: [musics.id],
  }),
})) 