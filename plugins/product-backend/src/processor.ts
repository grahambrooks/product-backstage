import { Entity } from '@backstage/catalog-model';
import { CatalogProcessor, CatalogProcessorEmit, processingResult } from '@backstage/plugin-catalog-node';
import { productEntityV1alpha1Schema } from './schema';

/**
 * Processor that establishes relationships between products and components/systems.
 * @public
 */
export class ProductEntitiesProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'ProductEntitiesProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    if (entity.kind !== 'Product') {
      return false;
    }

    try {
      // Parse with the schema
      productEntityV1alpha1Schema.parse(entity);
      return true;
    } catch (error) {
      return false;
    }
  }

  async postProcessEntity(
    entity: Entity,
    _location: any,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    // Only process Product entities
    if (entity.kind !== 'Product') {
      return entity;
    }

    const productSpec = entity.spec as {
      components?: string[];
      systems?: string[];
      parentProduct?: string;
      childProducts?: string[];
    };

    // Establish relationships with components
    if (productSpec.components && productSpec.components.length > 0) {
      for (const componentName of productSpec.components) {
        emit(processingResult.relation({
          source: { kind: 'Product', namespace: entity.metadata.namespace || 'default', name: entity.metadata.name },
          type: 'hasPart',
          target: { kind: 'Component', namespace: entity.metadata.namespace || 'default', name: componentName },
        }));
      }
    }

    // Establish relationships with systems
    if (productSpec.systems && productSpec.systems.length > 0) {
      for (const systemName of productSpec.systems) {
        emit(processingResult.relation({
          source: { kind: 'Product', namespace: entity.metadata.namespace || 'default', name: entity.metadata.name },
          type: 'hasPart',
          target: { kind: 'System', namespace: entity.metadata.namespace || 'default', name: systemName },
        }));
      }
    }

    // Establish relationship with parent product
    if (productSpec.parentProduct) {
      emit(processingResult.relation({
        source: { kind: 'Product', namespace: entity.metadata.namespace || 'default', name: entity.metadata.name },
        type: 'childOf',
        target: { kind: 'Product', namespace: entity.metadata.namespace || 'default', name: productSpec.parentProduct },
      }));
    }

    // Establish relationships with child products
    if (productSpec.childProducts && productSpec.childProducts.length > 0) {
      for (const childProductName of productSpec.childProducts) {
        emit(processingResult.relation({
          source: { kind: 'Product', namespace: entity.metadata.namespace || 'default', name: entity.metadata.name },
          type: 'parentOf',
          target: { kind: 'Product', namespace: entity.metadata.namespace || 'default', name: childProductName },
        }));
      }
    }

    return entity;
  }
}