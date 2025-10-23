import { getAuthToken, clearAuthToken } from '../utils/customerAuth';
import { storeFrontClient } from './shopifyClient';
import { CUSTOMER_QUERY } from './queries/customer/customerQuery';

export const checkCustomerAuth = async () => {
    try {
        const token = await getAuthToken();
        if (!token) {
            return null;
        }

        // Try to fetch customer data with the token
        const response = await storeFrontClient.request(CUSTOMER_QUERY, {
            customerAccessToken: token
        });

        if (response.customer) {
            return response.customer;
        }

        // If we got here without customer data, clear the token
        await clearAuthToken();
        return null;
    } catch (error) {
        console.error('Customer auth check failed:', error);
        if (error.message.includes('Unidentified customer')) {
            await clearAuthToken();
        }
        return null;
    }
};