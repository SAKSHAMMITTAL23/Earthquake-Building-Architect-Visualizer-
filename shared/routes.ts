
import { z } from 'zod';
import { insertBuildingSchema, insertSimulationSchema, buildings, simulations } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  buildings: {
    list: {
      method: 'GET' as const,
      path: '/api/buildings',
      responses: {
        200: z.array(z.custom<typeof buildings.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/buildings/:id',
      responses: {
        200: z.custom<typeof buildings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/buildings',
      input: insertBuildingSchema,
      responses: {
        201: z.custom<typeof buildings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  simulations: {
    list: {
      method: 'GET' as const,
      path: '/api/simulations',
      responses: {
        200: z.array(z.custom<typeof simulations.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/simulations',
      input: insertSimulationSchema,
      responses: {
        201: z.custom<typeof simulations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
