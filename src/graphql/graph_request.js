import AsyncStorage from '@react-native-async-storage/async-storage';
import cartCreate from './mutation/createNewCart';
import fetch_product_by_id from './queries/products/fetch_product_by_id';
import fetch_products from './queries/products/fetch_products';
import search_products from './queries/products/search_products';
import { shopifyClient, storeFrontClient } from './shopifyClient';
import createNewCart from './mutation/createNewCart';
import fetch_cart from './queries/cart/fetch_cart';
import cartLinesAdd from './mutation/cartLinesAdd';
import fetch_bestsellers from './queries/collections/fetch_bestsellers';
import collection_by_handle from './queries/collections/collection_by_handle';
import fetch_products_by_single_style from './queries/collections/fetch_products_by_single_style';
import fetch_recently_viewed from './queries/products/fetch_recently_viewed';
import fetch_filters_by_collections from './queries/filter/fetch_filters_by_collections';
import fetch_filters from './queries/filter/fetch_filters';
import { CUSTOMER_ACCESS_TOKEN_CREATE } from './mutation/customer/customerMutations';
import { CUSTOMER_RECOVER } from './mutation/customer/customerMutations';
import { CUSTOMER_ACCESS_TOKEN_RENEW } from './mutation/customer/customerAccessTokenRenew';
import createCheckout from './mutation/checkout/createCheckout';
import fetch_products_by_ids from './queries/products/fetch_products_by_ids';
import CUSTOMER_UPDATE from './mutation/customer/customerUpdate';
import CUSTOMER_ADDRESS_CREATE from './mutation/customer/customerAddressCreate';
import CUSTOMER_ADDRESS_UPDATE from './mutation/customer/customerAddressUpdate';
import CUSTOMER_DEFAULT_ADDRESS_UPDATE from './mutation/customer/customerDefaultAddressUpdate';
import { CUSTOMER_METAFIELDS_SET } from './mutation/customer/customerMetafieldsSet';
import { CUSTOMER_SIGNUP } from './mutation/customer/authMutations';
import cartBuyerIdentityUpdate from './mutation/cartBuyerIdentityUpdate';
import FETCH_CUSTOMER_ORDERS from './queries/customer/fetch_orders';
import FETCH_ORDER_BY_ID from './queries/customer/fetch_order_by_id';
import { CUSTOMER_QUERY } from './queries/customer/customerQuery';
import GET_DELIVERY_OPTIONS from './queries/cart/get_delivery_options';
import CART_SELECTED_DELIVERY_OPTIONS_UPDATE from './mutation/cart/cartSelectedDeliveryOptionsUpdate';
import CUSTOMER_ACCESS_TOKEN_CREATE_WITH_MULTIPASS from './mutation/customer/customerAccessTokenCreateWithMultipass';


export const getProducts = async (params) => {
    return await storeFrontClient.request(fetch_products, params)
}

export const searchProducts = async (params) => {
    return await storeFrontClient.request(search_products, params)
}

export const getBestSellers = async (params) => {
    return await storeFrontClient.request(fetch_bestsellers, params)
}

export const getProductById = async (id) => {
    return await storeFrontClient.request(fetch_product_by_id, { id })
}


export const createCart = async (lines = []) => {

    console.log("cartCreate lines", lines);

    const { cartCreate } = await storeFrontClient.request(createNewCart, {
        input: { lines },
    });

    console.log("cartCreate", cartCreate);

    if (cartCreate?.cart?.id) {
        await AsyncStorage.setItem("cartId", cartCreate.cart.id);
    }
    return cartCreate.cart;
}

export const addToCart = async (merchandiseId, quantity = 1) => {
    let cartId = await AsyncStorage.getItem("cartId");
    if (!cartId) {
        const newCart = await createCart();
        cartId = newCart.id;
    }

    const { cartLinesAdded } = await storeFrontClient.request(cartLinesAdd, {
        cartId,
        lines: [{ merchandiseId, quantity }],
    });

    return cartLinesAdded?.cart;
}

