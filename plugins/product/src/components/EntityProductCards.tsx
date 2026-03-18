import React from 'react';
import {
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from '@material-ui/core';
import {
  InfoCard,
  InfoCardVariants,
  Link,
  MarkdownContent,
  Progress,
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import PublicIcon from '@material-ui/icons/Public';
import BusinessIcon from '@material-ui/icons/Business';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import BuildIcon from '@material-ui/icons/Build';
import CategoryIcon from '@material-ui/icons/Category';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import { formatEntityName } from './utils';

const useStyles = makeStyles({
  links: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
    '& > li': {
      padding: '8px 0',
    },
  },
  label: {
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
    letterSpacing: '0.00714em',
    marginTop: '16px',
  },
  value: {
    fontWeight: 'bold',
    overflow: 'hidden',
    lineHeight: '24px',
    wordBreak: 'break-word',
  },
  description: {
    wordBreak: 'break-word',
  },
  tagChip: {
    margin: '2px',
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '8px',
  },
});

/**
 * Props for the ProductAboutCard component.
 * @public
 */
export type ProductAboutCardProps = {
  variant?: InfoCardVariants;
};

/**
 * An entity card that displays product details including type, lifecycle, owner, and market.
 * @public
 */
export const ProductAboutCard = ({ variant }: ProductAboutCardProps) => {
  const { entity } = useEntity();
  const classes = useStyles();

  if (!entity) {
    return <Progress />;
  }

  const {
    metadata: { name, description, tags = [] },
    spec = {},
  } = entity;

  const type = spec.type || '';
  const lifecycle = spec.lifecycle || '';
  const owner = spec.owner || '';
  const market = spec.market || '';
  const parentProduct = spec.parentProduct || '';
  const childProducts = spec.childProducts || [];

  // Generate a nicer title for the entity
  const title = formatEntityName(name);

  // Format entity references
  const getEntityRefLinks = (refs: string[]) => {
    return refs.map(ref => {
      const formattedName = formatEntityName(ref);
      return (
        <ListItem key={ref}>
          <ListItemIcon>
            <ArrowDownwardIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Link to={`/catalog/default/product/${ref}`}>{formattedName}</Link>
            }
          />
        </ListItem>
      );
    });
  };

  return (
    <InfoCard
      title={title}
      variant={variant}
    >
      <CardContent>
        {description && (
          <MarkdownContent content={description} dialect="gfm" />
        )}
        <Grid container>
          <Grid item xs={12} sm={6} md={6}>
            <div className={classes.label}>Type</div>
            <div className={classes.value}>
              <Chip
                size="small"
                label={type}
                icon={<CategoryIcon fontSize="small" />}
              />
            </div>

            <div className={classes.label}>Lifecycle</div>
            <div className={classes.value}>
              <Chip
                size="small"
                label={lifecycle}
                icon={<BuildIcon fontSize="small" />}
              />
            </div>

            {market && (
              <>
                <div className={classes.label}>Market</div>
                <div className={classes.value}>
                  <Chip
                    size="small"
                    label={market}
                    icon={<PublicIcon fontSize="small" />}
                  />
                </div>
              </>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <div className={classes.label}>Owner</div>
            <div className={classes.value}>
              <Chip
                size="small"
                label={owner}
                icon={<BusinessIcon fontSize="small" />}
              />
            </div>

            {parentProduct && (
              <>
                <div className={classes.label}>Parent Product</div>
                <div className={classes.value}>
                  <Link to={`/catalog/default/product/${parentProduct}`}>
                    {formatEntityName(parentProduct)}
                  </Link>
                </div>
              </>
            )}
          </Grid>
        </Grid>

        {tags && tags.length > 0 && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <div className={classes.label}>Tags</div>
            <div className={classes.tags}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  icon={<LocalOfferIcon fontSize="small" />}
                  variant="outlined"
                  className={classes.tagChip}
                />
              ))}
            </div>
          </>
        )}

        {childProducts.length > 0 && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            <div className={classes.label}>Child Products</div>
            <List dense className={classes.links}>
              {getEntityRefLinks(childProducts)}
            </List>
          </>
        )}
      </CardContent>
    </InfoCard>
  );
};

/**
 * An entity card that displays product hierarchy relations.
 * @public
 */
export const ProductRelationsCard = ({ variant }: { variant?: InfoCardVariants }) => {
  const { entity } = useEntity();
  const classes = useStyles();

  if (!entity || entity.kind !== 'Product') {
    return null;
  }

  const spec = entity.spec as {
    parentProduct?: string;
    childProducts?: string[];
  };

  const parentProduct = spec.parentProduct;
  const childProducts = spec.childProducts || [];

  if (!parentProduct && childProducts.length === 0) {
    return null;
  }

  return (
    <InfoCard title="Product Hierarchy" variant={variant}>
      <CardContent>
        {parentProduct && (
          <>
            <div className={classes.label}>Parent Product</div>
            <List dense className={classes.links}>
              <ListItem>
                <ListItemIcon>
                  <ArrowUpwardIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link to={`/catalog/default/product/${parentProduct}`}>
                      {formatEntityName(parentProduct)}
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </>
        )}

        {childProducts.length > 0 && (
          <>
            {parentProduct && <Divider style={{ margin: '16px 0' }} />}
            <div className={classes.label}>Child Products</div>
            <List dense className={classes.links}>
              {childProducts.map(childProduct => (
                <ListItem key={childProduct}>
                  <ListItemIcon>
                    <ArrowDownwardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Link to={`/catalog/default/product/${childProduct}`}>
                        {formatEntityName(childProduct)}
                      </Link>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </InfoCard>
  );
};
