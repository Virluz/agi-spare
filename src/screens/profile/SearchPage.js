import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
    ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { getProducts } from '../../graphql/graph_request';
import { ArrowLeft, Camera, CameraIcon, Clock, Search as SearchIcon, X } from 'lucide-react-native';
import { _getVerticalPadding } from '../../utils/Helper';
import FastImage from '@d11/react-native-fast-image';
import { heightPixel } from '../../utils/fonts';
import axios from 'axios';

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
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const debounceRef = useRef();

    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(RECENT_KEY);
                if (raw) setRecent(JSON.parse(raw));
            } catch { }
        })();

        loadCategories();
    }, []);

    const loadCategories = async () => {
        const res = await axios.get(`https://searchserverapi1.com/getresults?api_key=4L6R2W4G3E&suggestions=true&categories=true`);
        setCategories(res?.data?.categories || []);
    }


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
        const q = term?.trim();
        if (!q) { setResults([]); return; }
        setLoading(true);
        try {
            // Build a Shopify search query across title/product_type/tag
            const query = `title:*${q}* OR product_type:*${q}* OR tag:*${q}*`;


            // const res = await getProducts({ first: 20, query });

            const res = await axios.get(`https://searchserverapi1.com/getresults?api_key=4L6R2W4G3E&queryBy[title]=${q}&suggestions=true&categories=true`);

            console.log("Search API Response", res);
            const edges = res?.data?.items || [];
            const items = edges.map(e => ({
                id: e?.product_id,
                title: e?.title,
                image: e?.image_link,
                variantImage: e?.node?.variants?.edges?.[0]?.node?.image?.url,
                handle: e?.node?.handle,
            }));
            setResults(items);
        } catch (e) {
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

    const openProduct = async (id) => {
        // Ensure current term is saved when navigating to a product
        if (search?.trim()) {
            await saveRecent(search);
        }
        navigation.navigate('ProductDetails', { productId: `gid://shopify/Product/${id}` });
    };

    const Highlighted = ({ text, query }) => {
        if (!query) return <Text style={styles.text_12_reg_mainTextColor2} numberOfLines={1}>{text}</Text>;
        const q = query.trim();
        if (!q) return <Text style={styles.text_12_reg_mainTextColor2} numberOfLines={1}>{text}</Text>;
        const parts = text.split(new RegExp(`(${q})`, 'i'));
        return (
            <Text style={styles.text_12_reg_mainTextColor2} numberOfLines={1}>
                {parts.map((part, i) => (
                    part.toLowerCase() === q.toLowerCase()
                        ? <Text key={i} style={styles.text_12_semi_mainTextColor2}>{part}</Text>
                        : <Text key={i}>{part}</Text>
                ))}
            </Text>
        );
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
                <TouchableOpacity onPress={() => { /* camera search placeholder */ }} style={localStyles.headerIconBtn}>
                    <Camera size={20} color={'#222'} />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>

                {search?.trim()?.length ? (
                    // Results view with right-side suggestions
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ flex: 2.5 }}>
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                ListEmptyComponent={!loading && (
                                    <Text style={[styles.text_14_reg_mainTextColor2, { padding: 16 }]}>No results</Text>
                                )}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={localStyles.resultRow} onPress={() => openProduct(item.id)}>
                                        <Image source={{ uri: item.image || item.variantImage }} style={localStyles.resultThumb} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.text_14_semi_mainTextColor2]} numberOfLines={1}>{item.title}</Text>
                                            {/* simple keyword emphasis */}
                                            {!!search && (
                                                <Highlighted text={item.title} query={search} />
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                        <View style={{ width: 1, backgroundColor: '#EFEFEF' }} />
                        <View style={{ flex: 1, paddingTop: 12 }}>
                            <Text style={[styles.text_14_semi_mainTextColor2, { paddingHorizontal: 12, marginBottom: 8 }]}>Suggested</Text>
                            <ScrollView>
                                {SUGGESTED_SEARCHES.filter(s => s.toLowerCase().includes(search.toLowerCase())).map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        onPress={async () => { setSearch(s); await saveRecent(s); runSearch(s); }}
                                        style={localStyles.suggestRow}
                                    >
                                        <SearchIcon size={16} color={'#444'} style={{ marginRight: 4 }} />
                                        <Text style={[styles.text_14_reg_mainTextColor2]} numberOfLines={1}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                ) : (
                    // Default state with history and suggestions
                    <ScrollView keyboardShouldPersistTaps="handled">
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
                        <Text style={[styles.text_14_semi_mainTextColor2]}>Suggested Searches</Text>
                        {_getVerticalPadding(8)}
                        {SUGGESTED_SEARCHES.map((item) => (
                            <TouchableOpacity
                                key={item}
                                onPress={async () => { setSearch(item); await saveRecent(item); runSearch(item); }}
                                style={localStyles.suggestRow}
                            >
                                {/* <SearchIcon size={16} color={'#444'} style={{ marginLeft: 16, marginRight: 8 }} /> */}
                                <Text style={[styles.text_14_reg_mainTextColor2]}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        <View style={localStyles.divider} />
                        <Text style={[styles.text_14_semi_mainTextColor2]}>Categories</Text>
                        <FlatList
                            data={categories}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item) => item.label}
                            contentContainerStyle={localStyles.categoryList}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={localStyles.categoryItem}
                                    onPress={async () => {
                                        navigation.navigate('ProductList', { title: item.title, handle: item?.link.split('/').pop() });
                                        // setSearch(item.title); 
                                        // await saveRecent(item.label); runSearch(item.label);
                                    }}
                                >
                                    <FastImage
                                        source={{ uri: item?.image_link }}
                                        style={localStyles.categoryImage}
                                    />
                                    <Text style={[styles.text_12_reg_mainTextColor2, { textAlign: 'center' }]}>{item.title}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        {/* <Text style={[styles.text_14_semi_mainTextColor2]}>For Men's</Text> */}
                        {/* Add men's categories FlatList here if needed */}
                    </ScrollView>
                )}
            </View>


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
