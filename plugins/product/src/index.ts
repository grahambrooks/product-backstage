/**
 * A Backstage plugin that provides product entity support in the frontend.
 *
 * @packageDocumentation
 */

export {
  productPlugin,
  ProductsExplorerPage,
  EntityProductAboutCard,
  EntityProductRelationsCard,
} from './plugin';
export { rootRouteRef } from './routes';
export { isLeafProduct } from './components/utils';
