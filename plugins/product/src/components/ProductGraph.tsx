import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react';
import { makeStyles, Theme } from '@material-ui/core';
import {
  Content,
  ContentHeader,
  SupportButton,
  Progress,
  ErrorPanel,
  InfoCard,
  InfoCardVariants,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  entityRouteRef,
  useEntity,
} from '@backstage/plugin-catalog-react';
import {
  Entity,
  CompoundEntityRef,
  getCompoundEntityRef,
  RELATION_PARENT_OF,
  RELATION_CHILD_OF,
} from '@backstage/catalog-model';
import {
  EntityRelationsGraph,
  EntityRelationsGraphProps,
  EntityNode,
  Direction,
} from '@backstage/plugin-catalog-graph';
import { useNavigate } from 'react-router-dom';
import {
  computeProductRoots,
  formatEntityName,
  summarizeDescription,
} from './utils';

/**
 * Relations that make up the product hierarchy. These are emitted by the
 * backend ProductEntitiesProcessor from `spec.parentProduct` /
 * `spec.childProducts`.
 */
const HIERARCHY_RELATIONS = [RELATION_PARENT_OF, RELATION_CHILD_OF];

const useStyles = makeStyles((theme: Theme) => ({
  graphContainer: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
  },
  graph: {
    flex: 1,
    minHeight: 0,
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
}));

const useNodeStyles = makeStyles(
  theme => ({
    node: {
      fill: theme.palette.grey[300],
      stroke: theme.palette.grey[300],
      '&.primary': {
        fill: theme.palette.primary.light,
        stroke: theme.palette.primary.light,
      },
      '&.secondary': {
        fill: theme.palette.secondary.light,
        stroke: theme.palette.secondary.light,
      },
    },
    title: {
      fill: theme.palette.getContrastText(theme.palette.grey[300]),
      fontSize: 14,
      '&.primary': { fill: theme.palette.primary.contrastText },
      '&.secondary': { fill: theme.palette.secondary.contrastText },
      '&.focused': { fontWeight: 'bold' },
    },
    description: {
      fill: theme.palette.getContrastText(theme.palette.grey[300]),
      fontSize: 11,
      opacity: 0.75,
      '&.primary': { fill: theme.palette.primary.contrastText },
      '&.secondary': { fill: theme.palette.secondary.contrastText },
    },
    clickable: {
      cursor: 'pointer',
    },
  }),
  { name: 'PluginProductGraphNode' },
);

const NODE_PADDING = 12;
const TITLE_FONT_SIZE = 14;
const DESC_FONT_SIZE = 11;
const LINE_GAP = 6;

const cls = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).join(' ');

/**
 * Custom graph node that renders the product's title (from `metadata.title`
 * when supplied, otherwise a humanized name) and a short description summary.
 * The node measures its rendered text so the surrounding box fits the content.
 */
const ProductGraphNode = ({ node }: { node: EntityNode }) => {
  const classes = useNodeStyles();
  const { entity, color = 'default', focused, onClick } = node;
  const textRef = useRef<SVGGElement>(null);
  const [width, setWidth] = useState(0);

  const title =
    (entity.metadata.title as string | undefined) ||
    formatEntityName(entity.metadata.name);
  const summary = summarizeDescription(entity.metadata.description);

  useLayoutEffect(() => {
    if (textRef.current) {
      const measured = Math.round(textRef.current.getBBox().width);
      if (measured !== width) {
        setWidth(measured);
      }
    }
  }, [width, title, summary]);

  const titleY = NODE_PADDING + TITLE_FONT_SIZE;
  const descY = titleY + LINE_GAP + DESC_FONT_SIZE;
  const height = (summary ? descY : titleY) + NODE_PADDING;
  const paddedWidth = width + NODE_PADDING * 2;
  const colorClass = color === 'primary' || color === 'secondary' ? color : '';

  return (
    <g onClick={onClick} className={cls(onClick && classes.clickable)}>
      <rect
        className={cls(classes.node, colorClass)}
        width={paddedWidth}
        height={height}
        rx={10}
      />
      <g ref={textRef}>
        <text
          className={cls(classes.title, colorClass, focused && 'focused')}
          x={NODE_PADDING}
          y={titleY}
        >
          {title}
        </text>
        {summary && (
          <text
            className={cls(classes.description, colorClass)}
            x={NODE_PADDING}
            y={descY}
          >
            {summary}
          </text>
        )}
      </g>
      <title>{entity.metadata.name}</title>
    </g>
  );
};

