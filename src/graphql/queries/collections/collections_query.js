

import { gql } from "graphql-request";

export const collections_query = gql`
  query getCollections($first: Int!) {
    collections(first: $first) {
      edges {
        node {
          id
          image {
            url
          }
          title
          handle
        }
      }
    }
  }
`;
