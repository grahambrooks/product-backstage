# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Backstage monorepo whose purpose is to develop and publish two plugins that add **Product** as a first-class catalog entity kind. The `packages/app` (frontend) and `packages/backend` (backend) are a host Backstage app used only to run and test the plugins locally — the shippable artifacts live in `plugins/`.

| Path | Role | Published as |
|------|------|--------------|
| `plugins/product` | Frontend plugin (explorer page, entity cards) | `@grahambrooks/plugin-product` |
| `plugins/product-backend` | Catalog backend module (validation, relations) | `@grahambrooks/plugin-product-backend` |

## Commands

Node 20 or 22 (`.nvmrc` pins v22). Package manager is yarn 4 via Corepack.

```bash
yarn install              # install deps
yarn start                # run host app (frontend + backend) for manual testing
yarn test                 # test changed packages (backstage-cli repo test)
yarn lint                 # lint changed files since origin/main
yarn tsc --project tsconfig.plugins.json --skipLibCheck   # type-check the plugins

# Work on a single plugin (note the @internal/ dev scope, see below)
yarn workspace @internal/plugin-product test
yarn workspace @internal/plugin-product-backend test
yarn workspace @internal/plugin-product lint

# Run one test file / pattern (jest passthrough)
yarn workspace @internal/plugin-product test src/components/utils.test.ts
yarn workspace @internal/plugin-product test -t "isLeafProduct"

yarn test:e2e             # Playwright end-to-end tests
```

## Package scope: `@internal/` vs `@grahambrooks/`

Both plugins are named `@internal/plugin-*` during development (this is what `yarn workspace` and the CI/release workflows reference). At publish time, `scripts/prepare-release.sh` rewrites the `@internal/` scope to `@grahambrooks/`, strips `"private": true`, sets the GitHub Packages registry, and rewrites scope references inside `dist/`. **Do not hand-edit package names to the public scope** — keep `@internal/` in source; the release script handles the rename.

Releases are tag-triggered: pushing a `v*` tag runs `.github/workflows/release.yml`, which type-checks, lints, builds, tests, runs `prepare-release.sh`, then `npm publish`es both plugins to GitHub Packages.

## How the Product entity works (backend)

The flow for a `kind: Product` entity moving through the catalog:

1. **`schema.ts`** — a zod schema (`productEntityV1alpha1Schema`) defining the entity shape. Note `spec.lifecycle`, `spec.type`, `spec.owner` etc. are plain strings, not enums — there is no allowed-value validation beyond presence and type.
2. **`processor.ts`** — `ProductEntitiesProcessor` (a `CatalogProcessor`): `validateEntityKind` parses against the zod schema; `postProcessEntity` emits catalog relations from spec fields:
   - `spec.components[]` / `spec.systems[]` → `hasPart` relations
   - `spec.parentProduct` → `childOf`, `spec.childProducts[]` → `parentOf` (hierarchy is bidirectional)
3. **`module.ts`** — `catalogModuleProductEntityProcessor`, a backend module registered against `catalogProcessingExtensionPoint`, wires the processor into the catalog. It is the package's default export.

For the Product kind to be ingested, the host app's `app-config.yaml` must list `Product` under `catalog.rules.allow`.

## Frontend plugin structure

`plugins/product/src/plugin.ts` is the extension surface. It exposes:
- `ProductsExplorerPage` — routable extension (full-page searchable/filterable product grid); heavy logic lives in `components/ProductsPage.tsx`.
- `ProductGraphPage` — routable extension (mount point `graphRouteRef`) rendering the whole hierarchy as a graph, rooted at top-level products; in `components/ProductGraph.tsx`.
- `EntityProductAboutCard` / `EntityProductRelationsCard` — component extensions for the catalog entity page, both from `components/EntityProductCards.tsx`.
- `EntityProductGraphCard` — component extension rendering the hierarchy graph centred on the current product; in `components/ProductGraph.tsx`.

The two graph views wrap `EntityRelationsGraph` from `@backstage/plugin-catalog-graph` (so they match the standard catalog graph), filtered to `Product` kind and the `parentOf`/`childOf` relations the backend processor emits. They depend on those relations being present, so a graph change usually means a `processor.ts` change too.

Pure helpers (e.g. `isLeafProduct`, `formatEntityName`) live in `components/utils.ts` and are the easiest things to unit-test in isolation. UI uses Material-UI v4.

## Conventions

- Public plugin API symbols are tagged with `@public` JSDoc and re-exported from each plugin's `src/index.ts` (the `main`/`types` entry during development).
- CI runs on Node 20 and 22; keep both working.
