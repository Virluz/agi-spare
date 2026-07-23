import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, Modal, TextInput, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storeFrontClient } from "../../graphql/shopifyClient";
import { CART_LINES_UPDATE } from "../../graphql/queries/cart/cart_lines_update";
import { CART_LINES_REMOVE } from "../../graphql/queries/cart/cart_lines_remove";
import fetch_cart from "../../graphql/queries/cart/fetch_cart";
import { RefreshControl } from "react-native-gesture-handler";
import { _getVerticalPadding, noDataView } from "../../utils/Helper";
import Constants from "../../utils/Constants";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, removeCartItem, updateCartItemQuantity } from "../../redux/reducers/cartSlice";
import Toolbar from "../../components/ui/Toolbar";
import { useNavigation } from "@react-navigation/native";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { heightPixel, widthPixel } from "../../utils/fonts";
import AppStyles from "../../styles/AppStyles";
import { createCheckoutShopify, updateCartBuyerIdentity, getValidCustomerToken, getCartDeliveryOptions, getProductsByIds, setCartDeliveryOption } from "../../graphql/graph_request";
import { checkServiceability } from "../../api/requests";
import { createPickupCheckout } from "../../service/customCheckout";
import YouWillAlsoLike from "./YouWillAlsoLike";
import { Minus, Plus, Trash2 } from "lucide-react-native";
// LinearGradient now used inside WishlistTray

