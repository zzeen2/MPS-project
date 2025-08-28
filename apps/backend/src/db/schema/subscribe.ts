import {
    pgTable,
    bigserial,
    bigint,
    integer,
    numeric,
    timestamp,
    uniqueIndex,
  } from 'drizzle-orm/pg-core';
  import { companies } from './companies';
  
  export const subscribe = pgTable(
    'subscribe',
    {
      id: bigserial('id', { mode: 'number' }).primaryKey(),
  
      companyId: bigint('company_id', { mode: 'number' })
        .references(() => companies.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
  
      // 등급 (0: free, 1: standard, 2: business)
      grade: integer('grade').notNull().default(0),
  
      // 구독 시작 / 종료일
      startDate: timestamp('start_date', { withTimezone: true }).notNull(),
      endDate: timestamp('end_date', { withTimezone: true }),
  
      // 월 요금 / 월간 리워드 한도 / 할인율
      monthlyFee: numeric('monthly_fee', { precision: 12, scale: 0 }),
      maxPlaysPerMonth: integer('max_plays_per_month'),
      discountRate: numeric('discount_rate', { precision: 5, scale: 2 }), // 예: 15.25 (%)
  
    },
    (table) => ({
      // 기업별 구독은 하나만 존재해야 하므로 유니크 제약
      uqCompany: uniqueIndex('subscribe_company_id_uq').on(table.companyId),
    }),
  );
  