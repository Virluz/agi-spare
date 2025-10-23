import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import ProductCard from '../../components/ui/ProductCard';
import { setWishlistItems } from '../../redux/reducers/wishlistSlice';
import { loadWishlistFromStorage } from '../../utils/wishlistStorage';
import { noDataView } from '../../utils/Helper';
import { widthPixel } from '../../utils/fonts';

const WishlistScreen = () => {
    const styles = AppStyles.getAllStyles();
    const colorSet = AppStyles.colorSet[styles.colorScheme];
    const dispatch = useDispatch();
    const { wishlistItems } = useSelector(state => state.wishlist);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Load wishlist items from AsyncStorage when component mounts
        loadWishlistFromStorage().then(items => {
            dispatch(setWishlistItems(items));
        });
    }, []);

    useEffect(() => {
        // Here you would fetch product details for wishlist items using Shopify API
        // For now, we'll just use the IDs
        setProducts(wishlistItems.map(id => ({ node: { id } })));
    }, [wishlistItems]);

    const renderItem = ({ item, index }) => (
        <ProductCard
            item={item}
            index={index}
            showAddToCartButton={true}
        />
    );

    if (wishlistItems.length === 0) {
        return (
            <View style={AppStyles.container}>
                <Toolbar title="Wishlist" showBackButton />
                {noDataView('No items in wishlist', 'Start exploring and add items to your wishlist')}
            </View>
        );
    }

    return (
        <View style={AppStyles.container}>
            <Toolbar title="Wishlist" showBackButton />
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={item => item.node.id}
                numColumns={2}
                contentContainerStyle={localStyles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    listContent: {
        padding: widthPixel(16),
    },
});

export default WishlistScreen;