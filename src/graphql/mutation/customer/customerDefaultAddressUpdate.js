import { gql } from 'graphql-request';

const CUSTOMER_DEFAULT_ADDRESS_UPDATE = gql`
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
        defaultAddress { id address1 city province zip country phone }
      }
      customerUserErrors { code field message }
    }
  }
`;

export default CUSTOMER_DEFAULT_ADDRESS_UPDATE;
