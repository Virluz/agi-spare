const fetch_cart = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      createdAt
      updatedAt
      checkoutUrl
      buyerIdentity {
        email
        countryCode
        customer {
          id
          email
        }
      }
      lines(first: 10) {
        edges {
          node {
            id
            quantity
            attributes { key value }
            merchandise {
              ... on ProductVariant {
                id
                title
                product {
                  id
                  title
                  handle
                  featuredImage {
                    url(transform: {
                      maxWidth: 200,
                      maxHeight: 200,
                      crop: CENTER,
                      scale: 2
                    })
                  }
                }
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
      estimatedCost {
        subtotalAmount {
          amount
          currencyCode
        }
        totalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

export default fetch_cart;
