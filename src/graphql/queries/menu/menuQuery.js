import { storeFrontClient } from '../../shopifyClient';
import { MENU_WITH_RESOURCES_QUERY } from './fetch_menus';

export const GET_MENU = `
  query GetMenu($handle: String!) {
    menu(handle: $handle) {
      id
      handle
      items {
        id
        resourceId
        tags
        type
        url
        title
        items {
          id
          resourceId
          tags
          type
          url
          title
          items {
            id
            resourceId
            tags
            type
            url
            title
          }
        }
      }
    }
  }
`;

export const getMenu = async (variables) => {
  try {
    const response = await storeFrontClient.request(MENU_WITH_RESOURCES_QUERY, variables);
    return response;
  } catch (error) {
    console.error('Error fetching menu:', error);
    throw error;
  }
};

