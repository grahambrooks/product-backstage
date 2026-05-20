import { Entity, stringifyEntityRef } from '@backstage/catalog-model';

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

/**
 * Reduce a (possibly markdown) entity description to a single, length-capped
 * line suitable for an SVG graph node, which cannot wrap text on its own.
 * @public
 */
export const summarizeDescription = (
  description?: string,
  maxLength = 60,
): string => {
  if (!description) {
    return '';
  }
  const plain = description
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // markdown links/images -> their text
    .replace(/[*_`#>]/g, '') // drop remaining emphasis/heading punctuation
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLength
    ? `${plain.slice(0, maxLength - 1).trimEnd()}…`
    : plain;
};

/**
 * Given all product entities, return those that are roots of the hierarchy —
 * i.e. products that neither declare a `spec.parentProduct` nor are listed in
 * another product's `spec.childProducts`. Membership is keyed on entity refs
 * so products that share a name across namespaces don't collide.
 *
 * Falls back to returning every product when none qualify (e.g. parent/child
 * wiring is incomplete or forms a cycle), so the graph is never empty.
 * @public
 */
export const computeProductRoots = (products: Entity[]): Entity[] => {
  // Refs of products that are declared as a child from the parent side.
  const declaredChildren = new Set<string>();
  for (const product of products) {
    const childProducts =
      (product.spec as { childProducts?: string[] } | undefined)
        ?.childProducts ?? [];
    const namespace = product.metadata.namespace ?? 'default';
    for (const child of childProducts) {
      declaredChildren.add(
        stringifyEntityRef({ kind: 'Product', namespace, name: child }),
      );
    }
  }

  const roots = products.filter(product => {
    const hasParent = !!(product.spec as { parentProduct?: string } | undefined)
      ?.parentProduct;
    return !hasParent && !declaredChildren.has(stringifyEntityRef(product));
  });

  return roots.length > 0 ? roots : products;
};
