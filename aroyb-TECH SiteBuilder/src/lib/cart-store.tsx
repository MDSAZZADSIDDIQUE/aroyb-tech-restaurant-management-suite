'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartItem, CartState, FulfillmentType, CartItemModifier, CartItemAddOn } from '@/types';

const initialState: CartState = {
  items: [],
  locationId: null,
  fulfillmentType: 'delivery',
  tip: 0,
};

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_INSTRUCTIONS'; payload: { id: string; instructions: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOCATION'; payload: string }
  | { type: 'SET_FULFILLMENT'; payload: FulfillmentType }
  | { type: 'SET_SCHEDULED_TIME'; payload: string | undefined }
  | { type: 'SET_DELIVERY_ZONE'; payload: string | undefined }
  | { type: 'SET_TIP'; payload: number }
  | { type: 'LOAD_CART'; payload: CartState };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(
        item => 
          item.itemId === action.payload.itemId &&
          JSON.stringify(item.modifiers) === JSON.stringify(action.payload.modifiers) &&
          JSON.stringify(item.addOns) === JSON.stringify(action.payload.addOns)
      );
      
      if (existingItemIndex > -1) {
        const newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: newItems };
      }
      
      return { ...state, items: [...state.items, action.payload] };
    }
    
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter(item => item.id !== action.payload.id) };
      }
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    }
    
    case 'UPDATE_INSTRUCTIONS':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id 
            ? { ...item, specialInstructions: action.payload.instructions } 
            : item
        ),
      };
    
    case 'CLEAR_CART':
      return { ...initialState, locationId: state.locationId };
    
    case 'SET_LOCATION':
      return { ...state, locationId: action.payload };
    
    case 'SET_FULFILLMENT':
      return { ...state, fulfillmentType: action.payload };
    
    case 'SET_SCHEDULED_TIME':
      return { ...state, scheduledTime: action.payload };
    
    case 'SET_DELIVERY_ZONE':
      return { ...state, deliveryZoneId: action.payload };
    
    case 'SET_TIP':
      return { ...state, tip: action.payload };
    
    case 'LOAD_CART':
      return action.payload;
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateInstructions: (id: string, instructions: string) => void;
  clearCart: () => void;
  setLocation: (locationId: string) => void;
  setFulfillment: (type: FulfillmentType) => void;
  setScheduledTime: (time: string | undefined) => void;
  setDeliveryZone: (zoneId: string | undefined) => void;
  setTip: (amount: number) => void;
  getSubtotal: () => number;
  getItemTotal: (item: CartItem) => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('aroyb-cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsed });
      } catch (e) {
        console.error('Failed to load cart from localStorage');
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('aroyb-cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const id = `${item.itemId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({ type: 'ADD_ITEM', payload: { ...item, id } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const updateInstructions = (id: string, instructions: string) => {
    dispatch({ type: 'UPDATE_INSTRUCTIONS', payload: { id, instructions } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setLocation = (locationId: string) => {
    dispatch({ type: 'SET_LOCATION', payload: locationId });
  };

  const setFulfillment = (type: FulfillmentType) => {
    dispatch({ type: 'SET_FULFILLMENT', payload: type });
  };

  const setScheduledTime = (time: string | undefined) => {
    dispatch({ type: 'SET_SCHEDULED_TIME', payload: time });
  };

  const setDeliveryZone = (zoneId: string | undefined) => {
    dispatch({ type: 'SET_DELIVERY_ZONE', payload: zoneId });
  };

  const setTip = (amount: number) => {
    dispatch({ type: 'SET_TIP', payload: amount });
  };

  const getItemTotal = (item: CartItem): number => {
    let total = item.basePrice;
    
    // Add modifier prices
    item.modifiers.forEach(mod => {
      mod.options.forEach(opt => {
        total += opt.priceDelta;
      });
    });
    
    // Add add-on prices
    item.addOns.forEach(addOn => {
      total += addOn.price * addOn.quantity;
    });
    
    return total * item.quantity;
  };

  const getSubtotal = (): number => {
    return state.items.reduce((total, item) => total + getItemTotal(item), 0);
  };

  const getTotalItems = (): number => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        updateInstructions,
        clearCart,
        setLocation,
        setFulfillment,
        setScheduledTime,
        setDeliveryZone,
        setTip,
        getSubtotal,
        getItemTotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
