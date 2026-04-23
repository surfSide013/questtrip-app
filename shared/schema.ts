import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // bcrypt hash
  name: text("name").notNull(),
  role: text("role").notNull().default("player"), // "player" | "creator" | "admin"
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ─── QUESTS ──────────────────────────────────────────────────────────────────
export const quests = sqliteTable("quests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  creatorId: integer("creator_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverUrl: text("cover_url"),
  city: text("city").notNull().default(""),
  format: text("format").notNull().default("walking"), // "walking"|"detective"|"historical"|"family"
  durationMin: integer("duration_min").notNull().default(60),
  price: real("price").notNull().default(0),
  status: text("status").notNull().default("draft"), // "draft"|"pending"|"published"|"rejected"
  rating: real("rating").notNull().default(0),
  completions: integer("completions").notNull().default(0),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertQuestSchema = createInsertSchema(quests).omit({ id: true, createdAt: true, rating: true, completions: true });
export type InsertQuest = z.infer<typeof insertQuestSchema>;
export type Quest = typeof quests.$inferSelect;

// ─── LEVELS ──────────────────────────────────────────────────────────────────
// Each quest has ordered levels; each level has a task
export const levels = sqliteTable("levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questId: integer("quest_id").notNull(),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  story: text("story").notNull().default(""), // narrative text shown to player
  mediaUrl: text("media_url"),               // optional image/gif
  taskType: text("task_type").notNull().default("text"), // "text"|"choice"|"photo"
  taskQuestion: text("task_question").notNull().default(""),
  taskOptions: text("task_options"),          // JSON array for "choice" type
  taskAnswer: text("task_answer").notNull().default(""), // correct answer
  hint1: text("hint1"),
  hint2: text("hint2"),
  hint3: text("hint3"),
});

export const insertLevelSchema = createInsertSchema(levels).omit({ id: true });
export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type Level = typeof levels.$inferSelect;

// ─── PURCHASES ───────────────────────────────────────────────────────────────
export const purchases = sqliteTable("purchases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").notNull(),
  amount: real("amount").notNull(),
  status: text("status").notNull().default("completed"), // "completed"|"refunded"
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, createdAt: true });
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  questId: integer("quest_id").notNull(),
  currentLevel: integer("current_level").notNull().default(1),
  hintsUsed: text("hints_used").notNull().default("[]"), // JSON array of level ids where hints were used
  completedAt: text("completed_at"),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertProgressSchema = createInsertSchema(progress).omit({ id: true, updatedAt: true });
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;
