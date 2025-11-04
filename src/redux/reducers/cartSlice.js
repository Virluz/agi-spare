// cartSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storeFrontClient } from "../../graphql/shopifyClient";
import fetch_cart from "../../graphql/queries/cart/fetch_cart";
import createNewCart from "../../graphql/mutation/createNewCart";
import { CART_LINES_UPDATE } from "../../graphql/queries/cart/cart_lines_update";
import cartLinesAdd from "../../graphql/mutation/cartLinesAdd";
import { CART_LINES_REMOVE } from "../../graphql/queries/cart/cart_lines_remove";

// Async Thunks
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  const cartId = await AsyncStorage.getItem("cartId");
  if (!cartId) return null;
  try {
    const res = await storeFrontClient.request(fetch_cart, { cartId });
    const cart = res?.cart || null;
    if (!cart) {
      // Stored cartId is no longer valid; clear it
      await AsyncStorage.removeItem('cartId');
    }
    return cart;
  } catch (e) {
    // On any fetch error, clear invalid cartId so a new one can be created next add
    await AsyncStorage.removeItem('cartId');
    return null;
  }
});

export const addOrUpdateCartLine = createAsyncThunk(
  "cart/addOrUpdateLine",
  async ({ variantId, quantity, attributes }, { getState, dispatch }) => {
    try {
      const recreateAndAdd = async () => {
        // Drop bad cartId and create a fresh cart with this single line
        await AsyncStorage.removeItem('cartId');
        const resCreate = await storeFrontClient.request(createNewCart, {
          input: {
            lines: [{
              merchandiseId: variantId, quantity, attributes: attributes
                ? Object.entries(attributes).map(([key, value]) => ({ key, value: String(value) }))
                : undefined
            }]
          },
        });
        const newId = resCreate?.cartCreate?.cart?.id;
        if (!newId) throw new Error(resCreate?.cartCreate?.userErrors?.map?.(e => e?.message).join(', ') || 'Failed to create cart');
        await AsyncStorage.setItem('cartId', newId);
        return await dispatch(fetchCart()).unwrap();
      };

      const isCartMissingError = (errs) => Array.isArray(errs) && errs.some(e =>
        String(e?.message || '').toLowerCase().includes('cart') &&
        (String(e?.message || '').toLowerCase().includes('not exist') ||
          String(e?.message || '').toLowerCase().includes('not found') ||
          String(e?.message || '').toLowerCase().includes('invalid'))
      );

      let cartId = await AsyncStorage.getItem("cartId");
      const state = getState();
      const currentCart = state.cart.cart;

      console.log("Current cart state:", currentCart);

      // Prepare optional line attributes for Shopify API
      const attributesArray = attributes
        ? Object.entries(attributes).map(([key, value]) => ({ key, value: String(value) }))
        : undefined;

      if (!cartId) {
        // Create new cart if none exists
        const res = await storeFrontClient.request(createNewCart, {
          input: { lines: [{ merchandiseId: variantId, quantity, attributes: attributesArray }] },
        });
        const createErrors = res?.cartCreate?.userErrors;
        if (Array.isArray(createErrors) && createErrors.length) {
          throw new Error(createErrors.map(e => e?.message).filter(Boolean).join(', '));
        }
        cartId = res?.cartCreate?.cart?.id;
        if (!cartId) throw new Error('Cart creation failed');
        await AsyncStorage.setItem("cartId", cartId);
      } else {
        // Check if item exists in cart
        const existingLine = currentCart?.lines?.edges?.find(
          (line) => line.node.merchandise.id === variantId
        );

        console.log("Existing line:", existingLine);

        if (existingLine) {
          // Update existing line
          if (!existingLine.node.id) {
            throw new Error("Existing line has no ID");
          }

          const updateLine = {
            id: existingLine.node.id,
            // increment existing qty by requested amount
            quantity: Number(existingLine?.node?.quantity || 0) + Number(quantity || 0)
          };
          // If attributes provided, set/update them on the line
          if (attributesArray) {
            updateLine.attributes = attributesArray;
          }

          const updRes = await storeFrontClient.request(CART_LINES_UPDATE, {
            cartId,
            lines: [updateLine]
          });
          const updErrors = updRes?.cartLinesUpdate?.userErrors;
          if (isCartMissingError(updErrors)) {
            return await recreateAndAdd();
          }
          if (Array.isArray(updErrors) && updErrors.length) {
            throw new Error(updErrors.map(e => e?.message).filter(Boolean).join(', '));
          }
        } else {
          // Add new line
          const addRes = await storeFrontClient.request(cartLinesAdd, {
            cartId,
            lines: [{
              merchandiseId: variantId,
              quantity: quantity,
              attributes: attributesArray,
            }]
          });
          const addErrors = addRes?.cartLinesAdd?.userErrors;
          if (isCartMissingError(addErrors)) {
            return await recreateAndAdd();
          }
          if (Array.isArray(addErrors) && addErrors.length) {
            throw new Error(addErrors.map(e => e?.message).filter(Boolean).join(', '));
          }
        }
      }

      // Refresh cart state
      return await dispatch(fetchCart()).unwrap();

    } catch (error) {
      console.error("Error in addOrUpdateCartLine:", error);
      throw error; // Important for handling rejection
    }
  }
);

export const initializeCart = createAsyncThunk(
  "cart/initialize",
  async (_, { dispatch }) => {
    const cartId = await AsyncStorage.getItem("cartId");
    if (cartId) {
      await dispatch(fetchCart());
    }
    return cartId;
  }
);


export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ lineId, quantity }, { getState, dispatch }) => {
    if (quantity < 1) throw new Error("Quantity must be at least 1");

    const cartId = await AsyncStorage.getItem("cartId");
    if (!cartId) throw new Error("No cart found");

    await storeFrontClient.request(CART_LINES_UPDATE, {
      cartId,
      lines: [{ id: lineId, quantity }],
    });

    // Refresh and return the latest cart to keep UI in sync
    const freshCart = await dispatch(fetchCart()).unwrap();
    return freshCart;
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (lineId, { getState, dispatch }) => {
    const cartId = await AsyncStorage.getItem("cartId");
    if (!cartId) throw new Error("No cart found");

    const res = await storeFrontClient.request(CART_LINES_REMOVE, {
      cartId,
      lineIds: [lineId],
    });
    const delErrors = res?.cartLinesRemove?.userErrors;
    if (Array.isArray(delErrors) && delErrors.length) {
      throw new Error(delErrors.map(e => e?.message).filter(Boolean).join(', '));
    }
    const fresh = await dispatch(fetchCart()).unwrap();
    return fresh;
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: null,
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addOrUpdateCartLine.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addOrUpdateCartLine.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(addOrUpdateCartLine.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.status = "updating";
      })
      .addCase(updateCartItemQuantity.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      .addCase(removeCartItem.pending, (state) => {
        state.status = "removing";
      })
      .addCase(removeCartItem.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  }
});

export default cartSlice.reducer;