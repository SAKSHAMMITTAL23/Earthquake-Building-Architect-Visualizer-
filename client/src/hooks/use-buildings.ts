import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertBuilding, type Building, type FloorProperty } from "@shared/routes";

export function useBuildings() {
  return useQuery({
    queryKey: [api.buildings.list.path],
    queryFn: async () => {
      const res = await fetch(api.buildings.list.path);
      if (!res.ok) throw new Error("Failed to fetch buildings");
      return api.buildings.list.responses[200].parse(await res.json());
    },
  });
}

export function useBuilding(id: number) {
  return useQuery({
    queryKey: [api.buildings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.buildings.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch building");
      return api.buildings.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBuilding) => {
      const res = await fetch(api.buildings.create.path, {
        method: api.buildings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create building");
      }
      return api.buildings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.buildings.list.path] });
    },
  });
}

// Default properties for a new building
export const generateDefaultProperties = (floors: number): FloorProperty[] => {
  return Array.from({ length: floors }, (_, i) => ({
    floorIndex: i,
    mass: 50000, // 50 tons per floor default
    stiffness: 80000000, // 80 MN/m default
    damping: 50000, // Damping coeff
  }));
};
