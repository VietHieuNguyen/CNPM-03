import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Kiểm tra auth khi app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authAPI.profile()
        setUser(res.data.data.user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    setUser(res.data.data.user)
    toast.success(`Chào mừng trở lại, ${res.data.data.user.name}! 🎌`)
    return res.data.data.user
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    setUser(res.data.data.user)
    toast.success(`Chào mừng ${res.data.data.user.name} đến với MangaStore! 🌸`)
    return res.data.data.user
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error(err)
    }
    setUser(null)
    toast.success('Đã đăng xuất. Hẹn gặp lại! ')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
