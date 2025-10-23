// fetch_recently_viewed.js
import { gql } from "@apollo/client";

const fetch_recently_viewed = gql`
  query GetRecentlyViewedProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
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
        variants(first: 10) {
          edges {
            node {
              id
              price {
                amount
                currencyCode
              }
              image {
                url(transform: {
                  maxWidth: 100,
                  maxHeight: 100,
                  crop: CENTER
                })
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
              url(transform: {
                maxWidth: 300,
                maxHeight: 300,
                crop: CENTER
              })
              altText
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

export default fetch_recently_viewed;