# Product Plugin

A Backstage frontend plugin that provides support for Product entities.

## Features

- **ProductsExplorerPage** - A full-page product explorer with search, market and type filters
- **EntityProductAboutCard** - An entity card showing product details (type, lifecycle, owner, market, tags, hierarchy) with markdown description support
- **EntityProductRelationsCard** - An entity card showing parent/child product relationships

## Installation

### Add the dependency

```bash
# From your Backstage root directory
yarn --cwd packages/app add @internal/plugin-product
```

### Add the explorer page

In `packages/app/src/App.tsx`:

```tsx
import { ProductsExplorerPage } from '@internal/plugin-product';

// In your FlatRoutes:
<Route path="/products" element={<ProductsExplorerPage />} />
```

### Add entity page cards

In `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityProductAboutCard, EntityProductRelationsCard } from '@internal/plugin-product';

// In your product entity page layout:
<Grid item md={6}>
  <EntityProductAboutCard variant="gridItem" />
</Grid>
<Grid item md={4} xs={12}>
  <EntityProductRelationsCard variant="gridItem" />
</Grid>
```

## Backend

This plugin requires `@internal/plugin-product-backend` for Product entity processing. See the [backend plugin README](../product-backend/README.md) for installation instructions.
