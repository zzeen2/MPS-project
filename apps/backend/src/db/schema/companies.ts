import { pgTable, bigint, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

export const companyGradeEnum = pgEnum('company_grade', ['free', 'standard', 'business'])

export const companies = pgTable('companies', {
  id: bigint('id', { mode: 'number' }).primaryKey(),
  name: text('name').notNull().unique(),
  business_number: text('business_number').notNull().unique(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  phone: text('phone'),
  grade: companyGradeEnum('grade').notNull().default('free'),
  ceo_name: text('ceo_name'),
  profile_image_url: text('profile_image_url'),
  homepage_url: text('homepage_url'),
  smart_account_address: text('smart_account_address').unique(),
  api_key_hash: text('api_key_hash'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})