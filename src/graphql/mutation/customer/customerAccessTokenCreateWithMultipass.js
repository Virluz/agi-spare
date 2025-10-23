import { gql } from 'graphql-request';

// Exchange a Shopify Multipass token for a Storefront customer access token
const CUSTOMER_ACCESS_TOKEN_CREATE_WITH_MULTIPASS = gql`
  mutation customerAccessTokenCreateWithMultipass($multipassToken: String!) {
    customerAccessTokenCreateWithMultipass(multipassToken: $multipassToken) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export default CUSTOMER_ACCESS_TOKEN_CREATE_WITH_MULTIPASS;
