import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertFloor } from "@shared/routes";

// GET /api/floors
export function useFloors() {
  return useQuery({
    queryKey: [api.floors.list.path],
    queryFn: async () => {
      const res = await fetch(api.floors.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch floors");
      return api.floors.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/floors
export function useCreateFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFloor) => {
      const validated = api.floors.create.input.parse(data);
      const res = await fetch(api.floors.create.path, {
        method: api.floors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.floors.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create floor");
      }
      return api.floors.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.floors.list.path] }),
  });
}

// PUT /api/floors/:id
export function useUpdateFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertFloor>) => {
      const validated = api.floors.update.input.parse(updates);
      const url = buildUrl(api.floors.update.path, { id });
      const res = await fetch(url, {
        method: api.floors.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.floors.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) {
          throw new Error("Floor not found");
        }
        throw new Error("Failed to update floor");
      }
      return api.floors.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.floors.list.path] }),
  });
}

// DELETE /api/floors/:id
export function useDeleteFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.floors.delete.path, { id });
      const res = await fetch(url, { 
        method: api.floors.delete.method, 
        credentials: "include" 
      });
      
      if (res.status === 404) throw new Error("Floor not found");
      if (!res.ok) throw new Error("Failed to delete floor");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.floors.list.path] }),
  });
}
