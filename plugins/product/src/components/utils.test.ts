import { Entity } from '@backstage/catalog-model';
import {
  computeProductRoots,
  formatEntityName,
  isLeafProduct,
  summarizeDescription,
} from './utils';

const product = (
  name: string,
  spec: Record<string, unknown> = {},
  namespace?: string,
): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Product',
  metadata: { name, ...(namespace ? { namespace } : {}) },
  spec,
});

describe('summarizeDescription', () => {
  it('returns an empty string for missing input', () => {
    expect(summarizeDescription()).toBe('');
    expect(summarizeDescription('')).toBe('');
  });

  it('passes short plain text through unchanged', () => {
    expect(summarizeDescription('A simple product')).toBe('A simple product');
  });

  it('reduces markdown links and images to their text', () => {
    expect(summarizeDescription('See [the docs](https://example.com/x)')).toBe(
      'See the docs',
    );
    expect(summarizeDescription('![logo](https://example.com/logo.png)')).toBe(
      'logo',
    );
  });

  it('strips emphasis, code and heading punctuation', () => {
    expect(summarizeDescription('# **Bold** _italic_ `code`')).toBe(
      'Bold italic code',
    );
  });

  it('collapses whitespace and newlines', () => {
    expect(summarizeDescription('line one\n\n   line two')).toBe(
      'line one line two',
    );
  });

  it('truncates with an ellipsis past the max length', () => {
    const result = summarizeDescription('x'.repeat(100), 10);
    expect(result).toHaveLength(10);
    expect(result.endsWith('…')).toBe(true);
  });

  it('does not truncate text at exactly the max length', () => {
    expect(summarizeDescription('abcde', 5)).toBe('abcde');
  });
});

describe('computeProductRoots', () => {
  it('returns an empty array for no products', () => {
    expect(computeProductRoots([])).toEqual([]);
  });

  it('keeps products that have neither a parent nor are claimed as a child', () => {
    const standalone = product('standalone');
    expect(computeProductRoots([standalone])).toEqual([standalone]);
  });

  it('excludes products that declare a parentProduct', () => {
    const parent = product('platform', { childProducts: ['checkout'] });
    const child = product('checkout', { parentProduct: 'platform' });

    expect(computeProductRoots([parent, child])).toEqual([parent]);
  });

  it('excludes children declared only from the parent side', () => {
    const parent = product('platform', { childProducts: ['billing'] });
    const child = product('billing'); // no parentProduct of its own

    expect(computeProductRoots([parent, child])).toEqual([parent]);
  });

  it('keys membership on entity refs so same-named products in different namespaces do not collide', () => {
    const childInA = product('shared', { parentProduct: 'root' }, 'team-a');
    const rootInB = product('shared', {}, 'team-b');
    const root = product('root', { childProducts: ['shared'] }, 'team-a');

    const roots = computeProductRoots([childInA, rootInB, root]);

    expect(roots).toContain(rootInB);
    expect(roots).toContain(root);
    expect(roots).not.toContain(childInA);
  });

  it('falls back to all products when none qualify (e.g. a cycle)', () => {
    const a = product('a', { parentProduct: 'b' });
    const b = product('b', { parentProduct: 'a' });

    expect(computeProductRoots([a, b])).toEqual([a, b]);
  });
});

describe('existing helpers', () => {
  it('formats kebab-case names as title case', () => {
    expect(formatEntityName('my-cool-product')).toBe('My Cool Product');
  });

  it('detects leaf products', () => {
    expect(isLeafProduct(product('leaf'))).toBe(true);
    expect(isLeafProduct(product('parent', { childProducts: ['leaf'] }))).toBe(
      false,
    );
  });
});
