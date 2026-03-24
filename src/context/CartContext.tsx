"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useSettings } from './SettingsContext';

export interface CartItem {
  id: string; // Unique ID for the cart item
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number; // Base price or original added price, though we'll compute effective price dynamically
  customText?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getProductQuantity: (productId: string) => number;
  cartTotal: number;
  cartCount: number;
  getEffectivePrice: (productId: string, basePrice: number) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Need products to compute tiers dynamically based on total quantity of a productId
  const { products } = useSettings();

  // Load from localeStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('artesana_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart from local storage", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when cart changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('artesana_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    // Normalize empty strings to undefined to ensure exact matching
    const normalizedCustomText = newItem.customText || undefined;
    
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.productId === newItem.productId && item.customText === normalizedCustomText
      );

      if (existingItemIndex >= 0) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += newItem.quantity;
        return newCart;
      } else {
        const id = `${newItem.productId}-${Date.now()}`;
        return [...prev, { ...newItem, customText: normalizedCustomText, id }];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCartItems([]);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const getProductQuantity = (productId: string) => {
    return cartItems
      .filter(item => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const getEffectivePrice = (productId: string, basePrice: number) => {
    const totalQty = getProductQuantity(productId);
    const productDef = products.find(p => p.id === productId);
    
    if (!productDef || !productDef.priceTiers || productDef.priceTiers.length === 0) {
      return basePrice;
    }

    const activeTier = productDef.priceTiers.find(tier => {
      const minMatch = totalQty >= tier.minQty;
      const maxMatch = tier.maxQty === null || tier.maxQty === undefined || totalQty <= tier.maxQty;
      return minMatch && maxMatch;
    });

    return activeTier ? activeTier.unitPrice : basePrice;
  };

  // Compute total dynamically using effective tiers
  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const effectiveUnitPrice = getEffectivePrice(item.productId, item.unitPrice);
      return total + (effectiveUnitPrice * item.quantity);
    }, 0);
  }, [cartItems, products]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      openCart,
      closeCart,
      getProductQuantity,
      cartTotal,
      cartCount,
      getEffectivePrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
