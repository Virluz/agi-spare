import { gql } from 'graphql-request';

/**
 * Admin API Query - Fetch Line Item Fulfillment Status
 * This query uses Admin API to get precise per-line-item fulfillment status
 * which is NOT available in Storefront API
 * 
 * Admin API endpoint: https://store.myshopify.com/admin/api/2025-07/graphql.json
 * Requires: ADMIN_TOKEN (X-Shopify-Access-Token header)
 * 
 * Required Permissions:
 * - read_orders (to query order data)
 * - read_fulfillments (to query fulfillment status)
 */
const FETCH_ORDER_LINE_ITEMS_ADMIN = gql`
  query OrderFulfillments($id: ID!) {
  order(id: $id) {
    id
    lineItems(first: 100) {
      edges {
        node {
          id
          name
          quantity
          fulfillmentStatus   # important
          variant {
            id   # ⭐ REQUIRED TO MATCH ITEMS
          }
        }
      }
    }
    fulfillments {
      id
      status
      displayStatus
      trackingInfo {
        company
        number
        url
      }
      fulfillmentLineItems(first: 100) {
        edges {
          node {
            quantity
            lineItem {
              id
              name
                sku
                title
                variantTitle
                variant {
                 id   # ⭐ Needed for matching
              }
            }
          }
        }
      }
    }
  }
}

`;

export default FETCH_ORDER_LINE_ITEMS_ADMIN;
