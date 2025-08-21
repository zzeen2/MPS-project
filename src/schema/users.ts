import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    age: integer('age'),
    createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
});
