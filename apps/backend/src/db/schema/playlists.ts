import { pgTable, bigserial, text, bigint, timestamp } from 'drizzle-orm/pg-core';
import { companies } from './companies';

export const playlists = pgTable('playlists', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  companyId: bigint('company_id', { mode: 'number' }).references(() => companies.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}); 