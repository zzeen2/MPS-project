import { pgTable, bigserial, text, uniqueIndex, index } from "drizzle-orm/pg-core";

export const musicCategories = pgTable(
  "music_categories",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
  },
  (table) => ({
    uqName: uniqueIndex("music_categories_name_uq").on(table.name),
    ixName: index("music_categories_name_idx").on(table.name),
  })
);