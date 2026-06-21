import Board from '../components/board/Board'
import BoardHeader from '../components/board/BoardHeader'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../hooks/useAuth'

function DashboardPage({ navigate }) {
  const { token, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <AppLayout>
      <section className="dashboard-page">
        <BoardHeader user={user} onLogout={handleLogout} />
        <Board token={token} />
      </section>
    </AppLayout>
  )
}

export default DashboardPage
