import React, { useState } from 'react'
import Toolbar from '../../components/ui/Toolbar'
import Loader from '../../widgets/Loader'
import { Text, View } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCart } from '../../redux/reducers/cartSlice';

const Privacy = ({ navigation }) => {
    const { colorScheme, apiCredentials } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const route = useRoute();
    const { url, guest } = route.params;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [completed, setCompleted] = useState(false);
    const dispatch = useDispatch();

    useFocusEffect(
        React.useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: styles.tabBarStyle
                });
            };
        }, [navigation])
    );
    return (
        <>
            {loading && <Loader />}

            <Toolbar title={"Checkout"} />
            <View style={styles.container}>

                {error && <Text> Something went wrong! Please try again</Text>}

                {

                    <WebView
                        source={{ uri: url }}
                        style={styles.container}
                        incognito={!!guest}
                        thirdPartyCookiesEnabled={!guest}
                        sharedCookiesEnabled={!guest}
                        onLoadStart={() => setLoading(true)}
                        onMessage={() => { }}
                        onNavigationStateChange={async (navState) => {
                            try {
                                const currentUrl = navState?.url || '';
                                // Detect Shopify thank you / order status pages
                                if (!completed && /(thank[_-]?you|order_status)/i.test(currentUrl)) {
                                    setCompleted(true);
                                    // Clear local cart and refresh redux state
                                    await AsyncStorage.removeItem('cartId');
                                    dispatch(fetchCart());
                                }
                            } catch (_) { }
                        }}
                        onLoad={() => { setLoading(false) }}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                    />
                }
            </View>


        </>


    )
}

export default Privacy