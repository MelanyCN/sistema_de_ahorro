/**
 * AURA — Router principal de la aplicación
 */
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import IngresosPage from './pages/IngresosPage'
import GastosPage from './pages/GastosPage'
import AnalisisPage from './pages/AnalisisPage'
import HormigasPage from './pages/HormigasPage'
import MetasPage from './pages/MetasPage'
import RecomendacionesPage from './pages/RecomendacionesPage'
import PerfilPage from './pages/PerfilPage'
import PresupuestosPage from './pages/PresupuestosPage'
import ComparativaPage from './pages/ComparativaPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="ingresos" element={<IngresosPage />} />
        <Route path="gastos" element={<GastosPage />} />
        <Route path="analisis" element={<AnalisisPage />} />
        <Route path="hormigas" element={<HormigasPage />} />
        <Route path="metas" element={<MetasPage />} />
        <Route path="presupuestos" element={<PresupuestosPage />} />
        <Route path="comparativa" element={<ComparativaPage />} />
        <Route path="recomendaciones" element={<RecomendacionesPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
