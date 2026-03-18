import {memo, useState, useEffect, useMemo, useCallback} from 'react';
import {
    makeStyles,
    Grid,
    Typography,
    TextField,
    InputAdornment,
    Box,
    Theme,
} from '@material-ui/core';
import {
    Content,
    ContentHeader,
    SupportButton,
    Progress,
    ErrorPanel,
    MarkdownContent,
} from '@backstage/core-components';
import {useApi} from '@backstage/core-plugin-api';
import {catalogApiRef} from '@backstage/plugin-catalog-react';
import {Entity} from '@backstage/catalog-model';
import {useNavigate} from 'react-router-dom';
import SearchIcon from '@material-ui/icons/Search';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import CategoryIcon from '@material-ui/icons/Category';
import PublicIcon from '@material-ui/icons/Public';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FilterListIcon from '@material-ui/icons/FilterList';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import {
    formatEntityName,
    getInitials,
    getEntityColor,
} from './utils';

const useStyles = makeStyles((theme: Theme) => ({
    card: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        marginBottom: theme.spacing(1),
    },
    cardContent: {
        flexGrow: 1,
    },
    cardHeader: {
        position: 'relative',
    },
    media: {
        height: 140,
        backgroundSize: 'contain',
    },
    mediaPlaceholder: {
        height: 140,
        backgroundColor: theme.palette.grey[100],
    },
    marketChip: {
        margin: theme.spacing(0.5),
    },
    starIcon: {
        fontSize: '1rem',
    },
    categoryChip: {
        margin: theme.spacing(0.5),
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.contrastText,
    },
    avatar: {
        backgroundColor: theme.palette.secondary.main,
    },
    title: {
        fontSize: '1.25rem',
        lineHeight: '1.6',
        fontWeight: 700,
        marginBottom: theme.spacing(1),
    },
    description: {
        height: '4.5em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
    },
    searchField: {
        marginBottom: theme.spacing(2),
        width: '400px',
    },
    header: {
        marginBottom: theme.spacing(2),
    },
    filterSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        marginBottom: theme.spacing(2),
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    infoSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing(1),
    },
    filterChip: {
        margin: theme.spacing(0.5),
        fontWeight: 'bold',
    },
    filterContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        margin: theme.spacing(1, 0),
    },
    filterHeading: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        marginTop: theme.spacing(1),
    },
    filterIcon: {
        marginRight: theme.spacing(1),
    },
    tagChip: {
        margin: theme.spacing(0.25),
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: theme.spacing(1),
    },
}));

const ProductCard = memo(({product}: { product: Entity }) => {
    const classes = useStyles();
    const navigate = useNavigate();

    const spec = product.spec || {};
    const market = (spec.market as string) || '';
    const type = (spec.type as string) || '';
    const lifecycle = (spec.lifecycle as string) || '';
    const imageUrl = (spec.imageUrl as string) || '';
    const tags = product.metadata.tags || [];

    const formattedTitle = formatEntityName(product.metadata.name);
    const description = product.metadata.description ?? 'No description provided';

    const handleViewDetails = useCallback(() => {
        const namespace = product.metadata.namespace ?? 'default';
        navigate(`/catalog/${namespace}/product/${product.metadata.name}`);
    }, [navigate, product.metadata.name, product.metadata.namespace]);

    return (
        <Card className={classes.card}>
            {imageUrl ? (
                <CardMedia
                    className={classes.media}
                    image={imageUrl}
                    title={formattedTitle}
                />
            ) : (
                <div className={classes.mediaPlaceholder} />
            )}
            <CardContent className={classes.cardContent}>
                <Typography
                    gutterBottom
                    variant="h5"
                    component="h2"
                    className={classes.title}
                >
                    {formattedTitle}
                </Typography>

                <div className={classes.description}>
                    <MarkdownContent content={description} dialect="gfm" />
                </div>

                <div className={classes.infoSection}>
                    <div className={classes.chips}>
                        {type && (
                            <Chip
                                size="small"
                                icon={<CategoryIcon/>}
                                label={type}
                                className={classes.categoryChip}
                            />
                        )}
                        {market && (
                            <Chip
                                size="small"
                                icon={<PublicIcon/>}
                                label={market}
                                className={classes.marketChip}
                            />
                        )}
                    </div>

                    <Chip
                        avatar={
                            <Avatar
                                className={classes.avatar}
                                style={{backgroundColor: getEntityColor(lifecycle)}}
                            >
                                {getInitials(lifecycle)}
                            </Avatar>
                        }
                        label={lifecycle}
                        variant="outlined"
                        size="small"
                    />
                </div>

                {tags.length > 0 && (
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
                )}
            </CardContent>
            <CardActions>
                <Button size="small" color="primary" onClick={handleViewDetails}>
                    View Details
                </Button>
            </CardActions>
        </Card>
    );
});

ProductCard.displayName = 'ProductCard';

/**
 * Props for the ProductsPage component.
 * @public
 */
export type ProductsPageProps = {
    title?: string;
};

/**
 * A page component that displays a filterable grid of product entities.
 * @public
 */
