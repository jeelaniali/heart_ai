import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

import Header    from './components/Header.jsx'
import Sidebar   from './components/Sidebar.jsx'

import Dashboard      from './pages/Dashboard.jsx'
import Explainability from './pages/Explainability.jsx'
import Sensitivity    from './pages/Sensitivity.jsx'
import Lifestyle      from './pages/Lifestyle.jsx'
import Report         from './pages/Report.jsx'

export default function App() {
  const [patientData, setPatientData] = useState(null)
  const [lastResult,  setLastResult]  = useState(null)
  const shared = { patientData, setPatientData, lastResult, setLastResult }

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden" style={{ background: '#f0f4f8' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header lastResult={lastResult} />
          <main className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/"               element={<Dashboard      {...shared} />} />
                <Route path="/explainability"  element={<Explainability {...shared} />} />
                <Route path="/sensitivity"    element={<Sensitivity    {...shared} />} />
                <Route path="/lifestyle"      element={<Lifestyle      {...shared} />} />
                <Route path="/report"         element={<Report         {...shared} />} />
                <Route path="*"              element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
