import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Droplets, Heart, Zap } from 'lucide-react'

const METRICS = [
  { key: 'trestbps', label: 'Blood Pressure', unit: 'mm Hg', icon: Activity,
    thresholds: { safe: 120, caution: 140 } },
  { key: 'chol',     label: 'Cholesterol',    unit: 'mg/dl', icon: Droplets,
    thresholds: { safe: 200, caution: 240 } },
  { key: 'thalach',  label: 'Max Heart Rate', unit: 'bpm',   icon: Heart,
    thresholds: { min: 100 }, inverted: true },
  { key: 'oldpeak',  label: 'ST Depression',  unit: 'mm',    icon: Zap,
    thresholds: { safe: 1.0, caution: 2.0 } },
]

function getStatus(val, thresholds, inverted) {
  if (inverted) {
    if (val >= 130) return 'safe'
    if (val >= 100) return 'caution'
    return 'danger'
  }
  if (!thresholds.safe) return 'neutral'
  if (val <= thresholds.safe)    return 'safe'
  if (val <= thresholds.caution) return 'caution'
  return 'danger'
}

const STATUS = {
  safe:    { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Optimal',   barColor: '#4ade80' },
  caution: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', label: 'Elevated',  barColor: '#fbbf24' },
  danger:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Critical',  barColor: '#f87171' },
  neutral: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', label: 'Recorded',  barColor: '#60a5fa' },
}

export default function MetricCards({ patientData }) {
  if (!patientData) return null

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {METRICS.map(({ key, label, unit, icon: Icon, thresholds, inverted }, i) => {
        const val    = patientData[key]
        const status = getStatus(val, thresholds, inverted)
        const s      = STATUS[status]

        // Bar fill percentage (approximate normalisation)
        const barPct = Math.min(100, inverted
          ? Math.max(0, (val / 200) * 100)
          : Math.max(0, (val / (thresholds.caution * 1.3 || 300)) * 100))

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-4 cursor-default"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${s.border}` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: s.bg }}>
                <Icon size={16} style={{ color: s.color }} />
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: s.bg, color: s.color, fontFamily: 'Outfit, sans-serif' }}>
                {s.label}
              </span>
            </div>

            <div className="mb-3">
              <div className="font-display font-bold text-2xl text-slate-900 leading-none">
                {typeof val === 'number' ? val.toFixed(val % 1 === 0 ? 0 : 1) : val}
                <span className="text-slate-400 text-sm font-normal ml-1">{unit}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>

            {/* Animated bar */}
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: s.barColor }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
