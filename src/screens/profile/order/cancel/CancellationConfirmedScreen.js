import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppStyles from '../../../../styles/AppStyles';
import Toolbar from '../../../../components/ui/Toolbar';

const CancellationConfirmedScreen = ({ navigation }) => {
  return (
    <View style={AppStyles.container}>
      <Toolbar title={'Cancellation Confirmed'} />
      <View style={styles.contentContainer}>
        <Text style={styles.confirmationText}>Cancellation Confirmed</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Keep Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ProfileStack', { screen: 'OrderDetailsScreen' })}>
          <Text style={styles.buttonText}>View All Orders</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 15,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CancellationConfirmedScreen;