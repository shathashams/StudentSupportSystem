import { Outlet } from 'react-router-dom'

import Navbar from '../components/Navbar'
import { useCurrentUser } from '../hooks/useCurrentUser'

function AppLayout() {
  const user = useCurrentUser()

  return (
    <>
      <Navbar role={user?.role} />

      <main className="app-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  )
}

export default AppLayout
