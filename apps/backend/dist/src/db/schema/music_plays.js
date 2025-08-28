"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.music_playsRelations = exports.music_plays = exports.useCaseEnum = exports.rewardCodeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const musics_1 = require("./musics");
const companies_1 = require("./companies");
const playlists_1 = require("./playlists");
exports.rewardCodeEnum = (0, pg_core_1.pgEnum)('reward_code', ['0', '1', '2', '3']);
exports.useCaseEnum = (0, pg_core_1.pgEnum)('use_case', ['0', '1', '2']);
exports.music_plays = (0, pg_core_1.pgTable)('music_plays', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    music_id: (0, pg_core_1.bigint)('music_id', { mode: 'number' }).notNull(),
    using_company_id: (0, pg_core_1.bigint)('using_company_id', { mode: 'number' }).notNull(),
    reward_amount: (0, pg_core_1.numeric)('reward_amount').notNull(),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    transaction_hash: (0, pg_core_1.text)('transaction_hash'),
    api_latency: (0, pg_core_1.integer)('api_latency'),
    reward_code: (0, exports.rewardCodeEnum)('reward_code').notNull(),
    use_case: (0, exports.useCaseEnum)('use_case').notNull(),
    use_price: (0, pg_core_1.numeric)('use_price'),
    played_at: (0, pg_core_1.timestamp)('played_at', { withTimezone: true }),
    playlist_id: (0, pg_core_1.bigint)('playlist_id', { mode: 'number' }),
    is_valid_play: (0, pg_core_1.boolean)('is_valid_play').default(true),
    play_duration_sec: (0, pg_core_1.integer)('play_duration_sec'),
});
exports.music_playsRelations = (0, drizzle_orm_1.relations)(exports.music_plays, ({ one }) => ({
    music: one(musics_1.musics, {
        fields: [exports.music_plays.music_id],
        references: [musics_1.musics.id],
    }),
    company: one(companies_1.companies, {
        fields: [exports.music_plays.using_company_id],
        references: [companies_1.companies.id],
    }),
    playlist: one(playlists_1.playlists, {
        fields: [exports.music_plays.playlist_id],
        references: [playlists_1.playlists.id],
    }),
}));
//# sourceMappingURL=music_plays.js.map