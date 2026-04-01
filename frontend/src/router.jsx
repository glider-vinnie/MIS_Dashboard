import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Operations from './pages/Operations'
import Training from './pages/Training'
import Financial from './pages/Financial'
import Field from './pages/Field'
import Reports from './pages/Reports'
import NotFound from './pages/NotFound'

function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Login />} />

      {/* Protected — any authenticated user */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/operations" element={<Operations />} />
          <Route path="/training" element={<Training />} />
          <Route path="/financial" element={<Financial />} />
          <Route path="/field" element={<Field />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRouter
