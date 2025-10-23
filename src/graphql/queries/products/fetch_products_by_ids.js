import { gql } from "graphql-request";

const fetch_products_by_ids = gql`
  query GetProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        handle
        description
        options {
          name
          values
        }
        variants(first: 50) {
          edges {
            node {
              id
              title
              image {
                url(transform: {
                  maxWidth: 24,
                  maxHeight: 24,
                  crop: CENTER,
                  scale: 2
                })
              }
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
    }
  }
`;

export default fetch_products_by_ids;