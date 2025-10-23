import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import Toolbar from '../../components/ui/Toolbar';

const TABS = [
    { key: 'active', label: 'Active' },
    { key: 'expired', label: 'Expired' },
];

const MOCK_DATA = [
    {
        id: '1',
        image: require('../../../assets/images/pdp/returns.png'),
        title: 'Urban Polo With EFast...',
        size: 'M',
        color: 'Ponderosa Pine',
        price: '₹499',
        date: '13th Sep ‘25',
        time: '2AM-8PM',
        valid: 'Valid for 2 days',
        location: 'Hyderabad, Raidurg, Serilingampally, Mandal S...',
        locationOpted: true,
    },
    // ...repeat or add more mock items as needed
];

const BookAndTrail = () => {
    const navigation = useNavigation();
    const [selectedTab, setSelectedTab] = useState('active');

    const styles = AppStyles.getAllStyles();
    const colorSet = AppStyles.colorSet[styles.colorScheme];

    const renderTab = (tab) => (
        <TouchableOpacity
            key={tab.key}
            style={[
                localStyles.tabButton,
                selectedTab === tab.key && localStyles.tabButtonActive,
            ]}
            onPress={() => setSelectedTab(tab.key)}
        >
            <Text
                style={[
                    localStyles.tabText,
                    selectedTab === tab.key && localStyles.tabTextActive,
                ]}
            >
                {tab.label}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }) => (
        <View style={localStyles.cardContainer}>
            <View style={localStyles.row}>
                <Image source={item.image} style={localStyles.productImage} />
                <View style={localStyles.cardContent}>
                    <View style={localStyles.validRow}>
                        <Text style={localStyles.validBadge}>{item.valid}</Text>
                    </View>
                    <Text style={[styles.text_12_semi_mainTextColor2, localStyles.title]} numberOfLines={1}>{item.title}</Text>
                    <View style={localStyles.row}>
                        <View style={localStyles.dot} />
                        <Text style={localStyles.sizeColor}>{item.size} - {item.color}</Text>
                    </View>
                    <Text style={[AppStyles.textSemiBold, localStyles.price]}>{item.price}</Text>
                    <Text style={localStyles.label}>Date: <Text style={localStyles.value}>{item.date}</Text></Text>
                    <Text style={localStyles.label}>Time: <Text style={localStyles.value}>{item.time}</Text></Text>
                    {item.locationOpted && (
                        <View style={localStyles.locationRow}>
                            <Text style={localStyles.locationBadge}>Location opted</Text>
                        </View>
                    )}
                    <Text style={localStyles.locationText}>{item.location}</Text>
                </View>
                <View style={localStyles.arrowContainer}>
                    <Text style={localStyles.arrow}>{'>'}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={AppStyles.container}>
            <Toolbar title="Book & Trial" showBackButton navigation={navigation} />
            <View style={localStyles.tabsRow}>
                {TABS.map(renderTab)}
            </View>
            <FlatList
                data={MOCK_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={localStyles.listContent}
                ItemSeparatorComponent={() => <View style={localStyles.separator} />}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const localStyles = StyleSheet.create({
    tabsRow: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        backgroundColor: '#F6F6F6',
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    tabText: {
        color: '#A0A0A0',
        fontSize: 16,
    },
    tabTextActive: {
        color: '#222',
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    separator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 16,
        marginLeft: 80,
    },
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'column',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    productImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#F6F6F6',
    },
    cardContent: {
        flex: 1,
        flexDirection: 'column',
    },
    validRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    validBadge: {
        backgroundColor: '#4CAF50',
        color: '#fff',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 12,
        alignSelf: 'flex-start',
        overflow: 'hidden',
    },
    title: {
        fontSize: 16,
        marginBottom: 2,
        color: '#222',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#B71C1C',
        marginRight: 6,
        marginTop: 2,
    },
    sizeColor: {
        fontSize: 14,
        color: '#222',
        marginBottom: 2,
    },
    price: {
        fontSize: 16,
        color: '#222',
        marginBottom: 2,
    },
    label: {
        fontSize: 13,
        color: '#222',
        marginBottom: 1,
    },
    value: {
        fontWeight: 'bold',
        color: '#222',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 2,
    },
    locationBadge: {
        backgroundColor: '#E6F9EC',
        color: '#4CAF50',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        fontSize: 12,
        overflow: 'hidden',
    },
    locationText: {
        fontSize: 13,
        color: '#222',
        marginBottom: 2,
    },
    arrowContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginTop: 24,
    },
    arrow: {
        fontSize: 28,
        color: '#BDBDBD',
        fontWeight: '300',
    },
});

export default BookAndTrail;
