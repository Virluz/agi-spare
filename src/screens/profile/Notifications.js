import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';
import FastImage from '@d11/react-native-fast-image';
import { heightPixel, widthPixel } from '../../utils/fonts';
import { Settings } from 'lucide-react-native';
import { noDataView } from '../../utils/Helper';

const Notifications = () => {

    const navigation = useNavigation();

    const [notifications, setNotifications] = useState([

    ]);
    const { colorScheme, } = useSelector(state => state.app);

    const styles = AppStyles.getAllStyles(colorScheme);
    const colorSet = AppStyles.colorSet[colorScheme];

    const localStyles = getLocalStyles(colorSet);
    return (
        <>
            <Toolbar title="Notifications" isFilter
            // filerIcon={
            //     <FastImage
            //         source={require('../../../assets/images/account/setting.png')}
            //         style={{ width: widthPixel(18), height: widthPixel(18), }} />} 
            />
            <View style={styles.container}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={localStyles.notificationItem}>
                            <FastImage source={{ uri: item.image }} style={localStyles.avatar} />
                            <View style={localStyles.notificationContent}>
                                <Text style={styles.text_14_semi_mainTextColor2}>{item.title} asdf</Text>
                                <Text style={[styles.text_12_reg_mainTextColor2, { color: '#595959' }]}>{item.message}</Text>
                                <Text style={[styles.text_12_reg_mainTextColor2, { color: '#595959' }]}>{item.time}</Text>
                            </View>

                        </View>
                    )}
                    ListEmptyComponent={(!notifications || notifications.length === 0) && <>

                        {noDataView(colorScheme, "Your bag looks empty", 'Let’s fill it up', require('../../../assets/images/cart/empty_cart.png'))}


                    </>
                    }
                />

            </View>
        </>

    )
}

export default Notifications

const getLocalStyles = (colorSet) => StyleSheet.create({
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: heightPixel(10),
        // paddingHorizontal: widthPixel(15),
        gap: widthPixel(16),
        borderBottomWidth: 0.5,
        borderStyle: 'dashed',
        borderBottomColor: colorSet.light,
    },
    avatar: {
        width: widthPixel(48),
        height: widthPixel(48),
        // borderRadius: widthPixel(20),
        // marginRight: widthPixel(10),
    },
    notificationContent: {
        flex: 1,
    },

})
