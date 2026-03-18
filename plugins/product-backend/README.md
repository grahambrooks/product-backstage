# Product Backend

A Backstage backend module that adds support for Product entities to the catalog.

## Features

- Validates Product entities against a Zod schema
- Establishes catalog relationships:
  - `hasPart` relations to components and systems
  - `parentOf` / `childOf` relations for product hierarchy

## Installation

### Add the dependency

```bash
# From your Backstage root directory
yarn --cwd packages/backend add @internal/plugin-product-backend
```

### Register the module

In `packages/backend/src/index.ts`:

```typescript
backend.add(import('@internal/plugin-product-backend'));
```

### Allow the Product kind

In `app-config.yaml`:

```yaml
catalog:
  rules:
    - allow: [Component, System, API, Resource, Location, Product]
```

## Product Entity Schema

```yaml
apiVersion: backstage.io/v1alpha1
kind: Product
metadata:
  name: my-product
  description: |
    Supports **markdown** in descriptions.
  tags:
    - mobile
    - payments
spec:
  type: service           # required
  lifecycle: production   # required
  owner: team-a           # required
  market: north-america   # optional
  imageUrl: https://example.com/product.png  # optional
  parentProduct: parent-product              # optional
  childProducts:                             # optional
    - child-product-a
    - child-product-b
  components:                                # optional
    - component-1
  systems:                                   # optional
    - system-1
```

## Product Hierarchy

Products can be organized hierarchically using `parentProduct` and `childProducts` fields. The processor automatically creates bidirectional `parentOf` / `childOf` relationships.

See [examples/nested-products.yaml](./examples/nested-products.yaml) for a complete demonstration.

## Frontend

Pair this with `@internal/plugin-product` for the frontend UI. See the [frontend plugin README](../product/README.md) for details.
