import React, { createContext, useState, useEffect, useContext } from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await cartAPI.getCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err.response?.data?.message || "Lỗi lấy thông tin giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart(null);
    }
  }, [user]);

  const addToCart = async (comicId, quantity = 1) => {
    if (!user) {
      return { success: false, requireAuth: true, message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng." };
    }
    setLoading(true);
    try {
      const res = await cartAPI.addToCart(comicId, quantity);
      if (res.success) {
        setCart(res.data);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi thêm sản phẩm vào giỏ hàng.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (comicId, quantity) => {
    if (!user) return { success: false, requireAuth: true };
    setLoading(true);
    try {
      const res = await cartAPI.updateQuantity(comicId, quantity);
      if (res.success) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi cập nhật số lượng.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (comicId) => {
    if (!user) return { success: false, requireAuth: true };
    setLoading(true);
    try {
      const res = await cartAPI.removeFromCart(comicId);
      if (res.success) {
        setCart(res.data);
        return { success: true, message: res.message };
      }
      return { success: false, message: res.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi xóa sản phẩm khỏi giỏ hàng.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await cartAPI.clearCart();
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error("Clear cart error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper values
  const cartCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  const subtotalAmount = cart?.items?.reduce((sum, item) => {
    if (!item.comic) return sum;
    return sum + (item.comic.price * item.quantity);
  }, 0) || 0;

  const totalAmount = cart?.items?.reduce((sum, item) => {
    if (!item.comic) return sum;
    const finalPrice = item.comic.price * (1 - (item.comic.discount || 0) / 100);
    return sum + (finalPrice * item.quantity);
  }, 0) || 0;

  const discountAmount = subtotalAmount - totalAmount;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        cartCount,
        subtotalAmount,
        totalAmount,
        discountAmount,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