export const ProductsPage = ({title = 'Products'}: ProductsPageProps) => {
    const classes = useStyles();
    const catalogApi = useApi(catalogApiRef);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [products, setProducts] = useState<Entity[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedMarket, setSelectedMarket] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [availableMarkets, setAvailableMarkets] = useState<string[]>([]);
    const [availableTypes, setAvailableTypes] = useState<string[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await catalogApi.getEntities({
                    filter: {
                        kind: 'Product',
                    },
                });

                setProducts(response.items);

                // Extract unique markets and types
                const markets = new Set<string>();
                const types = new Set<string>();

                response.items.forEach(product => {
                    const spec = product.spec || {};
                    if (spec.market && typeof spec.market === 'string') {
                        markets.add(spec.market);
                    }
                    if (spec.type && typeof spec.type === 'string') {
                        types.add(spec.type);
                    }
                });

                setAvailableMarkets(Array.from(markets).sort((a, b) => a.localeCompare(b)));
                setAvailableTypes(Array.from(types).sort((a, b) => a.localeCompare(b)));
            } catch (e) {
                setError(e as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [catalogApi]);

    const filteredProducts = useMemo(() => {
        let filtered = [...products];

        // Apply search query filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(product => {
                const name = product.metadata.name.toLowerCase();
                const description = (product.metadata.description ?? '').toLowerCase();
                const type = ((product.spec as any)?.type ?? '').toLowerCase();
                const market = ((product.spec as any)?.market ?? '').toLowerCase();

                return (
                    name.includes(query) ||
                    description.includes(query) ||
                    type.includes(query) ||
                    market.includes(query)
                );
            });
        }

        // Apply market filter
        if (selectedMarket) {
            filtered = filtered.filter(product => {
                return (product.spec as any)?.market === selectedMarket;
            });
        }

        // Apply type filter
        if (selectedType) {
            filtered = filtered.filter(product => {
                return (product.spec as any)?.type === selectedType;
            });
        }

        return filtered;
    }, [searchQuery, selectedMarket, selectedType, products]);
    const memoizedProductCards = useMemo(
        () =>
            filteredProducts.map(product => (
                <Grid
                    item
                    key={product.metadata.name}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                >
                    <ProductCard product={product}/>
                </Grid>
            )),
        [filteredProducts],
    );

    // Create a dynamic title based on filters
    const dynamicTitle = useMemo(() => {
        const count = filteredProducts.length;
        const countText = `${count} ${count === 1 ? 'product' : 'products'}`;

        if (selectedMarket && selectedType) {
            return `${countText} - ${selectedType} in ${selectedMarket}`;
        } else if (selectedMarket) {
            return `${countText} in ${selectedMarket}`;
        } else if (selectedType) {
            return `${countText} - ${selectedType}`;
        } else if (searchQuery) {
            return `${countText} matching "${searchQuery}"`;
        }

        return `${countText}`;
    }, [filteredProducts.length, selectedMarket, selectedType, searchQuery]);

    if (loading) {
        return <Progress/>;
    }

    if (error) {
        return <ErrorPanel error={error}/>;
    }


    return (
        <Content>
            <ContentHeader title={title}>
                <Typography variant="h6" color="textSecondary">
                    {dynamicTitle}
                </Typography>
                <SupportButton>
                    Find and explore products across your organization.
                </SupportButton>
            </ContentHeader>

            <div className={classes.filterSection}>
                <TextField
                    className={classes.searchField}
                    variant="outlined"
                    placeholder="Search products by name, description, type or market"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon/>
                            </InputAdornment>
                        ),
                    }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    margin="dense"
                />
            </div>

            <div>
                <div className={classes.filterHeading}>
                    <FilterListIcon className={classes.filterIcon}/>
                    <Typography variant="subtitle2">Filters</Typography>
                </div>

                <Box display="flex" flexWrap="wrap" style={{ gap: '16px' }}>
                    {availableMarkets.length > 0 && (
                        <Box flex="1" minWidth={200}>
                            <Typography variant="body2" color="textSecondary">
                                Market
                            </Typography>
                            <div className={classes.filterContainer}>
                                <Chip
                                    label="All Markets"
                                    onClick={() => setSelectedMarket('')}
                                    className={classes.filterChip}
                                    style={{
                                        backgroundColor: !selectedMarket ? '#2E77D0' : undefined,
                                        color: !selectedMarket ? '#ffffff' : undefined,
                                    }}
                                    size="small"
                                />
                                {availableMarkets.map(market => (
                                    <Chip
                                        key={market}
                                        label={market}
                                        onClick={() => setSelectedMarket(market)}
                                        className={classes.filterChip}
                                        style={{
                                            backgroundColor:
                                                selectedMarket === market ? '#2E77D0' : undefined,
                                            color: selectedMarket === market ? '#ffffff' : undefined,
                                        }}
                                        size="small"
                                        icon={<PublicIcon fontSize="small"/>}
                                    />
                                ))}
                            </div>
                        </Box>
                    )}

                    {availableTypes.length > 0 && (
                        <Box flex="1" minWidth={200}>
                            <Typography variant="body2" color="textSecondary">
                                Type
                            </Typography>
                            <div className={classes.filterContainer}>
                                <Chip
                                    label="All Types"
                                    onClick={() => setSelectedType('')}
                                    className={classes.filterChip}
                                    style={{
                                        backgroundColor: !selectedType ? '#2E77D0' : undefined,
                                        color: !selectedType ? '#ffffff' : undefined,
                                    }}
                                    size="small"
                                />
                                {availableTypes.map(type => (
                                    <Chip
                                        key={type}
                                        label={type}
                                        onClick={() => setSelectedType(type)}
                                        className={classes.filterChip}
                                        style={{
                                            backgroundColor:
                                                selectedType === type ? '#2E77D0' : undefined,
                                            color: selectedType === type ? '#ffffff' : undefined,
                                        }}
                                        size="small"
                                        icon={<CategoryIcon fontSize="small"/>}
                                    />
                                ))}
                            </div>
                        </Box>
                    )}
                </Box>
            </div>

            <Grid container spacing={3}>
                {filteredProducts.length > 0 ? (
                    memoizedProductCards
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            No products found matching your search criteria.
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Content>
    );
};
