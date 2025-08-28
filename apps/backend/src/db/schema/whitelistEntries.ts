import {
    pgTable,
    bigserial,
    bigint,
    boolean,
    timestamp,
    uniqueIndex,
    index,
  } from 'drizzle-orm/pg-core';
  import { companies } from './companies';
  import { musics } from './musics';
  
  export const whitelistEntries = pgTable(
    'whitelist_entries',
    {
      id: bigserial('id', { mode: 'number' }).primaryKey(),
  
      companyId: bigint('company_id', { mode: 'number' })
        .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
  
      musicId: bigint('music_id', { mode: 'number' })
        .references(() => musics.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
  
      isActive: boolean('is_active').notNull().default(true),
  
      createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
  
      deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
    },
    (table) => ({
      // 회사 + 음악 복합 유니크
      uqCompanyMusic: uniqueIndex('whitelist_company_id_music_id_uq').on(
        table.companyId,
        table.musicId,
      ),
  
      // 자주 조회용 인덱스
      ixCompany: index('whitelist_company_id_idx').on(table.companyId),
      ixMusic: index('whitelist_music_id_idx').on(table.musicId),
    }),
  );
  