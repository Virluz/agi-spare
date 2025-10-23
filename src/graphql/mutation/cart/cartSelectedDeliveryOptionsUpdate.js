const CART_SELECTED_DELIVERY_OPTIONS_UPDATE = `
  mutation SetCartDeliveryOption($cartId: ID!, $selected: [CartSelectedDeliveryOptionInput!]!) {
    cartSelectedDeliveryOptionsUpdate(cartId: $cartId, selectedDeliveryOptions: $selected) {
      cart {
        id
        deliveryGroups(first: 10) {
          edges {
            node {
              id
              selectedDeliveryOption { handle title }
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`;

export default CART_SELECTED_DELIVERY_OPTIONS_UPDATE;
