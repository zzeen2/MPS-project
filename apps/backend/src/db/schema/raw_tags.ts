import { pgTable, bigserial, text } from 'drizzle-orm/pg-core'

export const raw_tags = pgTable('raw_tags', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  type: text('type').notNull(),
}) 