export const fetchCart = async () => {
    const cartId = await AsyncStorage.getItem("cartId");
    if (!cartId) {
        return null; // No cart yet
    }

    const data = await storeFrontClient.request(fetch_cart, { cartId });
    return data.cart;
}

export const getCollectionByHandle = async (params) => {
    return await storeFrontClient.request(collection_by_handle, params)
}

export const getCollectionByStyle = async (params) => {
    return await storeFrontClient.request(fetch_products_by_single_style, params)
}

export const getRecentlyViewedList = async (params) => {
    return await storeFrontClient.request(fetch_recently_viewed, params)
}

export const getCollectionFilters = async (params) => {
    return await storeFrontClient.request(fetch_filters_by_collections, params)
}

export const getFilters = async () => {
    return await storeFrontClient.request(fetch_filters)
}


export const loginCustomer = async (email, password) => {
    const variables = {
        input: {
            email,
            password,
        },
    };
    return await storeFrontClient.request(CUSTOMER_ACCESS_TOKEN_CREATE, variables);
}

// Trigger Shopify to email a password reset link to the provided email
export const customerRecover = async (email) => {
    const variables = { email };
    return await storeFrontClient.request(CUSTOMER_RECOVER, variables);
}

// Validate token by checking expiry and attempt automatic renewal using Storefront API.
export const getValidCustomerToken = async () => {
    const token = await AsyncStorage.getItem('customerAccessToken');
    const expiresAt = await AsyncStorage.getItem('tokenExpiresAt');
    if (!token) return null;
    try {
        if (expiresAt && Date.parse(expiresAt) > Date.now() + 60_000) {
            // Token valid for at least 60s buffer
            return token;
        }
    } catch (_) { /* ignore parse issues */ }

    // Try renew via Storefront
    try {
        const { customerAccessTokenRenew } = await storeFrontClient.request(CUSTOMER_ACCESS_TOKEN_RENEW, { customerAccessToken: token });
        const renewed = customerAccessTokenRenew?.customerAccessToken;
        const errors = customerAccessTokenRenew?.userErrors;
        if (errors?.length) {
            // Renewal failed; clear token
            await AsyncStorage.multiRemove(['customerAccessToken', 'tokenExpiresAt']);
            return null;
        }
        if (renewed?.accessToken) {
            await AsyncStorage.setItem('customerAccessToken', renewed.accessToken);
            if (renewed.expiresAt) await AsyncStorage.setItem('tokenExpiresAt', renewed.expiresAt);
            return renewed.accessToken;
        }
    } catch (e) {
        // On any error, fall back to existing token (may be expired on server)
        return token;
    }
    return token;
}

export const signupCustomer = async (customerData) => {
    const variables = {
        input: customerData
    };
    return await storeFrontClient.request(CUSTOMER_SIGNUP, variables);
}

