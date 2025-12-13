import React, { use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AppStyles from '../../../../styles/AppStyles';
import Toolbar from '../../../../components/ui/Toolbar';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CancellationConfirmedScreen = ({ }) => {
  const { colorScheme, } = useSelector(state => state.app);

  const appStyles = AppStyles.getAllStyles(colorScheme);

  const navigation = useNavigation();

  const insets = useSafeAreaInsets();


  return (
    <View style={appStyles.container}>

      <TouchableOpacity style={{
        marginTop: insets.top + 10,
      }} onPress={() => {
        navigation.navigate('MyOrders')
      }}>

        <X />

      </TouchableOpacity>
      <Text style={appStyles.text_20_semi_mainTextColor2}>Cancellation Confirmed</Text>

      <TouchableOpacity style={{
        height: 43, width: '100%', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 20,
        // marginBottom: 20,
        borderBottomWidth: 0.5,

      }}
        onPress={() => {
          //reset the navigation stack to HomeDrawer
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeDrawer' }],
          });
        }}
      >
        <Text style={appStyles.text_16_reg_mainTextColor2}>Keep Shopping</Text>


      </TouchableOpacity>
      <TouchableOpacity style={{
        height: 43, width: '100%', flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 20,
        marginBottom: 20,
        borderBottomWidth: 0.5,

      }}
        onPress={() => {
          navigation.navigate('MyOrders')
        }}
      >

        <Text style={appStyles.text_16_reg_mainTextColor2}>View All Orders</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: 'red',
    // justifyContent: 'center',
    // alignItems: 'center',
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