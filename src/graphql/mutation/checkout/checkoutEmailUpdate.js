export const CHECKOUT_EMAIL_UPDATE = `
mutation checkoutEmailUpdateV2($checkoutId: ID!, $email: String!) {
  checkoutEmailUpdateV2(checkoutId: $checkoutId, email: $email) {
    checkoutUserErrors { field message }
    checkout {
      id
      email
    }
  }
}
`;
