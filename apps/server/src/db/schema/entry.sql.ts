import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.sql";

export const entry = pgTable("entry", {
  id: text().primaryKey(),
  title: text().notNull(),
  content: text().notNull(),
  date: timestamp().notNull(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
