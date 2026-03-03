import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap, Target } from 'lucide-react'

const IMPACT = {
  High:   { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#f87171' },
  Medium: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', dot: '#fbbf24' },
  Low:    { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', dot: '#94a3b8' },
}

export default function SensitivityAnalyzer({ data }) {
  if (!data?.results?.length) return null
  const { results, highest_impact, baseline_probability } = data

  return (
    <div className="card p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="section-label mb-1">Perturbation Lab</div>
          <h3 className="section-title">Risk Sensitivity</h3>
          <p className="text-xs text-slate-400 mt-1">
            +10% perturbation · Baseline: {baseline_probability?.toFixed(1)}%
          </p>
        </div>
        {highest_impact && (
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
               style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                        fontFamily: 'Outfit, sans-serif' }}>
            <Zap size={11} />
            {highest_impact}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {results.map((item, i) => {
          const s         = IMPACT[item.impact] || IMPACT.Low
          const isUp      = item.delta_pct >= 0
          const isHighest = item.label === highest_impact
          const DeltaIcon = isUp ? TrendingUp : TrendingDown

          return (
            <motion.div
              key={item.feature}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35 }}
              className="rounded-xl p-4 transition-all duration-200"
              style={{
                background: s.bg,
                border: `1px solid ${isHighest ? s.color + '60' : s.border}`,
                boxShadow: isHighest ? `0 2px 8px ${s.color}15` : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                  <div>
                    <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"
                         style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {isHighest && <Target size={11} style={{ color: s.color }} />}
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono">
                      {item.original_risk.toFixed(1)}% → {item.new_risk.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                     style={{ background: 'white', border: `1px solid ${s.border}` }}>
                  <DeltaIcon size={13} style={{ color: s.color }} />
                  <span className="font-mono font-bold text-sm" style={{ color: s.color }}>
                    {item.direction}{Math.abs(item.delta_pct).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1 rounded-full bg-white overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.abs(item.delta_pct) * 4)}%` }}
                  transition={{ delay: i * 0.07 + 0.2, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: s.dot }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-slate-400 text-center">
        Each row: +10% increase in feature → Δ cardiac risk probability
      </p>
    </div>
  )
}
