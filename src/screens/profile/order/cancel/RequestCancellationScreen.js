import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import AppStyles from '../../../../styles/AppStyles';
import Toolbar from '../../../../components/ui/Toolbar';
import { fetchOrderById, isOrderCancelable, cancelOrderAdmin } from '../../../../graphql/graph_request';
import { cancelOrderExternal } from '../../../../api/requests';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from '../../../../utils/Constants';

const RequestCancellationScreen = ({ navigation, route }) => {
  const { orderDetails } = route.params; // Assuming orderDetails is passed via navigation params
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');

  const cancellationReasons = [
    'Ordered the wrong product',
    'Ordered the wrong size',
    'Changed my mind ',
    'Found a better price elsewhere',
    'Need to change delivery address / details',
    'Delivery date is too long',
    'Payment or technical issue',
    'Other reason'
  ];

  const mapReasonToAdminReason = (label) => {
    if (!label) return 'CUSTOMER';
    const l = label.toLowerCase();
    if (l.includes('payment')) return 'CUSTOMER';
    if (l.includes('ratings') || l.includes('reviews')) return 'CUSTOMER';
    if (l.includes('size') || l.includes('color') || l.includes('type')) return 'CUSTOMER';
    if (l.includes('price')) return 'CUSTOMER';
    if (l.includes('address') || l.includes('contact') || l.includes('delivery date')) return 'CUSTOMER';
    if (l.includes('delivery time')) return 'CUSTOMER';
    return 'OTHER';
  };

  const createRefundForOrder = async (orderId) => {
    try {
      // Create refund mutation for Shopify Admin API
      const mutation = `
        mutation refundCreate($input: RefundInput!) {
          refundCreate(input: $input) {
            refund {
              id
              totalRefundedSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        input: {
          orderId: orderId,
          notify: true,
          note: 'Refund for cancelled order'
        }
      };

      const { shopifyClient } = require('../../../../graphql/shopifyClient');
      const result = await shopifyClient.request(mutation, variables);

      if (result?.refundCreate?.userErrors?.length > 0) {
        console.warn('Refund errors:', result.refundCreate.userErrors);
        return { ok: false, errors: result.refundCreate.userErrors };
      }

      return { ok: true, refund: result?.refundCreate?.refund };
    } catch (error) {
      console.error('Refund creation error:', error);
      return { ok: false, error: error.message };
    }
  };

  const handleSubmit = async () => {
    const uiReason = selectedReason || 'Other';
    const finalReason = selectedReason === 'My reason is not listed here' ? customReason : uiReason;
    const orderId = orderDetails?.id; // Expecting Admin GID: gid://shopify/Order/...

    if (!orderId) {
      Alert.alert('Error', 'Missing orderId for cancellation.');
      return;
    }

    if (selectedReason === 'My reason is not listed here' && !customReason?.trim()) {
      Alert.alert('Error', 'Please enter your reason.');
      return;
    }

    try {
      // Fetch order for eligibility check
      const res = await fetchOrderById(orderId);
      const node = res?.node?.__typename === 'Order' ? res.node : null;
      const check = isOrderCancelable(node);

      if (!check.ok) {
        Alert.alert('Cannot Cancel', `Order cannot be cancelled: ${check.reason || 'Not eligible'}`);
        return;
      }

      // Map user-friendly reason to Admin API reason enum
      const adminReason = mapReasonToAdminReason(selectedReason);

      console.log('Canceling order:', orderId, 'Reason:', adminReason);

      // Step 1: Cancel the order using Admin API
      const cancelResult = await cancelOrderAdmin({
        orderId: orderId,
        reason: adminReason,
        restock: true,
        notifyCustomer: true
      });

      if (cancelResult?.userErrors?.length > 0) {
        const errorMsg = cancelResult.userErrors.map(e => e.message).join(', ');
        Alert.alert('Cancellation Failed', errorMsg);
        return;
      }

      console.log('Order cancelled successfully:', cancelResult);

      // Step 2: Create refund for the cancelled order
      console.log('Creating refund for order:', orderId);
      const refundResult = await createRefundForOrder(orderId);

      if (refundResult?.ok) {
        console.log('Refund created successfully:', refundResult.refund);
      } else {
        console.warn('Refund creation failed:', refundResult.error || refundResult.errors);
        // Don't block the cancellation flow if refund fails
      }

      // Step 3: Also update external system if needed
      try {
        const accessToken = await AsyncStorage.getItem('customerAccessToken') || 'accessToken';
        const orderNumber = orderId.split('/').pop();
        const firstLineItem = node?.lineItems?.edges?.[0]?.node;
        const itemId = firstLineItem?.variant?.id?.split('/').pop() || '12943539255';

        const cancelPayload = {
          source: Constants.ORDER_CANCELLATION.SOURCE,
          orderId: orderNumber,
          itemIds: [itemId],
          status: "CANCELLED",
          reason: finalReason,
          createdAt: Date.now(),
          metadata: Constants.ORDER_CANCELLATION.METADATA
        };

        // await cancelOrderExternal(cancelPayload, accessToken);
      } catch (externalError) {
        console.warn('External cancellation update failed:', externalError);
        // Don't block the flow if external update fails
      }

      Alert.alert(
        'Success',
        refundResult?.ok
          ? 'Order cancelled and refund initiated successfully!'
          : 'Order cancelled successfully! Refund will be processed separately.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('CancellationConfirmedScreen', { reason: finalReason })
          }
        ]
      );

    } catch (e) {
      console.error('Cancel order error:', e);
      Alert.alert('Error', e?.message || 'Failed to cancel order. Please try again.');
    }
  };

  return (
    <View style={AppStyles.container}>

      <Toolbar title={'Request Cancellation'} isSearch={false} />

      <ScrollView style={styles.scrollViewContent}>
        <View style={styles.productInfoContainer}>
          <Image source={{ uri: orderDetails.imageUrl }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productName}>{orderDetails.productName}</Text>
            <Text style={styles.productPrice}>₹{orderDetails.totalAmount}</Text>
          </View>
          <Text style={styles.productQty}>Qty: 1</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reason for Cancellation</Text>
          {cancellationReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.radioButton}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={styles.radioCircle}>
                {selectedReason === reason && <View style={styles.selectedRadioCircle} />}
              </View>
              <Text style={styles.radioLabel}>{reason}</Text>
            </TouchableOpacity>
          ))}

          {selectedReason === 'My reason is not listed here' && (
            <TextInput
              style={styles.textInput}
              placeholder="Write comment*(not more than 50 words)"
              multiline
              numberOfLines={4}
              value={customReason}
              onChangeText={setCustomReason}
              maxLength={50}
            />
          )}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT REQUEST</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    // flex: 1,
    backgroundColor: '#f0f0f0',
  },
  productInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  productQty: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  selectedRadioCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#dc3545',
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RequestCancellationScreen;