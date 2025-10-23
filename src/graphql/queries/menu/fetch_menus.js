// lib/graphqlQueries.js
export const MENU_QUERY = `
  query GetMenu($handle: String!) {
    menu(handle: $handle) {
      id
      handle
      items {
        id
        resourceId
        tags
        type
        title
        url
        items {
          id
          resourceId
          tags
          type
          title
          url
          items {
            id
            resourceId
            tags
            type
            title
            url
          }
        }
      }
    }
  }
`;

export const MENU_WITH_RESOURCES_QUERY = `
  query MenuWithImages($handle: String!) {
      menu(handle: $handle) {
        id
        items {
          id
          title
          url
          resource {
            __typename
            ... on Collection {
              id
              handle
              image {
                url
                altText
              }
            }
            ... on Product {
              id
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
            ... on Page {
              id
              handle
              metafield(namespace: "custom", key: "menu_image") {
                reference {
                  ... on MediaImage {
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
            ... on Article {
              id
              handle
              metafield(namespace: "custom", key: "menu_image") {
                reference {
                  ... on MediaImage {
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
          items {
            id
            title
            url
            resource {
              __typename
              ... on Collection {
                id
                handle
                image { url altText }
              }
              ... on Product {
                id
                handle
                images(first: 1) { edges { node { url altText } } }
              }
            }
            items {
              id
              title
              url
              resource {
                __typename
                ... on Collection {
                  id
                  handle
                  image { url altText }
                }
                ... on Product {
                  id
                  handle
                  images(first: 1) { edges { node { url altText } } }
                }
            }
          }
          }
        }
      }
    }
`;