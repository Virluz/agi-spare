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
    ActivityIndicator
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

const SUGGESTED_SEARCHES = [
    'Tops',
    'Jeans',
    'Trousers',
    'T-shirts',
];

const WOMENS_CATEGORIES = [
    { label: 'Tops', image: require('../../../assets/images/pdp/returns.png') },
    { label: 'Jeans', image: require('../../../assets/images/pdp/returns.png') },
    { label: 'T-shirts', image: require('../../../assets/images/pdp/returns.png') },
    { label: 'Shorts', image: require('../../../assets/images/pdp/returns.png') },
    { label: 'Kurtas', image: require('../../../assets/images/pdp/returns.png') },
];

const MENS_CATEGORIES = [
    // Add men's categories as needed
];

const SearchPage = () => {
    const navigation = useNavigation();
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [search, setSearch] = useState('');
    const [recent, setRecent] = useState([]);
    const [results, setResults] = useState([]);

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

    const runSearch = async (term) => {
        if (!term?.trim()) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            const response = await searchProducts({
                query: term.trim(),
                first: 20
            });

            if (response?.products?.edges) {
                // Keep the data in the same format as ProductCard expects (with node structure)
                setResults(response.products.edges);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounce searches for better UX
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => runSearch(search), 350);
        return () => debounceRef.current && clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const onSubmit = async () => {
        await saveRecent(search);
        runSearch(search);
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
                    onChangeText={setSearch}
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

            <View style={{ flex: 1 }}>

                {search?.trim()?.length ? (
                    // Results view in grid
                    <View style={{ flex: 1 }}>
                        <FlatList
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
                                    <Text style={[styles.text_14_reg_mainTextColor2, { padding: 16, textAlign: 'center' }]}>No results found</Text>
                                )
                            }
                            renderItem={({ item, index }) => (
                                <ProductCard
                                    item={item}
                                    index={index}
                                    showColors={true}
                                    showDetails={true}
                                    isList={true}
                                />
                            )}
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
                                onPress={async () => { setSearch(item); await saveRecent(item); runSearch(item); }}
                            >
                                <Text style={[styles.text_14_reg_mainTextColor2]}>{item}</Text>
                                <FastImage source={require('../../../assets/images/search/up.png')} style={localStyles.clockIcon} resizeMode="contain" />
                            </TouchableOpacity>
                        ))}
                        <View style={localStyles.divider} />

                    </ScrollView>
                )}
            </View >


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
});

export default SearchPage;
