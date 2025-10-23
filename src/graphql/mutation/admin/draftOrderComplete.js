export const DRAFT_ORDER_COMPLETE = `
mutation draftOrderComplete($id: ID!, $paymentPending: Boolean) {
  draftOrderComplete(id: $id, paymentPending: $paymentPending) {
    draftOrder { id name }
    userErrors { field message }
  }
}
`;
