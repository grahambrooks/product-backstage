/**
 * A Backstage catalog backend module that adds support for Product entities
 *
 * @packageDocumentation
 */

export * from './module';
export * from './schema';
export * from './processor';

// This default export is required for the backend to load the module
export { catalogModuleProductEntityProcessor as default } from './module';
