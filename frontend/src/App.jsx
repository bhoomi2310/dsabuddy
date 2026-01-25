import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ROUTES } from './config/constants'

const LandingPage = lazy(() => import('./pages/LandingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))
const ComponentShowcase = lazy(() => import('./pages/ComponentShowcase'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-xl font-bold primary-color">Loading...</div>
  </div>
)

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.REGISTER} element={<LoginPage />} />
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />
          <Route path="/showcase" element={<ComponentShowcase />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
