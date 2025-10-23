import { gql } from "graphql-request";

export const CART_LINES_REMOVE = gql`
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        totalQuantity
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              attributes { key value }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;
