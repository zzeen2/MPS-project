"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raw_tags = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.raw_tags = (0, pg_core_1.pgTable)('raw_tags', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    slug: (0, pg_core_1.text)('slug').notNull().unique(),
    type: (0, pg_core_1.text)('type').notNull(),
});
//# sourceMappingURL=raw_tags.js.map