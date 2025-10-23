// queries/fetch_product_by_id.js
import { gql } from "@apollo/client";

const fetch_filters_by_collections = gql`
query GetCollectionFilters($handle: String!) {
  collection(handle: $handle) {
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
`;

export default fetch_filters_by_collections;