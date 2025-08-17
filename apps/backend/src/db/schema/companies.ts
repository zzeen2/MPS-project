import { pgTable, bigserial, text, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';

export const companyGrade = pgEnum('company_grade', ['free', 'standard', 'business']);

export const companies = pgTable(
  'companies',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    name: text('name').notNull(),
    businessNumber: text('business_number').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    phone: text('phone'),
    grade: companyGrade('grade').notNull().default('free'),
    ceoName: text('ceo_name'),
    profileImageUrl: text('profile_image_url'),
    homepageUrl: text('homepage_url'),
    smartAccountAddress: text('smart_account_address'),
    apiKeyHash: text('api_key_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    uqName: uniqueIndex('companies_name_uq').on(table.name),
    uqBizNum: uniqueIndex('companies_business_number_uq').on(table.businessNumber),
    uqEmail: uniqueIndex('companies_email_uq').on(table.email),
    uqSmartAccount: uniqueIndex('companies_smart_account_address_uq').on(table.smartAccountAddress),
  }),
); 