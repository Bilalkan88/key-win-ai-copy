import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('exclusive_cart');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      if (parsed.length > 0) {
        const expiresAt = localStorage.getItem('cart_expires_at');
        if (expiresAt && parseInt(expiresAt, 10) <= Date.now()) {
          localStorage.removeItem('cart_expires_at');
          localStorage.removeItem('exclusive_cart');
          return [];
        }
      }
      return parsed;
    } catch (e) {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    localStorage.setItem('exclusive_cart', JSON.stringify(cart));
    if (cart.length === 0) {
      setTimeLeft(0);
      localStorage.removeItem('cart_expires_at');
      return;
    }

    let expiresAt = localStorage.getItem('cart_expires_at');
    if (!expiresAt) {
      expiresAt = String(Date.now() + 15 * 60 * 1000);
      localStorage.setItem('cart_expires_at', expiresAt);
    }

    const expiresTime = parseInt(expiresAt, 10);
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiresTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        setCart([]);
        localStorage.removeItem('cart_expires_at');
        localStorage.removeItem('exclusive_cart');
        setIsCartOpen(false);
        toast.error("Reservation expired. Exclusive items have been released.");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [cart]);

  const addToCart = (keyword) => {
    if (cart.find(item => item.id === keyword.id)) {
      toast.info('Item already in cart');
      setIsCartOpen(true);
      return;
    }

    const expiresAt = String(Date.now() + 15 * 60 * 1000);
    localStorage.setItem('cart_expires_at', expiresAt);

    setCart([...cart, keyword]);
    toast.success('Added to cart!');
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart_expires_at');
    localStorage.removeItem('exclusive_cart');
    setIsCartOpen(false);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      timeLeft,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
