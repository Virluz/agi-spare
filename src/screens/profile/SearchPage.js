import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { searchProducts } from '../../graphql/graph_request';
import { ArrowLeft, Camera, CameraIcon, Clock, Search as SearchIcon, X } from 'lucide-react-native';
import { _getVerticalPadding } from '../../utils/Helper';
import FastImage from '@d11/react-native-fast-image';
import { heightPixel } from '../../utils/fonts';
import axios from 'axios';
import ProductCard from '../../components/ui/ProductCard';

const RECENT_KEY = 'recentSearches';

const SearchPage = () => {
    const navigation = useNavigation();
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [search, setSearch] = useState('');
    const [recent, setRecent] = useState([]);
    const [results, setResults] = useState([]);
    const [suggestions, setSuggestions] = useState({ queries: [], products: [] });
    const [showResults, setShowResults] = useState(false); // Toggle between suggestions and results view
    const [sortBy, setSortBy] = useState('RELEVANCE');
    const [showSortModal, setShowSortModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const debounceRef = useRef();

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(RECENT_KEY);
                if (raw) setRecent(JSON.parse(raw));
            } catch { }
        })();

    }, []);


    const saveRecent = async (term) => {
        if (!term) return;
        try {
            const lower = term.trim();
            if (!lower) return;
            const next = [lower, ...recent.filter(r => r.toLowerCase() !== lower.toLowerCase())].slice(0, 5);
            setRecent(next);
            await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
        } catch { }
    };

    const clearAllRecent = async () => {
        try {
            await AsyncStorage.removeItem(RECENT_KEY);
            setRecent([]);
        } catch { }
    };

    const runSearch = async (term, sort = sortBy, isSubmit = false) => {
        if (!term?.trim()) {
            setResults([]);
            setSuggestions({ queries: [], products: [] });
            return;
        }

        try {
            setLoading(true);
            let sortKey = 'RELEVANCE';
            let reverse = false;

            // Apply sorting only when showing results
            if (isSubmit) {
                switch (sort) {
                    case 'PRICE_LOW_HIGH':
                        sortKey = 'PRICE';
                        reverse = false;
                        break;
                    case 'PRICE_HIGH_LOW':
                        sortKey = 'PRICE';
                        reverse = true;
                        break;
                    case 'NEWEST':
                        sortKey = 'CREATED';
                        reverse = true;
                        break;
                    case 'BEST_SELLING':
                        sortKey = 'BEST_SELLING';
                        reverse = false;
                        break;
                    default:
                        sortKey = 'RELEVANCE';
                }
            }

            const response = await searchProducts({
                query: term.trim(),
                first: isSubmit ? 50 : 20,
                sortKey: sortKey,
                reverse: reverse
            });

            console.log('Search response:', response);

            // Extract predictive search suggestions
            if (response?.predictiveSearch) {
                setSuggestions({
                    queries: response.predictiveSearch.queries || [],
                    products: response.predictiveSearch.products || []
                });
            } else {
                setSuggestions({ queries: [], products: [] });
            }

            if (response?.products?.edges) {
                // Keep the data in the same format as ProductCard expects (with node structure)
                setResults(response.products.edges);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setSuggestions({ queries: [], products: [] });
        } finally {
            setLoading(false);
        }
    };

    // Debounce searches for better UX - only when not showing results
    useEffect(() => {
        if (!showResults) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => runSearch(search, sortBy, false), 350);
            return () => debounceRef.current && clearTimeout(debounceRef.current);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, showResults]);

    // Re-run search when sort changes (only in results view)
    useEffect(() => {
        if (showResults && search?.trim()) {
            runSearch(search, sortBy, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy]);

    // When user starts typing again, switch back to suggestions view
    const handleSearchChange = (text) => {
        setSearch(text);
        if (showResults) {
            setShowResults(false);
        }
    };

    const onSubmit = async () => {
        if (!search?.trim()) return;
        await saveRecent(search.trim());
        setShowResults(true);
        runSearch(search.trim(), sortBy, true);
    };

    const handleSuggestionClick = async (queryText) => {
        await saveRecent(queryText);
        setSearch(queryText);
        setShowResults(true);
        runSearch(queryText, sortBy, true);
    };

    const handleHistoryClick = async (item) => {
        await saveRecent(item);
        setSearch(item);
        setShowResults(true);
        runSearch(item, sortBy, true);
    };

    const sortOptions = [
        { label: 'Relevance', value: 'RELEVANCE' },
        { label: 'Price: Low to High', value: 'PRICE_LOW_HIGH' },
        { label: 'Price: High to Low', value: 'PRICE_HIGH_LOW' },
        { label: 'Newest', value: 'NEWEST' },
        { label: 'Best Selling', value: 'BEST_SELLING' },
    ];

    const getSortLabel = () => {
        return sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort';
    };

    return (
        <>

            <View style={localStyles.searchBarRow}>
                <TouchableOpacity onPress={() => {
                    setSearch('')
                    return navigation.goBack();
                }} style={localStyles.headerIconBtn}>
                    <ArrowLeft size={22} color={'#222'} />
                </TouchableOpacity>
                <TextInput
                    style={[localStyles.searchInput, styles.text_14_reg_dark3]}
                    placeholder="What are you looking for..."
                    value={search}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={onSubmit}
                    placeholderTextColor="#A0A0A0"
                    returnKeyType="search"
                    autoFocus
                />
                {!!search && (
                    <TouchableOpacity onPress={() => setSearch('')} style={localStyles.headerIconBtn}>
                        <X size={18} color={'#888'} />
                    </TouchableOpacity>
                )}
                {/* <TouchableOpacity onPress={() => { }} style={localStyles.headerIconBtn}>
                    <Camera size={20} color={'#222'} />
                </TouchableOpacity> */}
            </View>

            {showResults && search?.trim()?.length > 0 && (
                <View style={localStyles.filterSortBar}>
                    <TouchableOpacity
                        style={localStyles.filterButton}
                        onPress={() => setShowFilterModal(true)}
                    >
                        <Text style={styles.text_14_reg_mainTextColor2}>Filter</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={localStyles.sortButton}
                        onPress={() => setShowSortModal(true)}
                    >
                        <Text style={styles.text_14_reg_mainTextColor2}>{getSortLabel()}</Text>
                        <Text style={[styles.text_14_reg_mainTextColor2, { marginLeft: 4 }]}>▼</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={{ flex: 1 }}>

                {showResults && search?.trim()?.length ? (
                    // Results view in grid (after pressing enter)
                    <View style={{ flex: 1 }}>
                        <FlatList
                            key="results-grid"
                            data={results}
                            numColumns={2}
                            keyExtractor={(item, index) => item?.node?.id || index.toString()}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                            columnWrapperStyle={{ justifyContent: 'space-between' }}
                            ListEmptyComponent={
                                loading ? (
                                    <View style={{ padding: 32, alignItems: 'center' }}>
                                        <ActivityIndicator size="large" color={colorSet.primaryColor} />
                                    </View>
                                ) : (
                                    <Text style={[styles.text_14_reg_mainTextColor2, { padding: 16, textAlign: 'center' }]}>No results found for "{search}"</Text>
                                )
                            }
                            renderItem={({ item, index }) => (
                                <ProductCard
                                    item={item}
                                    index={index}
                                    showColors={true}
                                    showDetails={true}
                                    isList={false}
                                />
                            )}
                        />
                    </View>
                ) : search?.trim()?.length ? (
                    // Suggestions view (while typing)
                    <View style={{ flex: 1 }}>
                        <FlatList
                            key="suggestions-list"
                            data={results}
                            keyExtractor={(item, index) => item?.node?.id || index.toString()}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
                            // columnWrapperStyle={{ justifyContent: 'space-between' }}
                            ListHeaderComponent={
                                (suggestions.queries.length > 0 || suggestions.products.length > 0) ? (
                                    <View style={localStyles.suggestionsContainer}>
                                        {suggestions.queries.length > 0 && (
                                            <View style={localStyles.suggestionsSection}>
                                                <View style={localStyles.sectionHeader}>
                                                    <Text style={localStyles.sectionTitle}>SUGGESTIONS</Text>
                                                </View>
                                                {suggestions.queries.map((query, idx) => (
                                                    <TouchableOpacity
                                                        key={idx}
                                                        style={localStyles.suggestionQueryRow}
                                                        onPress={() => handleSuggestionClick(query.text)}
                                                    >
                                                        <Text style={localStyles.suggestionQueryText}>{query.text}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                        {suggestions.products.length > 0 && (
                                            <View style={localStyles.suggestionsSection}>
                                                <View style={localStyles.sectionHeader}>
                                                    <Text style={localStyles.sectionTitle}>PRODUCTS</Text>
                                                </View>
                                                {suggestions.products.map((product) => (
                                                    <TouchableOpacity
                                                        key={product.id}
                                                        style={localStyles.suggestionProductRow}
                                                        onPress={() => navigation.navigate('ProductDetails', { productId: product.id })}
                                                    >
                                                        <FastImage
                                                            source={{ uri: product.featuredImage?.url }}
                                                            style={localStyles.suggestionProductImage}
                                                            resizeMode="cover"
                                                        />
                                                        <Text style={localStyles.suggestionProductText} numberOfLines={2}>{product.title}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ) : null
                            }
                            ListEmptyComponent={
                                loading ? (
                                    <View style={{ padding: 32, alignItems: 'center' }}>
                                        <ActivityIndicator size="large" color={colorSet.primaryColor} />
                                    </View>
                                ) : null
                            }
                            renderItem={() => null}
                        />
                    </View>
                ) : (
                    // Default state with history and suggestions
                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.container}>
                        <View style={localStyles.sectionRow}>
                            <Text style={[styles.text_14_semi_mainTextColor2]}>History</Text>
                            <TouchableOpacity onPress={clearAllRecent}>
                                <Text style={localStyles.clearAll}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        {_getVerticalPadding(8)}

                        {recent.length === 0 && (
                            <Text style={[styles.text_12_reg_mainTextColor2,]}>No recent searches</Text>
                        )}
                        {recent.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={localStyles.historyRow}
                                onPress={() => handleHistoryClick(item)}
                            >
                                <Text style={[styles.text_14_reg_mainTextColor2]}>{item}</Text>
                                <FastImage source={require('../../../assets/images/search/up.png')} style={localStyles.clockIcon} resizeMode="contain" />
                            </TouchableOpacity>
                        ))}
                        <View style={localStyles.divider} />

                    </ScrollView>
                )}
            </View>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSortModal(false)}
            >
                <TouchableOpacity
                    style={localStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}
                >
                    <View style={localStyles.modalContent}>
                        <View style={localStyles.modalHeader}>
                            <Text style={[styles.text_16_semi_mainTextColor2]}>Sort By</Text>
                            <TouchableOpacity onPress={() => setShowSortModal(false)}>
                                <X size={24} color="#222" />
                            </TouchableOpacity>
                        </View>
                        {sortOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={localStyles.modalOption}
                                onPress={() => {
                                    setSortBy(option.value);
                                    setShowSortModal(false);
                                }}
                            >
                                <Text style={[
                                    styles.text_14_reg_mainTextColor2,
                                    sortBy === option.value && { fontWeight: '600', color: colorSet.primaryColor }
                                ]}>
                                    {option.label}
                                </Text>
                                {sortBy === option.value && (
                                    <Text style={{ color: colorSet.primaryColor }}>✓</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFilterModal(false)}
            >
                <TouchableOpacity
                    style={localStyles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowFilterModal(false)}
                >
                    <View style={localStyles.modalContent}>
                        <View style={localStyles.modalHeader}>
                            <Text style={[styles.text_16_semi_mainTextColor2]}>Filters</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <X size={24} color="#222" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={[styles.text_14_reg_mainTextColor2]}>Filters coming soon</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>


        </>

    );
};

const localStyles = StyleSheet.create({
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerIconBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    searchInput: {
        flex: 1,
        fontSize: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        color: '#222',
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
    },
    clearAll: {
        color: '#222',
        textDecorationLine: 'underline',
        fontSize: 13,
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(5)

    },
    resultRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultThumb: {
        width: 44,
        height: 44,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#F6F6F6',
    },
    historyText: {
        flex: 1,
        fontSize: 15,
        color: '#222',
    },
    clockIcon: {
        width: 18,
        height: 18,
        marginLeft: 8,
        tintColor: '#BDBDBD',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 20,
        marginHorizontal: 16,
    },
    suggestedText: {
        fontSize: 15,
        color: '#222',
        marginRight: 16,
        marginVertical: 8,
    },
    suggestRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        // paddingRight: 12,
    },
    categoryList: {
        marginTop: 12,
        marginBottom: 20,
    },
    categoryItem: {
        alignItems: 'center',
        width: 100,
    },
    categoryImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: 6,
        backgroundColor: '#F6F6F6',
    },
    categoryLabel: {
        fontSize: 12,
        color: '#222',
        textAlign: 'center',
    },
    suggestionsContainer: {
        backgroundColor: '#2E2560',
        marginHorizontal: -16,
        paddingHorizontal: 16,
        paddingVertical: 20,
        marginBottom: 16,
    },
    suggestionsSection: {
        marginBottom: 20,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9B95B8',
        letterSpacing: 1,
    },
    suggestionQueryRow: {
        paddingVertical: 12,
    },
    suggestionQueryText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    suggestionProductRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    suggestionProductImage: {
        width: 60,
        height: 60,
        borderRadius: 4,
        marginRight: 12,
        backgroundColor: '#F6F6F6',
    },
    suggestionProductText: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '400',
    },
    suggestionsDivider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    filterSortBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F8F8',
    },
});

export default SearchPage;
