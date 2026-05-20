import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';
import { graphRouteRef, rootRouteRef } from './routes';

/**
 * The product plugin for Backstage.
 * @public
 */
export const productPlugin = createPlugin({
  id: 'product',
  routes: {
    root: rootRouteRef,
    graph: graphRouteRef,
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
 * A full-page view of the product hierarchy rendered as a graph.
 * @public
 */
export const ProductGraphPage = productPlugin.provide(
  createRoutableExtension({
    name: 'ProductGraphPage',
    component: () =>
      import('./components/ProductGraph').then(m => m.ProductGraphPage),
    mountPoint: graphRouteRef,
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

/**
 * An entity card that displays the product hierarchy as a graph, centred on
 * the current product.
 * @public
 */
export const EntityProductGraphCard = productPlugin.provide(
  createComponentExtension({
    name: 'EntityProductGraphCard',
    component: {
      lazy: () =>
        import('./components/ProductGraph').then(m => m.ProductGraphCard),
    },
  }),
);
