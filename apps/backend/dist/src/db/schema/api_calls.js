"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api_callsRelations = exports.api_calls = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const companies_1 = require("./companies");
exports.api_calls = (0, pg_core_1.pgTable)('api_calls', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' }).notNull(),
    endpoint: (0, pg_core_1.varchar)('endpoint', { length: 255 }).notNull(),
    status_code: (0, pg_core_1.integer)('status_code'),
    response_time_ms: (0, pg_core_1.integer)('response_time_ms'),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.api_callsRelations = (0, drizzle_orm_1.relations)(exports.api_calls, ({ one }) => ({
    company: one(companies_1.companies, {
        fields: [exports.api_calls.company_id],
        references: [companies_1.companies.id],
    }),
}));
//# sourceMappingURL=api_calls.js.map