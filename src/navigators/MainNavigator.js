import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DrawerNavigator from './DrawerNavigator';
import ProductList from '../screens/product/ProductList';
import SearchPage from '../screens/profile/SearchPage';
import ProductDetails from '../screens/product/ProductDetails';
import Privacy from '../screens/profile/Privacy';

const Stack = createStackNavigator();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Drawer" component={DrawerNavigator} />
            <Stack.Screen name="ProductList" component={ProductList} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} />

            <Stack.Screen name="SearchPage" component={SearchPage} />

            <Stack.Screen
                options={{
                    headerShown: false,
                    tabBarStyle: { display: 'none' }
                }}
                name="Checkout"
                component={Privacy}
            />
        </Stack.Navigator>
    );
};

export default MainNavigator;
