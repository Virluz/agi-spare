import {
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    Animated,
    TextInput,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import { ArrowLeft, ArrowLeftCircle, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Heart, Minus, MoveLeft, Plus, ShoppingCart } from 'lucide-react-native';
import Toolbar from '../../components/ui/Toolbar';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { showErrorMsg, showSuccessMsg } from '../../widgets/FlashMessages';
import { getProductById } from '../../graphql/graph_request';
import { addOrUpdateCartLine } from '../../redux/reducers/cartSlice';
import { addToRecentlyViewed } from '../../utils/recentlyViewedUtils';
import FastImage from '@d11/react-native-fast-image';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import Carousel from 'react-native-reanimated-carousel';
import RenderHtml from 'react-native-render-html';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { _getVerticalPadding, extactColorsFromVariants, tagStyles } from '../../utils/Helper';
import { BlurView } from '@react-native-community/blur';
import { SecondaryButton } from '../../components/ui/SecondaryButton';
import { checkServiceability } from '../../api/requests';
import BottomSheet from 'react-native-raw-bottom-sheet';
// Buy Now helpers
import { createCheckoutShopify, getValidCustomerToken, updateCartBuyerIdentity } from '../../graphql/graph_request';
import { createPickupCheckout } from '../../service/customCheckout';
const { width: DEVICE_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = heightPixel(380);

const ProductDetails = () => {
    const { colorScheme, isLoggedInGlobal } = useSelector((state) => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const navigation = useNavigation();
    const route = useRoute();
    const { productId } = route.params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const carouselRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [accordionState, setAccordionState] = useState({
        details: false,
        moreInfo: false,
        reviews: false,
        buyOnline: false
    });

    const [pincode, setPincode] = useState('');
    const [pincodeChecked, setPincodeChecked] = useState(null);

    const [availableStores, setAvailableStores] = useState([])
    const [selectedStore, setSelectedStore] = useState(null);
    const storeSheetRef = useRef();


    const [colorVariants, setColorVariants] = useState([]);

    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart.cart);
    const user = useSelector((state) => state.user?.user);
    const variantId = selectedVariant?.id;

    const [images, setImages] = useState([]);
    const cartQuantity =
        cart?.lines?.edges.find((l) => l.node.merchandise.id === variantId)?.node
            .quantity || 0;

    // Maximum quantity allowed equals available stock for the selected variant
    const availableQty = Math.max(0, parseInt(selectedVariant?.quantityAvailable || 0, 10));
    const outOfStock = availableQty === 0;
    const qtyExceeds = quantity > availableQty;

    // Clamp selected quantity when variant changes or stock is lower than current qty
    useEffect(() => {
        if (availableQty > 0 && quantity > availableQty) {
            setQuantity(availableQty);
        }
    }, [availableQty]);

    const updateQty = (newQty) => {
        if (newQty >= 0) {
            dispatch(addOrUpdateCartLine({ variantId, quantity: newQty }));
        }
    };

    useEffect(() => {
        addToRecentlyViewed(productId);
        fetchProductDetails();
    }, [productId]);

    useFocusEffect(
        React.useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' },
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: { display: 'contents' },
                });
            };
        }, [navigation])
    );

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await getProductById(productId);
            const prod = response.product;

            console.log("response.pr", response.product);

            let temp = { ...prod }

            temp.options = temp?.options?.reverse()

            setProduct(temp);
            setImages(prod?.images?.edges);


            const colors = extactColorsFromVariants(prod?.variants)

            console.log("COLORS", colors);

            setColorVariants(colors);
            let defaultVariant = null;

            if (prod.variants.edges.length > 0) {
                // 1. Try to find a variant with stock
                defaultVariant = prod.variants.edges.find(
                    ({ node }) => parseInt(node.quantityAvailable || 0, 10) > 0
                )?.node;

                // 2. If all are out of stock, fallback to first variant
                // if (!defaultVariant) {
                //     defaultVariant = prod.variants.edges[0].node;
                // }
            }

            if (defaultVariant) {
                setSelectedVariant(defaultVariant);

                // set selected options
                const defaults = {};
                defaultVariant.selectedOptions.forEach((o) => {
                    defaults[o.name] = o.value;
                });
                setSelectedOptions(defaults);
            } else {
                // 3. No variants at all
                setSelectedVariant(null);
                setSelectedOptions({});
            }
        } catch (error) {
            console.log('Error fetching product details:', error);
            showErrorMsg('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (name, value, index) => {


        // if (name === 'Color') {
        //     console.log("ame, value", name, value, index);


        //     const colorVariants = [
        //         ...new Set(
        //             product.variants.edges
        //                 .map(({ node }) =>
        //                     node.selectedOptions.find((o) => o.name === "Color")?.value
        //                 )
        //                 .filter(Boolean) // remove undefined
        //         )
        //     ];
        //     console.log("colorVariants", colorVariants);

        //     const perVariantImageCount = images.length / colorVariants.length;

        //     carouselRef.current?.scrollTo({ index: index * perVariantImageCount, animated: true });
        // }

        const newOptions = { ...selectedOptions, [name]: value };
        setSelectedOptions(newOptions);

        // find matching variant
        const matchingVariant = product.variants.edges.find(({ node }) =>
            node.selectedOptions.every((o) => newOptions[o.name] === o.value)
        )?.node;

        if (matchingVariant) {
            setSelectedVariant(matchingVariant);
        }
    };

    const handleAddToCart = async () => {
        try {
            if (!selectedVariant) {
                showErrorMsg('Please select a variant');
                return;
            }
            if (outOfStock) {
                showErrorMsg('This item is out of stock');
                return;
            }
            if (qtyExceeds) {
                showErrorMsg(`Only ${availableQty} left in stock`);
                return;
            }
            // Attach pickup/store selection as line attributes if a store is selected
            const attributes = selectedStore ? {
                pickup: true,
                storeId: selectedStore?.fcId ?? '',
                storeName: selectedStore?.fcName ?? '',
                storeCity: selectedStore?.city ?? selectedStore?.town ?? '',
                pincode: String(pincode || '')
            } : undefined;

            dispatch(
                addOrUpdateCartLine({ variantId: selectedVariant.id, quantity, attributes })
            );
            console.log('Added to cart:', {
                productId: product.id,
                variantId: selectedVariant.id,
                quantity,
                attributes,
            });
            showSuccessMsg("Product Added To Cart!")
        } catch (error) {
            console.log('addOrUpdateCartLine error', error);
        }
    };

    // Buy Now: create a one-item checkout (or pickup draft order) and navigate to Checkout
    const [buying, setBuying] = useState(false);
    const handleBuyNow = async () => {
        if (buying) return;
        try {
            if (!selectedVariant) {
                showErrorMsg('Please select a variant');
                return;
            }
            if (outOfStock) {
                showErrorMsg('This item is out of stock');
                return;
            }
            if (qtyExceeds) {
                showErrorMsg(`Only ${availableQty} left in stock`);
                return;
            }

            setBuying(true);

            // If a store is selected, treat as Pickup: create a Draft Order and open invoice URL
            if (selectedStore) {
                const pickup = {
                    storeId: selectedStore?.fcId ?? '',
                    storeName: selectedStore?.fcName ?? '',
                    storeCity: selectedStore?.city ?? selectedStore?.town ?? '',
                    pincode: String(pincode || '')
                };

                // Minimal cart shape for createPickupCheckout
                const tempCart = {
                    lines: {
                        edges: [
                            {
                                node: {
                                    merchandise: { id: selectedVariant.id, price: selectedVariant?.price },
                                    quantity,
                                    attributes: [
                                        { key: 'pickup', value: 'true' },
                                        { key: 'storeId', value: pickup.storeId },
                                        { key: 'storeName', value: pickup.storeName },
                                        { key: 'storeCity', value: pickup.storeCity },
                                        { key: 'pincode', value: pickup.pincode },
                                    ],
                                },
                            },
                        ],
                    },
                };

                const customer = user
                    ? {
                        email: user?.email,
                        phone: user?.phone,
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                    }
                    : undefined;

                const customerAccessToken = await getValidCustomerToken();
                const draftOrder = await createPickupCheckout({ cart: tempCart, customer, pickup });
                if (!draftOrder?.invoiceUrl) {
                    throw new Error('Unable to start pickup checkout');
                }
                navigation.navigate('Checkout', {
                    url: draftOrder.invoiceUrl,
                    guest: !customerAccessToken,
                    isPickup: true,
                    pickupStore: pickup,
                });
                return;
            }

            // Normal shipping flow: create a Cart with a single line and open checkoutUrl
            const line = { merchandiseId: selectedVariant.id, quantity };
            let urlToOpen = null;
            let isGuest = true;

            const data = await createCheckoutShopify({ input: { lines: [line], buyerIdentity: { countryCode: 'IN' } } });
            const newCart = data?.cartCreate?.cart;
            urlToOpen = newCart?.checkoutUrl || null;

            // If user is logged in, try to attach buyer identity for auto-login at checkout
            try {
                const customerAccessToken = await getValidCustomerToken();
                if (customerAccessToken && newCart?.id) {
                    const buyerCart = await updateCartBuyerIdentity(newCart.id, { customerAccessToken, countryCode: 'IN' });
                    urlToOpen = buyerCart?.checkoutUrl || urlToOpen;
                    isGuest = false;
                }
            } catch (_) {
                // Non-fatal; proceed as guest
            }

            if (!urlToOpen) throw new Error('Unable to create checkout');

            navigation.navigate('Checkout', {
                url: urlToOpen,
                guest: isGuest,
            });
        } catch (e) {
            console.warn('Buy Now error:', e?.message || e);
            showErrorMsg(e?.message || 'Unable to start checkout.');
        } finally {
            setBuying(false);
        }
    };

    // if (loading || !product) {
    //     return (
    //         <View
    //             style={[
    //                 styles.container,
    //                 { justifyContent: 'center', alignItems: 'center' },
    //             ]}
    //         >
    //             <ActivityIndicator size="large" color={colorSet.primaryColor} />
    //         </View>
    //     );
    // }


    const goToNext = () => {

        const index = currentIndex === images.length - 1 ? 0 : currentIndex + 1
        carouselRef.current.scrollTo({ index });
        setCurrentIndex(index);

    };

    const goToPrev = () => {

        const index = currentIndex === 0 ? images.length - 1 : currentIndex - 1
        carouselRef.current.scrollTo({ index });
        setCurrentIndex(index);


    };

    return (
        <>
            <Toolbar
                leftIcon={ArrowLeft}
                onLeftPress={() => navigation.goBack()}
                title={"Product Details"}
                rightIcons={[
                    {
                        icon: Heart,
                        onPress: () => setIsFavorite(!isFavorite),
                        fill: isFavorite,
                    },
                ]}
            />

            <View style={[styles.container_no_padding]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Product Images */}


                    <View style={{ flex: 1, }}>
                        <Carousel
                            ref={carouselRef}
                            width={DEVICE_WIDTH}
                            height={IMAGE_HEIGHT}
                            data={images}
                            pagingEnabled
                            scrollAnimationDuration={500}
                            onSnapToItem={(index) => setCurrentIndex(index)}
                            renderItem={({ item }) => (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>

                                        {loading && <ActivityIndicator size="large" color={colorSet.primaryColor} />}
                                    </View>

                                    <Animated.Image
                                        source={{ uri: item.node.url }}
                                        style={{ width: DEVICE_WIDTH, height: IMAGE_HEIGHT, }}
                                        resizeMode="contain"
                                        onLoadStart={() => {
                                            setLoading(true);
                                            console.log('Image loading started');
                                        }}
                                        onLoadEnd={() => {
                                            setLoading(false);
                                            console.log('Image loading ended');
                                        }}
                                    />
                                </View>
                            )}
                        />



                        {/* <TouchableOpacity style={[localStyles.arrow, localStyles.leftArrow]} onPress={goToPrev}>
                            <ChevronLeft size={28} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[localStyles.arrow, localStyles.rightArrow]} onPress={goToNext}>
                            <ChevronRight size={28} />
                        </TouchableOpacity> */}

                        {/* Dots */}

                    </View>

                    {/* Product Info */}


                    <View
                        style={localStyles.detailsContainer}

                    >


                        {/* <BlurView
                            blurType="light"
                            blurAmount={9}
                            style={{ height: 'auto' }}
                            reducedTransparencyFallbackColor="rgba(128,128,128,0.4)"
                        // style={localStyles.detailsContainer}
                        /> */}


                        <View
                            style={{
                                flexDirection: 'row',
                                // gap: 5,
                                justifyContent: 'center',
                                flex: 1,
                                // backgroundColor: 'red'
                            }}
                        >
                            {images?.map((_, index) => (
                                <View
                                    key={index}
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        marginHorizontal: 4,
                                        backgroundColor: index === currentIndex ? '#000' : '#ccc',
                                    }}
                                />
                            ))}
                        </View>

                        {_getVerticalPadding(12)}

                        <Text style={styles.text_16_semi_mainTextColor2}>{product?.title}</Text>

                        {_getVerticalPadding(8)}
                        <Text style={[styles.text_16_reg_mainTextColor2, { color: '#666666' }]}>
                            {product?.variants?.edges?.[0].node?.sku}
                        </Text>


                        {isLoggedInGlobal && (
                            <Text style={styles.text_24_semi_mainTextColor2}>
                                ₹{selectedVariant?.price?.amount}
                                {selectedVariant?.compareAtPrice?.amount && (
                                    <Text style={localStyles.originalPrice}>
                                        {' '}
                                        ₹{selectedVariant.compareAtPrice.amount}
                                    </Text>
                                )}
                            </Text>
                        )}

                        {_getVerticalPadding(12)}

                        {/* Variant Selections */}
                        {[].map((option) => {

                            return (
                                <View key={option.name} style={localStyles.variantContainer}>

                                    <Text style={styles.text_14_semi_mainTextColor2}>{option.name === 'Color' ? 'Colour' : option.name}: <Text style={styles.text_14_reg_mainTextColor2}>{selectedOptions[option.name]}</Text></Text>
                                    {_getVerticalPadding(8)}
                                    <View style={localStyles.variantOptions}>
                                        {option.values.map((value, index) => {
                                            const isSelected = selectedOptions[option.name] === value;
                                            console.log("value", value);

                                            // Find the variant that matches this option value
                                            const matchingVariant = product.variants.edges.find(({ node }) => node.selectedOptions.every((o) => o.name === option.name ? value === o.value : selectedOptions[o.name] === o.value
                                            )
                                            )?.node;

                                            // If no matching variant OR quantity is 0 → disable
                                            const isDisabled = !matchingVariant || matchingVariant.quantityAvailable === 0;


                                            if (option.name === 'Color') {


                                                let fountColor = colorVariants.find((variant) => variant.color === value);

                                                console.log("fountColor", fountColor);


                                                return (
                                                    <TouchableOpacity
                                                        key={value}
                                                        style={[
                                                            // localStyles.variantButton,
                                                            // isSelected && { borderColor: '#000', borderColor: '#000' },
                                                            // isDisabled && { opacity: 0.4, borderColor: '#ccc' },
                                                        ]}
                                                        disabled={isDisabled}
                                                        onPress={() => handleOptionSelect(option.name, value, index)}
                                                    >

                                                        <FastImage
                                                            source={{ uri: fountColor?.image }}
                                                            resizeMode='contain'
                                                            style={[{
                                                                height: widthPixel(26), width: widthPixel(26),
                                                                borderRadius: widthPixel(13),
                                                                borderWidth: 1,
                                                                borderColor: isSelected ? '#000' : '#ccc',

                                                            }, isDisabled && { opacity: 0.4, borderColor: '#ccc' },]}
                                                        />
                                                        {/* <Text
                                                            style={[
                                                                localStyles.variantText,
                                                                isSelected && { color: '#fff' },
                                                                isDisabled && { color: '#aaa' },
                                                            ]}
                                                        >
                                                            {value}
                                                        </Text> */}
                                                    </TouchableOpacity>
                                                )
                                            }

                                            return (
                                                <TouchableOpacity
                                                    key={value}
                                                    style={[
                                                        localStyles.variantButton,
                                                        isSelected && { backgroundColor: colorSet?.primaryColor },
                                                        isDisabled && { opacity: 0.4, borderColor: '#ccc' },
                                                    ]}
                                                    disabled={isDisabled}
                                                    onPress={() => handleOptionSelect(option.name, value, index)}
                                                >
                                                    <Text
                                                        style={[
                                                            localStyles.variantText,
                                                            isSelected && { color: '#fff' },
                                                            isDisabled && { color: '#aaa' },
                                                        ]}
                                                    >
                                                        {value}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}




                        {/* Buy Online Pick-In Store */}
                        {
                            availableStores.length > 0 && (
                                <TouchableOpacity
                                    style={localStyles.buyOnlineHeader}
                                    onPress={() => setAccordionState({ ...accordionState, buyOnline: !accordionState.buyOnline })}
                                >
                                    <View style={[localStyles.buyOnlineHeader, {
                                        padding: 15,
                                        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
                                    }]}>

                                        <FastImage
                                            style={{ height: 20, width: 20, marginRight: 10 }}
                                            source={require('../../../assets/images/pdp/store.png')} />
                                        <View style={localStyles.buyOnlineLeft}>
                                            <Text style={styles.text_16_semi_mainTextColor3}>Buy Online Pick-In Store</Text>
                                            <ChevronDown color={'#fff'} />

                                        </View>


                                    </View>


                                    {accordionState.buyOnline && (
                                        <TouchableOpacity
                                            style={{
                                                paddingVertical: heightPixel(12),
                                                borderWidth: 1,
                                                borderColor: '#fff',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                margin: widthPixel(8),
                                                paddingHorizontal: widthPixel(8),
                                                flexDirection: 'row',
                                            }}
                                            onPress={() => storeSheetRef.current?.open()}
                                        >
                                            <Text style={styles.text_14_semi_mainTextColor3}>
                                                {selectedStore ? selectedStore.fcName : 'Available in Store'}
                                            </Text>
                                            <ArrowRight color={'#fff'} />
                                        </TouchableOpacity>
                                    )}


                                </TouchableOpacity>
                            )
                        }



                        {/* Quantity Selector */}
                        {/* <View style={{ marginVertical: 15 }}>
                            <Text style={{ fontSize: 16, marginBottom: 10 }}>Select Quantity</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    style={{ borderWidth: 1, borderColor: '#ddd', padding: 10 }}
                                    onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                                >
                                    <Text style={{ fontSize: 18 }}>−</Text>
                                </TouchableOpacity>
                                <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ddd', paddingHorizontal: 20, paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 16 }}>{quantity}</Text>
                                </View>
                                <TouchableOpacity
                                    style={{ borderWidth: 1, borderColor: '#ddd', padding: 10 }}
                                    onPress={() => setQuantity(quantity + 1)}
                                >
                                    <Text style={{ fontSize: 18 }}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View> */}

                        {/* Quantity Selector */}

                        {isLoggedInGlobal &&
                            <View style={localStyles.quantityContainer}>
                                <Text style={styles.text_14_semi_mainTextColor2}>Select Quantity</Text>
                                <View style={localStyles.quantityControls}>
                                    <TouchableOpacity
                                        style={localStyles.quantityButton}
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus size={14} />
                                        {/* <Text style={localStyles.quantityText}>-</Text> */}
                                    </TouchableOpacity>
                                    <Text style={styles.text_16_semi_mainTextColor2}>{quantity}</Text>
                                    <TouchableOpacity
                                        style={localStyles.quantityButton}
                                        onPress={() => setQuantity(Math.min(availableQty || 1, quantity + 1))}
                                        disabled={quantity >= availableQty}
                                    >
                                        <Plus size={14} color={quantity >= availableQty ? '#d5d5d5' : '#000'} />

                                    </TouchableOpacity>
                                </View>
                                {outOfStock ? (
                                    <Text style={[styles.text_12_reg_mainTextColor2, { color: '#C1272D', marginTop: 6 }]}>Out of stock</Text>
                                ) : (
                                    availableQty > 0 && availableQty < 5 && (
                                        <Text style={[styles.text_12_reg_mainTextColor2, { color: '#8a8a8a', marginTop: 6 }]}>Only {availableQty} left</Text>
                                    )
                                )}
                            </View>
                        }

                        {_getVerticalPadding(16)}


                        {/* Description */}
                        <View style={localStyles.descriptionContainer}>


                            {/* Accordion for Details */}
                            <TouchableOpacity
                                disabled
                                style={localStyles.accordionHeader}
                                onPress={() => setAccordionState({ ...accordionState, details: !accordionState.details })}
                            >
                                <Text style={styles.text_12_semi_mainTextColor2}>Details</Text>

                                {accordionState?.details ? <Minus size={14} /> : <Plus size={14} />}
                            </TouchableOpacity>

                            <View style={localStyles.accordionContent}>
                                <RenderHtml
                                    contentWidth={'100%'}
                                    tagsStyles={tagStyles}
                                    source={{ html: product?.descriptionHtml }}
                                />
                            </View>


                            {/* Accordion for Rating & Review */}
                            {/* <TouchableOpacity
                                style={localStyles.accordionHeader}
                                onPress={() => setAccordionState({ ...accordionState, reviews: !accordionState.reviews })}
                            >
                                <Text style={styles.text_12_semi_mainTextColor2}>Rating & Review</Text>
                                {accordionState?.reviews ? <Minus size={14} /> : <Plus size={14} />}
                            </TouchableOpacity>
                            {accordionState.reviews && (
                                <View style={localStyles.accordionContent}>
                                    <Text style={localStyles.productDescription}>
                                        No reviews yet. Be the first to review this product.
                                    </Text>
                                </View>
                            )} */}
                        </View>
                    </View>

                </ScrollView>

                {/* Add to Cart Button */}
                <View style={[localStyles.footer, { paddingHorizontal: widthPixel(16) }]}>

                    {isLoggedInGlobal ? (
                        <>
                            <View style={{ flex: 1, marginRight: widthPixel(8) }}>
                                <SecondaryButton
                                    title={'Buy Now'}
                                    onPress={handleBuyNow}
                                    disabled={buying || selectedVariant == null || outOfStock || qtyExceeds}
                                />
                            </View>

                            <View style={{ flex: 1, marginLeft: widthPixel(8) }}>
                                <PrimaryButton
                                    onPress={handleAddToCart}
                                    title={'Add to cart'}
                                    fullWidth
                                    disabled={selectedVariant == null || outOfStock || qtyExceeds}
                                />
                            </View>
                        </>
                    ) : (
                        <View style={{ flex: 1 }}>
                            <PrimaryButton
                                title={'Know More'}
                                color={colorSet?.primaryColor || '#3B82F6'}
                                onPress={() => {
                                    try {
                                        navigation.navigate('Login');
                                    } catch (e) {
                                        try { navigation.navigate('Profile'); } catch { }
                                    }
                                }}
                            />
                        </View>
                    )}
                </View>
            </View>
            {/* Store selection Bottom Sheet */}
            <BottomSheet
                ref={storeSheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: { backgroundColor: 'rgba(0,0,0,0.5)' },
                    draggableIcon: { backgroundColor: '#000' },
                }}
            >
                <View style={localStyles.sheetContainer}>
                    <View style={localStyles.sheetHeaderRow}>
                        <Text style={styles.text_16_semi_mainTextColor2}>Select store</Text>
                        <TouchableOpacity onPress={() => storeSheetRef.current?.close()}>
                            <Text style={styles.text_16_semi_mainTextColor2}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={localStyles.storeListContainer}>
                        {availableStores.map((s) => {
                            const isSelected = selectedStore?.fcId === s.fcId;
                            const addressParts = [s.town || s.city, s.state, s.postCode].filter(Boolean);
                            const distance = typeof s.distance === 'number' ? `${Math.round(s.distance * 10) / 10} km away` : '';
                            return (
                                <TouchableOpacity
                                    key={s.fcId}
                                    style={[localStyles.storeCard, isSelected && localStyles.selectedStoreCard]}
                                    activeOpacity={0.9}
                                    onPress={() => {
                                        setSelectedStore(s);
                                        storeSheetRef.current?.close();
                                    }}
                                >
                                    <Text style={styles.text_14_semi_mainTextColor2}>{s.town || s.city || 'Store'}</Text>
                                    <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 4 }]} numberOfLines={2}>
                                        {(s.streetNo || '') + (s.streetName ? `, ${s.streetName}` : '') + (s.city ? `, ${s.city}` : '') + (s.state ? `, ${s.state}` : '') + (s.postCode ? `, ${s.postCode}` : '')}
                                    </Text>
                                    {!!distance && (
                                        <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 6, color: '#8a8a8a' }]}>{distance}</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </BottomSheet>
        </>
    );
};

export default ProductDetails;

const localStyles = StyleSheet.create({
    container: { flex: 1 },
    detailsContainer: {
        padding: 20,
        // marginTop: -30,
        // borderTopLeftRadius: widthPixel(20),
        // borderTopRightRadius: widthPixel(20),
        backgroundColor: 'rgba(255, 255, 255, 0.9)'
    },
    productTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2a2a2a',
        marginBottom: 20,
    },
    originalPrice: {
        fontSize: 18,
        color: '#999',
        textDecorationLine: 'line-through',
        marginLeft: 10,
    },
    sectionTitle: { fontSize: 18, fontWeight: '600' },
    variantContainer: { marginBottom: 20 },
    variantOptions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    variantButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: widthPixel(30),
        borderWidth: 1,
        minWidth: widthPixel(30),
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#e8e9f1',
        borderColor: '#ddd',
        // borderRadius: 8,
        // marginRight: 10,
        marginBottom: 10,
    },
    variantText: { fontSize: 14 },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12)
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DEDEDE'
        // gap: 20,
        // backgroundColor: '#eee'

    },
    quantityButton: {
        width: 50,
        height: 35,
        justifyContent: 'center',
        alignItems: 'center',
        // borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
    },
    quantityText: {
        fontSize: 18
    },
    quantityValue: { fontSize: 14, minWidth: 30, textAlign: 'center' },
    descriptionContainer: { marginBottom: 20 },
    productDescription: { fontSize: 16, lineHeight: 24, color: '#555' },
    footer: {
        padding: widthPixel(8),
        paddingHorizontal: widthPixel(16),
        borderTopWidth: 1, borderTopColor: '#eee',
        flexDirection: 'row',
        gap: widthPixel(16),
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    addToCartButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 8,
        gap: 10,
    },
    addToCartText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    arrow: {
        position: 'absolute',
        top: '50%',
        // backgroundColor: 'rgba(0,0,0,0.5)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20,
    },
    leftArrow: {
        left: 10,
    },
    rightArrow: {
        right: 10,
    },
    arrowText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    accordionIcon: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    accordionContent: {
        paddingVertical: 10,
    },
    pincodeContainer: {
        marginVertical: 15,
    },
    pincodeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    pincodeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    pincodeInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        marginRight: 10,
        fontSize: 16,
    },
    checkButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    pincodeResult: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    pincodeAvailable: {
        fontSize: 14,
        color: '#333',
    },
    buyOnlineContainer: {
        borderWidth: 1,
        borderColor: '#eee',
        marginVertical: 15,
    },
    buyOnlineHeader: {
        backgroundColor: '#000',
        // flexDirection: 'row',
        // justifyContent: 'space-between',
        // alignItems: 'center',
        // padding: 15,
    },
    buyOnlineLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'space-between',

    },
    storeIcon: {
        fontSize: 20,
        marginRight: 10,
    },
    buyOnlineText: {
        fontSize: 16,
        fontWeight: '600',
    },
    shippingInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    shippingCard: {
        flex: 1,
        alignItems: 'center',
        // padding: 10,
    },
    shippingIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    shippingTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    shippingDescription: {
        fontSize: 12,
        textAlign: 'center',
        color: '#666',
    },
    sheetContainer: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(16),
    },
    sheetHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(8),
    },
    storeListContainer: {
        paddingVertical: heightPixel(8),
        gap: heightPixel(10),
    },
    storeCard: {
        borderWidth: 1,
        borderColor: '#E8E8E8',
        borderRadius: 8,
        padding: widthPixel(12),
        backgroundColor: '#fff',
    },
    selectedStoreCard: {
        borderColor: '#E53935',
    },
});
