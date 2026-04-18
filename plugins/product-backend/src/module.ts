import {createBackendModule} from '@backstage/backend-plugin-api';
import {catalogProcessingExtensionPoint} from '@backstage/plugin-catalog-node';
import {ProductEntitiesProcessor} from './processor';

/**
 * Module for the catalog that adds support for Product entities.
 * @public
 */
export const catalogModuleProductEntityProcessor = createBackendModule({
    pluginId: 'catalog',
    moduleId: 'product-entity-processor',
    register(env) {
        env.registerInit({
            deps: {
                catalog: catalogProcessingExtensionPoint,
            },
            async init({catalog}) {
                catalog.addProcessor(new ProductEntitiesProcessor());
            },
        });
    },
});