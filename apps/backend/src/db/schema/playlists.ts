import {
  pgTable,
  bigserial,
  text,
  bigint,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { musics } from './musics';

export const playlists = pgTable(
  'playlists',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    companyId: bigint('company_id', { mode: 'number' })
      .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
      .notNull(),

    // 단일 음원 FK (스펙 기준)
    musicId: bigint('music_id', { mode: 'number' })
      .references(() => musics.id, { onDelete: 'restrict', onUpdate: 'cascade' })
      .notNull(),

    name: text('name').notNull(),

    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    ixCompany: index('playlists_company_id_idx').on(table.companyId),
    ixMusic: index('playlists_music_id_idx').on(table.musicId),
    // 회사 내 동일 이름 방지(원하면 사용, 불필요하면 지워도 됨)
    uqCompanyName: uniqueIndex('playlists_company_id_name_uq').on(table.companyId, table.name),
  }),
);
