export const CHECKOUT_BY_ID = `
query checkoutById($id: ID!) {
  node(id: $id) {
    ... on Checkout {
      id
      webUrl
      currencyCode
      subtotalPriceV2 { amount currencyCode }
      totalTaxV2 { amount currencyCode }
      totalPriceV2 { amount currencyCode }
      email
      note
      customAttributes { key value }
      shippingAddress { firstName lastName phone country province city zip address1 address2 }
      lineItems(first: 50) {
        edges {
          node {
            id
            title
            quantity
            customAttributes { key value }
            variant {
              id
              title
              priceV2 { amount currencyCode }
              product { id title }
            }
          }
        }
      }
    }
  }
}
`;