const renderProductNode = (props: { node: EntityNode }) => (
  <ProductGraphNode {...props} />
);

/**
 * Graph configuration shared by the full-page and entity-card views, so the
 * two stay visually and behaviourally in sync. Per-instance props
 * (`rootEntityNames`, `maxDepth`, `onNodeClick`, `className`) are supplied at
 * the call site.
 */
const SHARED_GRAPH_PROPS: Partial<EntityRelationsGraphProps> = {
  kinds: ['Product'],
  relations: HIERARCHY_RELATIONS,
  mergeRelations: true,
  unidirectional: true,
  direction: Direction.TOP_BOTTOM,
  renderNode: renderProductNode,
  zoom: 'enable-on-click',
};

/**
 * Navigate to a product's catalog entity page when its node is clicked,
 * mirroring the behaviour of the standard catalog graph.
 */
const useNodeNavigation = () => {
  const navigate = useNavigate();
  const entityRoute = useRouteRef(entityRouteRef);
  return useCallback(
    (node: EntityNode) => {
      const { kind, metadata } = node.entity;
      navigate(
        entityRoute({
          kind: kind.toLocaleLowerCase('en-US'),
          namespace: (metadata.namespace ?? 'default').toLocaleLowerCase(
            'en-US',
          ),
          name: metadata.name,
        }),
      );
    },
    [navigate, entityRoute],
  );
};

/**
 * Props for the ProductGraphPage component.
 * @public
 */
export type ProductGraphPageProps = {
  title?: string;
  /** Maximum relation depth to traverse from the root products. */
  maxDepth?: number;
};

/**
 * A full-page view that renders the entire product hierarchy as a graph,
 * rooted at top-level products (those without a parent product).
 *
 * @public
 */
export const ProductGraphPage = ({
  title = 'Product Hierarchy',
  maxDepth = Number.POSITIVE_INFINITY,
}: ProductGraphPageProps) => {
  const classes = useStyles();
  const catalogApi = useApi(catalogApiRef);
  const onNodeClick = useNodeNavigation();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [products, setProducts] = useState<Entity[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Only the fields needed to compute hierarchy roots — the graph
        // component fetches the entities it renders separately.
        const response = await catalogApi.getEntities({
          filter: { kind: 'Product' },
          fields: [
            'kind',
            'metadata.name',
            'metadata.namespace',
            'spec.parentProduct',
            'spec.childProducts',
          ],
        });
        setProducts(response.items);
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [catalogApi]);

  // Render the graph from every hierarchy root, so the full tree (plus any
  // standalone products) is surfaced in a single view.
  const rootEntityNames = useMemo<CompoundEntityRef[]>(
    () => computeProductRoots(products).map(getCompoundEntityRef),
    [products],
  );

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ErrorPanel error={error} />;
  }

  return (
    <Content>
      <ContentHeader title={title}>
        <SupportButton>
          Explore how products relate to one another across the organization.
        </SupportButton>
      </ContentHeader>

      {rootEntityNames.length === 0 ? (
        <div className={classes.emptyState}>No products found.</div>
      ) : (
        <div className={classes.graphContainer}>
          <EntityRelationsGraph
            {...SHARED_GRAPH_PROPS}
            className={classes.graph}
            rootEntityNames={rootEntityNames}
            maxDepth={maxDepth}
            onNodeClick={onNodeClick}
          />
        </div>
      )}
    </Content>
  );
};

/**
 * Props for the ProductGraphCard component.
 * @public
 */
export type ProductGraphCardProps = {
  variant?: InfoCardVariants;
  title?: string;
  /** Pixel height of the embedded graph. */
  height?: number;
  /** Maximum relation depth to traverse from the current product. */
  maxDepth?: number;
};

/**
 * An entity card that renders the product hierarchy graph centred on the
 * current product, in the style of the standard catalog graph card.
 *
 * @public
 */
export const ProductGraphCard = ({
  variant,
  title = 'Product Hierarchy Graph',
  height = 400,
  maxDepth = 1,
}: ProductGraphCardProps) => {
  const { entity } = useEntity();
  const onNodeClick = useNodeNavigation();

  if (!entity || entity.kind !== 'Product') {
    return null;
  }

  return (
    <InfoCard title={title} variant={variant} noPadding>
      <div style={{ height }}>
        <EntityRelationsGraph
          {...SHARED_GRAPH_PROPS}
          rootEntityNames={getCompoundEntityRef(entity)}
          maxDepth={maxDepth}
          onNodeClick={onNodeClick}
        />
      </div>
    </InfoCard>
  );
};
