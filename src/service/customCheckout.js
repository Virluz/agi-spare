import { shopifyClient } from "../graphql/shopifyClient";
import { DRAFT_ORDER_CREATE } from "../graphql/mutation/admin/draftOrderCreate";

// Create a Storefront Checkout using GraphQL for pickup orders.
// Input contract:
// - cart: Shopify cart object (must include lines.edges[].node with merchandise.id, quantity, attributes)
// - customer: optional { email, phone, firstName, lastName }
// - pickup: { storeId, storeName, storeCity, pincode }
// Output: { checkout, errors }
export const createPickupCheckout = async ({ cart, customer, pickup }) => {
    if (!cart) throw new Error("Missing cart");

    // Map cart lines to Admin DraftOrder line items
    const lineItems = (cart?.lines?.edges || []).map(({ node }) => {
        const variantId = node?.merchandise?.id;
        const quantity = node?.quantity || 1;
        const attributes = node?.attributes || [];
        const pickupFlag = pickup?.storeId ? "true" : (attributes.find(a => a.key === 'pickup')?.value || "false");

        // Combine attributes with ensured pickup details
        const customAttributes = [
            ...attributes.map(a => ({ key: a.key, value: String(a.value ?? "") })),
        ];
        const ensure = (key, val) => {
            if (val == null) return;
            const i = customAttributes.findIndex(a => a.key === key);
            if (i >= 0) customAttributes[i] = { key, value: String(val) };
            else customAttributes.push({ key, value: String(val) });
        };
        ensure('pickup', pickupFlag);
        if (pickup) {
            ensure('storeId', pickup.storeId);
            ensure('storeName', pickup.storeName);
            ensure('storeCity', pickup.storeCity);
            ensure('pincode', pickup.pincode);
        }

        return {
            variantId,
            quantity,
            customAttributes,
        };
    });

    const input = {
        lineItems,
        note: 'Pickup order created via app',
        customAttributes: [{ key: 'fulfillment', value: 'pickup' }],
        tags: ['pickup'],
        email: customer?.email,
    };

    // Try to infer pickup info from provided parameter or line attributes
    const firstLine = cart?.lines?.edges?.[0]?.node;
    const attrs = firstLine?.attributes || [];
    const getAttr = (k) => attrs.find(a => a.key === k)?.value;
    const pickupStoreName = pickup?.storeName ?? getAttr('storeName');
    const pickupCity = pickup?.storeCity ?? getAttr('storeCity');
    const pickupPincode = pickup?.pincode ?? getAttr('pincode');
    const currencyCode = firstLine?.merchandise?.price?.currencyCode || 'INR';

    // Set a zero-cost shipping line titled Pickup to waive shipping charges
    // Admin API expects Money scalar (string) for price, not an object
    input.shippingLine = {
        title: 'Pickup',
        price: "0.00",
    };

    // Prefill a minimal shipping address to reduce prompts on invoice checkout
    input.shippingAddress = {
        address1: pickupStoreName ? `Pickup - ${pickupStoreName}` : 'Store Pickup',
        city: pickupCity || '',
        zip: pickupPincode || '',
        country: 'IN',
    };

    const res = await shopifyClient.request(DRAFT_ORDER_CREATE, { input });
    const err = res?.draftOrderCreate?.userErrors?.[0];
    if (err) throw new Error(err?.message || 'Failed to create draft order');
    return res?.draftOrderCreate?.draftOrder;
};

export default {
    createPickupCheckout,
};
