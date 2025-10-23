export const CHECKOUT_DISCOUNT_CODE_APPLY = `
mutation checkoutDiscountCodeApplyV2($discountCode: String!, $checkoutId: ID!) {
  checkoutDiscountCodeApplyV2(discountCode: $discountCode, checkoutId: $checkoutId) {
    checkoutUserErrors { field message }
    checkout { id }
  }
}
`;

export const CHECKOUT_DISCOUNT_CODE_REMOVE = `
mutation checkoutDiscountCodeRemove($checkoutId: ID!) {
  checkoutDiscountCodeRemove(checkoutId: $checkoutId) {
    checkoutUserErrors { field message }
    checkout { id }
  }
}
`;
