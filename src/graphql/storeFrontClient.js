import { GraphQLClient } from "graphql-request";

const storeFrontClient = new GraphQLClient(
    `https://${process.env.SHOPIFY_URL}.myshopify.com/api/2025-07/graphql.json`,
    {
        headers: {
            'X-Shopify-Storefront-Access-Token': process.env.STORE_FRONT_TOKEN,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }
);



export default storeFrontClient;
