import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { ArrowLeft, ArrowRight, ArrowRightIcon, ArrowRightLeft, ArrowUpDown, Bell, Check, CheckCheck, CheckSquare, CheckSquare2, ChevronRight, Filter, Lock, Menu, MenuIcon, MenuSquareIcon, MoveLeft, MoveRight, Search, SortAsc, SortAscIcon, X } from 'lucide-react-native';
import Toolbar from '../../components/ui/Toolbar';
import { useTranslation } from 'react-i18next';
import { getNumColumns, heightPixel, widthPixel } from '../../utils/fonts';
import { getRecipientMessages, setNotificationStatus } from '../../api/requests';
import Loader from '../../widgets/Loader';
import { _getHorizontalPadding, _getVerticalPadding, checkBackgroundPermission, DEVICE_HEIGHT, DEVICE_WIDTH, formatRelative, getDeviceInfo, ITEM_SPACING, noDataView, SIDE_MARGIN, sleep } from '../../utils/Helper';
import Ripple from 'react-native-material-ripple';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { showErrorMsg, showSuccessMsg, showSuccessMsgWithButton } from '../../widgets/FlashMessages';
import { fetchArchivedIncidentMessages, fetchIncidentMessages, insertIncidentMessages, markIncidentAsArchived } from '../../service/database';
import { set } from 'react-hook-form';
import SwipeToArchiveItem from '../../components/functions/SwipeToArchiveItem';
import { openSettings } from 'react-native-permissions';
import SecureStorage from '../../utils/SecureStorage';
import Constants from '../../utils/Constants';
import { getCollectionByHandle, getCollectionFilters, getFilters, getProducts, searchProducts } from '../../graphql/graph_request';
import ProductCard from '../../components/ui/ProductCard';
import VerticalCarousel from '../../components/ui/VerticalCarousel';
import BottomSheet from 'react-native-raw-bottom-sheet';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

const sortOptions = [
    { value: 'TITLE', label: 'Alphabetically (A-Z)', reverse: false },
    { value: 'TITLE', label: 'Alphabetically (Z-A)', reverse: true },
    { value: 'PRICE', label: 'Price (Low to High)', reverse: false },
    { value: 'PRICE', label: 'Price (High to Low)', reverse: true },
    { value: 'BEST_SELLING', label: 'Best Selling', reverse: false },
    // { value: 'CREATED_AT', label: 'Newest First', reverse: true },
    // { value: 'PRODUCT_TYPE', label: 'Product Type', reverse: false },
];

const NUM_COLUMNS = getNumColumns(2); // 2 on mobile, 3 on tablet


