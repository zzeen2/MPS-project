import { pgTable, bigserial, integer, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { musics } from './musics'

export const music_embeddings = pgTable('music_embeddings', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  music_id: integer('music_id').notNull(),
  kind: text('kind'), // 임베딩 소스 구분
  model: text('model'), // 임베딩 모델명
  dim: integer('dim'), // 백터 차원 수
  embedding: text('embedding').notNull(), // 실제 백터 값 (vector 타입은 text로 저장)
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export const music_embeddingsRelations = relations(music_embeddings, ({ one }) => ({
  music: one(musics, {
    fields: [music_embeddings.music_id],
    references: [musics.id],
  }),
})) 