// Create customer with metafields for extended fields (company name, GST, etc.)
export const createCustomerWithMetafields = async (payload) => {
    try {
        // Step 1: Create customer using Storefront API
        const customerInput = {
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            acceptsMarketing: payload.acceptsMarketing || false,
        };

        const createResult = await storeFrontClient.request(CUSTOMER_SIGNUP, { input: customerInput });

        if (createResult.customerCreate.customerUserErrors?.length > 0) {
            const error = createResult.customerCreate.customerUserErrors[0];
            return { success: false, message: error.message };
        }

        const customer = createResult.customerCreate.customer;
        const customerId = customer.id;

        // Step 2: Login to get access token
        const loginResult = await loginCustomer(payload.email, payload.password);

        if (loginResult.customerAccessTokenCreate.customerUserErrors?.length > 0) {
            const error = loginResult.customerAccessTokenCreate.customerUserErrors[0];
            return { success: false, message: error.message };
        }

        const { accessToken, expiresAt } = loginResult.customerAccessTokenCreate.customerAccessToken;

        // Step 3: Create address
        if (payload.address1 && payload.city && payload.province && payload.zip) {
            const addressInput = {
                address1: payload.address1,
                address2: payload.address2 || '',
                city: payload.city,
                province: payload.province,
                zip: payload.zip,
                country: payload.country || 'India',
                phone: payload.phone,
                firstName: payload.firstName,
                lastName: payload.lastName,
            };

            const addressResult = await createCustomerAddress(accessToken, addressInput);
            if (addressResult.customerAddressCreate.customerUserErrors?.length === 0) {
                const addressId = addressResult.customerAddressCreate.customerAddress?.id;
                if (addressId) {
                    await setCustomerDefaultAddress(accessToken, addressId);
                }
            }
        }

        // Step 4: Add metafields for custom fields using Admin API
        if (payload.metafields && customerId) {
            const metafieldsArray = [];

            if (payload.metafields.companyName) {
                metafieldsArray.push({
                    namespace: 'custom',
                    key: 'company_name',
                    value: payload.metafields.companyName,
                    type: 'single_line_text_field'
                });
            }

            if (payload.metafields.gstNo) {
                metafieldsArray.push({
                    namespace: 'custom',
                    key: 'gst_number',
                    value: payload.metafields.gstNo,
                    type: 'single_line_text_field'
                });
            }

            if (payload.metafields.state) {
                metafieldsArray.push({
                    namespace: 'custom',
                    key: 'select_state_1',
                    value: payload.metafields.state,
                    type: 'single_line_text_field'
                });
            }

            if (payload.metafields.pinCode) {
                metafieldsArray.push({
                    namespace: 'custom',
                    key: 'pin-code',
                    value: payload.metafields.pinCode,
                    type: 'single_line_text_field'
                });
            }

            if (payload.metafields.areaName) {
                metafieldsArray.push({
                    namespace: 'custom',
                    key: 'area_name',
                    value: payload.metafields.areaName,
                    type: 'single_line_text_field'
                });
            }

            if (payload.metafields.username) {
                metafieldsArray.push({
                    namespace: 'custom',
                    key: 'username',
                    value: payload.metafields.username,
                    type: 'single_line_text_field'
                });
            }

            if (metafieldsArray.length > 0) {
                try {
                    await setCustomerMetafieldsAdmin(customerId, metafieldsArray);
                } catch (metaErr) {
                    console.warn('Metafields creation failed (non-critical):', metaErr);
                    // Don't fail the entire registration if metafields fail
                }
            }
        }

        return {
            success: true,
            customer,
            accessToken,
            expiresAt,
        };
    } catch (error) {
        console.error('Create customer with metafields error:', error);
        return {
            success: false,
            message: error.message || 'Failed to create customer account'
        };
    }
}

export const createCheckoutShopify = async (variables) => {
    return await storeFrontClient.request(createCheckout, variables);
}
// Update buyer identity on the current cart (pass customerAccessToken for auto-login at checkout)
export const updateCartBuyerIdentity = async (cartId, buyerIdentity) => {
    const res = await storeFrontClient.request(cartBuyerIdentityUpdate, { cartId, buyerIdentity });
    const { userErrors } = res.cartBuyerIdentityUpdate || {};
    if (userErrors && userErrors.length) {
        const msg = userErrors.map(e => e.message).join(', ');
        throw new Error(`cartBuyerIdentityUpdate failed: ${msg}`);
    }
    return res.cartBuyerIdentityUpdate?.cart;
}

export const updateCustomerProfile = async (customerAccessToken, customerData) => {
    const variables = {
        customerAccessToken,
        customer: customerData
    };
    return await storeFrontClient.request(CUSTOMER_UPDATE, variables);
}

export const createCustomerAddress = async (customerAccessToken, address) => {
    return await storeFrontClient.request(CUSTOMER_ADDRESS_CREATE, { customerAccessToken, address });
}

export const updateCustomerAddress = async (customerAccessToken, id, address) => {
    return await storeFrontClient.request(CUSTOMER_ADDRESS_UPDATE, { customerAccessToken, id, address });
}

export const setCustomerDefaultAddress = async (customerAccessToken, addressId) => {
    return await storeFrontClient.request(CUSTOMER_DEFAULT_ADDRESS_UPDATE, { customerAccessToken, addressId });
}

// DO NOT call this from the client app. Route via a secure server using Admin API.
export const setCustomerMetafieldsAdmin = async (ownerId, metafields) => {
    return await shopifyClient.request(CUSTOMER_METAFIELDS_SET, { ownerId, metafields });
}

