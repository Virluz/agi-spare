import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../screens/profile/Profile';
import Privacy from '../screens/profile/Privacy';
import Cart from '../screens/cart/Cart';
import PickupSelector from '../screens/checkout/PickupSelector';
import CustomCheckout from '../screens/checkout/CustomCheckout';
const CartStack = createStackNavigator();



const CartContainer = () => {
    return (

        // <View style={{ backgroundColor: 'red' }}><Text style={styles.text_14_bold_black}>asdfasfd</Text></View>

        <CartStack.Navigator
            initialRouteName="Cart"
            screenOptions={{
                // ...AppStyles.getToolbarStyle(),
                // headerTitleStyle: styles.text_14_bold_mainTextColor2,
                // headerLeft: () => (
                //     <BackButton />
                // ),
            }}>

            <CartStack.Screen
                options={{
                    headerShown: false,
                }}
                name="Cart"
                component={Cart}
            />


            <CartStack.Screen
                options={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' }
                }}
                name="Checkout"
                component={Privacy}
            />

            <CartStack.Screen
                options={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' }
                }}
                name="CustomCheckout"
                component={CustomCheckout}
            />

            <CartStack.Screen
                options={{
                    headerShown: true,
                    title: 'Store Pickup'
                }}
                name="PickupSelector"
                component={PickupSelector}
            />




        </CartStack.Navigator>
    )
}

export default CartContainer