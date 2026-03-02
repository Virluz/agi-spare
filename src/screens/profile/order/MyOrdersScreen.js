import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import AppStyles from '../../../styles/AppStyles';
import Toolbar from '../../../components/ui/Toolbar';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { heightPixel, widthPixel } from '../../../utils/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCustomerOrders, fetchOrderLineItemsAdmin, mapFulfillmentDisplayStatus } from '../../../graphql/graph_request';
import { _getVerticalPadding } from '../../../utils/Helper';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const MyOrdersScreen = ({ navigation }) => {

    const { colorScheme, } = useSelector(state => state.app);

    const appStyles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [activeTab, setActiveTab] = useState('On the way');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Helper function to determine order status using order fulfillment status
    // Note: Storefront API has limited fields, so we rely on order.fulfillmentStatus and tracking
    const getShipmentStatusStages = (successfulFulfillments, lineItems, orderNode) => {
        try {
            // Check if order is cancelled first
            if (orderNode?.canceledAt) {
                return { displayStatus: 'Cancelled' };
            }

            // Check if all order items are returned (based on financial status)
            if (orderNode?.financialStatus === 'REFUNDED' || orderNode?.financialStatus === 'PARTIALLY_REFUNDED') {
                return { displayStatus: 'Returned' };
            }

            console.log('Determining shipment status for order:', orderNode);
            // Get order's fulfillment status (primary indicator from Shopify)
            const orderFulfillmentStatus = orderNode?.fulfillmentStatus;

            // Check if there's active tracking info (indicates shipment is in-transit)
            const fulfillmentList = successfulFulfillments || [];
            const trackingNumbers = fulfillmentList
                .flatMap(f => f?.trackingInfo || [])
                .map(t => t?.number)
                .filter(Boolean);
            const hasActiveTracking = trackingNumbers.length > 0;

            console.log(`Order status check - fulfillmentStatus: ${orderFulfillmentStatus}, trackingNumbers: ${trackingNumbers.join(', ')}, hasActiveTracking: ${hasActiveTracking}`);

            // Determine display status based on Shopify fulfillment status + tracking info
            // Key insight: Even if status is FULFILLED, if there's active tracking, package is still in-transit
            let displayStatus = 'Order Confirmed';

            // Special case: FULFILLED with active tracking = still in transit
            if (orderFulfillmentStatus === 'FULFILLED' && hasActiveTracking) {
                displayStatus = 'On the way';
            }
            // FULFILLED without tracking = actually delivered
            else if (orderFulfillmentStatus === 'FULFILLED') {
                displayStatus = 'Delivered';
            }
            // Partial fulfillment = not all items are fulfilled
            else if (orderFulfillmentStatus === 'PARTIALLY_FULFILLED') {
                displayStatus = 'Partially Fulfilled';
            }
            // In-progress states
            else if (orderFulfillmentStatus === 'IN_PROGRESS' || orderFulfillmentStatus === 'ATTEMPTED_DELIVERY') {
                displayStatus = 'On the way';
            }
            // Items being prepared
            else if (orderFulfillmentStatus === 'UNSHIPPED') {
                displayStatus = 'On the way';
            }
            // Various pending states
            else if (orderFulfillmentStatus === 'UNFULFILLED' || orderFulfillmentStatus === 'SCHEDULED' || orderFulfillmentStatus === 'UNFINISHED') {
                displayStatus = 'On the way';
            }
            // Cancellation or failure
            else if (orderFulfillmentStatus === 'CANCELLED' || orderFulfillmentStatus === 'FAILURE') {
                displayStatus = 'Cancelled';
            }
            // Default fallback
            else {
                displayStatus = 'Order Confirmed';
            }

            return { displayStatus };
        } catch (err) {
            console.warn('Error in getShipmentStatusStages:', err);
            return { displayStatus: 'Order Confirmed' };
        }
    };

    const filteredOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        const normalize = (s) => String(s || '').toLowerCase();
        switch (activeTab) {
            case 'On the way':
                return orders.filter(o => normalize(o.status) === 'on the way');
            case 'Delivered':
                return orders.filter(o => normalize(o.status) === 'delivered');
            case 'Returned':
                return orders.filter(o => normalize(o.status) === 'returned');
            default:
                return orders;
        }
    }, [orders, activeTab]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('customerAccessToken');
                if (!token) return;
                const res = await fetchCustomerOrders(token, 50);
                console.log(" fetchCustomerOrders res", res);

                const edges = res?.customer?.orders?.edges || [];

                // Fetch admin data for each order to get accurate display status
                const mappedPromises = edges.map(async ({ node }) => {
                    const firstItem = node.lineItems?.edges?.[0]?.node;
                    const imageUrl = firstItem?.variant?.image?.url || 'https://via.placeholder.com/150';

                    // Fetch admin order data to get fulfillments with displayStatus
                    let displayStatusLabel = 'Order Confirmed';
                    let displayStatusIcon = '🔄';

                    try {
                        const adminOrder = await fetchOrderLineItemsAdmin(node.id);
                        if (adminOrder?.fulfillments && adminOrder.fulfillments.length > 0) {
                            // Get the first fulfillment's displayStatus
                            const firstFulfillment = adminOrder.fulfillments[0];
                            console.log('First fulfillment for order', node.id, adminOrder.fulfillments);
                            const statusInfo = mapFulfillmentDisplayStatus(firstFulfillment.displayStatus);
                            displayStatusLabel = statusInfo.label;
                            displayStatusIcon = statusInfo.icon;
                        } else if (node.canceledAt) {
                            displayStatusLabel = 'Cancelled';
                            displayStatusIcon = '❌';
                        }
                    } catch (error) {
                        console.warn('Failed to fetch admin data for order:', node.id, error);
                        // Fallback to basic status determination
                        const statusResult = getShipmentStatusStages(node.successfulFulfillments, node.lineItems, node);
                        displayStatusLabel = statusResult.displayStatus;
                    }

                    return {
                        ...node,
                        id: node.id,
                        status: displayStatusLabel,
                        statusIcon: displayStatusIcon,
                        productName: firstItem?.title || node.name,
                        deliveryDate: node.processedAt?.slice(0, 10),
                        imageUrl,
                        rating: 0,
                        fulfillmentStatus: node.fulfillmentStatus,
                    };
                });

                const mapped = await Promise.all(mappedPromises);
                setOrders(mapped);
            } catch (e) {
                console.error('Failed to fetch orders', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text key={i} style={i <= rating ? styles.filledStar : styles.emptyStar}>
                    ★
                </Text>
            );
        }
        return <View style={styles.starContainer}>{stars}</View>;
    };

    const OrderCard = ({ order, index }) => {
        // Calculate total items by summing quantities from all line items
        const totalItems = order?.lineItems?.edges?.reduce((sum, edge) => {
            const qty = edge?.node?.quantity || 0;
            return sum + qty;
        }, 0) || 0;

        return (
            <TouchableOpacity style={[styles.orderCard, index == orders.length - 1 && { borderBottomWidth: 0 }]} onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}>
                <Image source={{ uri: order.imageUrl }} style={styles.productImage} />
                <View style={styles.orderDetails}>
                    <Text style={appStyles.text_12_reg_mainTextColor2}>{order.name}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: 2 }}>
                        {/* <Text style={{ fontSize: 14 }}>{order.statusIcon || '🔄'}</Text> */}
                        <Text style={[appStyles.text_12_reg_mainTextColor2, { color: '#FF6B35', fontWeight: '600' }]}>
                            {order.status}
                        </Text>
                    </View>

                    <Text style={appStyles.text_14_semi_mainTextColor2} numberOfLines={1}>
                        {order.productName}
                    </Text>

                    {totalItems > 0 &&
                        <Text style={appStyles.text_14_reg_mainTextColor2}>Items: {totalItems}</Text>
                    }

                    {/* {renderStars(order.rating)} */}

                    {/* <Text style={appStyles.text_12_reg_mainTextColor2}>Rate this product now</Text> */}

                </View>
                <Image style={styles.arrowIcon} source={require('../../../../assets/images/account/arrow_right.png')} />
            </TouchableOpacity>
        );
    };

    const OrderShimmer = () => (
        <View style={styles.orderCard}>
            <ShimmerPlaceholder
                duration={1500}
                LinearGradient={LinearGradient}
                style={styles.productImage}
            />
            <View style={styles.orderDetails}>
                <ShimmerPlaceholder
                    duration={1500}
                    LinearGradient={LinearGradient}
                    style={{ height: 12, width: '50%', marginBottom: 8 }}
                />
                <ShimmerPlaceholder
                    duration={1500}
                    LinearGradient={LinearGradient}
                    style={{ height: 12, width: '70%', marginBottom: 8 }}
                />
                <ShimmerPlaceholder
                    duration={1500}
                    LinearGradient={LinearGradient}
                    style={{ height: 14, width: '90%', marginBottom: 8 }}
                />
                <ShimmerPlaceholder
                    duration={1500}
                    LinearGradient={LinearGradient}
                    style={{ height: 11, width: '40%', marginBottom: 8 }}
                />
                {/* <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <ShimmerPlaceholder
                            key={i}
                            duration={1500}
                            LinearGradient={LinearGradient}
                            style={{ height: 20, width: 20 }}
                        />
                    ))}
                </View> */}
            </View>
            <ShimmerPlaceholder
                duration={1500}
                LinearGradient={LinearGradient}
                style={{ width: 20, height: 16 }}
            />
        </View>
    );

    return (
        <>
            <Toolbar title="My Orders" isSearch={false} />

            <View style={appStyles.container}>

                {/* <View style={styles.tabContainer}>
                    {['On the way', 'Delivered', 'Returned'].map((item, index) => (
                        <TouchableOpacity key={index} style={[styles.tabButton, activeTab === item && styles.activeTab]}
                            onPress={() => setActiveTab(item)}
                        >
                            <Text style={activeTab === item ? appStyles.text_12_reg_primary : appStyles.text_12_reg_mainTextColor2}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                   
                </View> */}

                <ScrollView contentContainerStyle={styles.orderList}
                    showsVerticalScrollIndicator={false}>
                    {loading ? (
                        <>
                            {[1, 2, 3, 4, 5].map(i => (
                                <OrderShimmer key={i} />
                            ))}
                        </>
                    ) : orders.length > 0 ? (
                        orders.map((order, index) => (
                            <OrderCard key={order.id} order={order} index={index} />
                        ))
                    ) : (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <Text style={appStyles.text_14_reg_mainTextColor2}>No orders in "{activeTab}"</Text>
                        </View>
                    )}

                    {_getVerticalPadding(80)}
                </ScrollView>
            </View >

        </>

    );
};

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-around',
        padding: 10,
        backgroundColor: '#fff',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        // borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#F2F2F2',
        borderColor: '#F2F2F2',
        // borderWidth: 1,
    },
    tabText: {
        color: '#888',
        fontWeight: 'bold',
    },
    activeTabText: {
        color: '#000',
        fontWeight: 'bold',
    },
    orderList: {
        // flex: 1,
        // height: '100%',
        // padding: 10,
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        // borderRadius: 8,
        paddingVertical: heightPixel(16),
        // marginBottom: 10,
        borderBottomWidth: 0.8,
        borderColor: '#808080',
        borderStyle: 'dashed',
        alignItems: 'center',
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    orderDetails: {
        flex: 1,
    },
    orderStatus: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    productName: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
    },
    starContainer: {
        flexDirection: 'row',
    },
    filledStar: {
        color: '#FF9500',
        fontSize: 22,
    },
    emptyStar: {
        color: '#ccc',
        fontSize: 22,
    },
    rateProductText: {
        fontSize: 12,
        color: '#007bff',
    },
    arrowIcon: {
        width: 20,
        height: 16,
    },
});

export default MyOrdersScreen;