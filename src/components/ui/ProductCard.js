import { StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useState } from 'react'
import { _getVerticalPadding, DEVICE_WIDTH, extactColorsFromVariants } from '../../utils/Helper';
import Ripple from 'react-native-material-ripple';
import AppStyles from '../../styles/AppStyles';
import { useDispatch, useSelector } from 'react-redux';
import { addOrUpdateCartLine } from '../../redux/reducers/cartSlice';
import { toggleWishlistItem } from '../../redux/reducers/wishlistSlice';
import { useNavigation } from '@react-navigation/native';
import { widthPixel } from '../../utils/fonts';
import { Cross, CrossIcon, Heart, HeartIcon, ShoppingBag, ShoppingBasket, ShoppingCart, ShoppingCartIcon, X } from 'lucide-react-native';
import FastImage from '@d11/react-native-fast-image';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { PrimaryButton } from './PrimaryButton';
import { showErrorMsg, showSuccessMsg } from '../../widgets/FlashMessages';


const ITEM_SPACING = widthPixel(16); // space between items
const NUM_COLUMNS = 2;
const SIDE_MARGIN = widthPixel(16); // padding left/right
const ITEM_WIDTH = (DEVICE_WIDTH - SIDE_MARGIN * 2 - ITEM_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const ProductCard = ({ item, index, isDarkBackground = false, quickShop = false, MAX_VISIBLE_COLORS = 3,
    showColors = true, horizonal = false, isList = false,
    showAddToCartButton = true, isWishlistItem = false, disableNavigation = true, showDetails = false }) => {

    const [quantity, setQuantity] = useState(1);

    if (!item?.node || item?.node === null)
        return (
            <View style={{
                width: ITEM_WIDTH,
                marginBottom: ITEM_SPACING,
                marginRight: isRightItem && !horizonal ? 0 : ITEM_SPACING,
                alignItems: 'center',
                height: 250,
            }} >

                <ShimmerPlaceholder
                    duration={2000}
                    LinearGradient={LinearGradient}
                    style={{ height: 150, width: '100%' }}
                />



                <ShimmerPlaceholder
                    duration={2000}
                    LinearGradient={LinearGradient}
                    style={{ height: 30, width: '100%', marginTop: 8 }}
                />



                <ShimmerPlaceholder
                    duration={1200}
                    LinearGradient={LinearGradient}
                    style={{ height: 30, width: '100%', marginTop: 8 }}
                />

            </View >

        )





    const isRightItem = (index + 1) % NUM_COLUMNS === 0;
    const { colorScheme, isLoggedInGlobal } = useSelector(state => state.app);
    const colors = extactColorsFromVariants(item?.node?.variants)



    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const navigation = useNavigation();
    const wishlist = useSelector(state => state.wishlist);
    const isInWishlist = wishlist?.wishlistItems?.includes(item?.node?.id) || false;
    const [imageLoading, setImageLoader] = useState(true);
    const dispatch = useDispatch();

    return (
        <TouchableWithoutFeedback
            onPress={() => {


                // if (disableNavigation) return;
                navigation.navigate('ProductDetails', { productId: item?.node?.id });
                return;
                navigation.navigate('FullScreenImage', { productId: item?.node?.id });

            }}>
            <View style={{
                width: ITEM_WIDTH,
                marginBottom: ITEM_SPACING,
                marginRight: isRightItem && !horizonal ? 0 : ITEM_SPACING,
                alignItems: 'center'
            }}>


                <FastImage
                    source={{ uri: item?.node?.images?.edges[0]?.node?.url }}
                    style={{ height: 200, width: '100%', }}
                    resizeMode="cover"

                    onLoad={() => { setImageLoader(false) }}
                />


                <View style={{ paddingVertical: widthPixel(8), alignSelf: 'flex-start', flexGrow: 1, width: '100%' }}>
                    <Text style={isDarkBackground ? styles.text_12_reg_mainTextColor3 : styles.text_12_reg_primaryTwo} numberOfLines={2}>{item?.node?.title}</Text>

                    {showDetails && (
                        <>
                            {_getVerticalPadding(4)}
                            <Text style={isDarkBackground ? styles.text_10_reg_mainTextColor3 : styles.text_10_reg_mainTextColor2} numberOfLines={1}>
                                {item?.node?.variants?.edges?.[0]?.node?.sku || ''}
                            </Text>
                            {_getVerticalPadding(4)}
                            <Text style={isDarkBackground ? styles.text_10_reg_mainTextColor3 : styles.text_10_reg_mainTextColor2} numberOfLines={2}>
                                {String(item?.node?.description || '').replace(/<[^>]*>/g, '')}
                            </Text>
                        </>
                    )}

                    {_getVerticalPadding(6)}
                    {isLoggedInGlobal && (
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                            <Text style={isDarkBackground ? styles.text_16_semi_mainTextColor3 : styles.text_16_semi_mainTextColor2}>
                                ₹{item?.node?.variants?.edges?.[0]?.node?.price?.amount}
                            </Text>
                            <Text style={[isDarkBackground ? styles.text_12_reg_mainTextColor3 : styles.text_12_reg_mainTextColor2, { textDecorationLine: 'line-through', opacity: 0.6 }]}>
                                ₹{Math.round(Number(item?.node?.variants?.edges?.[0]?.node?.price?.amount) * 1.14)}
                            </Text>
                            <View style={{
                                backgroundColor: '#22C55E',
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 4
                            }}>
                                <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600' }}>
                                    14% OFF
                                </Text>
                            </View>
                        </View>
                    )}

                </View>

                {showAddToCartButton && isLoggedInGlobal &&
                    <View style={{ width: '100%', paddingTop: -widthPixel(8) }}>
                        {/* Quantity Selector */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
                            gap: 12
                        }}>
                            <TouchableOpacity
                                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: colorSet?.primaryColorTwo,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>−</Text>
                            </TouchableOpacity>

                            <Text style={[
                                isDarkBackground ? styles.text_16_semi_mainTextColor3 : styles.text_16_semi_mainTextColor2,
                                { minWidth: 30, textAlign: 'center' }
                            ]}>
                                {quantity}
                            </Text>

                            <TouchableOpacity
                                onPress={() => setQuantity(quantity + 1)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    backgroundColor: colorSet?.primaryColorTwo,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <PrimaryButton title={'Add to Cart'} color={'#F2994A'} onPress={async () => {
                            try {
                                const variantId = item?.node?.variants?.edges?.[0]?.node?.id;
                                if (!variantId) {
                                    showErrorMsg('Variant unavailable');
                                    return;
                                }
                                await dispatch(addOrUpdateCartLine({ variantId, quantity: quantity })).unwrap();
                                showSuccessMsg(`Added ${quantity} item(s) to cart`);
                            } catch (e) {
                                showErrorMsg(String(e?.message || 'Failed to add to cart'));
                            }
                        }} />
                    </View>
                }

                {showAddToCartButton && !isLoggedInGlobal && (
                    <View style={{ width: '100%', paddingTop: -widthPixel(8) }}>
                        <PrimaryButton
                            title={'Know More'}
                            color={colorSet?.primaryColor || '#3B82F6'}
                            onPress={() => {
                                // Take user to the login screen to unlock prices and purchasing
                                try {
                                    navigation.navigate('Login');
                                } catch (e) {
                                    // Fallback: navigate to Profile tab if Login route isn't available
                                    try { navigation.navigate('Profile'); } catch { }
                                }
                            }}
                        />
                    </View>
                )}

                {isLoggedInGlobal &&
                    <Ripple
                        onPress={() => {
                            dispatch(toggleWishlistItem(item?.node?.id));
                        }}
                        style={{ position: 'absolute', zIndex: 1, top: 10, right: 10 }} >



                        {isWishlistItem ? <X size={18} /> :

                            <HeartIcon color={isInWishlist ? 'red' : 'black'}
                                {...isInWishlist && { fill: 'red' }}
                            />


                        }

                    </Ripple>
                }
            </View>


        </TouchableWithoutFeedback>
    )

}

export default ProductCard

const styles = StyleSheet.create({})