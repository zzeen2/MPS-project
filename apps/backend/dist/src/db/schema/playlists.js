"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playlistsRelations = exports.playlists = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const companies_1 = require("./companies");
const musics_1 = require("./musics");
exports.playlists = (0, pg_core_1.pgTable)('playlists', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    company_id: (0, pg_core_1.bigint)('company_id', { mode: 'number' }).notNull(),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' }).notNull(),
    name: (0, pg_core_1.text)('name').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
});
exports.playlistsRelations = (0, drizzle_orm_1.relations)(exports.playlists, ({ one }) => ({
    company: one(companies_1.companies, {
        fields: [exports.playlists.company_id],
        references: [companies_1.companies.id],
    }),
    music: one(musics_1.musics, {
        fields: [exports.playlists.music_id],
        references: [musics_1.musics.id],
    }),
}));
//# sourceMappingURL=playlists.js.map