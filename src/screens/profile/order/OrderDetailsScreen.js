import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import AppStyles from '../../../styles/AppStyles';
import { useState, useRef, useEffect, useMemo } from 'react';
import BottomSheet from 'react-native-raw-bottom-sheet';
import Toolbar from '../../../components/ui/Toolbar';
import { _getVerticalPadding } from '../../../utils/Helper';
import { useSelector } from 'react-redux';
import { PrimaryButton } from '../../../components/ui/PrimaryButton';
import { CommonActions, useIsFocused } from '@react-navigation/native';
import { ChevronRightIcon, DropletIcon, LocateIcon, MapPin, MapPinCheck, MapPinHouse, Navigation, Navigation2, ThumbsUp, User, UserCircle } from 'lucide-react-native';
import { heightPixel } from '../../../utils/fonts';
import { fetchOrderById, isOrderCancelable } from '../../../graphql/graph_request';

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

  useEffect(() => {
    if (!isFocused) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchOrderById(orderId);
        const node = res?.node?.__typename === 'Order' ? res.node : null;
        setOrderNode(node);
      } catch (e) {
        console.error('Failed to fetch order details', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, isFocused]);

  const primaryItem = useMemo(() => orderNode?.lineItems?.edges?.[0]?.node, [orderNode]);
  const imageUrl = primaryItem?.variant?.image?.url || 'https://via.placeholder.com/150';
  const productName = primaryItem?.title || orderNode?.name || '';
  const addr = orderNode?.shippingAddress;
  const addressText = addr ? `${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city}, ${addr.province} - ${addr.zip}` : '';
  const contactText = addr ? `${addr.firstName || ''} ${addr.lastName || ''} ${addr.phone || ''}`.trim() : '';
  const sellingPrice = Number(orderNode?.subtotalPriceV2?.amount || 0);
  const deliveryFee = Number(orderNode?.totalShippingPriceV2?.amount || 0);
  const totalAmount = Number(orderNode?.totalPriceV2?.amount || 0);
  const paidBy = orderNode?.financialStatus || '';
  const orderIdFull = orderNode?.name || '';
  const orderConfirmedDate = orderNode?.processedAt ? new Date(orderNode.processedAt).toDateString() : '';
  const isCanceled = !!orderNode?.canceledAt;
  const canceledDate = isCanceled && orderNode?.canceledAt ? new Date(orderNode.canceledAt).toDateString() : '';
  const fulfillment = orderNode?.fulfillmentStatus;
  const isDelivered = fulfillment === 'FULFILLED';
  const isInProgress = fulfillment === 'IN_PROGRESS';
  const headerStatusText = isCanceled ? 'Order Canceled' : isDelivered ? 'Delivered' : isInProgress ? 'On the way' : 'Order Confirmed';

  // Eligibility: simple client-side check
  // NOTE: Storefront API doesn't give an exact deliveredAt. We fallback to processedAt when fulfilled.
  const RETURN_WINDOW_DAYS = 7;   // editable
  const EXCHANGE_WINDOW_DAYS = 15; // editable
  const deliveredAt = isDelivered && orderNode?.processedAt ? new Date(orderNode.processedAt) : null;
  const daysSinceDelivery = deliveredAt ? Math.floor((Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isReturnEligible = !!(isDelivered && daysSinceDelivery !== null && daysSinceDelivery <= RETURN_WINDOW_DAYS);
  const isExchangeEligible = !!(isDelivered && daysSinceDelivery !== null && daysSinceDelivery <= EXCHANGE_WINDOW_DAYS);

  const renderOrderStatus = () => {
    if (isCanceled) {
      return (
        <View style={[styles.orderStatusContainer, { justifyContent: 'center' }]}>
          <Text style={appStyles.text_12_reg_mainTextColor2}>Order was canceled {canceledDate || ''}</Text>
        </View>
      );
    }
    return (
      <View style={styles.orderStatusContainer}>
        <View style={styles.statusItem}>
          <View style={[styles.statusCircle, styles.completedCircle]}><Text style={styles.checkMark}>✓</Text></View>
          <Text style={appStyles.text_10_reg_mainTextColor2}>Order Confirmed {orderConfirmedDate || ''}</Text>
        </View>
        <View style={styles.statusLine} />
        <View style={styles.statusItem}>
          <View style={[styles.statusCircle, isInProgress || isDelivered ? styles.completedCircle : null]}>{(isInProgress || isDelivered) && <Text style={styles.checkMark}>✓</Text>}</View>
          <Text style={appStyles.text_10_reg_mainTextColor2}>Shipped</Text>
        </View>
        <View style={styles.statusLine} />
        <View style={styles.statusItem}>
          <View style={[styles.statusCircle, isDelivered ? styles.completedCircle : null]}>{isDelivered && <Text style={styles.checkMark}>✓</Text>}</View>
          <Text style={appStyles.text_10_reg_mainTextColor2}>Delivery</Text>
        </View>
      </View>
    );
  };

  const getMoreOptionBottomSheet = () => {
    return (
      <BottomSheet
        ref={refRBSheet}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Need help?</Text>
          <TouchableOpacity style={styles.helpOption} onPress={() => refCancelRBSheet.current.open()}>
            <Text style={styles.helpIcon}>ⓧ Cancel Order</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpOption}>
            <Text style={styles.helpIcon}>📦 Return Policy</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpOption}>
            <Text style={styles.helpIcon}>💰 Refund Policy</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
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
            <Image source={{ uri: imageUrl }} style={styles.modalProductImage} />
            <View>
              <Text style={styles.modalProductName}>{productName}</Text>
              <Text style={styles.modalCancelText}>If you cancel now, you may not be avail this deal again. Do you still want to cancel?</Text>
            </View>
          </View>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.buttonOutline]}
              onPress={() => refCancelRBSheet.current.close()}
            >
              <Text style={styles.textStyleOutline}>DON'T CANCEL</Text>
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
                    id: orderNode?.id, // Admin GID
                    imageUrl,
                    productName,
                    totalAmount,
                  }
                });
              }}
            >
              <Text style={styles.textStyleFilled}>CANCEL ORDER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>

    )

  }

  return (
    <>

      <Toolbar title={'Order Details'} isFilter filerIcon={
        <View style={{
          borderWidth: 1,
          borderColor: '#F2F2F2',
          padding: 8
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

            <View style={styles.productInfoContainer}>
              <Image source={{ uri: imageUrl }} style={styles.productImage} />
              <View style={{ flex: 1 }}>
                <Text style={appStyles.text_14_semi_mainTextColor2}>{productName}</Text>
              </View>

            </View>

            <View style={styles.card}>
              <Text style={appStyles.text_14_semi_mainTextColor2}>{headerStatusText}</Text>
              {_getVerticalPadding(4)}
              <Text style={appStyles.text_12_reg_mainTextColor2}>
                {isCanceled ? `Your order was canceled ${canceledDate || ''}` : 'Your order has been placed'}
              </Text>
              {renderOrderStatus()}

              <View style={{ height: 1, backgroundColor: '#F2F2F2' }} />
              {_getVerticalPadding(8)}
              <TouchableOpacity style={{ alignItems: 'center' }}>

                <Text style={appStyles.text_10_reg_primary_secondaryFont}>SEE ALL UPDATES</Text>
              </TouchableOpacity>
            </View>

            {_getVerticalPadding(16)}
            <View style={styles.cardNormal}>
              <Text style={appStyles.text_12_reg_primary_secondaryFont}>RATE YOUR EXPERIENCE</Text>

              {_getVerticalPadding(8)}

              <TouchableOpacity style={styles.helpfulContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ThumbsUp size={22} />
                  <Text style={styles.text_12_reg_mainTextColor2}>Did you find this page helpful?</Text>

                </View>
                <ChevronRightIcon color={'#1f1f1f'} size={18} />
              </TouchableOpacity>
            </View>

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

            {/* Return / Exchange actions for Delivered orders */}
            {isDelivered && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.returnBtn, !isReturnEligible && styles.disabledBtn]}
                  onPress={() => {
                    if (!isReturnEligible) {
                      Alert.alert('Not eligible', `Returns are allowed within ${RETURN_WINDOW_DAYS} days of delivery.`);
                      return;
                    }
                    Alert.alert('Return', 'Return flow can be implemented here.');
                  }}
                  disabled={!isReturnEligible}
                >
                  <Text style={[styles.actionText, !isReturnEligible ? styles.disabledText : styles.returnText]}>RETURN ITEM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.exchangeBtn, !isExchangeEligible && styles.disabledBtn]}
                  onPress={() => {
                    if (!isExchangeEligible) {
                      Alert.alert('Not eligible', `Exchanges are allowed within ${EXCHANGE_WINDOW_DAYS} days of delivery.`);
                      return;
                    }
                    Alert.alert('Exchange', 'Exchange flow can be implemented here.');
                  }}
                  disabled={!isExchangeEligible}
                >
                  <Text style={[styles.actionText, styles.exchangeText]}>EXCHANGE ITEM</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* <TouchableOpacity style={styles.shopMoreButton} onPress={() => refRBSheet.current.open()}>
          <Text style={styles.shopMoreButtonText}>SHOW MORE</Text>
        </TouchableOpacity> */}



            {/* {_getVerticalPadding(50)} */}



          </ScrollView>
        )}


        <PrimaryButton title={'Shop More'} onPress={() => {

          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'HomeDrawer' }],
            }),
          );

        }} />

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
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  modalProductImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
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
    elevation: 2,
    marginHorizontal: 5,
    alignItems: 'center',
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
    flex: 1,
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
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
    height: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
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
  }
});

export default OrderDetailsScreen;