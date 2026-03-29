import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ rentals: [], services: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'user') {
      setCart({ rentals: [], services: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await apiService.getCart();
      if (res.success && res.data) {
        setCart({
          rentals: res.data.rentals || [],
          services: res.data.services || [],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addRentalToCart = useCallback(
    async (productId, paymentOption = 'payAdvance') => {
      const res = await apiService.addCartRental({ productId, quantity: 1, paymentOption });
      if (res.success) await refreshCart();
      return res;
    },
    [refreshCart]
  );

  const itemCount =
    (cart.rentals?.length || 0) + (cart.services?.length || 0);

  const value = {
    cart,
    loading,
    refreshCart,
    addRentalToCart,
    itemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
