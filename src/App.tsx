import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { CheckInPage } from './ui/pages/CheckInPage'
import { ConciergePage } from './ui/pages/ConciergePage'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="app-nav">
      <Link to="/check-in" className={location.pathname === '/check-in' ? 'active' : ''}>
        Check-in
      </Link>
      <Link to="/concierge" className={location.pathname === '/concierge' ? 'active' : ''}>
        Concierge
      </Link>
    </nav>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <main className="app-main">
        <Routes>
          <Route path="/check-in" element={<CheckInPage />} />
          <Route path="/concierge" element={<ConciergePage />} />
          <Route path="/" element={<CheckInPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