const ProductList = () => {
    const route = useRoute();
    const handle = route?.params?.handle ?? null;
    const title = route?.params?.title ?? null;

    console.log("ProductList mounted with title:", title, "and handle:", handle);
    console.log("ProductList current products length:", products?.length);

    const { colorScheme, apiCredentials, appSettings } = useSelector(state => state.app);
    const [products, setProducts] = useState([]);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const navigation = useNavigation();

    const collections = useSelector(state => state?.collections?.collections);

    const [isSearchView, setIsSearchView] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [endlessLoader, setEndLessLoader] = useState(false);
    const [selectedFilterCategory, setSelectedFilterCategory] = useState(null);
    const inputRef = useRef(null);
    const refSortRBSheet = useRef();
    const refFilterRBSheet = useRef();
    const { t } = useTranslation();
    const [hasNextPage, setHasNextPage] = useState(true);
    const [messages, setMessages] = useState([]);
    const [endCursor, setEndCursor] = useState(null);
    const [collectionTitle, setCollectionTitle] = useState("");

    const [selectedSortOption, setSelectedSortOption] = useState(sortOptions[0]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [availableFilters, setAvailableFilters] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 100000]);
    const [showAllCollections, setShowAllCollections] = useState(false);

    const translateKeys = {
        notification: t('Notifications'),
    }

    useEffect(() => {
        callApi();
    }, [handle])

    useEffect(() => {
        if (isSearchView) {
            inputRef.current?.focus();
        }


    }, [isSearchView])

    const callApi = async (loader = true, endCursor = null, searchQueryParam = null, sortKey = selectedSortOption.value, reverse = selectedSortOption.reverse) => {

        if (loader) {
            setLoading(true)
        }

        if (endCursor) {
            setEndLessLoader(true)
        }

        try {
            // Determine if we're doing a search
            const isSearching = searchQueryParam && searchQueryParam.trim().length > 0;

            console.log("callApi - isSearching:", isSearching, "searchQueryParam:", searchQueryParam);

            if (isSearching) {
                // SEARCH MODE - Use searchProducts API
                const variables = {
                    query: searchQueryParam.trim(),
                    first: 20,
                    sortKey,
                    reverse
                };
                if (endCursor) variables.after = endCursor;

                console.log("Calling searchProducts with variables:", variables);
                const response = await searchProducts(variables);
                console.log("searchProducts response:", response);

                if (endCursor) {
                    setProducts(prev => [...prev, ...response.products.edges]);
                } else {
                    setProducts(response.products.edges);
                }
                setHasNextPage(response.products.pageInfo.hasNextPage);
                setEndCursor(response.products.pageInfo.endCursor);

            } else if (handle) {
                // COLLECTION MODE - Use collection-specific API when handle is provided
                const variables = { handle, first: 20, sortKey, reverse };
                if (endCursor) variables.after = endCursor;

                // Only fetch filters on initial load (not during pagination)
                if (!endCursor) {
                    const filterResponse = await getCollectionFilters({ handle })
                    console.log("filterResponse response", filterResponse);
                    setAvailableFilters(filterResponse.collection.products.filters);
                    setSelectedFilterCategory(filterResponse.collection.products.filters[0]?.label)
                }

                const response = await getCollectionByHandle(variables);
                console.log("getCollectionByHandle response", response, variables);

                if (endCursor) {
                    setProducts(prev => [...prev, ...response.collection.products.edges]);
                } else {
                    setProducts(response.collection.products.edges);
                }

                if (response?.collection?.title) {
                    setCollectionTitle(response.collection.title);
                }
                setHasNextPage(response.collection.products.pageInfo.hasNextPage);
                setEndCursor(response.collection.products.pageInfo.endCursor);

            } else {
                // ALL PRODUCTS MODE - Use general products API when no handle is provided
                const variables = { first: 20, sortKey, reverse };
                if (endCursor) variables.after = endCursor;

                // Only fetch filters on initial load (not during pagination)
                if (!endCursor) {
                    const filterResponse = await getFilters()
                    console.log("filterResponse response", filterResponse);
                    setAvailableFilters(filterResponse.products.filters);
                    setSelectedFilterCategory(filterResponse.products.filters[0]?.label)
                }

                const response = await getProducts(variables);
                console.log("getProducts response", response, variables);

                if (endCursor) {
                    setProducts(prev => [...prev, ...response.products.edges]);
                } else {
                    setProducts(response.products.edges);
                }
                setHasNextPage(response.products.pageInfo.hasNextPage);
                setEndCursor(response.products.pageInfo.endCursor);
            }

        } catch (error) {
            console.log("ProductList API error:", error);
            console.log("Error details:", JSON.stringify(error, null, 2));
            showErrorMsg(Constants.DEFAULT_ERROR);
        } finally {
            setLoading(false)
            setEndLessLoader(false)
        }
    }


    const loadMoreProducts = () => {
        console.log("loadMoreProducts - hasNextPage:", hasNextPage, "loading:", loading, "endlessLoader:", endlessLoader);

        if (!hasNextPage || loading || endlessLoader) return;
        // Pass current search query when loading more
        callApi(false, endCursor, searchQuery, selectedSortOption.value, selectedSortOption.reverse);
    };

    const handleFilterChange = (filterId, values) => {
        console.log("filterId", filterId, 'values', values);
        setSelectedFilters(prev => ({
            ...prev,
            [filterId]: values
        }));
    };

    const applyFiltersToApi = async (filters) => {
        // Note: Filters work with collections, not with search
        // So we clear the search query when applying filters
        setSearchQuery('');
        setEndCursor(null);

        // For now, just reload the collection without filters since the filter
        // implementation needs to be handled differently in collections
        callApi(true, null, null, selectedSortOption.value, selectedSortOption.reverse);
    };

    const handleSortChange = (option) => {
        setSelectedSortOption(option);
        setEndCursor(null);
        // Preserve current search query when sorting
        callApi(true, null, searchQuery, option.value, option.reverse);
        refSortRBSheet.current.close();
    };



    const getSortBottomSheet = () => {
        return (
            <BottomSheet
                ref={refSortRBSheet}
                height={300}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)"
                    },
                    draggableIcon: {
                        backgroundColor: "#000"
                    }
                }}
            >
                <View style={localStyles.bottomSheetContent}>
                    <View style={localStyles.filterSection}>
                        <Text style={styles.text_24_reg_mainTextColor2}>Sort by</Text>
                        <TouchableOpacity onPress={() => refSortRBSheet.current.close()}>
                            <X size={24} color={colorSet.primaryTextColor} />
                        </TouchableOpacity>
                    </View>

                    <View style={localStyles.sectionTitleSeparator} />

                    {_getVerticalPadding(10)}
                    {sortOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            style={{ padding: 5 }}
                            onPress={() => handleSortChange(option)}
                        >
                            <Text style={[styles.text_14_reg_mainTextColor2, selectedSortOption.value === option.value && selectedSortOption.reverse === option.reverse && { color: colorSet?.primaryColor }]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </BottomSheet>
        );
    };

    const getFilterBottomSheet = () => {
        const selectedFilter = availableFilters.find(filter => filter.label === selectedFilterCategory);
        const isPriceFilter = selectedFilter?.id === 'filter.v.price';

        return (
            <BottomSheet
                ref={refFilterRBSheet}
                closeOnDragDown={true}
                closeOnPressMask={true}
                height={DEVICE_HEIGHT / 2}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)"
                    },
                    draggableIcon: {
                        backgroundColor: "#000"
                    }
                }}
            >
                <View style={localStyles.bottomSheetContent}>
                    <View style={localStyles.filterSection}>
                        <Text style={styles.text_24_reg_mainTextColor2}>Filter</Text>
                        <TouchableOpacity onPress={() => {
                            setSelectedFilters({});
                            setPriceRange([0, 10000]);
                        }}>
                            <Text style={[styles.text_14_semi_mainTextColor2, { textDecorationLine: 'underline' }]}>Clear All</Text>
                        </TouchableOpacity>

                    </View>


                    <View style={localStyles.sectionTitleSeparator} />

                    <View style={{ flexDirection: 'row', flex: 1, }}>
                        <View style={{ flex: 1, paddingTop: 10 }}>
                            <ScrollView>

                                {availableFilters.map((filter, index) => (
                                    <TouchableOpacity
                                        key={filter?.id || `filter-${filter?.label || index}`}
                                        style={{ padding: 5 }}
                                        onPress={() => setSelectedFilterCategory(filter.label)}
                                    >
                                        {selectedFilterCategory === filter.label && (
                                            <View style={styles.selectedFilterCategoryIndicator} />
                                        )}
                                        <Text
                                            style={[
                                                styles.text_14_reg_mainTextColor2,
                                                selectedFilterCategory === filter.label && { color: colorSet.primaryColor }
                                            ]}
                                        >
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                        </View>
                        <View style={{ flex: 1.5, borderLeftWidth: 1, paddingTop: 10, paddingLeft: 10, borderColor: '#DEDEDE' }}>
                            <ScrollView>

                                {isPriceFilter ? (
                                    <View style={{ padding: 15 }}>
                                        <Text style={[styles.text_14_semi_mainTextColor2, { marginBottom: 20 }]}>Price Range</Text>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <View style={{ width: '48%' }}>
                                                <TextInput
                                                    style={[localStyles.priceInput, styles.text_14_reg_mainTextColor2]}
                                                    placeholder="₹0"
                                                    placeholderTextColor="#A0A0A0"
                                                    keyboardType="numeric"
                                                    value={priceRange[0].toString()}
                                                    onChangeText={(text) => {
                                                        const val = parseInt(text) || 0;
                                                        if (val <= priceRange[1]) {
                                                            setPriceRange([val, priceRange[1]]);
                                                        }
                                                    }}
                                                />
                                            </View>
                                            <View style={{ width: '48%' }}>
                                                <TextInput
                                                    style={[localStyles.priceInput, styles.text_14_reg_mainTextColor2]}
                                                    placeholder="₹10000"
                                                    placeholderTextColor="#A0A0A0"
                                                    keyboardType="numeric"
                                                    value={priceRange[1].toString()}
                                                    onChangeText={(text) => {
                                                        const val = parseInt(text) || 10000;
                                                        if (val >= priceRange[0]) {
                                                            setPriceRange([priceRange[0], val]);
                                                        }
                                                    }}
                                                />
                                            </View>
                                        </View>

                                        <View style={{
                                            // alignItems: 'center',
                                            flex: 1,
                                            flewWrap: 'wrap',
                                            marginTop: 20, marginBottom: 10,
                                            //  width: 200
                                        }}>
                                            <MultiSlider
                                                values={priceRange}
                                                min={0}
                                                max={100000}
                                                step={100}

                                                sliderLength={180}
                                                onValuesChange={(values) => setPriceRange(values)}
                                                selectedStyle={{ backgroundColor: '#FF6B35' }}
                                                unselectedStyle={{ backgroundColor: '#E0E0E0' }}
                                                markerStyle={{
                                                    height: 20,
                                                    width: 20,
                                                    backgroundColor: '#FF6B35',
                                                    borderWidth: 2,
                                                    borderColor: '#FFF',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.25,
                                                    shadowRadius: 3.84,
                                                    elevation: 5
                                                }}
                                            />
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                                            <Text style={styles.text_12_reg_mainTextColor2}>₹{priceRange[0]}</Text>
                                            <Text style={styles.text_12_reg_mainTextColor2}>₹{priceRange[1]}</Text>
                                        </View>
                                    </View>
                                ) : (
                                    selectedFilter?.values.map((value, valueIndex) => {
                                        const isSelected = selectedFilters[selectedFilter.id]?.includes(value.input);
                                        return (
                                            <TouchableOpacity
                                                key={value?.id || value?.input || `${value?.label || 'opt'}-${valueIndex}`}
                                                style={{ padding: 5, flexDirection: 'row', gap: 5, alignItems: 'center' }}
                                                onPress={() => {
                                                    console.log("sldhdg", selectedFilters);

                                                    const currentValues = selectedFilters[selectedFilter.id] || [];
                                                    let newValues;
                                                    if (isSelected) {
                                                        newValues = currentValues.filter(v => v !== value.input);
                                                    } else {
                                                        newValues = [...currentValues, value.input];
                                                    }
                                                    handleFilterChange(selectedFilter.id, newValues);
                                                }}
                                            >
                                                <View style={[{
                                                    height: 16, width: 16,
                                                    borderWidth: 0.5,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }, isSelected && {
                                                    backgroundColor: colorSet.primaryColor,
                                                    borderColor: colorSet.primaryColor,
                                                }]}>
                                                    {/* <CheckSquare2 /> */}
                                                    {isSelected && <Check size={14} color={colorSet.white} />}
                                                </View>
                                                <Text style={styles.text_14_reg_mainTextColor2}>{value.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </ScrollView>

                        </View>
                    </View>
                    {/* {_getVerticalPadding(20)} */}

                    <PrimaryButton
                        title={'SHOW ITEMS'}
                        onPress={() => {
                            applyFiltersToApi();
                            refFilterRBSheet.current.close();
                        }}
                    />
                    {/* <TouchableOpacity
                        style={{
                            // position: 'absolute',
                            backgroundColor: 'red',
                            padding:w

                        }} onPress={() => {
                            applyFiltersToApi();
                            refFilterRBSheet.current.close();
                        }}>
                        <Text style={styles.applyFilterButtonText}>SHOW ITEMS</Text>
                    </TouchableOpacity> */}
                </View>
            </BottomSheet>
        );
    };

    return (
        <>
            {/* {loading && <Loader />} */}

            <Toolbar
                leftIcon={ArrowLeft}
                onLeftPress={() => navigation.goBack()}
                title={collectionTitle}
            // rightIcons={[
            //     {
            //         icon: Heart,
            //         onPress: () => setIsFavorite(!isFavorite),
            //         fill: isFavorite,
            //     },
            // ]}
            />


            {/* <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: widthPixel(8)
            }}>
                <Text style={[styles.text_12_reg_dark3_camton]}>
                    {products.length} Products
                </Text>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 5,
                    }}
                    onPress={() => setShowFilterModal(true)}
                >

                    <Filter size={20} />

                </TouchableOpacity>
            </View> */}


            <View style={{
                flex: 1,
                // paddingBottom: heightPixel(100),
                backgroundColor: colorSet.mainThemeBackgroundColor,

            }
            }>


                {
                    <FlatList
                        data={loading ? ["1", "2", "3", "4", "5", "6",] : products}
                        // renderItem={renderItem}
                        ListHeaderComponent={
                            <View>
                                {/* Search bar */}
                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: widthPixel(24),
                                    height: heightPixel(44),
                                    paddingHorizontal: widthPixel(14),
                                    marginHorizontal: SIDE_MARGIN,
                                    marginBottom: ITEM_SPACING,
                                    borderWidth: StyleSheet.hairlineWidth,
                                    borderColor: 'rgba(0,0,0,0.08)'
                                }}>
                                    <Search size={20} color={'#F2994A'} />
                                    <TextInput
                                        placeholder={'Find perfect spare part...'}
                                        placeholderTextColor={'#8E8E8E'}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onSubmitEditing={() => {
                                            setEndCursor(null);
                                            callApi(true, null, searchQuery);
                                        }}
                                        style={{ flex: 1, marginLeft: 8, color: colorSet.black }}
                                        returnKeyType="search"
                                    />
                                    {searchQuery.length > 0 && (
                                        <TouchableOpacity onPress={() => {
                                            setSearchQuery('');
                                            setEndCursor(null);
                                            callApi(true, null, '');
                                        }}>
                                            <X size={20} color={'#8E8E8E'} />
                                        </TouchableOpacity>
                                    )}
                                </View>


                                <View

                                    style={{
                                        flexDirection: 'row', gap: 8, flexWrap: 'wrap',

                                    }}
                                >
                                    {/* All button */}
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            paddingHorizontal: 8,
                                            paddingVertical: 6,
                                            backgroundColor: !handle ? '#F2994A' : '#1D1A44',
                                            borderRadius: 20,
                                            gap: 6,
                                        }}
                                        onPress={() => {
                                            navigation.navigate('ProductList', {
                                                handle: null,
                                                title: 'All Products',
                                            });
                                        }}
                                    >
                                        <Text style={[
                                            styles.text_12_reg_mainTextColor2,
                                            { color: !handle ? '#1D1A44' : '#fff' }
                                        ]}>
                                            All
                                        </Text>
                                    </TouchableOpacity>

                                    {collections
                                        ?.slice()
                                        ?.sort((a, b) => {
                                            // Sort so current collection appears first
                                            if (a.handle === handle) return -1;
                                            if (b.handle === handle) return 1;
                                            return 0;
                                        })
                                        ?.slice(0, showAllCollections ? undefined : getNumColumns(2) === 2 ? 2 : 3)
                                        ?.map((collection, index) => {
                                            const isCurrentCollection = collection.handle === handle;
                                            return (
                                                <TouchableOpacity
                                                    key={collection?.id || `collection-${index}`}
                                                    style={{
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        paddingHorizontal: 8,
                                                        paddingVertical: 6,
                                                        backgroundColor: isCurrentCollection ? '#F2994A' : '#1D1A44',
                                                        borderRadius: 20,
                                                        gap: 6,
                                                    }}
                                                    onPress={() => {
                                                        navigation.navigate('ProductList', {
                                                            handle: collection.handle,
                                                            title: collection.title,
                                                        });
                                                    }}
                                                >
                                                    <Text style={[
                                                        styles.text_12_reg_mainTextColor2,
                                                        { color: isCurrentCollection ? '#1D1A44' : '#fff' }
                                                    ]}>
                                                        {collection.title}
                                                    </Text>
                                                    {/* <ArrowRightIcon size={16} color={'#fff'} /> */}
                                                </TouchableOpacity>
                                            );
                                        })
                                    }
                                    {collections.length > 2 && (
                                        <TouchableOpacity
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                paddingHorizontal: 8,
                                                paddingVertical: 6,
                                                // backgroundColor: '#1D1A44',
                                                borderRadius: 20,
                                                gap: 6,
                                                borderWidth: 1,
                                                borderColor: '#1D1A44'
                                            }}
                                            onPress={() => setShowAllCollections(!showAllCollections)}
                                        >
                                            <Text style={[
                                                styles.text_12_reg_mainTextColor2,
                                                { color: '#1D1A44' }
                                            ]}>
                                                {showAllCollections ? 'Show Less' : 'Show More +'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>




                                {/* Category chips */}
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SIDE_MARGIN, paddingBottom: ITEM_SPACING }}>
                                    {availableFilters?.find(filter => filter.id === 'filter.p.m.custom.select_product_type')?.values?.map((item, index) => {
                                        const isSelected = selectedFilters['filter.p.m.custom.select_product_type']?.includes(item.input);
                                        const isDisabled = item?.count === 0;
                                        return (
                                            <TouchableOpacity
                                                key={item?.id || item?.input || `${item?.label || 'value'}-${index}`}
                                                style={{
                                                    paddingVertical: 8,
                                                    paddingHorizontal: 12,
                                                    marginRight: 8,
                                                    borderRadius: 20,
                                                    backgroundColor: isSelected ? '#F2994A' : '#1D1A44',
                                                    opacity: isDisabled ? 0.5 : 1,
                                                }}
                                                disabled={isDisabled}
                                                onPress={async () => {
                                                    let value = item?.input;
                                                    const currentValues = selectedFilters['filter.p.m.custom.select_product_type'] || [];
                                                    let newValues;
                                                    if (currentValues.includes(value)) {
                                                        newValues = currentValues.filter(v => v !== value);
                                                    } else {
                                                        newValues = [value];
                                                    }
                                                    const updatedFilters = {
                                                        ...selectedFilters,
                                                        'filter.p.m.custom.select_product_type': newValues
                                                    }
                                                    setSelectedFilters(updatedFilters);
                                                    applyFiltersToApi(updatedFilters);
                                                    return;
                                                }}
                                            >
                                                <Text style={{ color: isSelected ? '#fff' : '#fff' }}>{item.label}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        }
                        renderItem={({ item, index }) => (
                            <ProductCard
                                item={item}
                                index={index}
                                showColors={false}
                                disableNavigation={true}
                                showAddToCartButton={true}
                                showDetails={true}
                            />
                        )}
                        numColumns={NUM_COLUMNS}
                        keyExtractor={(item, index) => {
                            // item is either a product edge or a skeleton string during loading
                            if (typeof item === 'string') return `skeleton-${index}`;
                            const edge = item || {};
                            const nodeId = edge?.node?.id;
                            const cursor = edge?.cursor;
                            return String(nodeId || cursor || `item-${index}`);
                        }}

                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => {
                                    setSelectedFilters({});
                                    setSearchQuery('');
                                    setPriceRange([0, 10000]);
                                    setEndCursor(null);
                                    callApi();
                                }}
                            />
                        }
                        onEndReached={loadMoreProducts}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={!loading && products.length === 0 ? noDataView(colorScheme) : <View />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: SIDE_MARGIN,
                            paddingTop: ITEM_SPACING,
                            paddingBottom: ITEM_SPACING + heightPixel(100), // Adjusted padding for bottom buttons
                            flexGrow: 1,
                            backgroundColor: colorSet?.mainThemeBackgroundColor,
                        }}
                        ListFooterComponent={endlessLoader &&
                            <View style={{ height: 100, }}>
                                <ActivityIndicator size={'large'} color={colorSet?.primaryColor} />
                            </View>
                        }
                    />
                }

            </View >

            <View style={{
                position: 'absolute',
                bottom: 10,
                left: 0,
                right: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: SIDE_MARGIN,
            }}>
                <TouchableOpacity
                    onPress={() => refSortRBSheet.current.open()}
                    style={{
                        flex: 1,
                        backgroundColor: '#1D1A44',
                        paddingVertical: 12,
                        borderRadius: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}
                >
                    <ArrowUpDown color={'#fff'} size={18} />
                    <Text style={{ color: '#fff', fontWeight: '700' }}>SORT BY</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => refFilterRBSheet.current.open()}
                    style={{
                        flex: 1,
                        backgroundColor: colorSet.primaryColor,
                        paddingVertical: 12,
                        borderRadius: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8
                    }}
                >
                    <Filter color={'#fff'} size={18} />
                    <Text style={{ color: '#fff', fontWeight: '700' }}>FILTERS</Text>
                </TouchableOpacity>
            </View>

            {getSortBottomSheet()}
            {getFilterBottomSheet()}

        </>
    )
}

export default ProductList

const localStyles = StyleSheet.create({
    bottomButtonsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    bottomButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    bottomSheetContent: { flex: 1, paddingHorizontal: widthPixel(16), },
    sectionTitleSeparator: {
        height: 1, backgroundColor: '#DEDEDE',
        marginHorizontal: -widthPixel(16),
        // paddingVertical: widthPixel(8)
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 15,
    },
    bottomSheetTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    bottomSheetOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
    },
    bottomSheetOptionText: {
        fontSize: 18,
        color: '#333',
    },
    selectedOptionText: {
        color: '#dc3545',
    },
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: widthPixel(8),
        paddingBottom: widthPixel(16)
    },
    filterSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    filterOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    filterOptionText: {
        fontSize: 14,
        color: '#333',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkedCheckbox: {
        width: 12,
        height: 12,
        borderRadius: 2,
        backgroundColor: '#dc3545',
    },
    applyFilterButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    applyFilterButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    priceInput: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#FAFAFA',
    },
})