// queries/fetch_product_by_id.js
import { gql } from "@apollo/client";

const fetch_filters = gql`
query GetAllProductFilters {
  collections(first: 250) {
    edges {
      node {
        id
        handle
        title
        products(first: 250) {
          filters {
            id
            label
            type
            values {
              id
              label
              count
              input
            }
          }
        }
      }
    }
  }
}
`;

export default fetch_filters;