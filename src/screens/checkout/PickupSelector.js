import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AppStyles from '../../styles/AppStyles';
import { useSelector } from 'react-redux';
import { getCartDeliveryOptions, setCartDeliveryOption } from '../../graphql/graph_request';

const PickupSelector = () => {
    const { colorScheme } = useSelector(state => state.app);
    const styles = AppStyles.getAllStyles(colorScheme);
    const route = useRoute();
    const { cartId, onChosen } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [groups, setGroups] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const cart = await getCartDeliveryOptions(cartId);
                console.log('PickupSelector cart:', cart);
                const g = cart?.deliveryGroups?.edges?.map(e => e.node) || [];
                setGroups(g);
            } catch (e) {
                console.log('PickupSelector load error', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [cartId]);

    const onSelect = async (groupId, option) => {
        try {
            setSaving(true);
            await setCartDeliveryOption({ cartId, deliveryGroupId: groupId, deliveryOptionHandle: option.handle });
            if (onChosen) onChosen(option);
            // goBack is called by parent via callback, or navigation prop injected by stack
            // We avoid direct navigation use here to decouple
        } catch (e) {
            console.log('Set pickup error', e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
                <ActivityIndicator />
            </View>
        );
    }

    const options = groups.flatMap(g => (g.deliveryOptions || [])
        .filter(o => {
            const t = (o.title || '').toLowerCase();
            const d = (o.description || '').toLowerCase();
            return t.includes('pickup') || t.includes('pick-up') || d.includes('pickup') || d.includes('pick-up');
        })
        .map(o => ({ groupId: g.id, option: o }))
    );

    return (
        <View style={[styles.container, { padding: 16 }]}>
            <Text style={styles.text_18_semi_mainTextColor2}>Select a pickup location</Text>
            <FlatList
                data={options}
                keyExtractor={(i, idx) => `${i.groupId}-${i.option.handle}-${idx}`}
                renderItem={({ item }) => (
                    <TouchableOpacity disabled={saving} onPress={() => onSelect(item.groupId, item.option)} style={{ paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee' }}>
                        <Text style={styles.text_16_semi_mainTextColor2}>{item.option.title}</Text>
                        {item.option.description ? (
                            <Text style={styles.text_14_reg_mainTextColor3}>{item.option.description}</Text>
                        ) : null}
                        {item.option.estimatedCost?.amount ? (
                            <Text style={styles.text_14_reg_mainTextColor2}>{item.option.estimatedCost.amount} {item.option.estimatedCost.currencyCode}</Text>
                        ) : null}
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.text_14_reg_mainTextColor3}>No pickup available for this cart.</Text>}
            />
        </View>
    );
};

export default PickupSelector;
