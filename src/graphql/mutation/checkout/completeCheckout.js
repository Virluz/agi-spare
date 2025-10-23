export default `
  mutation checkoutCompleteWithTokenizedPayment($checkoutId: ID!, $payment: TokenizedPaymentInput!) {
    checkoutCompleteWithTokenizedPaymentV3(
      checkoutId: $checkoutId,
      payment: $payment
    ) {
      checkout {
        id
        order {
          id
          orderNumber
          processedAt
          totalPrice {
            amount
            currencyCode
          }
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
`