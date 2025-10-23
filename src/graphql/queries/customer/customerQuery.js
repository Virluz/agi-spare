import { gql } from 'graphql-request';

export const CUSTOMER_QUERY = gql`
  query customerQuery($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      email
      phone
      acceptsMarketing
      metafields(identifiers: [
        { namespace: "facts", key: "gender" },
        { namespace: "facts", key: "birth_date" }
      ]) {
        key
        value
        type
      }
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      addresses(first: 20) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            zip
            country
            phone
          }
        }
      }
    }
  }
`;