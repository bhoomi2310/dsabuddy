import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './config/constants'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

function ProtectedRoute({ children }) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Suspense fallback={null}>
        <Routes>
          <Route path={ROUTES.HOME} element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/forum" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/pyqs" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/pyqs/:companyName" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/leaderboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/settings" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path={ROUTES.REGISTER} element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path={ROUTES.LOGIN} element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path={ROUTES.ONBOARDING} element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/showcase" element={<ComponentShowcase />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
