import {
  createComponentExtension,
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
 * An entity card that displays product details.
 * @public
 */
export const EntityProductAboutCard = productPlugin.provide(
  createComponentExtension({
    name: 'EntityProductAboutCard',
    component: {
      lazy: () =>
        import('./components/EntityProductCards').then(m => m.ProductAboutCard),
    },
  }),
);

/**
 * An entity card that displays product hierarchy relations.
 * @public
 */
export const EntityProductRelationsCard = productPlugin.provide(
  createComponentExtension({
    name: 'EntityProductRelationsCard',
    component: {
      lazy: () =>
        import('./components/EntityProductCards').then(
          m => m.ProductRelationsCard,
        ),
    },
  }),
);
