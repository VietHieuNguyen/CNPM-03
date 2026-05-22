import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Shield, Calendar, LogOut, BookOpen } from 'lucide-react'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="paper-old rounded-2xl p-8 animate-fade-up">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wabi-green to-wabi-green-light flex items-center justify-center text-4xl font-black text-white mb-4 shadow-warm-lg">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <h1 className="font-serif text-2xl font-bold text-wabi-text">{user.name}</h1>
          <div className={`badge mt-2 ${user.role === 'admin' ? 'badge-hot' : 'badge-new'}`}>
            <Shield size={11} className="mr-1" />
            {user.role === 'admin' ? 'Admin' : 'Thành Viên'}
          </div>
        </div>

        {/* Info cards */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 bg-white border border-wabi-border rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-wabi-green/10 flex items-center justify-center">
              <User size={16} className="text-wabi-green" />
            </div>
            <div>
              <p className="text-xs text-wabi-muted">Tên hiển thị</p>
              <p className="text-wabi-text font-semibold">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-wabi-border rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-wabi-red/10 flex items-center justify-center">
              <Mail size={16} className="text-wabi-red" />
            </div>
            <div>
              <p className="text-xs text-wabi-muted">Email</p>
              <p className="text-wabi-text font-semibold">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-wabi-border rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg bg-wabi-sand/20 flex items-center justify-center">
              <Calendar size={16} className="text-wabi-brown" />
            </div>
            <div>
              <p className="text-xs text-wabi-muted">Tham gia</p>
              <p className="text-wabi-text font-semibold">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => navigate('/search')} className="btn-outline-green flex-1 justify-center" id="profile-browse-btn">
            <BookOpen size={16} /> Xem Truyện
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl border-2 border-wabi-red text-wabi-red font-bold hover:bg-red-50 transition-all"
            id="profile-logout-btn"
          >
            <LogOut size={16} /> Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
