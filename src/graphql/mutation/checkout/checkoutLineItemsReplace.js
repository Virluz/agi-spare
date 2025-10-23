export const CHECKOUT_LINE_ITEMS_REPLACE = `
mutation checkoutLineItemsReplace($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
  checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
    checkout {
      id
      webUrl
      lineItems(first: 50) {
        edges { node { id title quantity variant { id } customAttributes { key value } } }
      }
    }
    userErrors { field message }
  }
}
`;
