import { pgTable, bigserial, text, integer, bigint, timestamp, numeric, uniqueIndex, primaryKey } from 'drizzle-orm/pg-core';
import { companies } from './companies';

// 음원 정보
export const musics = pgTable(
  'musics',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    title: text('title').notNull(),
    artist: text('artist'),
    lyrics: text('lyrics'),
    ownerCompanyId: bigint('owner_company_id', { mode: 'number' }).references(() => companies.id, { onDelete: 'restrict', onUpdate: 'cascade' }).notNull(),
    durationSec: integer('duration_sec'),
    coverImageUrl: text('cover_image_url'),
    streamEndpoint: text('stream_endpoint'),
    pricePerPlay: numeric('price_per_play'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
);

// 음원 카테고리
export const musicCategories = pgTable(
  'music_categories',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
  },
  (table) => ({
    uqName: uniqueIndex('music_categories_name_uq').on(table.name),
  }),
);

// 음원 카테고리 매핑
export const musicCategoryMap = pgTable(
  'music_category_map',
  {
    musicId: bigint('music_id', { mode: 'number' }).references(() => musics.id, { onDelete: 'cascade' }).notNull(),
    categoryId: bigint('category_id', { mode: 'number' }).references(() => musicCategories.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.musicId, table.categoryId], name: 'music_category_map_pk' }),
  }),
); 