import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home/Home';
import AppStyles from '../styles/AppStyles';
import { useSelector } from 'react-redux';
import LevelOne from '../screens/category/LevelOne';
import LevelTwo from '../screens/category/LevelTwo';
import ProductList from '../screens/product/ProductList';
const CategoryStack = createStackNavigator();




const CategoryContainer = ({ navigation, route }) => {
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


        <CategoryStack.Navigator
            initialRouteName="LevelOne"
            screenOptions={{
                // ...AppStyles.getToolbarStyle(),
                // headerTitleStyle: styles.text_14_bold_mainTextColor2,
                // headerLeft: () => (
                //     <BackButton />
                // ),
            }}>



            <CategoryStack.Screen
                options={{
                    headerShown: false,
                }}
                name="LevelOne"
                component={LevelOne}
            />

            <CategoryStack.Screen
                options={{
                    headerShown: false,
                }}
                name="LevelTwo"
                component={LevelTwo}
            />


            <CategoryStack.Screen
                options={{
                    headerShown: false,
                    // tabBarStyle: { display: 'none' }
                }}
                name="ProductList"
                component={ProductList}
            />





        </CategoryStack.Navigator>
    )
}

export default CategoryContainer