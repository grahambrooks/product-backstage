/**
 * A Backstage plugin that provides product entity support in the frontend.
 *
 * @packageDocumentation
 */

export {
  productPlugin,
  ProductsExplorerPage,
  ProductGraphPage,
  EntityProductAboutCard,
  EntityProductRelationsCard,
  EntityProductGraphCard,
} from './plugin';
export type {
  ProductGraphPageProps,
  ProductGraphCardProps,
} from './components/ProductGraph';
export { graphRouteRef, rootRouteRef } from './routes';
export { isLeafProduct } from './components/utils';
