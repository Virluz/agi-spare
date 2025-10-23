export const CHECKOUT_CREATE = `
mutation checkoutCreate($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      id
      webUrl
      currencyCode
      subtotalPriceV2 { amount currencyCode }
      totalTaxV2 { amount currencyCode }
      totalPriceV2 { amount currencyCode }
      lineItems(first: 50) {
        edges {
          node {
            id
            quantity
            title
            variant { id title priceV2 { amount currencyCode } }
            customAttributes { key value }
          }
        }
      }
      shippingAddress { firstName lastName phone country province city zip address1 address2 }
      note
      customAttributes { key value }
    }
    checkoutUserErrors { field message }
  }
}
`;
