import { Entity } from '@backstage/catalog-model';

/**
 * Format entity name from kebab-case to Title Case
 * @public
 */
export const formatEntityName = (name: string): string => {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Get initials from an entity name or owner
 * @public
 */
export const getInitials = (name: string): string => {
  return name
    .split(/[ -]/)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Determine if a product is a leaf product (has no children)
 * @public
 */
export const isLeafProduct = (product: Entity): boolean => {
  const childProducts = (product.spec as any)?.childProducts || [];
  return childProducts.length === 0;
};

/**
 * Get a color based on a string input (for consistent entity coloring)
 * @public
 */
export const getEntityColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a hue between 0 and 360
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};
