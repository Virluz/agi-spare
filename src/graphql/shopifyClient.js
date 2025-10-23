import { GraphQLClient } from "graphql-request";
import { SHOPIFY_URL, ADMIN_TOKEN, STORE_FRONT_TOKEN } from '@env';



export const shopifyClient = new GraphQLClient(
    `https://${SHOPIFY_URL}.myshopify.com/admin/api/2025-07/graphql.json`,
    {
        headers: {
            'X-Shopify-Access-Token': ADMIN_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }
);






export const storeFrontClient = new GraphQLClient(
    `https://${SHOPIFY_URL}.myshopify.com/api/2025-07/graphql.json`,
    {
        headers: {
            'X-Shopify-Storefront-Access-Token': STORE_FRONT_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }
);


