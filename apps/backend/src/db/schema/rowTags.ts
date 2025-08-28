// src/db/rowTags.ts
import {
    pgTable,
    bigserial,
    text,
    uniqueIndex,
    index,
    check,
  } from 'drizzle-orm/pg-core';
  import { sql } from 'drizzle-orm';
  
  export const rowTags = pgTable(
    'row_tags',
    {
      id: bigserial('id', { mode: 'number' }).primaryKey(),
      name: text('name').notNull(),
      slug: text('slug').notNull(), // 서버에서 자동 생성
      type: text('type').notNull(), // 'genre' | 'mood' | 'context'
    },
    (table) => ({
      uqSlug: uniqueIndex('row_tags_slug_uq').on(table.slug),
      ixName: index('row_tags_name_idx').on(table.name),
      ckType: check('row_tags_type_ck', sql`${table.type} IN ('genre','mood','context')`),
    }),
  );
  