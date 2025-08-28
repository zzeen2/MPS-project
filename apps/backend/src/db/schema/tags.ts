import { pgTable, serial, bigint, text, timestamp, index } from 'drizzle-orm/pg-core';
import { musics } from './musics';

export const tags = pgTable(
  'tags',
  {
    id: serial('id').primaryKey(),  // ← 옵션 제거

    musicId: bigint('music_id', { mode: 'number' })
      .references(() => musics.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),

    text: text('text').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    ixMusic: index('tags_music_id_idx').on(table.musicId),
    ixMusicCreated: index('tags_music_id_created_at_idx').on(table.musicId, table.createdAt),
  }),
);