
import { db } from "./db";
import {
  buildings,
  simulations,
  type InsertBuilding,
  type InsertSimulation,
  type Building,
  type Simulation
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Buildings
  getBuildings(): Promise<Building[]>;
  getBuilding(id: number): Promise<Building | undefined>;
  createBuilding(building: InsertBuilding): Promise<Building>;
  
  // Simulations
  getSimulations(): Promise<Simulation[]>;
  createSimulation(simulation: InsertSimulation): Promise<Simulation>;
}

export class DatabaseStorage implements IStorage {
  // Buildings
  async getBuildings(): Promise<Building[]> {
    return await db.select().from(buildings);
  }

  async getBuilding(id: number): Promise<Building | undefined> {
    const [building] = await db.select().from(buildings).where(eq(buildings.id, id));
    return building;
  }

  async createBuilding(insertBuilding: InsertBuilding): Promise<Building> {
    const [building] = await db.insert(buildings).values(insertBuilding).returning();
    return building;
  }

  // Simulations
  async getSimulations(): Promise<Simulation[]> {
    return await db.select().from(simulations).orderBy(desc(simulations.timestamp));
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<Simulation> {
    const [simulation] = await db.insert(simulations).values(insertSimulation).returning();
    return simulation;
  }
}

export const storage = new DatabaseStorage();
