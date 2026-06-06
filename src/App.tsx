import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CheckInPage } from './ui/pages/CheckInPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/check-in" element={<CheckInPage />} />
        <Route path="/" element={<CheckInPage />} />
      </Routes>
    </BrowserRouter>
  )
}
