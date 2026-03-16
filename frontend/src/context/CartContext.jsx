import React, { createContext, useReducer, useCallback } from 'react';

export const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id && item.variant?.value === action.payload.variant?.value
      );

      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.id === action.payload.id && item.variant?.value === action.payload.variant?.value
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          ),
          totalItems: state.totalItems + (action.payload.quantity || 1),
        };
      }

      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.payload,
            quantity: action.payload.quantity || 1,
          },
        ],
        totalItems: state.totalItems + (action.payload.quantity || 1),
      };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        totalItems: state.totalItems - (state.items.find((item) => item.id === action.payload)?.quantity || 0),
      };

    case 'UPDATE_QUANTITY': {
      const item = state.items.find((i) => i.id === action.payload.id);
      if (!item) return state;

      const quantityDiff = action.payload.quantity - item.quantity;
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id
            ? { ...i, quantity: action.payload.quantity }
            : i
        ),
        totalItems: Math.max(0, state.totalItems + quantityDiff),
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addToCart = useCallback((product, quantity = 1, variant = null) => {
    const price = typeof product.price === 'string'
      ? parseFloat(product.price.replace(/[€,$]/g, '').trim())
      : product.price;

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        name: product.name,
        image: product.image,
        price,
        quantity,
        variant: variant || null,
        variantLabel: variant?.label || null,
      },
    });
  }, []);

  const removeFromCart = useCallback((itemId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: itemId,
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      dispatch({
        type: 'UPDATE_QUANTITY',
        payload: { id: itemId, quantity },
      });
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const value = {
    items: state.items,
    totalItems: state.totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
