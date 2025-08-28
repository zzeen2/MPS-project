import {
    pgTable,
    bigserial,
    bigint,
    text,
    uniqueIndex,
  } from 'drizzle-orm/pg-core';
  import { companies } from './companies';
  
  export const businessNumbers = pgTable(
    'business_numbers',
    {
      id: bigserial('id', { mode: 'number' }).primaryKey(),
  
      companyId: bigint('company_id', { mode: 'number' })
        .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
  
      number: text('number').notNull(),
    },
    (table) => ({
      uqCompanyNumber: uniqueIndex('business_numbers_company_id_number_uq').on(
        table.companyId,
        table.number,
      ),
    }),
  );
  