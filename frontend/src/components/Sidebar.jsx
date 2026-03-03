import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BrainCircuit, TrendingUp,
  HeartHandshake, FileText, Activity,
} from 'lucide-react'

const NAV = [
  { to: '/',               icon: LayoutDashboard, label: 'Dashboard',      sub: 'Risk Overview'    },
  { to: '/explainability', icon: BrainCircuit,    label: 'Explainability', sub: 'SHAP Analysis'    },
  { to: '/sensitivity',    icon: TrendingUp,      label: 'Sensitivity',    sub: 'Perturbation'     },
  { to: '/lifestyle',      icon: HeartHandshake,  label: 'Lifestyle',      sub: 'Advisory'         },
  { to: '/report',         icon: FileText,        label: 'Report',         sub: 'Medical Summary'  },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full"
           style={{ background: 'white', borderRight: '1px solid rgba(0,0,0,0.06)' }}>

      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.35)' }}>
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-base text-slate-900 leading-none">Heart AI</div>
            <div className="text-xs text-slate-400 mt-0.5 font-mono">v2.0 · Clinical</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="text-xs font-semibold text-slate-400 px-3 mb-3 tracking-widest uppercase">
          Navigation
        </div>
        {NAV.map(({ to, icon: Icon, label, sub }) => {
          const active = pathname === to || (to !== '/' && pathname.startsWith(to))
          return (
            <NavLink key={to} to={to} end={to === '/'}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                            transition-all duration-200 group
                            ${active
                              ? 'text-white'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-blue-50'}`}
                style={active ? {
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                } : {}}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                 transition-colors duration-200
                                 ${active
                                   ? 'bg-white/20'
                                   : 'bg-slate-100 group-hover:bg-blue-100'}`}>
                  <Icon size={15} className={active ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'} />
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold leading-none mb-0.5
                                   ${active ? 'text-white' : ''}`}
                       style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {label}
                  </div>
                  <div className={`text-xs truncate ${active ? 'text-blue-100' : 'text-slate-400'}`}>
                    {sub}
                  </div>
                </div>
              </motion.div>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom model card */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <div className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Model Active
            </span>
          </div>
          <div className="space-y-1">
            {[['Type', 'PyTorch NN'], ['Features', '13 clinical'], ['XAI', 'SHAP Deep']].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-400">{k}</span>
                <span className="text-slate-600 font-medium font-mono">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
