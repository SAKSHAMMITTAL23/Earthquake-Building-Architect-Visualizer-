
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Buildings API ===
  app.get(api.buildings.list.path, async (req, res) => {
    const buildings = await storage.getBuildings();
    res.json(buildings);
  });

  app.get(api.buildings.get.path, async (req, res) => {
    const building = await storage.getBuilding(Number(req.params.id));
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    res.json(building);
  });

  app.post(api.buildings.create.path, async (req, res) => {
    try {
      const input = api.buildings.create.input.parse(req.body);
      const building = await storage.createBuilding(input);
      res.status(201).json(building);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // === Simulations API ===
  app.get(api.simulations.list.path, async (req, res) => {
    const simulations = await storage.getSimulations();
    res.json(simulations);
  });

  app.post(api.simulations.create.path, async (req, res) => {
    try {
      const input = api.simulations.create.input.parse(req.body);
      const simulation = await storage.createSimulation(input);
      res.status(201).json(simulation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed default building if none exists
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const buildings = await storage.getBuildings();
  if (buildings.length === 0) {
    console.log("Seeding default 5-storey building...");
    await storage.createBuilding({
      name: "Default 5-Storey Frame",
      floors: 5,
      description: "Standard reinforced concrete frame structure for simulation benchmarks.",
      properties: [
        { floorIndex: 0, mass: 50000, stiffness: 8000000, damping: 20000 },
        { floorIndex: 1, mass: 48000, stiffness: 7500000, damping: 18000 },
        { floorIndex: 2, mass: 46000, stiffness: 7000000, damping: 16000 },
        { floorIndex: 3, mass: 44000, stiffness: 6500000, damping: 14000 },
        { floorIndex: 4, mass: 40000, stiffness: 6000000, damping: 12000 },
      ]
    });
  }
}