const Cart = () => {
    const [loading, setLoading] = useState(false);
    const { colorScheme, isLoggedInGlobal } = useSelector(state => state.app);
    const appStyles = AppStyles.getAllStyles(colorScheme)
    const cart = useSelector((state) => state.cart.cart);
    const cartStatus = useSelector((state) => state.cart.status);
    const user = useSelector((state) => state.user?.user);
    const navigation = useNavigation();
    const [checkout, setCheckout] = useState(null);
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [selectedWishlistIndex, setSelectedWishlistIndex] = useState(0);
    const [lineLoading, setLineLoading] = useState({}); // per-line loader map
    // Store change modal state
    const [storeModalVisible, setStoreModalVisible] = useState(false);
    const [storeSearchPincode, setStoreSearchPincode] = useState("");
    const [storeOptions, setStoreOptions] = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);
    const [storesError, setStoresError] = useState("");
    // Fetch cart from Shopify
    const dispatch = useDispatch();
    // Free delivery config
    const FREE_THRESHOLD = 1699;
    const DELIVERY_FEE = 99;

    const hasAnyLineLoading = useMemo(() => Object.values(lineLoading).some(Boolean), [lineLoading]);


    // Update quantity
    const handleUpdateQuantity = async (lineId, quantity, maxQty) => {
        if (maxQty !== undefined && quantity > maxQty) {
            Alert.alert('Max quantity reached', `Only ${maxQty} unit${maxQty === 1 ? '' : 's'} available for this item.`);
            return;
        }
        try {
            setLineLoading(prev => ({ ...prev, [lineId]: true }));
            await dispatch(updateCartItemQuantity({ lineId, quantity })).unwrap();
        } catch (error) {
            console.error("Failed to update quantity:", error);
        } finally {
            setLineLoading(prev => ({ ...prev, [lineId]: false }));
        }
    };

    // Remove item
    const handleRemoveItem = async (lineId) => {
        try {
            setLineLoading(prev => ({ ...prev, [lineId]: true }));
            await dispatch(removeCartItem(lineId)).unwrap();
            dispatch(fetchCart()); // Refresh cart data
        } catch (error) {
            console.error("Failed to remove item:", error);
        } finally {
            setLineLoading(prev => ({ ...prev, [lineId]: false }));
        }
    };

    // Decrement with confirmation when qty == 1
    const handleDecrement = async (lineId, quantity, productTitle) => {
        if (quantity > 1) {
            return handleUpdateQuantity(lineId, quantity - 1);
        }
        Alert.alert(
            'Remove item?',
            `Do you want to remove "${productTitle || 'this item'}" from your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => handleRemoveItem(lineId) },
            ]
        );
    };


    const cartItems = cart?.lines?.edges;

    // Determine if the cart is pickup-only (all lines marked with pickup=true)
    const isPickupOnly = Array.isArray(cartItems) && cartItems.length > 0 && cartItems.every(
        e => e?.node?.attributes?.some?.(a => a.key === 'pickup' && a.value === 'true')
    );

    // Determine if any line in the cart has pickup enabled
    const hasAnyPickup = Array.isArray(cartItems) && cartItems.some(
        e => e?.node?.attributes?.some?.(a => a.key === 'pickup' && a.value === 'true')
    );


    const calculateTotals = () => {

        const subtotalRaw = cartItems?.reduce((sum, item) => {
            const price = parseFloat(item?.node?.merchandise?.price?.amount || 0);
            const qty = Number(item?.node?.quantity || 0);
            return sum + price * qty;
        }, 0) || 0;

        // If you need tax later, plug real values from Shopify estimatedCost
        const taxRaw = 0;
        // Waive delivery fee entirely for pickup-only (BOPIS)
        const deliveryFeeRaw = isPickupOnly ? 0 : (subtotalRaw >= FREE_THRESHOLD ? 0 : DELIVERY_FEE);
        const toPayRaw = subtotalRaw + deliveryFeeRaw + taxRaw;

        return {
            subtotal: subtotalRaw.toFixed(2),
            tax: taxRaw.toFixed(2),
            deliveryFee: deliveryFeeRaw.toFixed(2),
            toPay: toPayRaw.toFixed(2),
            currencyCode: cartItems?.length > 0 ? cartItems?.[0]?.node?.merchandise?.price?.currencyCode : 'INR'
        };
    };

    const totals = calculateTotals();

    // Fetch selected delivery option and track pickup selection
    useEffect(() => {
        (async () => {
            try {
                const cartId = await AsyncStorage.getItem('cartId');
                if (!cartId) return;
                const cartDelivery = await getCartDeliveryOptions(cartId);
                const group = cartDelivery?.deliveryGroups?.edges?.[0]?.node;
                const sel = group?.selectedDeliveryOption;
                if (sel) {
                    const t = (sel.title || '').toLowerCase();
                    setSelectedPickup(t.includes('pickup') || t.includes('pick-up') ? sel : null);
                } else {
                    setSelectedPickup(null);
                }
            } catch (e) {
                // ignore
            }
        })();
    }, [cart?.id, cart?.updatedAt]);

    // Load wishlist products to show between items and recommendations
    const wishlistIds = useSelector((state) => state?.wishlist?.wishlistItems || []);
    useEffect(() => {
        (async () => {
            try {
                if (Array.isArray(wishlistIds) && wishlistIds.length > 0) {
                    const nodes = await getProductsByIds(wishlistIds);
                    const items = nodes?.nodes?.filter(Boolean) || [];
                    setWishlistProducts(items);
                } else {
                    setWishlistProducts([]);
                }
            } catch (e) {
                setWishlistProducts([]);
            }
        })();
    }, [JSON.stringify(wishlistIds)]);

    // Helper to open Change Store modal
    const openChangeStore = () => {
        try {
            const firstLine = cart?.lines?.edges?.[0];
            const pin = firstLine?.node?.attributes?.find?.(a => a.key === 'pincode')?.value || "";
            setStoreSearchPincode(String(pin || ""));
        } catch (_) { setStoreSearchPincode(""); }
        setStoresError("");
        setStoreOptions([]);
        setStoreModalVisible(true);
    };

    const getVariantNumericId = (gid) => String(gid || '').split('/').pop();

    const fetchStoresForAllItems = async () => {
        try {
            setStoresLoading(true);
            setStoresError("");
            const cartLines = cart?.lines?.edges || [];
            if (!cartLines.length) {
                setStoreOptions([]);
                return;
            }
            const payload = {
                location: storeSearchPincode?.trim() || "",
                deliveryMode: ['standard'],
                storePickup: 'YES',
                items: cartLines.map(e => ({
                    eoisSkuId: null,
                    skuId: getVariantNumericId(e?.node?.merchandise?.id),
                    quantity: Number(e?.node?.quantity || 1),
                }))
            };
            const res = await checkServiceability(payload);

            console.log("checkServiceability RES", res);

            const data = res?.data?.data ?? res?.data ?? res;
            const nearBy = data?.NearByStores || {};
            // Build intersection of stores across all items by fcId
            const countByFc = new Map();
            const storeByFc = new Map();
            const totalItems = payload.items.length;
            for (const it of payload.items) {
                const stores = nearBy?.[it.skuId] || [];
                const seenFc = new Set();
                for (const s of stores) {
                    if (!s?.storePickupEnabled) continue;
                    const fc = String(s.fcId || '');
                    if (!fc || seenFc.has(fc)) continue;
                    seenFc.add(fc);
                    countByFc.set(fc, (countByFc.get(fc) || 0) + 1);
                    if (!storeByFc.has(fc)) storeByFc.set(fc, s);
                }
            }
            const intersection = [];
            for (const [fc, count] of countByFc.entries()) {
                if (count === totalItems) {
                    const s = storeByFc.get(fc);
                    // Accept intersection stores regardless of postCode; API already uses location proximity
                    intersection.push(s);
                }
            }
            setStoreOptions(intersection);
        } catch (e) {
            setStoresError(e?.message || 'Failed to fetch stores');
            setStoreOptions([]);
        } finally {
            setStoresLoading(false);
        }
    };

    const applyStoreToAllItems = async (store) => {
        try {
            if (!store) return;
            const cartId = await AsyncStorage.getItem('cartId');
            if (!cartId) return;
            const lines = (cart?.lines?.edges || []).map(e => {
                const id = e?.node?.id;
                const existing = e?.node?.attributes || [];
                const rest = existing.filter(a => !['pickup', 'storeId', 'storeName', 'storeCity', 'pincode'].includes(a.key));
                const cityName = store?.city || store?.town || '';
                const attrs = [
                    { key: 'pickup', value: 'true' },
                    { key: 'storeId', value: String(store?.fcId || '') },
                    { key: 'storeName', value: String(store?.fcName || '') },
                    { key: 'storeCity', value: String(cityName) },
                    { key: 'pincode', value: String(store?.postCode || '') },
                ].concat(rest);
                return { id, attributes: attrs };
            });
            await storeFrontClient.request(CART_LINES_UPDATE, { cartId, lines });
            setStoreModalVisible(false);
            dispatch(fetchCart());
        } catch (e) {
            Alert.alert('Update failed', e?.message || 'Could not update pickup store');
        }
    };

    const handleCheckout = async () => {
        try {
            const customerAccessToken = await getValidCustomerToken();
            const cartLines = cart?.lines?.edges || [];

            // If pickup-only cart: create Draft Order with zero shipping
            if (isPickupOnly && cartLines.length > 0) {
                try {
                    setLoading(true);

                    // Get pickup store info from first line attributes
                    const firstLine = cartLines?.[0]?.node?.attributes || [];
                    const pickup = {
                        storeId: firstLine.find(a => a.key === 'storeId')?.value,
                        storeName: firstLine.find(a => a.key === 'storeName')?.value,
                        storeCity: firstLine.find(a => a.key === 'storeCity')?.value,
                        pincode: firstLine.find(a => a.key === 'pincode')?.value,
                    };

                    // Get customer info if logged in
                    let customer = null;
                    if (customerAccessToken && user) {
                        customer = {
                            email: user?.email,
                            phone: user?.phone,
                            firstName: user?.firstName,
                            lastName: user?.lastName,
                        };
                    }

                    // Create Draft Order via Admin API with pickup and zero shipping
                    const draftOrder = await createPickupCheckout({ cart, customer, pickup });

                    if (!draftOrder?.invoiceUrl) {
                        throw new Error('No invoice URL received');
                    }

                    // Navigate to the Draft Order invoice (checkout page with zero shipping)
                    navigation.navigate('Checkout', {
                        url: draftOrder.invoiceUrl,
                        guest: !customerAccessToken,
                        isPickup: true,
                        pickupStore: pickup
                    });

                    setLoading(false);
                    return;
                } catch (e) {
                    setLoading(false);
                    console.warn('Draft Order creation failed:', e?.message || e);
                    Alert.alert('Checkout Error', e?.message || 'Failed to create pickup checkout. Please try again.');
                    return;
                }
            }

            // Normal checkout flow for non-pickup or mixed carts
            let urlToOpen = cart?.checkoutUrl;
            let isGuest = !customerAccessToken;
            if (cart?.id && cart?.checkoutUrl) {
                try {
                    if (customerAccessToken) {
                        const buyerCart = await updateCartBuyerIdentity(cart.id, { customerAccessToken });
                        urlToOpen = buyerCart?.checkoutUrl || cart.checkoutUrl;
                        isGuest = false;
                    } else {
                        const freshLines = cartLines.map(e => {
                            const attrs = e?.node?.attributes || [];
                            return {
                                merchandiseId: e?.node?.merchandise?.id,
                                quantity: e?.node?.quantity,
                                attributes: attrs.map(a => ({ key: a.key, value: a.value }))
                            };
                        })?.filter(Boolean) || [];
                        if (freshLines.length) {
                            const data = await createCheckoutShopify({ input: { lines: freshLines, buyerIdentity: { countryCode: 'IN' } } });
                            const newCart = data?.cartCreate?.cart;
                            urlToOpen = newCart?.checkoutUrl || urlToOpen;
                            isGuest = true;
                        }
                    }
                } catch (e) {
                    console.warn('checkout prep warning:', e?.message || e);
                }

                navigation.navigate("Checkout", {
                    url: urlToOpen,
                    guest: isGuest,
                });
                return;
            }

        } catch (error) {
            console.error('Checkout error:', error);
            Alert.alert('Checkout error', error?.message || 'Unable to start checkout.');
        }
    };



    if (loading) {
        return (
            <View style={styles.center}>
                <Text>Loading cart...</Text>
            </View>
        );
    }

    if (!isLoggedInGlobal) {
        return (
            <>
                <Toolbar title={'My Cart'} />


                <View style={styles.center}>

                    <PrimaryButton

                        title={"Go To Login"}
                        onPress={() => navigation.navigate('Login')}
                    />

                    <Text style={appStyles.text_18_bold_mainTextColor2}>

                        Please log in to view your cart.

                    </Text>


                </View>
            </>
        )
    }

    // if (!cart || cart?.lines?.edges?.length === 0) {
    //     return (
    //         <View style={styles.center}>
    //             <Text>Your cart is empty</Text>
    //         </View>
    //     );
    // }

    return (
        <>
            <Toolbar title={'My Cart'} />

            {/* Free Delivery banner */}
            {/* {(() => {
                const subtotalNum = parseFloat(totals?.subtotal || '0');
                const remaining = Math.max(0, Math.ceil(FREE_THRESHOLD - subtotalNum));
                const progress = Math.max(0, Math.min(100, (subtotalNum / FREE_THRESHOLD) * 100));
                const reached = remaining === 0;
                // For pickup-only, no delivery charges regardless of subtotal
                if (isPickupOnly) {
                    return (
                        <View style={{
                            backgroundColor: '#DCFFDB',
                            height: heightPixel(48), alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={[appStyles.text_14_reg_primary, { color: '#23A01D' }]}>Pickup selected — No delivery charges</Text>
                        </View>
                    );
                }
                if (reached) {
                    return (
                        <View style={{
                            backgroundColor: '#DCFFDB',
                            height: heightPixel(48), alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={[appStyles.text_14_reg_primary, { color: '#23A01D' }]}>Hooray! FREE DELIVERY unlocked!</Text>
                        </View>
                    );
                }
                return (
                    <View style={{ backgroundColor: '#FFF4EF', paddingVertical: 10 }}>
                        <View style={{ paddingHorizontal: widthPixel(16), alignItems: 'center' }}>
                            <Text style={appStyles.text_14_reg_primary}>
                                {`Shop for ${Constants.CURRENCY}${remaining} more to unlock `}
                                FREE DELIVERY
                            </Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: '#E9E9E9', marginTop: 8, borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${progress}%`, backgroundColor: '#23A01D' }} />
                        </View>
                    </View>
                );
            })()} */}



            <View style={appStyles.container}>
                {/* Change store CTA */}
                {Array.isArray(cart?.lines?.edges) && cart?.lines?.edges?.length > 0 && hasAnyPickup && (
                    <View style={{ paddingHorizontal: widthPixel(16), paddingTop: heightPixel(8), paddingBottom: heightPixel(4) }}>
                        <TouchableOpacity onPress={openChangeStore}>
                            <Text style={[appStyles.text_14_reg_mainTextColor2, { textDecorationLine: 'underline' }]}>Change pickup store</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {/* Fulfillment: Shipping or Pickup */}
                {/* <View style={{ paddingHorizontal: widthPixel(16), paddingTop: heightPixel(8) }}>
                    <Text style={appStyles.text_16_semi_mainTextColor2}>Fulfillment</Text>
                    {selectedPickup ? (
                        <View style={{ marginTop: 6 }}>
                            <Text style={appStyles.text_14_reg_mainTextColor2}>Pickup: {selectedPickup.title}</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('PickupSelector', { cartId: cart?.id, onChosen: () => navigation.goBack() })}>
                                <Text style={[appStyles.text_14_reg_mainTextColor2, { textDecorationLine: 'underline' }]}>Change pickup location</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={{ marginTop: 6 }} onPress={() => navigation.navigate('PickupSelector', { cartId: cart?.id, onChosen: () => navigation.goBack() })}>
                            <Text style={[appStyles.text_14_reg_mainTextColor2, { textDecorationLine: 'underline' }]}>Choose store pickup</Text>
                        </TouchableOpacity>
                    )}
                </View> */}

                <FlatList
                    data={cart?.lines?.edges}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.node.id}
                    renderItem={({ item }) => {
                        const { id, quantity, merchandise } = item.node;
                        const maxQty = merchandise?.quantityAvailable;
                        const isAtMax = maxQty !== undefined && quantity >= maxQty;

                        console.log("Item", item);

                        return (
                            <View style={styles.cardItem}>
                                {/* Top row: image + info + qty pill */}
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    onPress={() => navigation.navigate('ProductDetails', { productId: merchandise?.product?.id })}
                                    style={{ flexDirection: 'row', flex: 1 }}
                                >
                                    <View style={styles.thumbBox}>
                                        <Image style={styles.thumb} source={{ uri: merchandise?.product?.featuredImage?.url }} />
                                    </View>
                                    <View style={{ flex: 1, paddingLeft: 12 }}>
                                        <Text style={[appStyles.text_14_semi_mainTextColor2]} numberOfLines={1}>
                                            {merchandise?.product?.title}
                                        </Text>
                                        <Text style={[appStyles.text_12_reg_mainTextColor2, { opacity: 0.8 }]} numberOfLines={1}>
                                            {merchandise?.title}
                                        </Text>
                                        {/* Pickup badge if present */}
                                        {Array.isArray(item?.node?.attributes) && item.node.attributes.some(a => a.key === 'pickup' && a.value === 'true') && (
                                            <View style={styles.pickupBadge}>
                                                <Text style={[appStyles.text_12_reg_mainTextColor2, { color: '#2e7d32' }]}>Pickup: {item.node.attributes.find(a => a.key === 'storeName')?.value || 'Selected store'}</Text>
                                            </View>
                                        )}

                                        {/* Price row */}
                                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                                            <Text style={[appStyles.text_12_reg_mainTextColor2, { textDecorationLine: 'line-through', opacity: 0.6 }]}>₹{Math.round(Number(merchandise?.price?.amount || 0) * 1.14)}</Text>
                                            <Text style={[appStyles.text_16_semi_mainTextColor2]}>₹{merchandise?.price?.amount}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>

                                {/* Bottom row: qty pill + delete */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                    {/* Qty control */}
                                    <View style={styles.qtyPill}>
                                        <TouchableOpacity
                                            style={styles.qtyIcon}
                                            onPress={() => handleDecrement(id, quantity, merchandise?.product?.title)}
                                            disabled={!!lineLoading[id]}
                                        >
                                            <Minus size={16} />
                                        </TouchableOpacity>
                                        {lineLoading[id] ? (
                                            <ActivityIndicator size="small" style={{ marginHorizontal: 8 }} />
                                        ) : (
                                            <Text style={appStyles.text_14_reg_mainTextColor2}>{quantity}</Text>
                                        )}
                                        <TouchableOpacity
                                            style={[styles.qtyIcon, isAtMax && { opacity: 0.35 }]}
                                            onPress={() => {
                                                if (isAtMax) {
                                                    Alert.alert('Max quantity reached', `Only ${maxQty} unit${maxQty === 1 ? '' : 's'} available for this item.`);
                                                    return;
                                                }
                                                handleUpdateQuantity(id, quantity + 1, maxQty);
                                            }}
                                            disabled={!!lineLoading[id] || isAtMax}
                                        >
                                            <Plus size={16} />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Delete button */}
                                    <TouchableOpacity
                                        disabled={!!lineLoading[id]}
                                        onPress={() =>
                                            Alert.alert(
                                                'Remove item?',
                                                `Remove "${merchandise?.product?.title || 'this item'}" from your cart?`,
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Remove', style: 'destructive', onPress: () => handleRemoveItem(id) },
                                                ]
                                            )
                                        }
                                        style={styles.deleteBtn}
                                    >
                                        <Trash2 size={18} color="#E53935" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    style={{
                        paddingTop: heightPixel(8)
                    }}
                    ItemSeparatorComponent={
                        <View style={{ height: 8 }} />
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={dispatch(fetchCart)}
                        />
                    }
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={(!cart || cart?.lines?.edges?.length === 0) && <>

                        {noDataView(colorScheme, "Your bag looks empty", 'Let’s fill it up', require('../../../assets/images/cart/empty_cart.png'))}


                    </>
                    }
                    ListFooterComponent={
                        <>


                            {cart?.lines?.edges.length > 0 && (() => {
                                const mrpTotal = Math.round(Number(totals.subtotal) * 1.14);
                                const productTotal = Number(totals.subtotal);
                                const COUPON_DISCOUNT = 150; // static placeholder; plug real coupon value if available
                                const deliveryCharge = Number(totals.deliveryFee);
                                const grand = Math.max(0, productTotal + deliveryCharge - COUPON_DISCOUNT);
                                const savings = (mrpTotal - productTotal) + (deliveryCharge === 0 ? DELIVERY_FEE : 0) + COUPON_DISCOUNT;

                                return (
                                    <View style={styles.payCard}>
                                        <View style={styles.payCardHeader}>
                                            <Text style={[appStyles.text_16_semi_mainTextColor2]}>Payment Summary</Text>
                                        </View>

                                        <View style={styles.payRow}>
                                            <Text style={appStyles.text_14_reg_mainTextColor2}>Total MRP</Text>
                                            <Text style={appStyles.text_14_semi_mainTextColor2}>₹{mrpTotal.toLocaleString('en-IN')}</Text>
                                        </View>

                                        <View style={styles.payRow}>
                                            <Text style={appStyles.text_14_reg_mainTextColor2}>Product Total</Text>
                                            <Text style={appStyles.text_14_semi_mainTextColor2}>₹{productTotal.toLocaleString('en-IN')}</Text>
                                        </View>

                                        <View style={styles.payRow}>
                                            <Text style={appStyles.text_14_reg_mainTextColor2}>Coupon Discount</Text>
                                            <Text style={[appStyles.text_14_semi_mainTextColor2, { color: '#23A01D' }]}>-₹{COUPON_DISCOUNT}</Text>
                                        </View>

                                        <View style={styles.payRow}>
                                            <Text style={appStyles.text_14_reg_mainTextColor2}>Delivery Charges</Text>
                                            {deliveryCharge > 0 ? (
                                                <Text style={appStyles.text_14_semi_mainTextColor2}>₹{deliveryCharge}</Text>
                                            ) : (
                                                <Text style={[appStyles.text_14_semi_mainTextColor2, { color: '#23A01D' }]}>Free</Text>
                                            )}
                                        </View>

                                        <View style={styles.payDivider} />

                                        <View style={[styles.payRow, { paddingTop: 6 }]}>
                                            <Text style={[appStyles.text_16_semi_mainTextColor2]}>Grand Total</Text>
                                            <Text style={[appStyles.text_16_semi_mainTextColor2]}>₹{grand.toLocaleString('en-IN')}</Text>
                                        </View>


                                    </View>
                                );
                            })()}


                            {_getVerticalPadding(60)}

                        </>
                    }

                // ListHeaderComponent={cart?.lines?.edges && (
                //     <View style={{ alignItems: 'flex-end', paddingTop: heightPixel(8) }}>
                //         <Text style={appStyles.text_14_reg_mainTextColor2}>{cart?.lines?.edges?.length} Items Selected</Text>
                //     </View>
                // )}
                />




            </View>

            {/* Change Store Modal */}
            <Modal visible={storeModalVisible} transparent animationType="fade" onRequestClose={() => setStoreModalVisible(false)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 }}>
                    <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16, maxHeight: '85%' }}>
                        <Text style={appStyles.text_16_semi_mainTextColor2}>Select pickup store</Text>
                        <Text style={[appStyles.text_12_reg_mainTextColor2, { marginTop: 6 }]}>Enter pincode to find stores that can fulfill all items.</Text>
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
                            <TextInput
                                placeholder="Pincode"
                                placeholderTextColor="#A0A0A0"
                                value={storeSearchPincode}
                                onChangeText={setStoreSearchPincode}
                                keyboardType="number-pad"
                                style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10 }}
                            />
                            <TouchableOpacity onPress={fetchStoresForAllItems} style={{ paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#000' }}>
                                <Text>Find</Text>
                            </TouchableOpacity>
                        </View>
                        {storesLoading && (
                            <View style={{ alignItems: 'center', paddingVertical: 12 }}><ActivityIndicator /></View>
                        )}
                        {!!storesError && (
                            <Text style={{ color: 'red', marginTop: 8 }}>{storesError}</Text>
                        )}
                        {!storesLoading && storeOptions.length === 0 && !storesError && (
                            <Text style={[appStyles.text_12_reg_mainTextColor2, { marginTop: 8 }]}>No stores yet. Enter pincode and tap Find.</Text>
                        )}
                        <FlatList
                            style={{ marginTop: 12 }}
                            data={storeOptions}
                            keyExtractor={(s) => String(s?.fcId || Math.random())}
                            renderItem={({ item: s }) => (
                                <TouchableOpacity onPress={() => applyStoreToAllItems(s)} style={{ paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
                                    <Text style={appStyles.text_14_reg_mainTextColor2}>{s?.fcName}</Text>
                                    <Text style={appStyles.text_12_reg_mainTextColor2}>{s?.city || s?.town} · {s?.postCode}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                            <TouchableOpacity onPress={() => setStoreModalVisible(false)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#000' }}>
                                <Text>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* {cart?.lines?.edges && (
                <View style={{
                    height: 32,
                    backgroundColor: '#F4FBFF',
                    paddingHorizontal: widthPixel(16),
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                }}>
                    <Text style={appStyles.text_14_reg_mainTextColor2}>
                        To Pay: <Text style={appStyles.text_14_bold_mainTextColor2}>{Constants.CURRENCY}{totals.toPay} </Text>
                    </Text>
                </View>
            )} */}

            <View style={styles.footer}>


                <PrimaryButton
                    loading={loading}
                    onPress={() => {
                        console.log("cart", cart);

                        if (cart === null || cart?.lines?.edges?.length === 0) {
                            console.log("cart", cart);

                            navigation.navigate('Home')
                            return
                        }
                        handleCheckout();
                        return
                        console.log("onPress");

                        try {
                            var options = {
                                description: 'Credits towards consultation',
                                image: 'https://i.imgur.com/3g7nmJC.png',
                                currency: 'INR',
                                key: process.env.RAZROPAY_KEY, // Your api key
                                amount: '5000',
                                name: 'foo',
                                prefill: {
                                    email: 'void@razorpay.com',
                                    contact: '9191919191',
                                    name: 'Razorpay Software'
                                },
                                theme: { color: '#F37254' }
                            }
                            console.log("options", options);


                            console.log("options", options);

                        } catch (error) {
                            console.log("ERROR", error);

                        }


                    }}
                    title={cart?.lines?.edges.length > 0 ? 'Proceed to checkout' : 'Contine Shopping'}
                // disabled={selectedVariant == null}
                />

            </View>


            {/* Global overlay loader only for full cart loads; per-line updates show inline spinners */}
            {(cartStatus === 'loading' && !hasAnyLineLoading) && (
                <View style={styles.overlay} pointerEvents="none">
                    <ActivityIndicator size="large" color="#000" />
                </View>
            )}

        </>

    );
};

export default Cart;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 10,
        backgroundColor: "#fff",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    cardItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 12,
        // marginHorizontal: widthPixel(16),
    },
    thumbBox: {
        width: 64,
        height: 64,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#fafafa'
    },
    thumb: { width: '100%', height: '100%' },
    lineItem: {
        flexDirection: "row",
        alignItems: "center",
        // backgroundColor: "#f5f5f5",
        paddingVertical: 10,
        marginBottom: 8,
        borderRadius: 6,
    },
    pickupBadge: {
        marginTop: 6,
        paddingVertical: 2,
        paddingHorizontal: 6,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#2e7d32',
        borderRadius: 4,
        backgroundColor: '#F0FFF0'
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
    },
    price: {
        fontSize: 14,
        color: "gray",
    },
    qtyPill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 20,
        paddingHorizontal: 8,
        height: 32,
        backgroundColor: '#F7F7F7',
        alignSelf: 'center'
    },
    qtyIcon: { padding: 6 },
    qtyContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 30,
        // marginHorizontal: 10,
        borderColor: "#ccc",
        borderWidth: 1,

    },
    qtyButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        // borderWidth: 1,
        borderRadius: 4,
        borderColor: "#ccc",
        // backgroundColor: "#eee",
    },
    qtyText: {
        marginHorizontal: 8,
        fontSize: 16,
    },
    removeButton: {
        backgroundColor: "red",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    payCard: {
        marginTop: 12,
        // marginHorizontal: widthPixel(16),
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        padding: 12,
    },
    payCardHeader: { marginBottom: 8 },
    payRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4
    },
    payDivider: { height: 1, backgroundColor: '#EEE', marginVertical: 6 },
    savingsPill: {
        marginTop: 10,
        backgroundColor: '#F1FFF1',
        borderWidth: 1,
        borderColor: '#BDE8BD',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
        alignItems: 'center'
    },
    summaryContainer: {
        // flex: 1,
        paddingVertical: widthPixel(8)
    },
    summaryRow: {
        flex: 1,
        // flexWrap: 'wrap',
        flexDirection: 'row',
        gap: 5,
        // alignItems: 'center',
        justifyContent: 'space-between',
    },
    footer: {
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingHorizontal: widthPixel(16)
    },
    overlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.3)'
    },
    deleteBtn: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FFF0F0',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
