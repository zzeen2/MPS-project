import { pgTable, bigserial, bigint, boolean, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { companies } from './companies';
import { musics } from './musics';

export const whitelistEntries = pgTable(
  'whitelist_entries',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    companyId: bigint('company_id', { mode: 'number' }).references(() => companies.id, { onDelete: 'cascade' }).notNull(),
    musicId: bigint('music_id', { mode: 'number' }).references(() => musics.id, { onDelete: 'cascade' }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
  },
  (table) => ({
    uqCompanyMusic: uniqueIndex('whitelist_company_music_uq').on(table.companyId, table.musicId),
  }),
); 