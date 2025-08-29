"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscription_settings = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.subscription_settings = (0, pg_core_1.pgTable)('subscription_settings', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    tier: (0, pg_core_1.varchar)('tier', { length: 20 }).notNull(),
    monthly_fee: (0, pg_core_1.decimal)('monthly_fee', { precision: 10, scale: 2 }).notNull(),
    annual_discount_rate: (0, pg_core_1.decimal)('annual_discount_rate', { precision: 5, scale: 2 }).default('0'),
    max_api_calls_per_month: (0, pg_core_1.integer)('max_api_calls_per_month'),
    max_rewards_per_month: (0, pg_core_1.integer)('max_rewards_per_month'),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
//# sourceMappingURL=subscription_settings.js.map