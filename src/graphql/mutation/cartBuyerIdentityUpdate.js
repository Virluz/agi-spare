export default `
mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
  cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
    cart {
      id
      checkoutUrl
      buyerIdentity {
        countryCode
        email
        customer {
          id
          email
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;
