import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { IconUser, IconEnvelope, IconCalendar, IconShield } from '../components/Icons'

const ProfilePage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) { navigate('/login'); return null }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="paper-old rounded-2xl p-6 sm:p-8 animate-fade-up">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-wabi-green to-wabi-green-light flex items-center justify-center text-3xl sm:text-4xl font-black text-white mb-4 shadow-warm-lg">
            {user.name?.charAt(0)?.toUpperCase()}
          </div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-wabi-text">{user.name}</h1>
          <div className={`badge mt-2 flex items-center gap-1 ${user.role === 'admin' ? 'badge-hot' : 'badge-new'}`}>
            <IconShield className="w-3 h-3" />
            {user.role === 'admin' ? 'Admin' : 'Thành Viên'}
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 mb-8">
          <div className="flex items-center gap-3 bg-white border border-wabi-border rounded-xl p-3 sm:p-4">
            <div className="w-9 h-9 rounded-lg bg-wabi-green/10 flex items-center justify-center">
              <IconUser className="w-4 h-4 text-wabi-green" />
            </div>
            <div>
              <p className="text-xs text-wabi-muted">Tên hiển thị</p>
              <p className="text-wabi-text font-semibold text-sm sm:text-base">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-wabi-border rounded-xl p-3 sm:p-4">
            <div className="w-9 h-9 rounded-lg bg-wabi-red/10 flex items-center justify-center">
              <IconEnvelope className="w-4 h-4 text-wabi-red" />
            </div>
            <div>
              <p className="text-xs text-wabi-muted">Email</p>
              <p className="text-wabi-text font-semibold text-sm sm:text-base break-all">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white border border-wabi-border rounded-xl p-3 sm:p-4">
            <div className="w-9 h-9 rounded-lg bg-wabi-sand/20 flex items-center justify-center">
              <IconCalendar className="w-4 h-4 text-wabi-brown" />
            </div>
            <div>
              <p className="text-xs text-wabi-muted">Tham gia</p>
              <p className="text-wabi-text font-semibold text-sm sm:text-base">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button onClick={() => navigate('/search')} className="btn-green flex-1 justify-center cursor-pointer" id="profile-browse-btn">Xem Truyện</button>
          <button onClick={handleLogout} className="btn-outline flex-1 justify-center cursor-pointer" id="profile-logout-btn">
            Đăng Xuất
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
