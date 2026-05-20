import { createRouteRef } from '@backstage/core-plugin-api';

/**
 * Route reference for the product explorer page.
 * @public
 */
export const rootRouteRef = createRouteRef({
  id: 'product',
});

/**
 * Route reference for the product hierarchy graph page.
 * @public
 */
export const graphRouteRef = createRouteRef({
  id: 'product:graph',
});
