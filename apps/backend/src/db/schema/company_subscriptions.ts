import { pgTable, bigserial, bigint, varchar, date, decimal, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { companies } from './companies'

export const company_subscriptions = pgTable('company_subscriptions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  company_id: bigint('company_id', { mode: 'number' }).notNull(),
  tier: varchar('tier', { length: 20 }).notNull(),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  monthly_fee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  auto_renew: boolean('auto_renew').notNull().default(true),
  payment_status: varchar('payment_status', { length: 20 }),
  total_paid_amount: decimal('total_paid_amount', { precision: 10, scale: 2 }),
  payment_count: integer('payment_count'),
  discount_amount: decimal('discount_amount', { precision: 10, scale: 2 }),
  actual_paid_amount: decimal('actual_paid_amount', { precision: 10, scale: 2 }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const company_subscriptionsRelations = relations(company_subscriptions, ({ one }) => ({
  company: one(companies, {
    fields: [company_subscriptions.company_id],
    references: [companies.id],
  }),
})) 