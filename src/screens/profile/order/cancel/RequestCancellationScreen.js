import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import AppStyles from '../../../../styles/AppStyles';
import Toolbar from '../../../../components/ui/Toolbar';
import { fetchOrderById, isOrderCancelable, cancelOrderAdmin } from '../../../../graphql/graph_request';

const RequestCancellationScreen = ({ navigation, route }) => {
  const { orderDetails } = route.params; // Assuming orderDetails is passed via navigation params
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');

  const cancellationReasons = [
    'I want to change the payment option',
    'I\'m worried about the ratings/reviews',
    'I want to change the size/color/type',
    'Price of the product has now decreased',
    'My reason is not listed here',
    'I want to change the delivery address',
    'I was hoping for a shorter delivery time',
    'I want to change the contact details',
    'I want to change the delivery date',
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

  const handleSubmit = async () => {
    const uiReason = selectedReason || 'Other';
    const adminReason = mapReasonToAdminReason(uiReason);
    const id = orderDetails?.id; // Expecting Admin GID: gid://shopify/Order/...
    try {
      // Optional: fetch order for eligibility
      const res = await fetchOrderById(id);
      const node = res?.node?.__typename === 'Order' ? res.node : null;
      const check = isOrderCancelable(node);
      if (!check.ok) {
        alert('Order cannot be cancelled: ' + (check.reason || 'Not eligible'));
        return;
      }
      const cancelled = await cancelOrderAdmin({ id, reason: adminReason, restock: true, notifyCustomer: true });
      if (cancelled?.canceledAt) {
        navigation.navigate('CancellationConfirmedScreen', { reason: uiReason });
        return;
      }
      alert('Could not cancel order.');
    } catch (e) {
      alert(e?.message || 'Cancel failed');
    }
  };

  return (
    <View style={AppStyles.container}>

      <Toolbar title={'Request Cancellation'} />

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