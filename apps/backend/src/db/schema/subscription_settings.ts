import { pgTable, bigserial, varchar, timestamp, decimal, integer } from 'drizzle-orm/pg-core'

// 구독 관련 설정
export const subscription_settings = pgTable('subscription_settings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  tier: varchar('tier', { length: 20 }).notNull(), // 'free', 'standard', 'business'
  monthly_fee: decimal('monthly_fee', { precision: 10, scale: 2 }).notNull(),
  annual_discount_rate: decimal('annual_discount_rate', { precision: 5, scale: 2 }).default('0'),
  max_api_calls_per_month: integer('max_api_calls_per_month'),
  max_rewards_per_month: integer('max_rewards_per_month'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}) 