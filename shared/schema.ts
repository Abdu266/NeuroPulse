import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const migrainePertods = pgTable("migraine_episodes", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  intensity: integer("intensity").notNull(), // 1-10 scale
  symptoms: text("symptoms").array(),
  triggers: text("triggers").array(),
  notes: text("notes"),
  isEmergency: boolean("is_emergency").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medications = pgTable("medications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  dosage: varchar("dosage").notNull(),
  frequency: varchar("frequency").notNull(), // daily, as-needed, etc.
  sideEffects: text("side_effects").array(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicationLogs = pgTable("medication_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  medicationId: integer("medication_id").references(() => medications.id),
  episodeId: integer("episode_id").references(() => migrainePertods.id),
  takenAt: timestamp("taken_at").notNull(),
  effectiveness: integer("effectiveness"), // 1-10 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const triggers = pgTable("triggers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // sleep, stress, food, weather, etc.
  correlationScore: real("correlation_score"), // 0-1 scale
  frequency: integer("frequency").default(0),
  lastOccurrence: timestamp("last_occurrence"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deviceData = pgTable("device_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  heartRate: integer("heart_rate"),
  stressLevel: varchar("stress_level"), // low, medium, high
  sleepQuality: varchar("sleep_quality"), // poor, fair, good, excellent
  timestamp: timestamp("timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const medicalReports = pgTable("medical_reports", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reportType: varchar("report_type").notNull(), // weekly, monthly, custom
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reportData: jsonb("report_data").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  migrainePertods: many(migrainePertods),
  medications: many(medications),
  medicationLogs: many(medicationLogs),
  triggers: many(triggers),
  deviceData: many(deviceData),
  medicalReports: many(medicalReports),
}));

export const migrainePertodeRelations = relations(migrainePertods, ({ one, many }) => ({
  user: one(users, {
    fields: [migrainePertods.userId],
    references: [users.id],
  }),
  medicationLogs: many(medicationLogs),
}));

export const medicationsRelations = relations(medications, ({ one, many }) => ({
  user: one(users, {
    fields: [medications.userId],
    references: [users.id],
  }),
  medicationLogs: many(medicationLogs),
}));

export const medicationLogsRelations = relations(medicationLogs, ({ one }) => ({
  user: one(users, {
    fields: [medicationLogs.userId],
    references: [users.id],
  }),
  medication: one(medications, {
    fields: [medicationLogs.medicationId],
    references: [medications.id],
  }),
  episode: one(migrainePertods, {
    fields: [medicationLogs.episodeId],
    references: [migrainePertods.id],
  }),
}));

export const triggersRelations = relations(triggers, ({ one }) => ({
  user: one(users, {
    fields: [triggers.userId],
    references: [users.id],
  }),
}));

export const deviceDataRelations = relations(deviceData, ({ one }) => ({
  user: one(users, {
    fields: [deviceData.userId],
    references: [users.id],
  }),
}));

export const medicalReportsRelations = relations(medicalReports, ({ one }) => ({
  user: one(users, {
    fields: [medicalReports.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertMigrainePeriodSchema = createInsertSchema(migrainePertods).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationSchema = createInsertSchema(medications).omit({
  id: true,
  createdAt: true,
});

export const insertMedicationLogSchema = createInsertSchema(medicationLogs).omit({
  id: true,
  createdAt: true,
});

export const insertTriggerSchema = createInsertSchema(triggers).omit({
  id: true,
  createdAt: true,
});

export const insertDeviceDataSchema = createInsertSchema(deviceData).omit({
  id: true,
  createdAt: true,
});

export const insertMedicalReportSchema = createInsertSchema(medicalReports).omit({
  id: true,
  generatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertMigrainePeriod = z.infer<typeof insertMigrainePeriodSchema>;
export type MigrainePeriod = typeof migrainePertods.$inferSelect;
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;
export type InsertMedicationLog = z.infer<typeof insertMedicationLogSchema>;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type InsertTrigger = z.infer<typeof insertTriggerSchema>;
export type Trigger = typeof triggers.$inferSelect;
export type InsertDeviceData = z.infer<typeof insertDeviceDataSchema>;
export type DeviceData = typeof deviceData.$inferSelect;
export type InsertMedicalReport = z.infer<typeof insertMedicalReportSchema>;
export type MedicalReport = typeof medicalReports.$inferSelect;
