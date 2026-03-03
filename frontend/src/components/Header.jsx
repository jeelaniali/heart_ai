import React from 'react'
import { motion } from 'framer-motion'
import { Search, Bell, User, Heart } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const PAGE_META = {
  '/':               { title: 'Cardiac Dashboard',   sub: 'AI-powered risk assessment' },
  '/explainability': { title: 'SHAP Explainability', sub: 'Feature attribution analysis' },
  '/sensitivity':    { title: 'Sensitivity Analysis', sub: 'Risk perturbation lab' },
  '/lifestyle':      { title: 'Lifestyle Advisory',   sub: 'Clinical recommendations' },
  '/report':         { title: 'Medical Report',       sub: 'AI-generated clinical summary' },
}

export default function Header({ lastResult }) {
  const { pathname } = useLocation()
  const meta = PAGE_META[pathname] || PAGE_META['/']

  const riskColor = {
    Critical: '#dc2626', High: '#ea580c',
    Moderate: '#d97706', Low:  '#16a34a',
  }

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', zIndex: 20 }}>

      {/* Left: page title */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="font-display font-bold text-xl text-slate-900 leading-none">
          {meta.title}
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">{meta.sub}</p>
      </motion.div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-4">
        {/* Last result pill */}
        {lastResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: riskColor[lastResult.risk_level] + '12',
              color: riskColor[lastResult.risk_level],
              border: `1px solid ${riskColor[lastResult.risk_level]}25`,
              fontFamily: 'Outfit, sans-serif',
            }}
          >
            <Heart size={11} fill="currentColor" />
            {lastResult.risk_level} · {(lastResult.probability * 100).toFixed(1)}%
          </motion.div>
        )}

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
             style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.07)', minWidth: 200 }}>
          <Search size={14} className="text-slate-400 flex-shrink-0" />
          <span className="text-slate-400 text-sm">Search...</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 hover:bg-slate-100"
                style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
          <Bell size={16} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500
                           ring-2 ring-white" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
             style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      boxShadow: '0 2px 8px rgba(37,99,235,0.3)' }}>
          <User size={16} />
        </div>
      </div>
    </header>
  )
}
