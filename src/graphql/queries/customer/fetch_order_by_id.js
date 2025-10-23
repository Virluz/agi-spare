import { gql } from 'graphql-request';

const FETCH_ORDER_BY_ID = gql`
  query orderById($id: ID!) {
    node(id: $id) {
      __typename
      ... on Order {
        id
        name
        processedAt
        canceledAt
        financialStatus
        fulfillmentStatus
  subtotalPriceV2 { amount currencyCode }
        totalShippingPriceV2 { amount currencyCode }
        totalPriceV2 { amount currencyCode }
        shippingAddress {
          firstName
          lastName
          address1
          address2
          city
          province
          zip
          country
          phone
        }
        lineItems(first: 5) {
          edges {
            node {
              title
              quantity
              variant { image { url } }
            }
          }
        }
      }
    }
  }
`;

export default FETCH_ORDER_BY_ID;
