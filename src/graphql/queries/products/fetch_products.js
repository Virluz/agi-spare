// fetch_products.js
import { gql } from "@apollo/client";

const fetch_products = gql`
  query GetProducts($first: Int, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          title
          handle
          description
          variants(first: 100) {
            edges {
              node {
                id
                sku
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
                    maxWidth: 200,
                    maxHeight: 200,
                    crop: CENTER,
                    scale: 2
                  })
              }
            }
          }
        }
      }
    }
  }
`;

export default fetch_products;