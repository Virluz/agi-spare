import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Toolbar from "../../components/ui/Toolbar";
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import storeFrontClient from "../../graphql/storeFrontClient";
import { CHECKOUT_BY_ID } from "../../graphql/queries/checkout/checkoutById";
import AppStyles from "../../styles/AppStyles";
import { CHECKOUT_EMAIL_UPDATE } from "../../graphql/mutation/checkout/checkoutEmailUpdate";
import { CHECKOUT_DISCOUNT_CODE_APPLY, CHECKOUT_DISCOUNT_CODE_REMOVE } from "../../graphql/mutation/checkout/discounts";

const CustomCheckout = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { checkoutId, draftOrderId, draftOrderName, invoiceUrl } = route.params || {};
    const { colorScheme } = require('react-redux').useSelector((s) => s.app);
    const styles = AppStyles.getAllStyles(colorScheme);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkout, setCheckout] = useState(null);
    const [email, setEmail] = useState("");
    const [discount, setDiscount] = useState("");

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                if (checkoutId) {
                    const res = await storeFrontClient.request(CHECKOUT_BY_ID, { id: checkoutId });
                    const node = res?.node && res.node.id === checkoutId ? res.node : res?.node;
                    if (mounted) {
                        setCheckout(node);
                        setEmail(node?.email || "");
                    }
                }
            } catch (e) {
                if (mounted) setError(e?.message || 'Failed to load checkout');
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [checkoutId]);

    return (
        <View style={{ flex: 1 }}>
            <Toolbar leftIcon={ArrowLeft} onLeftPress={() => navigation.goBack()} title={"Pickup Checkout"} />
            <View style={{ padding: 16 }}>
                {loading && checkoutId && <Text style={styles.text_14_reg_mainTextColor2}>Loading checkout…</Text>}
                {error && <Text style={[styles.text_14_reg_mainTextColor2, { color: 'red' }]}>{error}</Text>}
                {checkout && (
                    <>
                        <Text style={styles.text_16_semi_mainTextColor2}>Order summary</Text>
                        <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 4 }]}>Checkout ID: {checkout?.id}</Text>

                        <FlatList
                            style={{ marginTop: 12 }}
                            data={checkout?.lineItems?.edges || []}
                            keyExtractor={(e) => e.node.id}
                            renderItem={({ item }) => {
                                const node = item.node;
                                const price = node?.variant?.priceV2?.amount;
                                const cc = node?.variant?.priceV2?.currencyCode || checkout?.currencyCode || 'INR';
                                const pickupStore = node?.customAttributes?.find?.(a => a.key === 'storeName')?.value;
                                return (
                                    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' }}>
                                        <Text style={styles.text_14_reg_mainTextColor2}>{node.title}</Text>
                                        <Text style={styles.text_12_reg_mainTextColor2}>Qty: {node.quantity}  ·  {cc} {price}</Text>
                                        {pickupStore && (
                                            <Text style={[styles.text_12_reg_mainTextColor2, { color: '#2e7d32' }]}>Pickup: {pickupStore}</Text>
                                        )}
                                    </View>
                                );
                            }}
                        />

                        <View style={{ paddingVertical: 12 }}>
                            <Text style={styles.text_14_semi_mainTextColor2}>Subtotal: {checkout?.subtotalPriceV2?.currencyCode} {checkout?.subtotalPriceV2?.amount}</Text>
                            {checkout?.totalTaxV2 && (
                                <Text style={styles.text_14_reg_mainTextColor2}>Tax: {checkout?.totalTaxV2?.currencyCode} {checkout?.totalTaxV2?.amount}</Text>
                            )}
                            <Text style={[styles.text_16_semi_mainTextColor2, { marginTop: 4 }]}>Total: {checkout?.totalPriceV2?.currencyCode} {checkout?.totalPriceV2?.amount}</Text>
                        </View>

                        {/* Email capture */}
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.text_14_semi_mainTextColor2}>Contact email</Text>
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                <TextInput
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10 }}
                                    value={email}
                                    placeholder="email@example.com"
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={async () => {
                                        try {
                                            await storeFrontClient.request(CHECKOUT_EMAIL_UPDATE, { checkoutId: checkout.id, email });
                                        } catch (e) {
                                            // ignore
                                        }
                                    }}
                                    style={{ paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#000' }}
                                >
                                    <Text>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Discount apply/remove */}
                        <View style={{ marginTop: 16 }}>
                            <Text style={styles.text_14_semi_mainTextColor2}>Discount code</Text>
                            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                <TextInput
                                    style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', padding: 10 }}
                                    value={discount}
                                    placeholder="ENTER CODE"
                                    onChangeText={setDiscount}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    onPress={async () => {
                                        try {
                                            await storeFrontClient.request(CHECKOUT_DISCOUNT_CODE_APPLY, { checkoutId: checkout.id, discountCode: discount });
                                            // refetch checkout to update totals
                                            const res = await storeFrontClient.request(CHECKOUT_BY_ID, { id: checkout.id });
                                            setCheckout(res?.node);
                                        } catch (e) { }
                                    }}
                                    style={{ paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#000' }}
                                >
                                    <Text>Apply</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={async () => {
                                        try {
                                            await storeFrontClient.request(CHECKOUT_DISCOUNT_CODE_REMOVE, { checkoutId: checkout.id });
                                            const res = await storeFrontClient.request(CHECKOUT_BY_ID, { id: checkout.id });
                                            setCheckout(res?.node);
                                            setDiscount("");
                                        } catch (e) { }
                                    }}
                                    style={{ paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#000' }}
                                >
                                    <Text>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 16 }]}>Next: integrate native payment and complete order.</Text>
                    </>
                )}

                {/* Admin Draft Order path (pickup) */}
                {!checkoutId && (
                    <View style={{ marginTop: 12 }}>
                        <Text style={styles.text_16_semi_mainTextColor2}>Pickup Draft Order</Text>
                        <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 4 }]}>Draft Order ID: {draftOrderId}</Text>
                        {!!draftOrderName && <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 4 }]}>Name: {draftOrderName}</Text>}
                        {!!invoiceUrl && (
                            <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 8, textDecorationLine: 'underline' }]} onPress={() => {
                                // open invoice in webview route if desired
                                navigation.navigate('Checkout', { url: invoiceUrl, guest: true });
                            }}>Open invoice to pay</Text>
                        )}
                        <Text style={[styles.text_12_reg_mainTextColor2, { marginTop: 12 }]}>Note: This draft order is for in-store pickup. You can share or open the invoice link to complete payment, or integrate native payments here and then complete the draft order via Admin.</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

export default CustomCheckout;
