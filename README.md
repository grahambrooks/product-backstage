# Backstage Product Plugins

Backstage plugins that add **Product** as a first-class entity kind to [Backstage](https://backstage.io). Products can
represent anything your organisation ships — services, mobile apps, SaaS offerings, platform capabilities — and can be
organised into hierarchies, linked to components and systems, and filtered by market, type, and tags.

## Plugins

| Plugin                                        | Package                                | Description                                               |
|-----------------------------------------------|----------------------------------------|-----------------------------------------------------------|
| [product](./plugins/product/)                 | `@grahambrooks/plugin-product`         | Frontend plugin — explorer page, entity cards             |
| [product-backend](./plugins/product-backend/) | `@grahambrooks/plugin-product-backend` | Backend module — entity validation, catalog relationships |

## Features

- **Product entity kind** with schema validation (type, lifecycle, owner, market, tags, imageUrl)
- **Hierarchical products** — parent/child relationships with bidirectional `parentOf` / `childOf` relations
- **Product explorer page** — searchable, filterable grid of product cards with market and type filters
- **Markdown descriptions** — full GFM markdown rendering in product cards and detail pages
- **Entity cards** — `EntityProductAboutCard` and `EntityProductRelationsCard` for the catalog entity page
- **Tags display** — tags shown on both explorer cards and entity detail page

## Quick Start

### 1. Install the backend module

```bash
yarn --cwd packages/backend add @grahambrooks/plugin-product-backend
```

```typescript
// packages/backend/src/index.ts
backend.add(import('@grahambrooks/plugin-product-backend'));
```

Allow the Product kind in `app-config.yaml`:

```yaml
catalog:
  rules:
    - allow: [ Component, System, API, Resource, Location, Product ]
```

### 2. Install the frontend plugin

```bash
yarn --cwd packages/app add @grahambrooks/plugin-product
```

Add the explorer page route:

```tsx
// packages/app/src/App.tsx
import {ProductsExplorerPage} from '@grahambrooks/plugin-product';

<Route path="/products" element={<ProductsExplorerPage/>}/>
```

Add entity cards to your product entity page:

```tsx
// packages/app/src/components/catalog/EntityPage.tsx
import {EntityProductAboutCard, EntityProductRelationsCard} from '@grahambrooks/plugin-product';

<Grid item md={6}>
    <EntityProductAboutCard variant="gridItem"/>
</Grid>
<Grid item md={4} xs={12}>
    <EntityProductRelationsCard variant="gridItem"/>
</Grid>
```

### 3. Add a product to the catalog

```yaml
apiVersion: backstage.io/v1alpha1
kind: Product
metadata:
  name: my-product
  description: |
    Supports **markdown** descriptions.
  tags:
    - mobile
spec:
  type: service
  lifecycle: production
  owner: team-a
  market: north-america
  imageUrl: https://example.com/product.png
```

See the [backend plugin README](./plugins/product-backend/README.md) for the full schema reference and hierarchy
examples.

## Development

```bash
# Install dependencies
yarn install

# Start the app (frontend + backend)
yarn start

# Type check plugins
yarn tsc --project tsconfig.plugins.json --skipLibCheck

# Lint plugins
yarn workspace @internal/plugin-product lint
yarn workspace @internal/plugin-product-backend lint

# Test plugins
yarn workspace @internal/plugin-product test
yarn workspace @internal/plugin-product-backend test

# Build plugins
yarn workspace @internal/plugin-product build
yarn workspace @internal/plugin-product-backend build
```

## Docker

A pre-built container image is published to GitHub Container Registry for both `linux/amd64` and `linux/arm64`:

```bash
docker pull ghcr.io/grahambrooks/product-backstage:latest
```

The fastest way to try it out is with Docker Compose:

```bash
cd docker
docker compose up
```

This starts Backstage with PostgreSQL and example product data at **http://localhost:7007**.

See the [Docker README](./docker/README.md) for configuration options.

## Releasing

Pushing a version tag triggers workflows that publish:

- **npm packages** to GitHub Packages under the `@grahambrooks` scope
- **Container image** to `ghcr.io/grahambrooks/product-backstage` (amd64 + arm64)

```bash
git tag v0.2.0
git push origin v0.2.0
```

Pushes to `main` also build and push the container image tagged as `latest`.

## Documentation

- [Frontend plugin README](./plugins/product/README.md) — installation, components, and usage
- [Backend plugin README](./plugins/product-backend/README.md) — schema, hierarchy, and configuration
- [Docker README](./docker/README.md) — running with Docker Compose
- [Example product entities](./plugins/product-backend/examples/nested-products.yaml) — nested product hierarchy demo

## License

Apache-2.0
