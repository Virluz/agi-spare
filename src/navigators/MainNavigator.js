import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabs } from './BottomTabs';
import ProductList from '../screens/product/ProductList';
import SearchPage from '../screens/profile/SearchPage';
import SearchResultsPage from '../screens/profile/SearchResultsPage';
import ProductDetails from '../screens/product/ProductDetails';
import Privacy from '../screens/profile/Privacy';
import AccountContainer from './AccountContainer';
import WebPage from '../screens/drawer/WebPage';
import Wishlist from '../screens/profile/Wishlist';
import Notifications from '../screens/profile/Notifications';

const Stack = createStackNavigator();

const MainNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="HomeTabs" component={BottomTabs} />
            <Stack.Screen name="ProductList" component={ProductList} />
            <Stack.Screen name="ProductDetails" component={ProductDetails} />
            <Stack.Screen name="SearchPage" component={SearchPage} />
            <Stack.Screen name="SearchResultsPage" component={SearchResultsPage} />
            <Stack.Screen name="AccountContainer" component={AccountContainer} />
            <Stack.Screen name="WebViewScreen" component={WebPage} />
            <Stack.Screen name="Wishlist" component={Wishlist} />
            <Stack.Screen name="Notifications" component={Notifications} />
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
