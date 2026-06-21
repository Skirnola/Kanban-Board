import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import DashboardPage from '../pages/DashboardPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

const publicRoutes = ['/login', '/register']

function AppRoutes() {
  const { isAuthenticated } = useAuth()
  const [path, setPath] = useState(() => window.location.pathname)

  const navigate = useCallback((nextPath) => {
    window.history.pushState({}, '', nextPath)
    setPath(nextPath)
  }, [])

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!isAuthenticated && !publicRoutes.includes(path)) {
      navigate('/login')
      return
    }

    if (isAuthenticated && publicRoutes.includes(path)) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate, path])

  if (!isAuthenticated && path === '/register') {
    return <RegisterPage navigate={navigate} />
  }

  if (!isAuthenticated) {
    return <LoginPage navigate={navigate} />
  }

  return <DashboardPage navigate={navigate} />
}

export default AppRoutes
