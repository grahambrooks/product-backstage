# Product Plugin

A Backstage frontend plugin that provides support for Product entities.

## Features

- **ProductsExplorerPage** - A full-page product explorer with search, market and type filters
- **ProductGraphPage** - A full-page view of the entire product hierarchy rendered as a graph, rooted at top-level products
- **EntityProductAboutCard** - An entity card showing product details (type, lifecycle, owner, market, tags, hierarchy) with markdown description support
- **EntityProductRelationsCard** - An entity card showing parent/child product relationships
- **EntityProductGraphCard** - An entity card rendering the product hierarchy as a graph, centred on the current product

The graph views build on `@backstage/plugin-catalog-graph`, so they look and behave like the standard catalog relations graph. They visualize the `parentOf` / `childOf` relations emitted by the backend processor; clicking a node navigates to that product's entity page. Each node shows the product's title (`metadata.title` when supplied, otherwise a humanized name) and a short summary of its description.

## Installation

### Add the dependency

```bash
# From your Backstage root directory
yarn --cwd packages/app add @internal/plugin-product
```

### Add the explorer page

In `packages/app/src/App.tsx`:

```tsx
import { ProductsExplorerPage, ProductGraphPage } from '@internal/plugin-product';

// In your FlatRoutes:
<Route path="/products" element={<ProductsExplorerPage />} />
<Route path="/products/graph" element={<ProductGraphPage />} />
```

### Add entity page cards

In `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import {
  EntityProductAboutCard,
  EntityProductRelationsCard,
  EntityProductGraphCard,
} from '@internal/plugin-product';

// In your product entity page layout:
<Grid item md={6}>
  <EntityProductAboutCard variant="gridItem" />
</Grid>
<Grid item md={6} xs={12}>
  <EntityProductGraphCard variant="gridItem" height={400} maxDepth={2} />
</Grid>
<Grid item md={4} xs={12}>
  <EntityProductRelationsCard variant="gridItem" />
</Grid>
```

## Backend

This plugin requires `@internal/plugin-product-backend` for Product entity processing. See the [backend plugin README](../product-backend/README.md) for installation instructions.
