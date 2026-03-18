import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { rootRouteRef } from './routes';

/**
 * The product plugin for Backstage.
 * @public
 */
export const productPlugin = createPlugin({
  id: 'product',
  routes: {
    root: rootRouteRef,
  },
});

/**
 * A full-page product explorer component.
 * @public
 */
export const ProductsExplorerPage = productPlugin.provide(
  createRoutableExtension({
    name: 'ProductsExplorerPage',
    component: () =>
      import('./components/ProductsExplorerPage').then(
        m => m.ProductsExplorerPage,
      ),
    mountPoint: rootRouteRef,
  }),
);

/**
 * An entity content component that displays product details.
 * @public
 */
export const EntityProductAboutCard = productPlugin.provide(
  createRoutableExtension({
    name: 'EntityProductAboutCard',
    component: () =>
      import('./components/EntityProductCards').then(m => m.ProductAboutCard),
    mountPoint: rootRouteRef,
  }),
);

/**
 * An entity content component that displays product hierarchy relations.
 * @public
 */
export const EntityProductRelationsCard = productPlugin.provide(
  createRoutableExtension({
    name: 'EntityProductRelationsCard',
    component: () =>
      import('./components/EntityProductCards').then(
        m => m.ProductRelationsCard,
      ),
    mountPoint: rootRouteRef,
  }),
);
