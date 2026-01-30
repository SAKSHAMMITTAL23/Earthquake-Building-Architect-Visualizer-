import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Store building configurations
export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  floors: integer("floors").notNull(),
  description: text("description"),
  // [{ floorIndex, mass, stiffness, damping }]
  properties: jsonb("properties").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Store simulation run history
export const simulations = pgTable("simulations", {
  id: serial("id").primaryKey(),
  buildingId: integer("building_id")
    .notNull()
    .references(() => buildings.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),

  // Input parameters
  magnitude: real("magnitude").notNull(),
  duration: real("duration").notNull(),
  soilType: text("soil_type").notNull(),

  // Results summary
  maxDrift: real("max_drift").notNull(),
  safetyScore: real("safety_score").notNull(),
  damageLevel: text("damage_level").notNull(),
  report: text("report"),
});

// === INSERT SCHEMAS ===
export const insertBuildingSchema = createInsertSchema(buildings).omit({
  id: true,
  createdAt: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  timestamp: true,
});

// === TYPES ===
export type Building = typeof buildings.$inferSelect;
export type InsertBuilding = z.infer<typeof insertBuildingSchema>;

export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;

// === JSON STRUCTURE ===
export const FloorPropertySchema = z.object({
  floorIndex: z.number(),
  mass: z.number(),
  stiffness: z.number(),
  damping: z.number().optional(),
});

export type FloorProperty = z.infer<typeof FloorPropertySchema>;
