import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '../api'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch cart when user logs in
  const fetchCart = async () => {
    if (!user) {
      setCart(null)
      return
    }
    setLoading(true)
    try {
      const res = await cartAPI.get()
      setCart(res.data.data)
    } catch (err) {
      console.error('Lỗi khi lấy giỏ hàng:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [user])

  const addToCart = async (comicId, quantity = 1) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng! 🎌')
      return false
    }
    try {
      const res = await cartAPI.add({ comicId, quantity })
      setCart(res.data.data)
      toast.success(res.data.message || 'Đã thêm sản phẩm vào giỏ hàng! 🌸')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm sản phẩm vào giỏ hàng.')
      return false
    }
  }

  const updateQuantity = async (comicId, quantity) => {
    try {
      const res = await cartAPI.update({ comicId, quantity })
      setCart(res.data.data)
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật số lượng.')
      return false
    }
  }

  const removeFromCart = async (comicId) => {
    try {
      const res = await cartAPI.remove(comicId)
      setCart(res.data.data)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng.')
      return true
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể xóa sản phẩm.')
      return false
    }
  }

  const clearCart = async () => {
    try {
      const res = await cartAPI.clear()
      setCart(res.data.data)
      return true
    } catch (err) {
      console.error('Không thể làm trống giỏ hàng:', err)
      return false
    }
  }

  // Calculate stats
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  const totalPrice = cart?.items?.reduce((sum, item) => {
    const finalPrice = item.comic.price * (1 - (item.comic.discount || 0) / 100)
    return sum + finalPrice * item.quantity
  }, 0) || 0

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        totalItems,
        totalPrice,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
