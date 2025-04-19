import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.sql";

export const entry = pgTable("entry", {
  id: uuid().primaryKey().defaultRandom(),
  rating: integer().notNull(),
  notes: text(),
  date: timestamp({ mode: "date" }).notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
