import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSimulation } from "@shared/routes";

export function useSimulations() {
  return useQuery({
    queryKey: [api.simulations.list.path],
    queryFn: async () => {
      const res = await fetch(api.simulations.list.path);
      if (!res.ok) throw new Error("Failed to fetch simulations");
      return api.simulations.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSimulation) => {
      const res = await fetch(api.simulations.create.path, {
        method: api.simulations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to save simulation results");
      }
      return api.simulations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.simulations.list.path] });
    },
  });
}
