import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
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
  headerStyles,
  InfoCard,
  InfoCardVariants,
  Link,
  Progress,
  WarningPanel
} from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import {
  parseEntityRef,
  stringifyEntityRef,
} from '@backstage/catalog-model';
import PublicIcon from '@material-ui/icons/Public';
import BusinessIcon from '@material-ui/icons/Business';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import BuildIcon from '@material-ui/icons/Build';
import CategoryIcon from '@material-ui/icons/Category';

// Helper function to format entity names from kebab-case to Title Case
const formatEntityName = (name: string): string => {
  return name
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

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
});

type ProductAboutCardProps = {
  variant?: InfoCardVariants;
};

export const ProductAboutCard = ({ variant }: ProductAboutCardProps) => {
  const { entity } = useEntity();
  const classes = useStyles();

  if (!entity) {
    return <Progress />;
  }

  const {
    metadata: { name, description },
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
      try {
        const parsed = parseEntityRef(ref);
        const entityName = parsed.name;
        const formattedName = formatEntityName(entityName);

        const entityRef = stringifyEntityRef(parsed);

        return (
          <ListItem key={entityRef}>
            <ListItemIcon>
              <ArrowDownwardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Link to={`/catalog/${entityRef}`}>{formattedName}</Link>
              }
            />
          </ListItem>
        );
      } catch (err) {
        return (
          <ListItem key={ref}>
            <ListItemText primary={ref} />
          </ListItem>
        );
      }
    });
  };

  return (
    <InfoCard
      title={title}
      subheader={description}
      variant={variant}
    >
      <CardContent>
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
                  <Link to={`/catalog/${stringifyEntityRef({namespace: 'default', kind: 'Product', name: parentProduct})}`}>
                    {formatEntityName(parentProduct)}
                  </Link>
                </div>
              </>
            )}
          </Grid>
        </Grid>

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
 * A card displaying product hierarchy relations
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
                    <Link to={`/catalog/${stringifyEntityRef({namespace: 'default', kind: 'Product', name: parentProduct})}`}>
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
                      <Link to={`/catalog/${stringifyEntityRef({namespace: 'default', kind: 'Product', name: childProduct})}`}>
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