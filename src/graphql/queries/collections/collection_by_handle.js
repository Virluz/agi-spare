// fetch_collection_by_handle.js
import { gql } from "@apollo/client";

const collection_by_handle = gql`
  query GetCollectionByHandle($handle: String!, $first: Int = 20, $after:String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      image {
        url
        altText
      }
      products(first: $first, after:$after, sortKey: $sortKey, reverse: $reverse) {
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
                  url
                  altText
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export default collection_by_handle;