import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home/Home';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import AppStyles from '../styles/AppStyles';
import { useSelector } from 'react-redux';
import ProductDetails from '../screens/product/ProductDetails';
import ProductList from '../screens/product/ProductList';
import Collections from '../screens/home/Collections';
import Privacy from '../screens/profile/Privacy';
import LevelOne from '../screens/category/LevelOne';
const HomeStack = createStackNavigator();




const HomeContainer = ({ navigation, route }) => {
    const { colorScheme } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);


    // React.useLayoutEffect(() => {
    //     const routeName = getFocusedRouteNameFromRoute(route);
    //     console.log("routeName", routeName);

    //     const tabHiddenRoutes = [
    //         'NoficationDetail',
    //     ];

    //     if (tabHiddenRoutes.includes(routeName)) {
    //         navigation.setOptions({ tabBarStyle: { display: 'none' } });
    //     } else {
    //         navigation.setOptions({
    //             tabBarStyle: styles.tabBarStyle,
    //         });
    //     }
    // }, [navigation, route]);


    return (


        <HomeStack.Navigator
            initialRouteName="Home"
            screenOptions={{
                // ...AppStyles.getToolbarStyle(),
                // headerTitleStyle: styles.text_14_bold_mainTextColor2,
                // headerLeft: () => (
                //     <BackButton />
                // ),
                headerShown: false
            }}
        >
            <HomeStack.Screen
                options={{
                    headerShown: false,
                }}
                name="Home" component={Home} />
            <HomeStack.Screen
                options={{
                    headerShown: false,
                }}
                name="ProductList" component={ProductList} />
            <HomeStack.Screen
                options={{
                    headerShown: false,
                }}
                name="Collections" component={Collections} />
            <HomeStack.Screen
                options={{
                    headerShown: false,
                    // tabBarStyle: { display: 'none' }
                }}
                name="ProductDetails"
                component={ProductDetails}
            />

            <HomeStack.Screen
                options={{
                    headerShown: false,
                }}
                name="LevelOne"
                component={LevelOne}
            />
        </HomeStack.Navigator>
    )
}

export default HomeContainer