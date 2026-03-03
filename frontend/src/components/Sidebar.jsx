import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BrainCircuit, TrendingUp,
  HeartHandshake, FileText, Activity,
} from 'lucide-react'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',      sub: 'Risk Overview'   },
  { to: '/explainability', icon: BrainCircuit,    label: 'Explainability', sub: 'SHAP Analysis'   },
  { to: '/sensitivity',    icon: TrendingUp,      label: 'Sensitivity',    sub: 'Perturbation'    },
  { to: '/lifestyle',      icon: HeartHandshake,  label: 'Lifestyle',      sub: 'Advisory'        },
  { to: '/report',         icon: FileText,        label: 'Report',         sub: 'Medical Summary' },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col h-full"
      style={{ background: '#1a2e1e' }}
    >
      {/* Logo */}
      <div className="px-5 py-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #059669, #34d399)',
              boxShadow: '0 4px 12px rgba(5,150,105,0.50)',
            }}
          >
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-base text-white leading-none">
              Heart AI
            </div>
            <div className="text-xs mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
              v2.0 · Clinical
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div
          className="text-xs font-semibold px-3 mb-3 tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Outfit, sans-serif' }}
        >
          Navigation
        </div>

        {NAV.map(({ to, icon: Icon, label, sub }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to))
          return (
            <NavLink key={to} to={to} end={to === '/'}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                           transition-all duration-200 group"
                style={active
                  ? { background: '#059669', boxShadow: '0 4px 12px rgba(5,150,105,0.40)' }
                  : {}}
              >
                {/* Icon box */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                             transition-colors duration-200"
                  style={active
                    ? { background: 'rgba(255,255,255,0.18)' }
                    : { background: 'rgba(255,255,255,0.07)' }}
                >
                  <Icon
                    size={15}
                    style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.45)' }}
                    className="group-hover:!text-white transition-colors duration-200"
                  />
                </div>

                {/* Label */}
                <div className="min-w-0">
                  <div
                    className="text-sm font-semibold leading-none mb-0.5"
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.65)',
                    }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: active ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.28)' }}
                  >
                    {sub}
                  </div>
                </div>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* Model status card */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: '#34d399' }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: 'rgba(255,255,255,0.50)', fontFamily: 'Outfit, sans-serif' }}
            >
              Model Active
            </span>
          </div>
          <div className="space-y-1">
            {[['Type', 'PyTorch NN'], ['Features', '13 clinical'], ['XAI', 'SHAP Deep']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: 'rgba(255,255,255,0.28)' }}>{k}</span>
                <span className="font-mono font-medium" style={{ color: 'rgba(255,255,255,0.60)' }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
