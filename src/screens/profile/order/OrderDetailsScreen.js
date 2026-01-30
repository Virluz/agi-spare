import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import AppStyles from '../../../styles/AppStyles';
import { useState, useRef, useEffect, useMemo } from 'react';
import BottomSheet from 'react-native-raw-bottom-sheet';
import Toolbar from '../../../components/ui/Toolbar';
import { _getVerticalPadding } from '../../../utils/Helper';
import { useSelector } from 'react-redux';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import { ArrowRight, ArrowRightIcon, ChevronRightIcon, DropletIcon, LocateIcon, MapPin, MapPinCheck, MapPinHouse, Navigation, Navigation2, ThumbsUp, User, UserCircle } from 'lucide-react-native';
import { heightPixel } from '../../../utils/fonts';
import { fetchOrderById, fetchOrderLineItemsAdmin, mergeOrderDataWithLineItemStatus, isOrderCancelable, mapFulfillmentDisplayStatus } from '../../../graphql/graph_request';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SecondaryButton } from '../../../components/ui/SecondaryButton';
import { t } from 'i18next';

const OrderDetailsScreen = ({ navigation, route }) => {
  const { orderId } = route.params; // Assuming orderId is passed via navigation params
  const refRBSheet = useRef();
  const refCancelRBSheet = useRef();

  const { colorScheme, } = useSelector(state => state.app);

  const appStyles = AppStyles.getAllStyles(colorScheme);
  const colorSet = AppStyles.colorSet[colorScheme];


  const [loading, setLoading] = useState(true);
  const [orderNode, setOrderNode] = useState(null);
  const isFocused = useIsFocused();
  // Derive customer id from order/shipping info to avoid undefined
  const [customerData, setCustomerData] = useState(null);

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      setLoading(true);
      try {
        // Step 1: Fetch Storefront data (customer-facing info: pricing, shipping, etc.)
        const res = await fetchOrderById(orderId);
        const storefrontOrder = res?.node?.__typename === 'Order' ? res.node : null;
        console.log('fetchOrderById res', res);

        // Step 2: Fetch Admin API data (line item fulfillment status)
        const adminOrder = await fetchOrderLineItemsAdmin(orderId);
        console.log('fetchOrderLineItemsAdmin res', adminOrder);

        // Step 3: Merge the data - adds fulfillmentStatus to each line item and fulfillments data
        let mergedOrder = mergeOrderDataWithLineItemStatus(storefrontOrder, adminOrder);

        // Step 4: Add fulfillments with displayStatus from Admin API
        if (adminOrder?.fulfillments) {
          mergedOrder = {
            ...mergedOrder,
            fulfillments: adminOrder.fulfillments,
          };
        }

        console.log('mergedOrder with fulfillmentStatus', mergedOrder);

        setOrderNode(mergedOrder);
      } catch (e) {
        console.error('Failed to fetch order details', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, isFocused]);


  // Remove recursive checkCustomerAuth; derive from order once loaded
  // Keeping state for backward compatibility if needed elsewhere
  const addr = orderNode?.shippingAddress;
  const derivedCustomerId = (orderNode?.customer?.phone || addr?.phone || '').toString();


  // Keep first item for modal usage but display all items in UI
  const primaryItem = useMemo(() => orderNode?.lineItems?.edges?.[0]?.node, [orderNode]);
  const lineItems = useMemo(() => orderNode?.lineItems?.edges?.map(e => e.node) || [], [orderNode]);

  // Group line items by fulfillment with tracking info and status
  const fulfillmentGroups = useMemo(() => {

    const lineItemMap = {};

    // Map all order line items by variant ID (not lineItem ID)
    orderNode?.lineItems?.edges?.forEach(edge => {

      console.log('Mapping line item for fulfillment grouping', edge.node);
      const variantId = edge.node.variant?.id;
      if (!variantId) return;

      lineItemMap[variantId] = {
        name: edge.node.title,
        quantity: edge.node.quantity,
        fulfillmentStatus: edge.node.fulfillmentStatus || null,
        variant: {
          id: variantId,
          title: edge.node.variant?.title || null,
          image: {
            url: edge.node.variant?.image?.url || 'https://via.placeholder.com/150',
          },
          product: {
            id: edge.node.variant?.product?.id || null,
            title: edge.node.variant?.product?.title || null,
            vendor: edge.node.variant?.product?.vendor || null,
          },
        },
      };
    });

    // Build fulfillment groups
    const fulfillmentGroups = orderNode?.fulfillments?.map(f => {
      const items = f.fulfillmentLineItems.edges.map(edge => {
        const variantId = edge.node.lineItem?.variant?.id;
        const mappedItem = lineItemMap[variantId];

        return {
          ...mappedItem,
          fulfilledQuantity: edge.node.quantity,
        };
      }) || [];

      return {
        id: f.id,
        tracking: f.trackingInfo?.map(t => ({
          company: t.company,
          number: t.number,
          url: t.url,
        })) || [],
        items,
        fulfillmentStatus: f.displayStatus || f.status || null,
        hasTracking: (f.trackingInfo || []).some(t => !!t.number),
      };
    }) || [];

    return fulfillmentGroups;
  }, [orderNode, lineItems]);


  const fulfilledQtyMap = {};

  // Loop through all fulfillments
  orderNode?.fulfillments?.forEach(f => {
    f.fulfillmentLineItems.edges.forEach(edge => {
      const variantId = edge.node.lineItem?.variant?.id;
      if (!variantId) return;

      // Add fulfilled quantity
      if (!fulfilledQtyMap[variantId]) fulfilledQtyMap[variantId] = 0;
      fulfilledQtyMap[variantId] += edge.node.quantity;
    });
  });

  const remainingItems = orderNode?.lineItems?.edges
    ?.map(edge => {
      console.log('Calculating remaining quantity for line item', edge.node);
      const variantId = edge.node.variant?.id;
      const totalQty = edge.node.quantity;
      const fulfilledQty = fulfilledQtyMap[variantId] || 0;

      const remainingQty = totalQty - fulfilledQty;

      // Only include items that are not fully fulfilled
      if (remainingQty > 0) {
        return {
          ...edge.node,
          remainingQuantity: remainingQty,
        };
      }
      return null;
    })
    .filter(Boolean);

  console.log('Remaining unfulfilled items', remainingItems);

  const addressText = addr ? `${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.province} - ${addr.zip}` : '';
  const contactText = addr ? `${addr.firstName || ''} ${addr.lastName || ''} ${addr.phone || ''}`.trim() : '';
  const sellingPrice = Number(orderNode?.subtotalPrice?.amount || 0);
  const deliveryFee = Number(orderNode?.totalShippingPrice?.amount || 0);
  const totalAmount = Number(orderNode?.totalPrice?.amount || 0);
  const paidBy = orderNode?.financialStatus || '';
  const orderIdFull = orderNode?.name || '';
  const orderConfirmedDate = orderNode?.processedAt ? new Date(orderNode.processedAt).toDateString() : '';
  // Fallback placeholders for shipped & delivery dates (Storefront API may not expose granular timestamps).
  // If more precise timestamps become available, replace these derivations.
  const shippedDate = (isInProgress || isActuallyDelivered) && orderNode?.processedAt ? new Date(orderNode.processedAt).toDateString() : '';
  const deliveryDate = isActuallyDelivered && orderNode?.processedAt ? new Date(orderNode.processedAt).toDateString() : '';
  const isCanceled = !!orderNode?.canceledAt;
  const canceledDate = isCanceled && orderNode?.canceledAt ? new Date(orderNode.canceledAt).toDateString() : '';

  // Get accurate fulfillment status from Shopify
  const fulfillment = orderNode?.fulfillmentStatus;

  // Check for active tracking - indicates package is in transit
  const successfulFulfillments = orderNode?.successfulFulfillments || [];
  const trackingNumbers = successfulFulfillments
    .flatMap(f => f?.trackingInfo || [])
    .map(t => t?.number)
    .filter(Boolean);
  const hasActiveTracking = trackingNumbers.length > 0;

  // Determine actual delivery status
  // Check if any fulfillment has DELIVERED displayStatus
  const hasDeliveredFulfillment = orderNode?.fulfillments?.some(f =>
    f?.displayStatus === 'DELIVERED' || f?.displayStatus === 'MARKED_AS_FULFILLED'
  );

  // FULFILLED + tracking = still in transit
  // FULFILLED + no tracking = delivered
  // OR any fulfillment has DELIVERED status
  const isActuallyDelivered = hasDeliveredFulfillment || (fulfillment === 'FULFILLED' && !hasActiveTracking);
  const isInProgress = fulfillment === 'IN_PROGRESS' || fulfillment === 'PARTIALLY_FULFILLED' || fulfillment === 'ATTEMPTED_DELIVERY' || (fulfillment === 'FULFILLED' && hasActiveTracking && !hasDeliveredFulfillment);
  const isPartiallyFulfilled = fulfillment === 'PARTIALLY_FULFILLED';

  // Show cancel button only if any item is not yet packed (no fulfillments at all)
  const hasAnyFulfillment = successfulFulfillments.length > 0;
  const canCancelOrder = !isActuallyDelivered && !isInProgress && !isPartiallyFulfilled && !isCanceled && !hasAnyFulfillment;

  // Show return button only when order is actually delivered (all items shipped with no active tracking)
  const canReturnOrder = isActuallyDelivered;

  // Header status text based on fulfillment status (not just checking for FULFILLED)
  const getHeaderStatusText = () => {
    if (isCanceled) return 'Order Canceled';
    if (isActuallyDelivered) return 'Delivered';
    if (isInProgress || (fulfillment === 'FULFILLED' && hasActiveTracking)) return 'On the way';
    if (fulfillment === 'PARTIALLY_FULFILLED') return 'Partially Shipped';
    if (fulfillment === 'SCHEDULED') return 'Scheduled for Delivery';
    return 'Order Confirmed';
  };
  const headerStatusText = getHeaderStatusText();

  const insets = useSafeAreaInsets();

  // Helper function to determine shipment status stages
  // This shows the complete journey of a shipment based on fulfillment status
  const getShipmentStatusStages = (trackingInfo, fulfillmentStatus) => {
    // Map display status to shipment stages
    // fulfillmentStatus represents the displayStatus from Shopify fulfillment API

    const hasTracking = !!trackingInfo?.number;

    // Categorize fulfillment status into logical stages
    const confirmedStatuses = ['CONFIRMED', 'SUBMITTED', 'LABEL_PRINTED', 'LABEL_PURCHASED'];
    const packedStatuses = ['LABEL_PRINTED', 'LABEL_PURCHASED', 'PICKED_UP'];
    const shippedStatuses = ['CARRIER_PICKED_UP', 'PICKED_UP', 'READY_FOR_PICKUP'];
    const inTransitStatuses = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'ATTEMPTED_DELIVERY'];
    const deliveredStatuses = ['DELIVERED', 'FULFILLED', 'MARKED_AS_FULFILLED'];
    const failureStatuses = ['FAILURE', 'CANCELED', 'LABEL_VOIDED', 'NOT_DELIVERED'];
    const delayedStatuses = ['DELAYED'];

    const isConfirmed = confirmedStatuses.includes(fulfillmentStatus);
    const isPacked = packedStatuses.includes(fulfillmentStatus) || isConfirmed;
    const isShipped = shippedStatuses.includes(fulfillmentStatus) || isPacked;
    const isInTransit = inTransitStatuses.includes(fulfillmentStatus);
    const isDelivered = deliveredStatuses.includes(fulfillmentStatus);
    const isFailed = failureStatuses.includes(fulfillmentStatus);
    const isDelayed = delayedStatuses.includes(fulfillmentStatus);

    // Stage progression: when a later stage is reached, all previous stages should be marked complete
    // If delivered → all stages complete (confirmed, packed, shipped)
    // If in transit → confirmed, packed, shipped are complete
    // If shipped → confirmed, packed are complete
    // If packed → confirmed is complete

    return {
      isConfirmed: !isFailed && !isDelayed,                                    // Order confirmed - always true unless failed or delayed
      isPacked: (isPacked || isShipped || isInTransit || isDelivered) && !isFailed && !isDelayed,     // Packed when status progresses beyond confirmed
      isShipped: (isShipped || isInTransit || isDelivered) && !isFailed && !isDelayed,                // Shipped when status progresses beyond packed
      isInTransit: (isInTransit || isDelivered) && hasTracking && !isFailed && !isDelayed,           // In transit when actively tracked and progresses to delivery
      isDelivered: isDelivered && !isFailed && !isDelayed,                     // Delivered status reached
      isFailed: isFailed,                                                       // Failed fulfillment
      isDelayed: isDelayed,                                                     // Delayed delivery
      isProcessing: (isConfirmed || isPacked || isShipped) && !isDelivered && !isFailed && !isDelayed, // Processing before delivery
    };
  };

  // Helper functions for tracking
  const deriveCompanyFromUrl = (url) => {
    try {
      if (!url) return '';
      const host = new URL(url).hostname.toLowerCase();
      if (host.includes('bluedart')) return 'Bluedart';
      if (host.includes('delhivery')) return 'Delhivery';
      if (host.includes('ekart')) return 'Ekart';
      if (host.includes('dhl')) return 'DHL';
      if (host.includes('fedex')) return 'FedEx';
      if (host.includes('ups')) return 'UPS';
      if (host.includes('shiprocket')) return 'Shiprocket';
      return '';
    } catch (_) {
      return '';
    }
  };

  const resolveTrackingUrl = (trackingInfo) => {
    if (!trackingInfo) return null;
    const trackingUrlDirect = trackingInfo.url;
    if (trackingUrlDirect) return trackingUrlDirect;

    const num = trackingInfo.number;
    const comp = deriveCompanyFromUrl(trackingUrlDirect)?.toLowerCase() || '';
    if (!num) return null;
    if (comp.includes('delhivery')) return `https://www.delhivery.com/track/package/${num}`;
    if (comp.includes('bluedart')) return `https://www.bluedart.com/tracking?trackno=${num}`;
    if (comp.includes('ekart')) return `https://ekartlogistics.com/shipmenttrack/${num}`;
    if (comp.includes('dhl')) return `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${num}`;
    if (comp.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${num}`;
    if (comp.includes('ups')) return `https://www.ups.com/track?tracknum=${num}`;
    if (comp.includes('shiprocket')) return trackingUrlDirect || `https://shiprocket.co/tracking/${num}`;
    return null;
  };

  const SUPPORT_PHONE = '+917304053032';
  const SUPPORT_EMAIL = 'sharewithus@styleunion.in';
  // Eligibility: simple client-side check
  // NOTE: Storefront API doesn't give an exact deliveredAt. We fallback to processedAt when fulfilled.
  const RETURN_WINDOW_DAYS = 30;   // Extended to 30 days for better customer experience
  const EXCHANGE_WINDOW_DAYS = 30; // Extended to 30 days
  const deliveredAt = isActuallyDelivered && orderNode?.processedAt ? new Date(orderNode.processedAt) : null;
  const daysSinceDelivery = deliveredAt ? Math.floor((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isReturnEligible = !!(canReturnOrder && daysSinceDelivery !== null && daysSinceDelivery <= RETURN_WINDOW_DAYS);
  const isExchangeEligible = !!(canReturnOrder && daysSinceDelivery !== null && daysSinceDelivery <= EXCHANGE_WINDOW_DAYS);

  // Debug logging for return eligibility
  console.log('Return Eligibility Check:', {
    isActuallyDelivered,
    canReturnOrder,
    daysSinceDelivery,
    isReturnEligible,
    fulfillmentStatus: fulfillment,
    hasDeliveredFulfillment,
    deliveredAt: deliveredAt?.toISOString()
  });

  const renderOrderStatus = (trackingInfo = null, fulfillmentStatus = null) => {
    if (isCanceled) {
      return (
        <View style={[styles.orderStatusContainer, { justifyContent: 'center' }]}>
          <Text style={appStyles.text_12_reg_mainTextColor2}>Order was canceled {canceledDate || ''}</Text>
        </View>
      );
    }

    const stages = getShipmentStatusStages(trackingInfo, fulfillmentStatus);

    console.log('Rendering order status with stages', stages);

    return (
      <>
        {_getVerticalPadding(16)}

        {/* Visual Status Timeline */}
        <View style={styles.orderStatusContainer}>
          {/* Order Confirmed Stage */}
          <View style={styles.statusItem}>
            <View style={[styles.statusCircle, styles.completedCircle]}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
          </View>

          {/* Line to Packed Stage */}
          <View style={[styles.statusLine, stages.isPacked ? styles.statusLineActive : null]} />

          {/* Packed Stage */}
          <View style={styles.statusItem}>
            <View style={[styles.statusCircle, stages.isPacked ? styles.completedCircle : null]}>
              {stages.isPacked && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </View>

          {/* Line to Shipped Stage */}
          <View style={[styles.statusLine, stages.isShipped ? styles.statusLineActive : null]} />

          {/* Shipped Stage */}
          <View style={styles.statusItem}>
            <View style={[styles.statusCircle, stages.isShipped ? styles.completedCircle : null]}>
              {stages.isShipped && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </View>

          {/* Line to Delivered Stage */}
          <View style={[styles.statusLine, stages.isDelivered ? styles.statusLineActive : null]} />

          {/* Delivered Stage */}
          <View style={styles.statusItem}>
            <View style={[styles.statusCircle, stages.isDelivered ? styles.completedCircle : null]}>
              {stages.isDelivered && <Text style={styles.checkMark}>✓</Text>}
            </View>
          </View>
        </View>

        {/* Status Labels Row */}
        <View style={styles.statusLabelsContainer}>
          <View style={styles.statusLabelItem}>
            <Text style={appStyles.text_10_reg_mainTextColor2}>Order Confirmed</Text>
            <Text style={appStyles.text_9_reg_mainTextColor2}>{orderConfirmedDate || ''}</Text>
          </View>

          <View style={styles.statusLabelItem}>
            <Text style={appStyles.text_10_reg_mainTextColor2}>Packed</Text>
          </View>

          <View style={styles.statusLabelItem}>
            <Text style={appStyles.text_10_reg_mainTextColor2}>Shipped</Text>
            {stages.isShipped && shippedDate && (
              <Text style={appStyles.text_9_reg_mainTextColor2}>{shippedDate}</Text>
            )}
          </View>

          <View style={styles.statusLabelItem}>
            <Text style={appStyles.text_10_reg_mainTextColor2}>Delivered</Text>
            {stages.isDelivered && deliveryDate && (
              <Text style={appStyles.text_9_reg_mainTextColor2}>{deliveryDate}</Text>
            )}
          </View>
        </View>
      </>
    );
  };

  const openDialer = async (phone) => {
    const url = `tel:${phone}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url); else Alert.alert('Unable to open dialer');
    } catch (e) { Alert.alert('Error', 'Could not open dialer'); }
  };

  const openEmail = async (email) => {
    const url = `mailto:${email}`;
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url); else Alert.alert('No mail app available');
    } catch (e) { Alert.alert('Error', 'Could not open mail app'); }
  };

  const getMoreOptionBottomSheet = () => {
    return (
      <BottomSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        height={200}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0,0,0,0.5)"
          },
          draggableIcon: {
            backgroundColor: "#000"
          }
        }}
      >

        <View style={styles.card}>
          <Text style={appStyles.text_16_semi_mainTextColor2}>Need help?</Text>
          {_getVerticalPadding(12)}
          {[
            {
              key: 'cancel',
              title: 'Cancel Order',
              onPress: () => {
                refRBSheet.current.close();

                return refCancelRBSheet.current.open();
              },
            },

            {
              key: 'refund',
              title: 'Refund Policy',
              onPress: () => {
                refRBSheet.current.close();

                navigation.navigate('WebViewScreen', { url: 'https://www.agispares.com/return', title: 'Refund Policy' })
              },

            },
          ].map((item) => (
            <TouchableOpacity key={item.key} style={styles.helpOption} onPress={item.onPress}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {item.leftIcon && (
                  <Image
                    style={{ width: 24, height: 24, marginRight: 8 }}
                    source={item.leftIcon}
                  />
                )}
                <Text style={appStyles.text_16_reg_mainTextColor2}>{item.title}</Text>
              </View>
              <ArrowRightIcon color={'#808080'} size={20} />
            </TouchableOpacity>
          ))}
          {_getVerticalPadding(16)}

          {/* <TouchableOpacity onPress={() => openDialer(SUPPORT_PHONE)}>
            <Text style={[styles.text_14_semi_mainTextColor2]}>Customer care number - <Text style={[styles.text_14_reg_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>{SUPPORT_PHONE}</Text></Text>
          </TouchableOpacity>
          {_getVerticalPadding(6)}

          <TouchableOpacity onPress={() => openEmail(SUPPORT_EMAIL)}>
            <Text style={[styles.text_14_semi_mainTextColor2]}>Customer care email - <Text style={[styles.text_14_reg_mainTextColor2, { color: colorSet.primaryColor, textDecorationLine: 'underline' }]}>{SUPPORT_EMAIL}</Text></Text>
          </TouchableOpacity> */}


        </View>


      </BottomSheet>

    )

  }

  const getCancelBottomSheet = () => {
    return (
      <BottomSheet
        ref={refCancelRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{
          wrapper: {
            backgroundColor: "rgba(0,0,0,0.5)"
          },
          draggableIcon: {
            backgroundColor: "#000"
          }
        }}
      >
        <View style={styles.bottomSheetContent}>
          <View style={styles.modalProductInfo}>
            {/* <Image source={require('../../../../assets/images/order/percent.png')} style={{ height: 32, width: 32 }} /> */}
            {/* <Text style={appStyles.text_14_reg_mainTextColor2}>Cancel Order</Text> */}
          </View>

          {_getVerticalPadding(8)}

          {/* <View>
            <Text style={appStyles.text_14_reg_mainTextColor2}>If you cancel now, you may not be available this deal again. Do you still want to cancel?</Text>
          </View> */}

          <View>
            <Text style={appStyles.text_14_reg_mainTextColor2}>Are you sure you want to cancel this order ?</Text>
          </View>

          {_getVerticalPadding(16)}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonOutline]}
              onPress={() => refCancelRBSheet.current.close()}
            >
              <Text style={appStyles.text_14_reg_secondaryFont_primary}>DON'T CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonFilled]}
              onPress={() => {
                const check = isOrderCancelable(orderNode);
                if (!check.ok) {
                  alert('Order cannot be cancelled: ' + (check.reason || 'Not eligible'));
                  return;
                }
                refCancelRBSheet.current.close();
                navigation.navigate('RequestCancellationScreen', {
                  orderDetails: {
                    id: orderNode?.id,
                    imageUrl: primaryItem?.variant?.image?.url || 'https://via.placeholder.com/150',
                    productName: primaryItem?.title || orderNode?.name || '',
                    totalAmount,
                  }
                });
              }}
            >
              <Text style={appStyles.text_14_reg_secondaryFont}>CANCEL ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    )
  }

  return (
    <>

      <Toolbar
        title={'Order Details'}
        isFilter
        filerIcon={
          <View style={{
            borderWidth: 1,
            borderColor: '#F2F2F2',
            paddingHorizontal: 8
          }}>

            <Text style={appStyles.text_14_reg_mainTextColor2}>
              Help
            </Text>
          </View>

        }
        onFilter={() => refRBSheet.current.open()}
      />

      <View style={appStyles.container}>
        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} >
            {_getVerticalPadding(16)}

            {/* Display items grouped by fulfillment */}
            {fulfillmentGroups?.length > 0 ? (
              fulfillmentGroups.map((group, groupIndex) => {
                console.log('Rendering fulfillment group', groupIndex, group);
                const trackingInfo = group.tracking;
                const trackingNumber = trackingInfo?.[0]?.number || '';
                const trackingUrl = resolveTrackingUrl(trackingInfo?.[0]);
                const trackingCompany = deriveCompanyFromUrl(trackingInfo?.[0]?.company);
                const stages = getShipmentStatusStages(trackingInfo, group.fulfillmentStatus);

                console.log('Rendering fulfillment group', trackingInfo, trackingNumber, trackingUrl, stages);
                // Get displayStatus from fulfillments
                const fulfillment = orderNode?.fulfillments?.[groupIndex];
                const displayStatus = fulfillment?.displayStatus;
                const statusInfo = mapFulfillmentDisplayStatus(displayStatus);

                // Determine current shipment status text
                let shipmentStatusText = 'Order Confirmed';
                if (stages.isDelivered) shipmentStatusText = 'Delivered';
                else if (stages.isInTransit) shipmentStatusText = 'In Transit';
                else if (stages.isShipped) shipmentStatusText = 'Shipped';
                else if (stages.isPacked) shipmentStatusText = 'Packed';

                return (
                  <View key={`group-${groupIndex}`} style={styles.shipmentCard}>
                    {/* Shipment Card Header with Tracking */}
                    <View style={styles.shipmentCardHeader}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={appStyles.text_14_semi_mainTextColor2}>
                            Shipment {groupIndex + 1} {trackingCompany ? `- ${trackingCompany}` : ''}
                          </Text>
                          {/* Display Status with Icon */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                            <Text style={{ fontSize: 14 }}>{statusInfo.icon}</Text>
                            <Text style={[appStyles.text_11_reg_mainTextColor2, { color: '#FF6B35', fontWeight: '600' }]}>
                              {statusInfo.label}
                            </Text>
                          </View>
                        </View>
                      </View>
                      {trackingInfo && (
                        <TouchableOpacity
                          onPress={() => {
                            if (trackingUrl) {
                              navigation.navigate('WebViewScreen', {
                                url: trackingUrl,
                                title: `${trackingCompany || 'Tracking'}`
                              });
                            } else {
                              Alert.alert('Tracking Unavailable', 'No tracking link available.');
                            }
                          }}
                          style={[styles.trackingBadge, { marginTop: 12 }]}
                        >
                          <Text style={appStyles.text_10_reg_mainTextColor2}>Track: </Text>
                          <Text style={appStyles.text_10_reg_primary_secondaryFont}>{trackingNumber}</Text>
                          <Text style={appStyles.text_10_reg_primary_secondaryFont}> - See all updates </Text>
                        </TouchableOpacity>
                      )}

                    </View>

                    {/* Items in this shipment */}
                    <View style={styles.shipmentItemsContainer}>
                      {group.items.map((item, itemIndex) => {
                        const itemImage = item?.variant?.image?.url || 'https://via.placeholder.com/150';
                        const itemTitle = item?.title || item?.name || '';
                        const itemProductId = item?.variant?.product?.id;
                        return (
                          <View key={`${groupIndex}-${itemIndex}-${item.id}`} style={styles.shipmentItem}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              // onPress={() => {
                              //   if (itemProductId) {
                              //     navigation.navigate('ProductDetails', { productId: itemProductId });
                              //   } else {
                              //     Alert.alert('Unavailable', 'Could not open product page.');
                              //   }
                              // }}
                              disabled={true}
                              style={styles.itemTouchable}
                            >
                              <View style={styles.productInfoContainer}>
                                <Image source={{ uri: itemImage }} style={styles.productImage} />
                                <View style={{ flex: 1 }}>
                                  <Text style={appStyles.text_14_semi_mainTextColor2} numberOfLines={2}>{itemTitle}</Text>
                                  {!!item?.variant?.title && (
                                    <Text style={appStyles.text_11_reg_mainTextColor2}>{item.variant.title}</Text>
                                  )}
                                  {!!item?.quantity && (
                                    <Text style={appStyles.text_12_reg_mainTextColor2}>Qty: {item.quantity}</Text>
                                  )}
                                </View>
                              </View>
                            </TouchableOpacity>
                            {/* Item-level actions - Show return only if shipment is delivered and return window is open */}
                            {/* {isReturnEligible && (
                              <View style={styles.lineItemActionRow}>
                                <TouchableOpacity
                                  style={[styles.smallActionBtn, styles.returnActionBtn]}
                                  onPress={() => {
                                    navigation.navigate('RequestReturnScreen', { orderNode: orderNode, lineItem: item });
                                  }}
                                >
                                  <Text style={appStyles.text_12_reg_mainTextColor2}>Return</Text>
                                </TouchableOpacity>
                              </View>
                            )} */}
                            {itemIndex < group?.items?.length - 1 && (
                              <View style={styles.itemSeparator} />
                            )}
                          </View>
                        );
                      })}
                    </View>

                    {/* Shipment Status */}
                    <View style={{ padding: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}>
                      {renderOrderStatus(trackingInfo, group.fulfillmentStatus)}
                    </View>
                  </View>
                );
              })
            ) : (
              // Fallback: display all items without grouping
              lineItems.map((item, index) => {
                const itemImage = item?.variant?.image?.url || 'https://via.placeholder.com/150';
                const itemTitle = item?.title || '';
                const itemProductId = item?.variant?.product?.id;
                return (
                  <TouchableOpacity
                    key={`item-${index}`}
                    activeOpacity={0.8}
                    // onPress={() => {
                    //   if (itemProductId) {
                    //     navigation.navigate('ProductDetails', { productId: itemProductId });
                    //   } else {
                    //     Alert.alert('Unavailable', 'Could not open product page.');
                    //   }
                    // }}
                    disabled={true}
                    style={{ marginBottom: 12 }}
                  >
                    <View style={styles.productInfoContainer}>
                      <Image source={{ uri: itemImage }} style={styles.productImage} />
                      <View style={{ flex: 1 }}>
                        <Text style={appStyles.text_14_semi_mainTextColor2}>{itemTitle}</Text>
                        {!!item?.quantity && (
                          <Text style={appStyles.text_12_reg_mainTextColor2}>Qty: {item.quantity}</Text>
                        )}
                      </View>
                    </View>
                    {isReturnEligible && (
                      <View style={styles.lineItemActionRow}>
                        <TouchableOpacity
                          style={[styles.smallActionBtn, styles.returnActionBtn]}
                          onPress={() => {


                            navigation.navigate('RequestReturnScreen', { orderNode: orderNode, lineItem: item });
                          }}
                        >
                          <Text style={appStyles.text_12_reg_mainTextColor2}>Return</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            {!isCanceled &&
              remainingItems?.length > 0 && (
                <>
                  {_getVerticalPadding(16)}
                  <View style={styles.card}>
                    <Text style={appStyles.text_14_semi_mainTextColor2}>Items yet to be shipped</Text>
                    {_getVerticalPadding(8)}
                    {remainingItems?.map((item, index) => {

                      console.log('Rendering remaining unfulfilled item', item);
                      const itemImage = item?.variant?.image?.url || 'https://via.placeholder.com/150';
                      const itemTitle = item?.title || '';
                      const itemProductId = item?.variant?.product?.id;
                      return (
                        <TouchableOpacity
                          key={`remaining-item-${index}`}
                          activeOpacity={0.8}
                          onPress={() => {

                            console.log('Navigating to product details for unfulfilled item', itemProductId);
                            if (itemProductId) {
                              navigation.navigate('ProductDetails', { productId: itemProductId });
                            } else {
                              Alert.alert('Unavailable', 'Could not open product page.');
                            }
                          }}
                          style={{ marginBottom: 12 }}
                        >
                          <View style={styles.productInfoContainer}>
                            <Image source={{ uri: itemImage }} style={styles.productImage} />
                            <View style={{ flex: 1 }}>
                              <Text style={appStyles.text_14_semi_mainTextColor2}>{itemTitle}</Text>
                              {!!item?.remainingQuantity && (
                                <Text style={appStyles.text_12_reg_mainTextColor2}>Qty: {item.remainingQuantity}</Text>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )
            }

            <View style={styles.card}>
              <Text style={appStyles.text_14_semi_mainTextColor2}>{headerStatusText}</Text>
              {_getVerticalPadding(4)}
              <Text style={appStyles.text_12_reg_mainTextColor2}>
                {isCanceled ? `Your order was canceled ${canceledDate || ''}` : 'Your order has been placed'}
              </Text>
              {/* {renderOrderStatus()} */}

              <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />
              {_getVerticalPadding(8)}
              {fulfillmentGroups?.length > 0 && (
                <View>
                  <Text style={appStyles.text_12_semi_mainTextColor2}>Tracking Information</Text>
                  {_getVerticalPadding(4)}
                  {fulfillmentGroups.map((group, idx) => {
                    const trackingInfo = group.tracking[0];
                    if (!trackingInfo) return null;
                    const trackingUrl = trackingInfo.url;


                    const trackingCompany = deriveCompanyFromUrl(trackingInfo?.company);
                    return (
                      <TouchableOpacity
                        key={`track-${idx}`}
                        onPress={() => {
                          if (trackingUrl) {
                            navigation.navigate('WebViewScreen', {
                              url: trackingUrl,
                              title: `${trackingCompany || 'Tracking'}`
                            });
                          } else {
                            Alert.alert('Tracking Unavailable', 'No tracking link available.');
                          }
                        }}
                        style={styles.trackingItem}
                      >
                        <Text style={appStyles.text_11_reg_mainTextColor2}>
                          {trackingCompany || 'Shipment'} {idx + 1}: {' '}
                          <Text style={appStyles.text_11_reg_primary_secondaryFont}>
                            {trackingInfo.number}
                          </Text>
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
              {/* {_getVerticalPadding(8)} */}
              {/* {fulfillmentGroups.length > 0 && fulfillmentGroups[0].tracking && (
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => {
                    const firstTracking = fulfillmentGroups[0].tracking;
                    const url = resolveTrackingUrl(firstTracking);
                    if (url) {
                      navigation.navigate('WebViewScreen', { url, title: 'Tracking Updates' });
                    } else {
                      Alert.alert('Tracking Unavailable', 'No tracking information available.');
                    }
                  }}
                >
                  <Text style={appStyles.text_10_reg_primary_secondaryFont}>SEE ALL UPDATES</Text>
                </TouchableOpacity>
              )} */}
            </View>

            {/* {_getVerticalPadding(16)} */}
            {/* <View style={styles.cardNormal}>
              <Text style={appStyles.text_12_reg_primary_secondaryFont}>RATE YOUR EXPERIENCE</Text>

              {_getVerticalPadding(8)}

              <TouchableOpacity style={styles.helpfulContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ThumbsUp size={22} />
                  <Text style={styles.text_12_reg_mainTextColor2}>Did you find this page helpful?</Text>

                </View>
                <ChevronRightIcon color={'#1f1f1f'} size={18} />
              </TouchableOpacity>
            </View> */}

            {_getVerticalPadding(16)}

            <View style={styles.cardNormal}>
              <Text style={appStyles.text_14_semi_mainTextColor2}>{headerStatusText}</Text>

              {_getVerticalPadding(8)}
              <View style={styles.addressMainContainer}>

                <View style={styles.addressContainer}>


                  <MapPin size={22} />

                  <View style={{ flex: 1 }}>

                    <Text style={appStyles.text_14_reg_mainTextColor2}>{addressText}</Text>

                  </View>

                </View>

                {_getVerticalPadding(8)}

                <View style={{ height: 1, backgroundColor: '#DEDEDE' }} />

                {_getVerticalPadding(8)}

                <View style={styles.addressContainer}>


                  <UserCircle size={22} />


                  <View style={{ flex: 1 }}>


                    <Text style={appStyles.text_14_reg_mainTextColor2}>{contactText}</Text>
                  </View>


                </View>

              </View>

            </View>


            {/* <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Confirmed</Text>
            <View style={styles.addressContainer}>
              <Text style={styles.icon}>📍</Text>
              <Text style={styles.addressText}>{orderDetails.address}</Text>
            </View>
            <View style={styles.addressContainer}>
              <Text style={styles.icon}>📞</Text>
              <Text style={styles.addressText}>{orderDetails.contact}</Text>
            </View>
          </View> */}

            {_getVerticalPadding(16)}

            <Text style={appStyles.text_14_semi_mainTextColor2}>Price details</Text>

            {_getVerticalPadding(8)}

            <View style={styles.addressMainContainer}>
              <View style={styles.priceDetailRow}>
                <Text style={appStyles.text_14_reg_mainTextColor2}>Selling price</Text>
                <Text style={appStyles.text_14_reg_mainTextColor2}>₹{sellingPrice}</Text>
              </View>
              <View style={styles.priceDetailRow}>
                <Text style={appStyles.text_14_reg_mainTextColor2}>Delivery Fee</Text>
                <Text style={appStyles.text_14_reg_mainTextColor2}>₹{deliveryFee}</Text>
              </View>

              <View style={{
                borderBottomWidth: 1,
                borderStyle: 'dashed',
              }} />

              {_getVerticalPadding(8)}

              <View style={styles.priceDetailRow}>
                <Text style={appStyles.text_14_semi_mainTextColor2}>Total amount</Text>
                <Text style={appStyles.text_14_semi_mainTextColor2}>₹{totalAmount}</Text>
              </View>
              <View style={styles.priceDetailRow}>
                <Text style={appStyles.text_14_reg_mainTextColor2}>Paid by</Text>
                <Text style={appStyles.text_14_reg_mainTextColor2}>{paidBy}</Text>
              </View>
            </View>

            {_getVerticalPadding(8)
            }
            <View >
              <Text style={appStyles.text_14_semi_mainTextColor2}>Order Number</Text>

              <View style={styles.orderIdContainer}>
                <Text style={appStyles.text_12_reg_mainTextColor2}>{orderNode?.orderNumber || 'N/A'}</Text>
              </View>
            </View>

            <View >
              <Text style={appStyles.text_14_semi_mainTextColor2}>Order ID</Text>

              <View style={styles.orderIdContainer}>
                <Text style={appStyles.text_12_reg_mainTextColor2}>{orderIdFull}</Text>
                <TouchableOpacity>
                  <Image
                    source={require('../../../../assets/images/account/copy.png')}

                    style={styles.copyIcon} />
                </TouchableOpacity>
              </View>
            </View>

            {_getVerticalPadding(16)}

            {/* Cancel button for orders not yet packed - only show if no fulfillments exist */}
            {canCancelOrder && isOrderCancelable(orderNode).ok && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelActionBtn]}
                  onPress={() => {
                    refCancelRBSheet.current.open();
                  }}
                >
                  <Text style={[appStyles.text_14_reg_secondaryFont_primary]}>CANCEL ORDER</Text>
                </TouchableOpacity>
              </View>
            )}



          </ScrollView>
        )}


        <PrimaryButton title={'Shop More'} onPress={() => {

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'HomeTabs' }],
            }),
          );

        }} />

        {_getVerticalPadding(insets.bottom > 0 ? insets.bottom : 12)}

      </View>

      {getMoreOptionBottomSheet()}
      {getCancelBottomSheet()}

    </ >
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  bottomSheetContent: {
    padding: 20,
    alignItems: 'center',
  },
  modalProductInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  modalProductImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  modalProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  modalCancelText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 5,
    padding: 15,
    // elevation: 2,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  buttonFilled: {
    backgroundColor: '#e74c3c',
  },
  textStyleOutline: {
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyleFilled: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    padding: 15,

  },
  cardNormal: {
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  orderStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statusItem: {
    alignItems: 'center',
    // flex: 1,
  },
  statusCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  completedCircle: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  checkMark: {
    color: '#fff',
    fontSize: 12,
  },
  statusLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
    borderRadius: 2,
  },
  statusLineActive: {
    backgroundColor: '#28a745',
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
  },
  statusDate: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  seeAllUpdatesText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  helpfulContainer: {
    backgroundColor: '#F2F2F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: heightPixel(12),
    borderRadius: 8,
  },
  addressMainContainer: {
    backgroundColor: '#F2F2F2',
    padding: heightPixel(12),
    borderRadius: 8,
  },
  helpfulText: {
    fontSize: 14,
    color: '#555',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#888',
  },
  addressContainer: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
    alignItems: 'center',
    // alignItems: 'flex-start',

  },
  icon: {
    marginRight: 10,
    fontSize: 18,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  priceDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceDetailLabel: {
    fontSize: 14,
    color: '#555',
  },
  priceDetailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalAmountLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  orderIdContainer: {
    paddingVertical: heightPixel(8),
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdText: {
    fontSize: 14,
    color: '#555',
  },
  copyIcon: {
    width: 20,
    height: 20,
    // fontSize: 16,
    // color: '#007bff',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: heightPixel(12),
  },
  actionBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  returnBtn: {
    backgroundColor: '#F2F2F2',
    marginRight: 8,
  },
  exchangeBtn: {
    backgroundColor: '#C1272D',
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  returnText: {
    color: '#444',
  },
  exchangeText: {
    color: '#fff',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#888',
  },
  shopMoreButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  shopMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  shipmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  shipmentCardHeader: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  trackingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  shipmentItemsContainer: {
    padding: 12,
  },
  shipmentItem: {
    marginBottom: 8,
  },
  itemTouchable: {
    marginBottom: 4,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  fulfillmentGroup: {
    marginBottom: 16,
  },
  trackingHeader: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackingHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingItem: {
    paddingVertical: 4,
  },
  groupSeparator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  lineItemActionRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  smallActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  cancelActionBtn: {
    borderColor: '#E74C3C',
    backgroundColor: '#FFF',
  },
  returnActionBtn: {
    borderColor: '#3498DB',
    backgroundColor: '#FFF',
  },
  returnActionBtnFull: {
    backgroundColor: '#3498DB',
    borderColor: '#3498DB',
  },
  smallActionBtnDisabled: {
    opacity: 0.5,
    borderColor: '#CCC',
  },
  statusLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  statusLabelItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  inTransitBadge: {
    backgroundColor: '#FFE8E0',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginVertical: -4,
  },
});

export default OrderDetailsScreen;