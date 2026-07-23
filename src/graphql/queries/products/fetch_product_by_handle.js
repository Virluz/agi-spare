import { gql } from "@apollo/client";

const fetch_product_by_handle = gql`
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      vendor
      description
      descriptionHtml
      metafields(identifiers: [
        { namespace: "custom", key: "more_details" },
        { namespace: "custom", key: "fabric_composition" },
        { namespace: "custom", key: "wash_care_instructions" },
        { namespace: "custom", key: "mobile_aplus_content" },
      ]) {
        key
        namespace
        type
        value
      }
      handle
      options {
        name
        values
      }
      variants(first: 50) {
        edges {
          node {
            id
            title
            sku
            image {
              url(transform: {
                maxWidth: 24,
                maxHeight: 24,
                crop: CENTER,
                scale: 2
              })
            }
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
            quantityAvailable
          }
        }
      }
      images(first: 5) {
        edges {
          node {
            id
            url(transform: {
              maxWidth: 450,
              maxHeight: 450,
              crop: CENTER,
              scale: 2
            })
            altText
          }
        }
      }
    }
  }
`;

export default fetch_product_by_handle;
