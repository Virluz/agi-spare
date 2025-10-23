const GET_DELIVERY_OPTIONS = `
  query CartDeliveryOptions($cartId: ID!) {
    cart(id: $cartId) {
      id
      deliveryGroups(first: 10) {
        edges {
          node {
            id
            deliveryOptions {
              handle
              title
              description
              estimatedCost { amount currencyCode }
            }
            selectedDeliveryOption {
              handle
              title
              description
            }
          }
        }
      }
    }
  }
`;

export default GET_DELIVERY_OPTIONS;
