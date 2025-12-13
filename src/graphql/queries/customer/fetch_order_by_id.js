import { gql } from 'graphql-request';

const FETCH_ORDER_BY_ID = gql`
  query orderById($id: ID!) {
    node(id: $id) {
      __typename
      ... on Order {
        id
        name
        orderNumber
        processedAt
        canceledAt
        financialStatus
        fulfillmentStatus
        statusUrl
        email
        phone
        currencyCode
        totalPrice { amount currencyCode }
        subtotalPrice { amount currencyCode }
        totalShippingPrice { amount currencyCode }
        totalTax { amount currencyCode }
        shippingAddress {
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
        billingAddress {
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
        successfulFulfillments(first: 100) {
          trackingInfo {
            number
            url
          }
        }
        discountApplications(first: 10) {
          edges {
            node {
              __typename
              ... on DiscountCodeApplication {
                code
                applicable
              }
              ... on ManualDiscountApplication {
                title
              }
              ... on ScriptDiscountApplication {
                title
              }
            }
          }
        }
        lineItems(first: 100) {
          edges {
            node {
              title
              quantity
              variant {
                id
                title
                sku
                barcode
                metafield(namespace: "custom", key: "custom_variant_image") {
                  value
                  reference {
                    __typename
                    ... on MediaImage { image { url altText } }
                    ... on GenericFile { url }
                  }
                }
                image { url altText }
                product { 
                  id
                  title
                  vendor
                  productType
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default FETCH_ORDER_BY_ID;
