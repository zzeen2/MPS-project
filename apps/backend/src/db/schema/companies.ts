import {
  pgTable,
  bigserial,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
  numeric,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const companyGrade = pgEnum('company_grade', ['free', 'standard', 'business']);

export const subscriptionStatus = pgEnum('subscription_status', [
  'active',
  'canceled',
  'will_upgrade',
]);

export const companies = pgTable(
  'companies',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),

    name: text('name').notNull(),

    // 하이픈('-') 보존
    businessNumber: text('business_number').notNull(),

    // 대소문자 구분 필요 없으면 citext 추천(별도 마이그레이션)
    email: text('email').notNull(),

    passwordHash: text('password_hash').notNull(),

    phone: text('phone'),

    grade: companyGrade('grade').notNull().default('free'),

    ceoName: text('ceo_name'),

    profileImageUrl: text('profile_image_url'),
    homepageUrl: text('homepage_url'),

    // 선택(Nullable) UNIQUE: Postgres는 NULL은 충돌로 보지 않음
    smartAccountAddress: text('smart_account_address'),

    // MVP 단일 API 키 해시 — 충돌 방지 위해 UNIQUE
    apiKeyHash: text('api_key_hash'),

    // 월 최대 리워드 한도 (정수)
    maxRewardPerMonth: numeric('max_reward_per_month', { precision: 12, scale: 0 }),

    // 타임스탬프
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),

    // 현재 구독 상태
    subscriptionStatus: subscriptionStatus('subscription_status'),
  },
  (table) => ({
    // UNIQUE 제약
    uqName: uniqueIndex('companies_name_uq').on(table.name),
    uqBizNum: uniqueIndex('companies_business_number_uq').on(table.businessNumber),
    uqEmail: uniqueIndex('companies_email_uq').on(table.email),
    uqSmartAccount: uniqueIndex('companies_smart_account_address_uq').on(table.smartAccountAddress),
    uqApiKeyHash: uniqueIndex('companies_api_key_hash_uq').on(table.apiKeyHash),

    // 자주 조회되는 컬럼 인덱스
    ixCreatedAt: index('companies_created_at_idx').on(table.createdAt),
    ixGrade: index('companies_grade_idx').on(table.grade),
    ixSubscriptionStatus: index('companies_subscription_status_idx').on(table.subscriptionStatus),

    // 사업자번호 형식 제약(예: 000-00-00000)
    ckBizNumFormat: check(
      'companies_business_number_format_ck',
      sql`${table.businessNumber} ~ '^[0-9]{3}-[0-9]{2}-[0-9]{5}$'`,
    ),
  }),
);