// Convenience helper: update facts.gender (single_line_text_field) and facts.birth_date (date)
export const updateCustomerFactsMetafields = async ({ customerId, gender, birthDate }) => {
    if (!customerId) throw new Error('customerId is required');
    const toISO = (val) => {
        try {
            if (!val) return null;
            // Accept YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
            // Accept MM/DD/YYYY
            const [mm, dd, yyyy] = String(val).split('/');
            const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
            if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
            return null;
        } catch { return null; }
    };

    const metafields = [];
    if (gender) {
        metafields.push({ namespace: 'facts', key: 'gender', type: 'single_line_text_field', value: String(gender) });
    }
    if (birthDate) {
        const iso = toISO(birthDate);
        if (iso) metafields.push({ namespace: 'facts', key: 'birth_date', type: 'date', value: iso });
        else metafields.push({ namespace: 'facts', key: 'birth_date', type: 'single_line_text_field', value: String(birthDate) });
    }
    if (!metafields.length) return { ok: false, reason: 'no_fields' };

    const res = await setCustomerMetafieldsAdmin(customerId, metafields);
    const err = res?.metafieldsSet?.userErrors?.[0];
    if (err) throw new Error(err.message || 'metafieldsSet failed');
    return res?.metafieldsSet?.metafields || [];
}

// Alternative Admin path using customerUpdate (accepts metafields on CustomerInput)
export const updateCustomerMetafieldsAdmin = async (customerId, metafields) => {
    if (!customerId) throw new Error('customerId is required');
    if (!Array.isArray(metafields) || !metafields.length) return { ok: false, reason: 'no_fields' };

    console.log('updateCustomerMetafieldsAdmin called with:', { customerId, metafields });

    // Check if Admin token is configured


    // Use metafieldsSet mutation instead of customerUpdate
    const mutation = `
        mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: $metafields) {
                metafields { id key namespace value }
                userErrors { field message }
            }
        }
    `;

    // Transform metafields to include ownerId
    const metafieldsWithOwner = metafields.map(field => ({
        ...field,
        ownerId: customerId
    }));

    const variables = { metafields: metafieldsWithOwner };

    console.log('Mutation variables:', JSON.stringify(variables, null, 2));

    try {
        const res = await shopifyClient.request(mutation, variables);
        console.log('Shopify response:', JSON.stringify(res, null, 2));

        const err = res?.metafieldsSet?.userErrors?.[0];
        if (err) {
            console.error('Shopify userError:', err);
            throw new Error(err.message || 'metafieldsSet failed');
        }
        return res?.metafieldsSet?.metafields;
    } catch (error) {
        // Check for 401 authentication error
        if (error?.response?.status === 401) {
            throw new Error('Admin API authentication failed. Please verify ADMIN_TOKEN in .env has correct permissions (write_customers, write_customer_metafields).');
        }
        throw error;
    }
}

export const getProductsByIds = async (productIds) => {
    console.log('Requesting products with IDs:', productIds);
    return await storeFrontClient.request(fetch_products_by_ids, { ids: productIds });
}

