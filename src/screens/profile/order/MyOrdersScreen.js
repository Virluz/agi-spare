import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import AppStyles from '../../../styles/AppStyles';
import Toolbar from '../../../components/ui/Toolbar';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { heightPixel } from '../../../utils/fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCustomerOrders } from '../../../graphql/graph_request';

const MyOrdersScreen = ({ navigation }) => {

    const { colorScheme, } = useSelector(state => state.app);

    const appStyles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const [activeTab, setActiveTab] = useState('On the way');
    const [orders, setOrders] = useState([]);

    const filteredOrders = useMemo(() => {
        if (!Array.isArray(orders)) return [];
        const normalize = (s) => String(s || '').toLowerCase();
        switch (activeTab) {
            case 'On the way':
                // Include Processing as in-flight too
                return orders.filter(o => ['on the way', 'processing'].includes(normalize(o.status)));
            case 'Delivered':
                return orders.filter(o => normalize(o.status) === 'delivered');
            case 'Returned':
                // We don’t have explicit returns; show cancelled/returned-like
                return orders.filter(o => ['returned', 'cancelled'].includes(normalize(o.status)));
            default:
                return orders;
        }
    }, [orders, activeTab]);

    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem('customerAccessToken');
                if (!token) return;
                const res = await fetchCustomerOrders(token, 50);
                console.log(" fetchCustomerOrders res", res);

                const edges = res?.customer?.orders?.edges || [];

                const mapped = edges.map(({ node }) => {
                    const firstItem = node.lineItems?.edges?.[0]?.node;
                    const imageUrl = firstItem?.variant?.image?.url || 'https://via.placeholder.com/150';
                    // Map Shopify fulfillment status to UI text
                    let status = 'Order Confirmed';
                    if (node.fulfillmentStatus === 'FULFILLED') status = 'Delivered';
                    else if (node.canceledAt) status = 'Cancelled';
                    else if (node.fulfillmentStatus === 'IN_PROGRESS') status = 'On the way';
                    else if (node.fulfillmentStatus === 'UNFULFILLED') status = 'Processing';
                    return {
                        id: node.id,
                        status,
                        productName: firstItem?.title || node.name,
                        deliveryDate: node.processedAt?.slice(0, 10),
                        imageUrl,
                        rating: 0,
                        fulfillmentStatus: node.fulfillmentStatus,
                    };
                });
                setOrders(mapped);
            } catch (e) {
                console.error('Failed to fetch orders', e);
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

    const OrderCard = ({ order }) => (
        <TouchableOpacity style={styles.orderCard} onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}>
            <Image source={{ uri: order.imageUrl }} style={styles.productImage} />
            <View style={styles.orderDetails}>
                <Text style={appStyles.text_12_reg_mainTextColor2}>{order.status}</Text>
                <Text style={appStyles.text_14_semi_mainTextColor2} numberOfLines={1}>
                    {order.productName}
                </Text>

                {renderStars(order.rating)}

                <Text style={appStyles.text_12_reg_mainTextColor2}>Rate this product now</Text>

            </View>
            <Image style={styles.arrowIcon} source={require('../../../../assets/images/account/arrow_right.png')} />
        </TouchableOpacity>
    );

    return (
        <>
            <Toolbar title="My Orders" />

            <View style={appStyles.container}>

                <View style={styles.tabContainer}>
                    {['On the way', 'Delivered', 'Returned'].map((item, index) => (
                        <TouchableOpacity key={index} style={[styles.tabButton, activeTab === item && styles.activeTab]}
                            onPress={() => setActiveTab(item)}
                        >
                            <Text style={activeTab === item ? appStyles.text_12_reg_primary : appStyles.text_12_reg_mainTextColor2}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                    {/* <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
                    <Text style={styles.activeTabText}>On the way</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton}>
                    <Text style={styles.text_12_reg}>Delivered</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabButton}>
                    <Text style={styles.tabText}>Returned</Text>
                </TouchableOpacity> */}
                </View>

                <ScrollView contentContainerStyle={styles.orderList}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <OrderCard key={order.id} order={order} />
                        ))
                    ) : (
                        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <Text style={appStyles.text_14_reg_mainTextColor2}>No orders in "{activeTab}"</Text>
                        </View>
                    )}
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