import { gql } from 'graphql-request';

const CUSTOMER_UPDATE = gql`
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
        defaultAddress {
          id
          address1
          address2
          city
          company
          country
          province
          zip
          phone
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export default CUSTOMER_UPDATE;