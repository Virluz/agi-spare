// queries/fetch_product_by_id.js
import { gql } from "@apollo/client";

const fetch_filters = gql`
query GetAllProductFilters {
  products(first: 50, query: "title:*") {
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
`;

export default fetch_filters;