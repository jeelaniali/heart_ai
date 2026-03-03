import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, AlertCircle, ChevronDown, Heart } from 'lucide-react'

const SEV = {
  danger:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertTriangle, iconBg: '#fee2e2', badge: 'Danger'   },
  caution: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: AlertCircle,   iconBg: '#fef3c7', badge: 'Caution'  },
  safe:    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle,   iconBg: '#dcfce7', badge: 'Optimal'  },
}

export default function LifestyleAdvisory({ advice }) {
  const [open, setOpen] = useState({ 0: true })
  if (!advice?.length) return null

  const toggle = i => setOpen(p => ({ ...p, [i]: !p[i] }))

  return (
    <div className="card p-6">
      <div className="mb-5">
        <div className="section-label mb-1">AHA/ACC Guidelines</div>
        <h3 className="section-title">Clinical Lifestyle Advisory</h3>
        <p className="text-xs text-slate-400 mt-1">{advice.length} personalised recommendations</p>
      </div>

      <div className="space-y-2.5">
        {advice.map((item, i) => {
          const s    = SEV[item.severity] || SEV.safe
          const Icon = s.icon
          const isOpen = open[i]

          return (
            <div
              key={i}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{ border: `1px solid ${isOpen ? s.color + '40' : s.border}`,
                       background: isOpen ? s.bg : 'white' }}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: s.iconBg }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800"
                          style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: s.iconBg, color: s.color,
                                   fontFamily: 'Outfit, sans-serif' }}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={15} className="text-slate-400" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                  >
                    <div className="px-4 pb-4 border-t" style={{ borderColor: s.border }}>
                      <p className="text-sm text-slate-600 leading-relaxed mt-3">
                        {item.advice}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
           style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <Heart size={13} className="text-blue-500 flex-shrink-0" />
        <p className="text-xs text-slate-500">
          Based on AHA/ACC/ESC 2024 cardiovascular prevention guidelines. For informational use only.
        </p>
      </div>
    </div>
  )
}
