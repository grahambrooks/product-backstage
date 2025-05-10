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
  components:
    - component-1
    - component-2
  systems:
    - system-1
```

This will create a Product entity that is associated with the components "component-1" and "component-2", and the system "system-1".