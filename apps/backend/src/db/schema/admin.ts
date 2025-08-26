import {
    pgTable,
    bigserial,
    text,
    boolean,
    timestamp,
  } from 'drizzle-orm/pg-core';
  
  export const admin = pgTable(
    'admin',
    {
      id: bigserial('id', { mode: 'number' }).primaryKey(),
  
      passwordHash: text('password_hash').notNull(),
  
      isActive: boolean('is_active').notNull().default(true),
  
      lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  
      createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
  
      updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    },
  );
  