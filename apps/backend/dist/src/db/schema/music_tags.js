"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.music_tagsRelations = exports.music_tags = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const musics_1 = require("./musics");
exports.music_tags = (0, pg_core_1.pgTable)('music_tags', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    music_id: (0, pg_core_1.integer)('music_id').notNull(),
    text: (0, pg_core_1.text)('text').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
});
exports.music_tagsRelations = (0, drizzle_orm_1.relations)(exports.music_tags, ({ one }) => ({
    music: one(musics_1.musics, {
        fields: [exports.music_tags.music_id],
        references: [musics_1.musics.id],
    }),
}));
//# sourceMappingURL=music_tags.js.map