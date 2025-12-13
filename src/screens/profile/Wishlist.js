import { FlatList, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import FastImage from '@d11/react-native-fast-image';
import { widthPixel } from '../../utils/fonts';
import ProductCard from '../../components/ui/ProductCard';
import { ITEM_SPACING, noDataView, SIDE_MARGIN } from '../../utils/Helper';
import { loadWishlistFromStorage } from '../../utils/wishlistStorage';
import { setWishlistItems } from '../../redux/reducers/wishlistSlice';
import { getProductsByIds } from '../../graphql/graph_request';
import BetterTogether from './BetterTogether';

const Wishlist = () => {
    // Initialize all hooks first to prevent the "rendered fewer hooks than expected" error
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { wishlistItems } = useSelector(state => state.wishlist);
    const { colorScheme } = useSelector(state => state.app);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Styles
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];

    // Load wishlist items from storage on mount
    useEffect(() => {
        loadWishlistFromStorage().then(items => {
            dispatch(setWishlistItems(items));
        });
    }, []);

    // Fetch product details when wishlist items change
    const fetchWishlistProducts = async () => {
        if (!wishlistItems || wishlistItems.length === 0) {
            setWishlist([]);
            return;
        }

        setIsLoading(true);
        try {
            console.log('Fetching products for IDs:', wishlistItems);
            const response = await getProductsByIds(wishlistItems);
            if (response?.nodes) {
                const products = response.nodes
                    .filter(node => node != null)
                    .map(product => ({
                        node: product
                    }));
                setWishlist(products);
            }
        } catch (error) {
            console.error('Error fetching wishlist products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlistProducts();
    }, [wishlistItems]);

    const renderEmptyState = () => (
        <>

            {
                noDataView(colorScheme, `You have’t added any
products`, `Click to save your products`, require('../../../assets/images/cart/empty_cart.png'))}


        </>

    );

    const renderItem = ({ item, index }) => (
        <ProductCard
            item={item}
            index={index}
            isDarkBackground={false}
            showColors={true}
            showAddToCartButton={true}
            isWishlistItem={true}
        />
    );

    // Loading state render
    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: colorSet.white }}>
                <Toolbar
                    title="My Wishlist"
                    showBack={true}
                    onBackPress={() => navigation.goBack()}
                />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colorSet.primaryColor} />
                </View>
            </View>
        );
    }

    // Main render
    return (
        <View style={{ flex: 1, backgroundColor: colorSet.white }}>
            <Toolbar
                title="My Wishlist"
                showBack={true}
                onBackPress={() => navigation.goBack()}
            />

            <FlatList
                data={wishlist}
                renderItem={renderItem}
                keyExtractor={(item) => item.node.id}
                numColumns={2}
                contentContainerStyle={{
                    paddingHorizontal: SIDE_MARGIN,
                    paddingVertical: ITEM_SPACING,
                    flexGrow: 1
                }}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
            // ListFooterComponent={<BetterTogether />}
            />
        </View>
    );
};

export default Wishlist;

const styles = StyleSheet.create({
    // Add any additional styles here if needed
});