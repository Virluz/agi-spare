import { gql } from 'graphql-request';

const FETCH_CUSTOMER_ORDERS = gql`
  query customerOrders($customerAccessToken: String!, $first: Int = 20) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      orders(first: $first, reverse: true) {
        edges {
          node {
            id
            name
            orderNumber
            processedAt
            canceledAt
            financialStatus
            fulfillmentStatus
            statusUrl
            totalPrice { amount currencyCode }
            lineItems(first: 1) {
              edges {
                node {
                  title
                  variant { image { url } }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default FETCH_CUSTOMER_ORDERS;
