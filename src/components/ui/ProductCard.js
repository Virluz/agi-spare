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
import { Cross, CrossIcon, Heart, ShoppingBag, ShoppingBasket, ShoppingCart, ShoppingCartIcon, X } from 'lucide-react-native';
import FastImage from '@d11/react-native-fast-image';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { PrimaryButton } from './PrimaryButton';


const ITEM_SPACING = widthPixel(16); // space between items
const NUM_COLUMNS = 2;
const SIDE_MARGIN = widthPixel(16); // padding left/right
const ITEM_WIDTH = (DEVICE_WIDTH - SIDE_MARGIN * 2 - ITEM_SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

const ProductCard = ({ item, index, isDarkBackground = false, quickShop = false, MAX_VISIBLE_COLORS = 3, showColors = true, horizonal = false, showAddToCartButton = false, isWishlistItem = false }) => {

    if (!item.node || item?.node === null)
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
    const { colorScheme, } = useSelector(state => state.app);
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
                navigation.navigate('ProductDetails', { productId: item?.node?.id });
                return;
            }}>
            <View style={{
                width: ITEM_WIDTH,
                marginBottom: ITEM_SPACING,
                marginRight: isRightItem && !horizonal ? 0 : ITEM_SPACING,
                alignItems: 'center'
            }}>


                <FastImage
                    source={{ uri: item.node.images.edges[0].node.url }}
                    style={{ height: 200, width: '100%', }}
                    resizeMode="cover"

                    onLoad={() => { setImageLoader(false) }}
                />


                {showColors &&
                    <>
                        {_getVerticalPadding(6)}

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            // alignSelf: 'flex-start'
                        }}>

                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1,
                            }}>

                                {colors?.slice(0, MAX_VISIBLE_COLORS)?.map((color, index) => {

                                    return (
                                        <View key={index}
                                            style={{
                                                paddingVertical: widthPixel(4),
                                                paddingRight: widthPixel(4),
                                            }} >

                                            <FastImage
                                                source={{ uri: color?.image }}
                                                resizeMode='contain'
                                                style={{
                                                    height: widthPixel(24), width: widthPixel(24),
                                                    borderRadius: widthPixel(32),
                                                    borderWidth: 1,
                                                }}
                                            />

                                        </View>
                                    )
                                })}

                                {colors.length > MAX_VISIBLE_COLORS && (
                                    <View style={styles.remainingCountCircle}>
                                        <Text style={isDarkBackground ? styles.text_12_reg_mainTextColor3_campton : styles.text_12_reg_mainTextColor2_campton}>
                                            +{colors.length - MAX_VISIBLE_COLORS}
                                        </Text>
                                    </View>
                                )}

                            </View>

                            {quickShop ?
                                <View style={{
                                    borderWidth: 1,
                                    alignItems: 'center',
                                    padding: widthPixel(4),
                                    justifyContent: 'center'
                                }}>

                                    <Text style={isDarkBackground ? styles.text_10_reg_mainTextColor3_secondaryFont : styles.text_10_reg_mainTextColor2_secondaryFont}>

                                        {'QUICK SHOP'}

                                    </Text>

                                </View>

                                :

                                <View style={{
                                    height: widthPixel(24),
                                    width: widthPixel(24),
                                    alignItems: 'flex-end',
                                    borderWidth: 1, padding: widthPixel(3),
                                    borderRadius: widthPixel(12),
                                    borderColor: isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.2)'
                                }}>

                                    <FastImage
                                        style={{
                                            height: widthPixel(18),
                                            width: widthPixel(18),
                                        }}
                                        tintColor={isDarkBackground ? colorSet?.white : colorSet?.black}
                                        resizeMode='contain'
                                        source={require('../../../assets/images/cart.png')} />

                                </View>
                            }

                        </View>

                    </>

                }
                <View style={{ paddingVertical: widthPixel(8), alignSelf: 'flex-start', flexGrow: 1 }}>
                    <Text style={isDarkBackground ? styles.text_12_reg_mainTextColor3 : styles.text_12_reg_mainTextColor2} numberOfLines={2}>{item.node.title}</Text>

                    {_getVerticalPadding(8)}
                    <Text style={isDarkBackground ? styles.text_16_semi_mainTextColor3 : styles.text_16_semi_mainTextColor2}>
                        ₹{item.node.variants.edges[0].node.price.amount}
                    </Text>

                </View>

                {showAddToCartButton &&
                    <View style={{ width: '100%', paddingTop: -widthPixel(8) }}>

                        <PrimaryButton title={'Add to Cart'} />

                    </View>
                }

                <Ripple
                    onPress={() => {
                        dispatch(toggleWishlistItem(item?.node?.id));
                    }}
                    style={{ position: 'absolute', zIndex: 1, top: 10, right: 10 }} >

                    {/* <Heart
                        size={widthPixel(17)}
                        fill={isInWishlist ? colorSet?.primaryColor : 'transparent'}
                        color={isInWishlist ? colorSet?.primaryColor : isDarkBackground ? colorSet?.white : colorSet?.black}
                    /> */}

                    {isWishlistItem ? <X size={18} /> :

                        <FastImage
                            source={isInWishlist ? require('../../../assets/images/home/heart_filled.png') : require('../../../assets/images/home/heart.png')}
                            style={{ height: widthPixel(17), width: widthPixel(17), }}
                        />
                    }

                </Ripple>
            </View>


        </TouchableWithoutFeedback>
    )

}

export default ProductCard

const styles = StyleSheet.create({})