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
export { ProductsPage } from './components/ProductsPage';
export { ProductAboutCard, ProductRelationsCard } from './components/EntityProductCards';
export {
  formatEntityName,
  getInitials,
  isLeafProduct,
  getEntityColor,
} from './components/utils';
