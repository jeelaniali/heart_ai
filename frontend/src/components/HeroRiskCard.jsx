import React, { useEffect } from 'react'
import { motion, animate } from 'framer-motion'
import { useState } from 'react'
import { TrendingUp, Shield, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'

const RISK = {
  Low:      { color: '#16a34a', light: '#f0fdf4', ring: '#86efac', label: 'Low Risk',      Icon: CheckCircle   },
  Moderate: { color: '#d97706', light: '#fffbeb', ring: '#fcd34d', label: 'Moderate Risk',  Icon: AlertTriangle },
  High:     { color: '#ea580c', light: '#fff7ed', ring: '#fdba74', label: 'High Risk',      Icon: AlertTriangle },
  Critical: { color: '#dc2626', light: '#fef2f2', ring: '#fca5a5', label: 'Critical Risk',  Icon: XCircle       },
}

function useCountUp(target, duration = 1.4) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const ctrl = animate(0, target, {
      duration, ease: 'easeOut',
      onUpdate: v => setVal(Math.round(v * 10) / 10),
    })
    return ctrl.stop
  }, [target])
  return val
}

export default function HeroRiskCard({ result }) {
  const pct    = result ? result.probability * 100 : 0
  const level  = result?.risk_level || 'Low'
  const cfg    = RISK[level] || RISK.Low
  const Icon   = cfg.Icon
  const shown  = useCountUp(pct)

  const R = 72, C = 2 * Math.PI * R
  const offset = C - (pct / 100) * C

  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Soft background tint */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-40"
           style={{ background: `radial-gradient(ellipse at top right, ${cfg.light}, transparent 70%)` }} />

      <div className="relative">
        {/* Top label */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="section-label mb-1">Risk Assessment</div>
            <h2 className="font-display font-bold text-2xl text-slate-900">
              Cardiac Risk Score
            </h2>
          </div>
          <div className="badge" style={{ background: cfg.light, color: cfg.color }}>
            <Icon size={12} />
            {cfg.label}
          </div>
        </div>

        {/* Main content */}
        <div className="flex items-center gap-8">
          {/* SVG Ring */}
          <div className="relative flex-shrink-0">
            {/* Pulse rings */}
            {result && (
              <>
                <div className="absolute inset-0 rounded-full pulse-ring"
                     style={{ background: cfg.ring, opacity: 0.2 }} />
              </>
            )}
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Background track */}
              <circle cx="90" cy="90" r={R} fill="none"
                      stroke="#f1f5f9" strokeWidth="12" />
              {/* Animated progress */}
              <motion.circle
                cx="90" cy="90" r={R}
                fill="none"
                stroke={cfg.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 90 90)"
                style={{ filter: `drop-shadow(0 0 6px ${cfg.color}50)` }}
              />
              {/* Inner subtle ring */}
              <circle cx="90" cy="90" r={58} fill="none"
                      stroke={cfg.light} strokeWidth="1" />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-bold leading-none"
                    style={{ fontSize: 38, color: cfg.color }}>
                {shown.toFixed(1)}
              </span>
              <span className="text-slate-400 text-sm font-medium mt-1">percent</span>
            </div>
          </div>

          {/* Right info */}
          <div className="flex-1">
            {result ? (
              <>
                <div className="text-slate-500 text-sm mb-4 leading-relaxed">
                  {result.label}. The AI model has assessed{' '}
                  <span className="font-semibold" style={{ color: cfg.color }}>
                    {(result.probability * 100).toFixed(1)}% probability
                  </span>{' '}
                  of cardiac disease based on 13 clinical parameters.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Prediction" value={result.prediction === 1 ? 'Positive' : 'Negative'} color={cfg.color} />
                  <MiniMetric label="Risk Level"  value={result.risk_level} color={cfg.color} />
                  <MiniMetric label="Confidence"  value={`${(result.probability * 100).toFixed(1)}%`} color={cfg.color} />
                  <MiniMetric label="Model"       value="PyTorch NN" color="#2563eb" />
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-500 text-sm leading-relaxed">
                  Submit patient clinical parameters to compute the AI-powered cardiac risk probability score.
                </p>
                <div className="space-y-2">
                  {[['Low', '< 35%', '#16a34a'], ['Moderate', '35–55%', '#d97706'],
                    ['High', '55–75%', '#ea580c'], ['Critical', '> 75%', '#dc2626']].map(([l, r, c]) => (
                    <div key={l} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
                      <span className="text-slate-600 font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>{l}</span>
                      <span className="text-slate-400">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniMetric({ label, value, color }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{label}</div>
      <div className="font-display font-bold text-sm" style={{ color }}>{value}</div>
    </div>
  )
}
