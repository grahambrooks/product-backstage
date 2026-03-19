# Running with Docker Compose

The quickest way to try the Backstage Product Catalog.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Compose v2

## Quick Start

```bash
cd docker
docker compose up
```

Backstage will be available at **http://localhost:7007** once the containers are healthy.

## What's Included

- **Backstage** container (`ghcr.io/grahambrooks/product-backstage`) with the product plugins pre-installed
- **PostgreSQL 16** for the catalog database
- Example entities including product hierarchy examples
- Guest authentication enabled for immediate access

## Configuration

The `app-config.docker.yaml` file is mounted into the container and merged with the built-in configuration. Edit it to:

- Change the organization name
- Add your own catalog locations
- Configure GitHub integration (add a `GITHUB_TOKEN` environment variable)
- Switch to a real auth provider

### Adding Your Own Products

Create a YAML file with your product definitions and mount it into the container:

```yaml
# my-products.yaml
apiVersion: backstage.io/v1alpha1
kind: Product
metadata:
  name: my-product
  description: |
    Supports **markdown** descriptions.
  tags:
    - payments
spec:
  type: service
  lifecycle: production
  owner: my-team
  market: global
```

Add it to `app-config.docker.yaml`:

```yaml
catalog:
  locations:
    - type: file
      target: ./my-products.yaml
      rules:
        - allow: [Product]
```

And mount it in `docker-compose.yaml`:

```yaml
volumes:
  - ./my-products.yaml:/app/my-products.yaml:ro
```

## Stopping

```bash
docker compose down        # stop containers, keep data
docker compose down -v     # stop containers and delete database
```

## Updating

```bash
docker compose pull
docker compose up -d
```
