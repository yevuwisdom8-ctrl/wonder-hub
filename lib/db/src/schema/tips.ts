import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tipsTable = pgTable("tips", {
  id: serial("id").primaryKey(),
  sport: text("sport").notNull(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  league: text("league").notNull(),
  tipText: text("tip_text").notNull(),
  odds: numeric("odds", { precision: 10, scale: 2 }).notNull(),
  confidence: integer("confidence"),
  status: text("status", { enum: ["pending", "won", "lost", "void"] }).notNull().default("pending"),
  matchDate: text("match_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertTipSchema = createInsertSchema(tipsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTip = z.infer<typeof insertTipSchema>;
export type Tip = typeof tipsTable.$inferSelect;
