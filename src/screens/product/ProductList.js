import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { ArrowLeft, ArrowRight, ArrowRightIcon, ArrowRightLeft, Bell, Check, CheckCheck, CheckSquare, CheckSquare2, ChevronRight, Filter, Lock, Menu, MenuIcon, MenuSquareIcon, MoveLeft, MoveRight, Search, SortAsc, SortAscIcon, X } from 'lucide-react-native';
import Toolbar from '../../components/ui/Toolbar';
import { useTranslation } from 'react-i18next';
import { heightPixel, widthPixel } from '../../utils/fonts';
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
import { getCollectionByHandle, getCollectionFilters, getFilters, getProducts } from '../../graphql/graph_request';
import ProductCard from '../../components/ui/ProductCard';
import VerticalCarousel from '../../components/ui/VerticalCarousel';
import BottomSheet from 'react-native-raw-bottom-sheet';
import { PrimaryButton } from '../../components/ui/PrimaryButton';

const sortOptions = [
    { value: 'TITLE', label: 'Alphabetically (A-Z)', reverse: false },
    { value: 'TITLE', label: 'Alphabetically (Z-A)', reverse: true },
    { value: 'PRICE', label: 'Price (Low to High)', reverse: false },
    { value: 'PRICE', label: 'Price (High to Low)', reverse: true },
    { value: 'BEST_SELLING', label: 'Best Selling', reverse: false },
    { value: 'CREATED_AT', label: 'Newest First', reverse: true },
    { value: 'PRODUCT_TYPE', label: 'Product Type', reverse: false },
];

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
    const [isSearchView, setIsSearchView] = useState(false);
    const [colorSearchQuery, setColorSearchQuery] = useState('');
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

    const [selectedSortOption, setSelectedSortOption] = useState(sortOptions[0]);
    const [selectedFilters, setSelectedFilters] = useState({});
    const [availableFilters, setAvailableFilters] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);

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

    const callApi = async (loader = true, endCursor = null, query, sortKey = selectedSortOption.value, reverse = selectedSortOption.reverse) => {

        if (loader) {
            setLoading(true)
        }

        if (endCursor) {
            setEndLessLoader(true)
        }

        try {

            if (handle) {
                // Use collection-specific API when handle is provided
                const variables = { handle, first: 20 };
                if (endCursor) variables.after = endCursor;

                const filterResponse = await getCollectionFilters({ handle })
                console.log("filterResponse response", filterResponse);
                setAvailableFilters(filterResponse.collection.products.filters);
                setSelectedFilterCategory(filterResponse.collection.products.filters[0]?.label)

                const response = await getCollectionByHandle(variables);
                console.log("getCollectionByHandle response", response, variables);

                if (endCursor) {
                    // Append new products for pagination
                    setProducts(prev => [...prev, ...response.collection.products.edges]);
                } else {
                    // Initial load
                    setProducts(response.collection.products.edges);
                }
                setHasNextPage(response.collection.products.pageInfo.hasNextPage);
                setEndCursor(response.collection.products.pageInfo.endCursor);

            } else {
                // Use general products API when no handle is provided
                const variables = { first: 20, sortKey, reverse };
                if (endCursor) variables.after = endCursor;
                if (query) variables.query = query;

                const filterResponse = await getFilters()
                console.log("filterResponse response", filterResponse);
                setAvailableFilters(filterResponse.products.filters);
                setSelectedFilterCategory(filterResponse.products.filters[0]?.label)

                const response = await getProducts(variables);
                console.log("getProducts response", response, variables);

                if (endCursor) {
                    // Append new products for pagination
                    setProducts(prev => [...prev, ...response.products.edges]);
                } else {
                    // Initial load
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
        console.log("newPAge", hasNextPage);

        if (!hasNextPage) return;
        callApi(false, endCursor);
    };

    const handleFilterChange = (filterId, values) => {
        console.log("filterId", filterId, 'values', values);
        setSelectedFilters(prev => ({
            ...prev,
            [filterId]: values
        }));
    };

    const applyFiltersToApi = async (filters) => {

        const filtersToSend = filters ?? selectedFilters;
        // Build query from selected filters
        let query = '';
        Object.entries(filtersToSend).forEach(([filterId, values]) => {
            if (values && values.length > 0) {
                values.forEach(value => {
                    // Parse the JSON input to get the actual filter criteria
                    try {
                        const filterData = JSON.parse(value);
                        if (filterData.variantOption) {
                            query += `${filterData.variantOption.name}:${filterData.variantOption.value} `;
                        } else if (filterData.productMetafield) {
                            query += `tag:${filterData.productMetafield.value} `;
                        } else if (filterData.price) {
                            query += `variants.price:>=${filterData.price.min} variants.price:<=${filterData.price.max} `;
                        }
                    } catch (error) {
                        console.log('Error parsing filter:', error);
                    }
                });
            }
        });
        console.log("QUERY", query);

        // Call your API with the filter query
        callApi(true, null, query.trim());
    };

    const handleSortChange = (option) => {
        setSelectedSortOption(option);
        callApi(true, null, null, option.value, option.reverse);
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
                        <TouchableOpacity onPress={() => setSelectedFilters({})}>
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

                                {selectedFilter?.values.map((value, valueIndex) => {
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
                                }
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
                title={title ?? "Product List"}
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


            < View style={{
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
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            // contentContainerStyle={{
                            //     flexDirection: 'row',
                            //     // height: 100,
                            //     // backgroundColor: 'red'
                            //     // alignItems: 'center',
                            //     // justifyContent: 'space-between'
                            // }}
                            >

                                {availableFilters?.find(filter => filter.id === 'filter.p.m.custom.select_product_type')?.values?.map((item, index) => {
                                    const isSelected = selectedFilters['filter.p.m.custom.select_product_type']?.includes(item.input);
                                    const isDisabled = item?.count === 0;
                                    return (
                                        <TouchableOpacity
                                            key={item?.id || item?.input || `${item?.label || 'value'}-${index}`}
                                            style={{
                                                // backgroundColor: 'red',
                                                // flexDirection: 'row',
                                                // alignItems: 'center',
                                                // justifyContent: 'space-between',
                                                // paddingVertical: 5,
                                                padding: 8,
                                                marginBottom: ITEM_SPACING,
                                                borderBottomWidth: isSelected ? 1 : 0
                                            }}
                                            disabled={isDisabled}
                                            onPress={async () => {
                                                console.log("item", item);

                                                let value = item?.input;
                                                const currentValues = selectedFilters['filter.p.m.custom.select_product_type'] || [];
                                                let newValues;

                                                if (currentValues.includes(value)) {
                                                    newValues = currentValues.filter(v => v !== value);
                                                } else {
                                                    // newValues = [...currentValues, value]; //for multiple 
                                                    newValues = [value];
                                                }

                                                const updatedFilters = {
                                                    ...selectedFilters,
                                                    'filter.p.m.custom.select_product_type': newValues
                                                }
                                                setSelectedFilters(updatedFilters);
                                                // await sleep(1000);
                                                applyFiltersToApi(updatedFilters);
                                                return;


                                            }}
                                        >
                                            <Text style={[styles.text_12_reg_mainTextColor2, {
                                                // color: isSelected ? "white" : 'black'
                                            }]}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}

                            </ScrollView >
                        }
                        renderItem={({ item, index }) => <ProductCard item={item} index={index} />}
                        numColumns={2}
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
                bottom: 80,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'black',
                alignSelf: 'center',
                padding: 10,
                gap: 12,
                borderRadius: 8,


                // width: '100%'
            }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} onPress={() => refSortRBSheet.current.open()}>

                    <SortAsc color={colorSet.white} />
                    <Text style={styles.text_16_reg_mainTextColor3}>Sort By</Text>
                </TouchableOpacity>
                <Text style={styles.text_16_reg_mainTextColor3}>
                    |
                </Text>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }} onPress={() => refFilterRBSheet.current.open()}>
                    <Menu color={colorSet.white} />

                    <Text style={styles.text_16_reg_mainTextColor3}>Filter</Text>
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
})