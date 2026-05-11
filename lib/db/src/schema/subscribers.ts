import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const subscribersTable = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  active: boolean("active").notNull().default(true),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
});

export type Subscriber = typeof subscribersTable.$inferSelect;
