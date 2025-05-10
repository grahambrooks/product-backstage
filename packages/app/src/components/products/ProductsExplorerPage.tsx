import { Page } from '@backstage/core-components';
import { ProductsPage } from './ProductsPage';

export const ProductsExplorerPage = () => {
  return (
    <Page themeId="home">
      <ProductsPage title="Explore Products" />
    </Page>
  );
};