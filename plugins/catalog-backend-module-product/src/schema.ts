import { z } from 'zod';

/**
 * Schema for the Product kind.
 */
export const productEntityV1alpha1Schema = z.object({
  apiVersion: z.literal('backstage.io/v1alpha1'),
  kind: z.literal('Product'),
  metadata: z.object({
    name: z.string(),
    description: z.string().optional(),
    annotations: z.record(z.string()).optional(),
    labels: z.record(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),
  spec: z.object({
    type: z.string(),
    lifecycle: z.string(),
    owner: z.string(),
    components: z.array(z.string()).optional(),
    systems: z.array(z.string()).optional(),
  }),
});

/**
 * The schema for a Product entity.
 */
export const productEntitySchemaValidator = productEntityV1alpha1Schema;

/**
 * The type for a Product entity.
 */
export type ProductEntityV1alpha1 = z.infer<typeof productEntityV1alpha1Schema>;