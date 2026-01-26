import { gql } from 'graphql-request';

// WARNING: This is an Admin API mutation. Do NOT call it from the mobile app.
// Expose this via your server if you plan to set customer metafields (e.g., gender, dob).
export const CUSTOMER_METAFIELDS_SET = gql`
  mutation customerMetafieldsSet($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields { id key namespace value type }
      userErrors { field message }
    }
  }
`;
