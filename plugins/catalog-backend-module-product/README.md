# Catalog Backend Module for Product Entities

This module adds support for Product entities to the Backstage catalog.

## Installation

```bash
# From your Backstage root directory
yarn add --cwd packages/backend @internal/plugin-catalog-backend-module-product
```

## Configuration

1. Add the module to your backend:

```typescript
// packages/backend/src/index.ts
backend.add(import('@internal/plugin-catalog-backend-module-product'));
```

2. Update your app-config.yaml to allow the Product kind:

```yaml
catalog:
  rules:
    - allow: [Component, System, API, Resource, Location, Product]
```

## Usage

You can now create Product entities in your catalog. A Product entity can be associated with components and systems.

Example:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Product
metadata:
  name: my-product
  annotations:
    backstage.io/managed-by-location: url:https://github.com/example/repo/catalog-info.yaml
    backstage.io/managed-by-origin-location: url:https://github.com/example/repo/catalog-info.yaml
spec:
  type: service
  lifecycle: experimental
  owner: team-a
  market: north-america  # Optional market attribute
  parentProduct: parent-product  # Optional reference to parent product
  childProducts:  # Optional list of child products
    - child-product-1
    - child-product-2
  components:
    - component-1
    - component-2
  systems:
    - system-1
```

This will create a Product entity that is associated with the components "component-1" and "component-2", and the system "system-1". The product belongs to the North America market, has a parent product called "parent-product", and two child products "child-product-1" and "child-product-2".

## Product Nesting

Product entities can be organized hierarchically. Use the `parentProduct` field to specify a parent product and `childProducts` to list any child products. The processor will automatically create bidirectional relationships between parent and child products with the relation types `parentOf` and `childOf`.

See the [nested products example](./examples/nested-products.yaml) for a complete demonstration of product hierarchy with multiple nesting levels.

## Market Attribute

The optional `market` attribute can be used to categorize products by geographical market or business segment. This can be useful for filtering and organizing products in the catalog.