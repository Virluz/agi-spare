// fetch_bestsellers.js
import { gql } from "@apollo/client";

const fetch_bestsellers = gql`
  query GetBestSellers($first: Int = 4) {
    products(first: $first, query: "tag:bestseller", sortKey: BEST_SELLING) {
      edges {
        node {
          id
          title
          handle
          description
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
                  name  # e.g., "Color"
                  value # e.g., "Mosaic Blue"
                }
                title
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
  }
`;

export default fetch_bestsellers;