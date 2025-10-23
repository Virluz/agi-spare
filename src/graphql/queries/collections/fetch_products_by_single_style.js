// fetch_products_by_single_style.js
import { gql } from "@apollo/client";

const fetch_products_by_single_style = gql`
  query GetProductsBySingleStyle($query: String!, $first: Int = 20, $after: String) {
    products(
      first: $first
      after: $after
      query: $query
      sortKey: BEST_SELLING
    ) {
      edges {
        node {
          id
          title
          handle
          description
          tags
          productType
          options {
            name
            values
          }
          variants(first: 100) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
                image {
                  url(transform: {
                    maxWidth: 24,
                    maxHeight: 24,
                    crop: CENTER,
                    scale: 2
                  })
                }
                selectedOptions {
                  name
                  value
                }
                title
              }
            }
          }
          images(first: 1) {
            edges {
              node {
                url(transform: {
                  maxWidth: 300,
                  maxHeight: 300,
                  crop: CENTER
                })
                altText
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
  }
`;

export default fetch_products_by_single_style;