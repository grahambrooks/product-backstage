# Plugins

This workspace contains the Product plugins for Backstage.

| Plugin                                | Package                            | Description                                                          |
|---------------------------------------|------------------------------------|----------------------------------------------------------------------|
| [product](./product/)                 | `@internal/plugin-product`         | Frontend plugin providing the product explorer page and entity cards |
| [product-backend](./product-backend/) | `@internal/plugin-product-backend` | Backend module adding Product entity support to the catalog          |

## Quick Start

### Backend

```bash
yarn --cwd packages/backend add @internal/plugin-product-backend
```

```typescript
// packages/backend/src/index.ts
backend.add(import('@internal/plugin-product-backend'));
```

### Frontend

```bash
yarn --cwd packages/app add @internal/plugin-product
```

```tsx
// packages/app/src/App.tsx
import {ProductsExplorerPage} from '@internal/plugin-product';

<Route path="/products" element={<ProductsExplorerPage/>}/>
```

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import {EntityProductAboutCard, EntityProductRelationsCard} from '@internal/plugin-product';
```

See individual plugin READMEs for full installation details.
