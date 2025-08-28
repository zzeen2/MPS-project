"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.musicsRelations = exports.musics = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const music_categories_1 = require("./music_categories");
const music_tags_1 = require("./music_tags");
const music_plays_1 = require("./music_plays");
const rewards_1 = require("./rewards");
exports.musics = (0, pg_core_1.pgTable)('musics', {
    id: (0, pg_core_1.bigserial)('id', { mode: 'number' }).primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    artist: (0, pg_core_1.text)('artist').notNull(),
    lyrics_text: (0, pg_core_1.text)('lyrics_text'),
    lyrics_file: (0, pg_core_1.text)('lyrics_file'),
    duration_sec: (0, pg_core_1.integer)('duration_sec'),
    release_date: (0, pg_core_1.date)('release_date'),
    cover_image_url: (0, pg_core_1.text)('cover_image_url'),
    stream_endpoint: (0, pg_core_1.text)('stream_endpoint'),
    price_per_play: (0, pg_core_1.numeric)('price_per_play'),
    lyrics_price: (0, pg_core_1.numeric)('lyrics_price'),
    created_at: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)('updated_at', { withTimezone: true }).defaultNow(),
    reward_amount: (0, pg_core_1.integer)('reward_amount'),
    reward_count: (0, pg_core_1.integer)('reward_count'),
    category_id: (0, pg_core_1.integer)('category_id'),
    genre: (0, pg_core_1.varchar)('genre', { length: 100 }),
    grade: (0, pg_core_1.integer)('grade').notNull().default(0),
    is_active: (0, pg_core_1.boolean)('is_active').default(true),
    play_count: (0, pg_core_1.bigint)('play_count', { mode: 'number' }).default(0),
    total_revenue: (0, pg_core_1.decimal)('total_revenue', { precision: 10, scale: 2 }).default('0'),
    last_played_at: (0, pg_core_1.timestamp)('last_played_at', { withTimezone: true }),
});
exports.musicsRelations = (0, drizzle_orm_1.relations)(exports.musics, ({ many, one }) => ({
    category: one(music_categories_1.music_categories, {
        fields: [exports.musics.category_id],
        references: [music_categories_1.music_categories.id],
    }),
    tags: many(music_tags_1.music_tags),
    plays: many(music_plays_1.music_plays),
    rewards: many(rewards_1.rewards),
}));
//# sourceMappingURL=musics.js.map