import React, { useEffect, useState } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppState, DeviceEventEmitter, FlatList, Image, NativeEventEmitter, NativeModules, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
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
            backgroundColor: colorSet.mainThemeBackgroundColor,
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
                        <View style={{
                            // height: 20,
                            // backgroundColor: 'rgba(0, 0, 0, 0.1)',

                        }}>

                            <View style={[{
                                flex: 1,
                                width: '100%',
                                position: 'absolute',
                                bottom: 20,
                                backgroundColor: 'transparent',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                paddingHorizontal: 16,

                            }]}>
                                {/* Left Tabs */}
                                <View style={{
                                    flexDirection: 'row',
                                    overflow: 'hidden',
                                    borderRadius: 10,
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    height: 40,
                                    width: (DEVICE_WIDTH / 2) - 24 - 30,
                                }}>
                                    <BlurView
                                        style={{
                                            position: 'absolute', top: 0,
                                            left: 0, right: 0, bottom: 0,
                                        }}
                                        overlayColor={'rgba(231, 226, 226, 0.2)'}
                                        blurType="light"
                                        blurAmount={30}
                                    />
                                    {state?.routes?.slice(0, 2).map((item, index) => getTabIcon(
                                        item?.name,
                                        index === state.index ? colorSet?.primaryColor : colorSet?.black,
                                        index === state.index,
                                        () => navigation.navigate(item?.name)
                                    ))}
                                </View>

                                {/* Center Tab */}
                                <View style={{
                                    width: 70,
                                    height: 70,
                                    bottom: -15,
                                    borderRadius: 35,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 10,
                                    overflow: 'hidden',
                                }}>
                                    <BlurView
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                        }}
                                        overlayColor={'rgba(231, 226, 226, 0.2)'}

                                        blurType="light"
                                        blurAmount={30}
                                    />
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate(state.routes[2]?.name)}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Image
                                            source={require('../../assets/images/fluid.png')}
                                            style={{
                                                width: 40,
                                                height: 20,
                                                resizeMode: 'contain',
                                                tintColor: state.index === 2 ? colorSet?.primaryColor : colorSet?.black,
                                            }}
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* Right Tabs */}
                                <View style={{
                                    flexDirection: 'row', overflow: 'hidden',
                                    borderRadius: 10, height: 40,
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    width: (DEVICE_WIDTH / 2) - 24 - 30,
                                }}>
                                    <BlurView
                                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, }}
                                        blurType="light"
                                        blurAmount={30}
                                        overlayColor={'rgba(231, 226, 226, 0.2)'}

                                    />
                                    {state?.routes?.slice(3, 5).map((item, index) => getTabIcon(
                                        item?.name,
                                        (index + 3) === state.index ? colorSet?.primaryColor : colorSet?.black, // Adjust index for active state
                                        (index + 3) === state.index,
                                        () => navigation.navigate(item?.name)
                                    ))}
                                </View>
                            </View>

                        </View>

                    )

                }
                }

                initialRouteName={'Home'}
                screenOptions={({ route }) => ({
                    // headerTitleStyle: styles.text_14_bold_mainTextColor2,
                    // // headerTitleAlign: 'center',
                    // headerStyle: {
                    //     elevation: 0,
                    //     backgroundColor: colorSet.mainThemeBackgroundColor,
                    //     height: heightPixel(54),
                    // },
                    tabBarActiveTintColor: colorSet.black,
                    tabBarInactiveTintColor: colorSet.white,
                    // tabBarItemStyle: {
                    //     backgroundColor: colorSet.mainThemeBackgroundColor,
                    // },
                    tabBarStyle: styles.tabBarStyle,
                    tabBarItemStyle: {
                        backgroundColor: 'transparent',
                    },
                    tabBarBackground: () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />,
                    // // tabBarLabelStyle: {
                    // //     color: colorSet.mainTextColor,
                    // //     fontSize: fonts._12, fontWeight: '400'
                    // // },
                    tabBarLabelStyle: { fontSize: 12 },
                    tabBarIcon: ({ focused, color, size }) => {
                        return getTabIcon(route?.name, color, focused);
                    },
                    tabBarShowLabel: true,

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

                <Tab.Screen name={'New In'}
                    component={NewInScreen}
                    options={{
                        headerShown: false,

                    }}
                />

                <Tab.Screen
                    name={'Cart'}
                    component={CartContainer}
                    options={{
                        headerShown: false,
                    }} />


                <Tab.Screen name={'Rewards'}
                    component={ProfileContainer}
                    options={{
                        headerShown: false,

                    }}
                />

            </Tab.Navigator >

        </View >
    )
}
