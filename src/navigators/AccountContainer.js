import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyAccountScreen from '../screens/profile/MyAccountScreen';

import EditProfile from '../screens/profile/EditProfile';
import MyOrdersScreen from '../screens/profile/order/MyOrdersScreen';
import OrderDetailsScreen from '../screens/profile/order/OrderDetailsScreen';
import RequestCancellationScreen from '../screens/profile/order/cancel/RequestCancellationScreen';
import CancellationConfirmedScreen from '../screens/profile/order/cancel/CancellationConfirmedScreen';
import Notifications from '../screens/profile/Notifications';
import Wishlist from '../screens/profile/Wishlist';
import Login from '../screens/auth/Login';
import SignUp from '../screens/auth/SignUp';
import CreateAccount from '../screens/auth/CreateAccount';
import ForgotPassword from '../screens/auth/ForgotPassword';

import BookAndTrail from '../screens/profile/BookAndTrail';
import AddAddress from '../screens/profile/address/AddAddress';
import EditAddress from '../screens/profile/address/EditAddress';
import WebPage from '../screens/drawer/WebPage';
import LoginBottomSheet from '../components/ui/LoginBottomSheet';
import LoginWithOtpScreen from '../screens/LoginWithOtpScreen';
import LoginScreen from '../screens/profile/LoginScreen';

const AccountStack = createStackNavigator();

const AccountContainer = () => {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="MyAccount" component={MyAccountScreen} />
      <AccountStack.Screen name="EditProfile" component={EditProfile} />
      <AccountStack.Screen name="MyOrders" component={MyOrdersScreen} />
      <AccountStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <AccountStack.Screen name="Notifications" component={Notifications} />
      <AccountStack.Screen name="Wishlist" component={Wishlist} />
      <AccountStack.Screen name="Login" component={LoginScreen} />
      <AccountStack.Screen name="SignUp" component={SignUp} />
      <AccountStack.Screen name="CreateAccount" component={CreateAccount} />
      <AccountStack.Screen name="ForgotPassword" component={ForgotPassword} />

      <AccountStack.Screen name="BookAndTrail" component={BookAndTrail} />

      <AccountStack.Screen name="AddAddress" component={AddAddress} />
      <AccountStack.Screen name="EditAddress" component={EditAddress} />


      <AccountStack.Screen
        name="RequestCancellationScreen"
        component={RequestCancellationScreen}
      />
      <AccountStack.Screen
        name="CancellationConfirmedScreen"
        component={CancellationConfirmedScreen}
      />

      <AccountStack.Screen
        name="WebViewScreen"
        component={WebPage}
      />
    </AccountStack.Navigator>
  );
};

export default AccountContainer;