import { Page } from '@backstage/core-components';
import { ProductsPage } from './ProductsPage';

/**
 * A full-page product explorer component wrapped in a Backstage Page.
 * @public
 */
export const ProductsExplorerPage = () => {
  return (
    <Page themeId="home">
      <ProductsPage title="Explore Products" />
    </Page>
  );
};
