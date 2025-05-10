import { Entity } from '@backstage/catalog-model';

/**
 * Format entity name from kebab-case to Title Case
 */
export const formatEntityName = (name: string): string => {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

/**
 * Get a placeholder image URL for a product entity
 * This creates a deterministic mapping from product name to a specific image
 */
export const getProductImageUrl = (product: Entity): string => {
  // Generate a deterministic number from the product name
  const name = product.metadata.name;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  // We'll use a set of reliable placeholder images
  const imageIds = [
    '237', '238', '239', '240', '241', '242', '243', '244', 
    '245', '246', '247', '248', '249', '250', '251', '252'
  ];
  
  // Use the hash to select a specific placeholder image
  const imageId = imageIds[Math.abs(hash) % imageIds.length];
  
  // Use picsum.photos which is more reliable than unsplash
  return `https://picsum.photos/id/${imageId}/800/200`;
};

/**
 * Get initials from an entity name or owner
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
 */
export const isLeafProduct = (product: Entity): boolean => {
  const childProducts = (product.spec as any)?.childProducts || [];
  return childProducts.length === 0;
};

/**
 * Get a color based on a string input (for consistent entity coloring)
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