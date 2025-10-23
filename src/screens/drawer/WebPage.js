import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import WebView from 'react-native-webview';
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import Loader from '../../widgets/Loader';

const WebPage = ({ navigation }) => {
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const route = useRoute();
    const { url, title = 'Web Page' } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useFocusEffect(
        React.useCallback(() => {
            // Hide tab bar and force WebView to start from the initial URL on focus
            navigation?.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
            setError(false);
            setLoading(true);
            setRefreshKey((k) => k + 1); // remount WebView so it always loads the first page
            return () => navigation?.getParent()?.setOptions({ tabBarStyle: styles.tabBarStyle });
        }, [navigation])
    );

    return (
        <>
            {loading && <Loader />}
            <Toolbar title={title} />
            {error ? (
                <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={styles.text_14_reg_mainTextColor2}>Something went wrong! Please try again.</Text>
                </View>
            ) : (
                <WebView
                    key={`${url || ''}-${refreshKey}`}
                    source={{ uri: url }}
                    style={styles.container}
                    cacheEnabled={false}
                    incognito
                    startInLoadingState
                    onLoadStart={() => setLoading(true)}
                    onLoad={() => setLoading(false)}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => { setLoading(false); setError(true); }}
                />
            )}
        </>
    );
};

export default WebPage;

const localStyles = StyleSheet.create({});