// Optional: Persist extra customer fields (gender/dob) via your backend.
// Configure env CUSTOMER_EXTRAS_ENDPOINT to enable.
export const saveCustomerExtras = async (payload) => {
    try {
        const endpoint = process.env.CUSTOMER_EXTRAS_ENDPOINT;
        if (!endpoint) return { ok: false, reason: 'endpoint_not_configured' };
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}

export const fetchCustomerOrders = async (customerAccessToken, first = 20) => {
    return await storeFrontClient.request(FETCH_CUSTOMER_ORDERS, { customerAccessToken, first });
}

export const fetchOrderById = async (id) => {
    return await storeFrontClient.request(FETCH_ORDER_BY_ID, { id });
}

// Determine if an order can be cancelled (basic checks)
export const isOrderCancelable = (order) => {
    if (!order) return { ok: false, reason: 'missing_order' };
    if (order.canceledAt) return { ok: false, reason: 'already_canceled' };
    const fulfillment = order.fulfillmentStatus;
    if (fulfillment === 'FULFILLED' || fulfillment === 'IN_PROGRESS' || fulfillment === 'PARTIALLY_FULFILLED') {
        return { ok: false, reason: 'already_in_fulfillment' };
    }
    return { ok: true };
}

// Admin: Cancel order using Admin GraphQL
export const cancelOrderAdmin = async ({ id, reason = 'CUSTOMER', restock = true, notifyCustomer = true }) => {
    const mutation = `
        mutation CancelOrder($id: ID!, $notifyCustomer: Boolean, $reason: OrderCancelReason, $restock: Boolean) {
          orderCancel(id: $id, notifyCustomer: $notifyCustomer, reason: $reason, restock: $restock) {
            order { id canceledAt cancelReason name }
            userErrors { field message }
          }
        }
    `;
    const res = await shopifyClient.request(mutation, { id, reason, restock, notifyCustomer });
    const err = res?.orderCancel?.userErrors?.[0];
    if (err) throw new Error(err.message || 'orderCancel failed');
    return res?.orderCancel?.order;
}

// Cancel order via your backend (Admin API required). Configure CANCEL_ORDER_ENDPOINT.
export const cancelOrderRequest = async ({ orderId, reason, note }) => {
    try {
        const endpoint = process.env.CANCEL_ORDER_ENDPOINT;
        if (!endpoint) return { ok: false, reason: 'endpoint_not_configured' };
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, reason, note }),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, data };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}

// Fetch logged-in customer basic profile (email/name) via Storefront
export const fetchCustomerProfile = async (customerAccessToken) => {
    if (!customerAccessToken) return null;
    try {
        const { customer } = await storeFrontClient.request(CUSTOMER_QUERY, { customerAccessToken });
        return customer;
    } catch (_) {
        return null;
    }
}

// Build a Multipass login URL by calling your serverless endpoint
// Configure env MULTIPASS_ENDPOINT, e.g., https://your-vercel-app.vercel.app/api/multipass-login
export const getMultipassLoginUrl = async ({ email, firstName, lastName, returnTo }) => {
    const endpoint = process.env.MULTIPASS_ENDPOINT;
    if (!endpoint) return { ok: false, reason: 'multipass_endpoint_not_configured' };
    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, firstName, lastName, returnTo }),
        });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, status: res.status, url: data?.url, data };
    } catch (e) {
        return { ok: false, error: String(e) };
    }
}

// Exchange Multipass token for Storefront customer access token
export const createAccessTokenWithMultipass = async (multipassToken) => {
    const variables = { multipassToken };
    const { customerAccessTokenCreateWithMultipass } = await storeFrontClient.request(
        CUSTOMER_ACCESS_TOKEN_CREATE_WITH_MULTIPASS,
        variables
    );
    const errs = customerAccessTokenCreateWithMultipass?.customerUserErrors;
    if (errs && errs.length) {
        const msg = errs.map(e => e.message).join(', ');
        throw new Error(msg || 'Multipass token exchange failed');
    }
    return customerAccessTokenCreateWithMultipass?.customerAccessToken;
}

// Delivery options (Shipping / Pickup) helpers
export const getCartDeliveryOptions = async (cartId) => {
    if (!cartId) return null;
    try {
        const { cart } = await storeFrontClient.request(GET_DELIVERY_OPTIONS, { cartId });
        return cart;
    } catch (e) {
        console.warn('getCartDeliveryOptions error:', e?.message || e);
        return null;
    }
}

export const setCartDeliveryOption = async ({ cartId, deliveryGroupId, deliveryOptionHandle }) => {
    const variables = {
        cartId,
        selected: [{ deliveryGroupId, deliveryOptionHandle }],
    };
    const res = await storeFrontClient.request(CART_SELECTED_DELIVERY_OPTIONS_UPDATE, variables);
    const err = res?.cartSelectedDeliveryOptionsUpdate?.userErrors?.[0];
    if (err) throw new Error(err.message || 'Failed to set delivery option');
    return res?.cartSelectedDeliveryOptionsUpdate?.cart;
}
