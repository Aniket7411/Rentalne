import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const CartContext = createContext(null);

const GUEST_CART_KEY = 'rental_guest_cart_v1';

function readGuestCart() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return { rentals: [], services: [] };
    const data = JSON.parse(raw);
    return {
      rentals: Array.isArray(data.rentals) ? data.rentals : [],
      services: Array.isArray(data.services) ? data.services : [],
    };
  } catch {
    return { rentals: [], services: [] };
  }
}

function writeGuestCart(rentals, services = []) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify({ rentals, services }));
}

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ rentals: [], services: [] });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !user || user.role !== 'user') {
      setLoading(true);
      try {
        const g = readGuestCart();
        setCart({ rentals: g.rentals, services: g.services });
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const g = readGuestCart();
      if (g.rentals.length > 0) {
        for (const line of g.rentals) {
          const pid =
            typeof line.productId === 'object' && line.productId
              ? line.productId._id || line.productId.id
              : line.productId;
          if (!pid) continue;
          await apiService.addCartRental({
            productId: pid,
            quantity: line.quantity || 1,
            paymentOption: line.paymentOption || 'payAdvance',
          });
        }
        localStorage.removeItem(GUEST_CART_KEY);
      }
      const res = await apiService.getCart();
      if (res.success && res.data) {
        setCart({
          rentals: res.data.rentals || [],
          services: res.data.services || [],
        });
      } else {
        setCart({ rentals: [], services: [] });
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addRentalToCart = useCallback(
    async (productId, paymentOption = 'payAdvance', productSnapshot = null) => {
      if (!isAuthenticated || !user || user.role !== 'user') {
        if (!productSnapshot) {
          return { success: false, message: 'Product data missing for guest cart' };
        }
        const pid = productId || productSnapshot._id || productSnapshot.id;
        const lineId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const g = readGuestCart();
        g.rentals.push({
          _id: lineId,
          id: lineId,
          productId: pid,
          product: productSnapshot,
          quantity: 1,
          paymentOption,
          price: productSnapshot.price || {},
        });
        writeGuestCart(g.rentals, g.services);
        setCart({ rentals: g.rentals, services: g.services });
        return { success: true, message: 'Added to cart' };
      }
      const res = await apiService.addCartRental({
        productId,
        quantity: 1,
        paymentOption,
      });
      if (res.success) await refreshCart();
      return res;
    },
    [isAuthenticated, user, refreshCart]
  );

  const removeFromCart = useCallback(
    async (itemId) => {
      if (!isAuthenticated || !user || user.role !== 'user') {
        const g = readGuestCart();
        const rentals = g.rentals.filter(
          (r) => String(r._id || r.id) !== String(itemId)
        );
        const services = g.services.filter(
          (s) => String(s._id || s.id) !== String(itemId)
        );
        writeGuestCart(rentals, services);
        setCart({ rentals, services });
        return { success: true };
      }
      const res = await apiService.removeCartItem(itemId);
      if (res.success) await refreshCart();
      return res;
    },
    [isAuthenticated, user, refreshCart]
  );

  const itemCount = (cart.rentals?.length || 0) + (cart.services?.length || 0);

  const value = {
    cart,
    loading,
    refreshCart,
    addRentalToCart,
    removeFromCart,
    itemCount,
    isGuestCart: !isAuthenticated || !user || user.role !== 'user',
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
