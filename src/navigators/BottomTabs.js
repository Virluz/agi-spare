import React, { useEffect, useState } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState, DeviceEventEmitter, FlatList, Image, NativeEventEmitter, NativeModules, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { _getHorizontalPadding, _getValidateText, checkBackgroundPermission, checkLocationPermission, DEVICE_WIDTH, generateTokenFromUsernamePassword, getCameraIcon, getDeviceInfo, getTabIcon } from '../utils/Helper';
import ProfileContainer from './ProfileContainer';
import Home from '../screens/home/Home';
import { Bell } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux';
import AppStyles from '../styles/AppStyles';
import HomeContainer from './HomeContainer';
import { updateFirebaseToken, updateUserLocation } from '../api/requests';
import { getMessaging } from '@react-native-firebase/messaging';
import SecureStorage from '../utils/SecureStorage';
import { setAuthorizationHeader, setAxiosBaseUrl } from '../api/config';
import Loader from '../widgets/Loader';
import { heightPixel, widthPixel } from '../utils/fonts';
import CartContainer from './CartContainer';
import { setColorScheme } from '../redux/reducers/appSlice';
import ProductList from '../screens/product/ProductList';
import FluidXShape from '../components/ui/FluidXShape';
import CategoryContainer from './CategoryContainer';
import { BlurView } from '@react-native-community/blur';
import NewInScreen from '../screens/home/NewInScreen';
const Tab = createBottomTabNavigator();

export const BottomTabs = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const appScheme = useColorScheme();

    const { colorScheme, apiCredentials } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];
    const insets = useSafeAreaInsets();
    const cart = useSelector(state => state.cart?.cart);


    useEffect(() => {
        const unsubscribe = getMessaging().onTokenRefresh(async (fcmToken) => {
            try {

                const payload = {
                    "MobileRecipientId": apiCredentials.username,
                    "PushNotificationId": fcmToken,
                    "DeviceInfo": await getDeviceInfo(payload)
                }
                const response = await updateFirebaseToken(payload);
            }
            catch (error) {

            }
        });



        return () => {
            unsubscribe();

        };

    }, [])

    useEffect(() => {
        const colorScheme = 'system-default-' + appScheme;
        // } else {
        //   colorScheme = scheme
        // }
        dispatch(setColorScheme(colorScheme));

    }, [appScheme])



    if (loading) {
        return <Loader />
    }
    return (
        <View style={{
            flex: 1,
            backgroundColor: 'transparent',
        }}>

            <Tab.Navigator
                tabBar={({ state, descriptors, navigation }) => {

                    const getActiveRouteName = (route) => {
                        if (route.state) {
                            // Recursively go deeper into nested navigators
                            const nestedRoute = route.state.routes[route.state.index];
                            return getActiveRouteName(nestedRoute);
                        }
                        return route.name;
                    };

                    const currentRoute = state.routes[state.index];
                    const currentRouteName = getActiveRouteName(currentRoute);

                    // Routes where we want to hide tab bar
                    const hideTabBarRoutes = ['ProductDetails', 'Cart', 'Checkout'];

                    const shouldHideFromRouteName = hideTabBarRoutes.includes(currentRouteName);

                    if (shouldHideFromRouteName) {
                        return null;
                    }

                    return (
                        <View style={[styles.customTabBarContainer]}>

                            {state.routes.map((route, index) => {
                                const { options } = descriptors[route.key];
                                const label =
                                    options.tabBarLabel !== undefined
                                        ? options.tabBarLabel
                                        : options.title !== undefined
                                            ? options.title
                                            : route.name;

                                const isFocused = state.index === index;

                                const onPress = () => {
                                    const event = navigation.emit({
                                        type: 'tabPress',
                                        target: route.key,
                                        canPreventDefault: true,
                                    });

                                    if (!isFocused && !event.defaultPrevented) {
                                        navigation.navigate(route.name, route.params);
                                    }
                                };

                                const onLongPress = () => {
                                    navigation.emit({
                                        type: 'tabLongPress',
                                        target: route.key,
                                    });
                                };

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        accessibilityRole="button"
                                        accessibilityState={isFocused ? { selected: true } : {}}
                                        accessibilityLabel={options.tabBarAccessibilityLabel}
                                        testID={options.tabBarTestID}
                                        onPress={onPress}
                                        onLongPress={onLongPress}
                                        style={[
                                            styles.tabBarItem,
                                            isFocused && styles.activeTabBarItem
                                        ]}
                                    >
                                        <View style={[
                                            styles.tabIconContainer,
                                            // isFocused && styles.activeTabIconContainer
                                        ]}>
                                            {getTabIcon(
                                                route.name,
                                                isFocused,
                                                route?.name === 'Cart' ? (cart?.lines?.edges?.reduce((sum, e) => sum + (e?.node?.quantity || 0), 0) || 0) : undefined
                                            )}
                                        </View>
                                        <Text style={[
                                            styles.tabBarLabel,
                                            { color: isFocused ? '#F27E03' : colorSet.dark3 }
                                        ]}>
                                            {label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )

                }
                }

                initialRouteName={'Home'}
                screenOptions={({ route }) => ({
                    headerShown: false,
                })}
                sceneContainerStyle={{
                    backgroundColor: 'transparent',
                }}

            // screenListeners={({ navigation, route }) => ({
            //     tabPress: e => {
            //         e.preventDefault();
            //         // if (route.name === 'Shipments') {
            //         //     const eventEmitter = new NativeEventEmitter();
            //         //     eventEmitter.emit(Constants.SHIPMENT_TAB_PRESS_EVENT, {})
            //         // }
            //         navigation.navigate(route.name);
            //     },
            // })}
            >

                <Tab.Screen
                    name={'Home'}
                    component={HomeContainer}
                    options={{
                        headerShown: false,
                    }} />


                <Tab.Screen
                    name={'Category'}
                    component={CategoryContainer}
                    options={{
                        headerShown: false,
                    }} />

                {/* <Tab.Screen name={'New In'}
                    component={NewInScreen}
                    options={{
                        headerShown: false,

                    }}
                /> */}

                <Tab.Screen
                    name={'Cart'}
                    component={CartContainer}
                    options={{
                        headerShown: false,
                    }} />


                <Tab.Screen name={'Profile'}
                    component={ProfileContainer}
                    options={{
                        headerShown: false,

                    }}
                />

            </Tab.Navigator >

        </View >
    )
}
