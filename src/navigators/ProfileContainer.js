import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/profile/Profile';
import Privacy from '../screens/profile/Privacy';
import EditProfile from '../screens/profile/EditProfile';
import MyOrdersScreen from '../screens/profile/order/MyOrdersScreen';
import OrderDetailsScreen from '../screens/profile/order/OrderDetailsScreen';
import RequestCancellationScreen from '../screens/profile/order/cancel/RequestCancellationScreen';
import CancellationConfirmedScreen from '../screens/profile/order/cancel/CancellationConfirmedScreen';

const ProfileStack = createStackNavigator();



const ProfileContainer = () => {
    return (

        // <View style={{ backgroundColor: 'red' }}><Text style={styles.text_14_bold_black}>asdfasfd</Text></View>

        <ProfileStack.Navigator
            initialRouteName="Profile"
            screenOptions={{
                headerShown: false,
            }}>
            <ProfileStack.Screen
                name="Profile"
                component={Profile}
            />

            <ProfileStack.Screen
                name="Privacy"
                component={Privacy}
            />

            <ProfileStack.Screen name="MyOrders" component={MyOrdersScreen} />


            <ProfileStack.Screen name="OrderDetails" component={OrderDetailsScreen} />


            <ProfileStack.Screen
                name="EditProfile"
                component={EditProfile}
            />


            <ProfileStack.Screen
                name="RequestCancellationScreen"
                component={RequestCancellationScreen}
            />
            <ProfileStack.Screen
                name="CancellationConfirmedScreen"
                component={CancellationConfirmedScreen}
            />


        </ProfileStack.Navigator>
    )
}

export default ProfileContainer
