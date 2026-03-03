import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Info, Sparkles } from 'lucide-react'

const DESCRIPTIONS = {
  age:      'Patient age — cardiac risk increases with age.',
  sex:      'Biological sex: 0 = Female, 1 = Male.',
  cp:       'Chest pain type: 0=Typical, 1=Atypical, 2=Non-anginal, 3=Asymptomatic.',
  trestbps: 'Resting blood pressure (mm Hg) at admission.',
  chol:     'Serum cholesterol (mg/dl). High values increase risk.',
  fbs:      'Fasting blood sugar >120 mg/dl: 1=True, 0=False.',
  restecg:  'Resting ECG: 0=Normal, 1=ST-T abnormality, 2=LV hypertrophy.',
  thalach:  'Maximum heart rate achieved during exercise.',
  exang:    'Exercise-induced angina: 1=Yes, 0=No.',
  oldpeak:  'ST depression induced by exercise relative to rest.',
  slope:    'Slope of peak exercise ST segment.',
  ca:       'Number of major vessels (0–3) by fluoroscopy.',
  thal:     'Thalassemia: 1=Normal, 2=Fixed defect, 3=Reversible defect.',
}

export default function ShapSection({ shapData }) {
  const [hovered, setHovered] = useState(null)
  if (!shapData?.shap_values?.length) return null

  const values = shapData.shap_values.slice(0, 10)
  const maxAbs = Math.max(...values.map(v => Math.abs(v.shap_value)))

  return (
    <div className="card p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="section-label mb-1">XAI · SHAP</div>
          <h3 className="section-title">Feature Attribution</h3>
          <p className="text-xs text-slate-400 mt-1">
            DeepExplainer · Base: {shapData.base_value?.toFixed(4)}
          </p>
        </div>
        <div className="flex gap-3 text-xs" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
            Increases risk
          </span>
          <span className="flex items-center gap-1.5 text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Decreases risk
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {values.map((item, i) => {
          const isPos  = item.shap_value > 0
          const barPct = (Math.abs(item.shap_value) / maxAbs) * 100
          const color  = isPos ? '#dc2626' : '#16a34a'
          const bgBar  = isPos ? '#fef2f2' : '#f0fdf4'

          return (
            <div
              key={item.feature}
              className="relative group"
              onMouseEnter={() => setHovered(item.feature)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center gap-3">
                {/* Feature name */}
                <div className="w-28 flex-shrink-0 text-right">
                  <div className="text-xs font-medium text-slate-600 truncate"
                       style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {item.label}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-1 h-7 rounded-lg overflow-hidden"
                     style={{ background: '#f8fafc' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barPct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-lg flex items-center justify-end px-2.5"
                    style={{ background: bgBar, borderRight: `3px solid ${color}` }}
                  >
                    <span className="text-xs font-mono font-semibold whitespace-nowrap"
                          style={{ color }}>
                      {isPos ? '+' : ''}{item.shap_value.toFixed(4)}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Tooltip */}
              {hovered === item.feature && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-32 -top-1 z-50 bg-white rounded-xl px-3 py-2.5 w-56 text-xs
                             pointer-events-none"
                  style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <div className="font-semibold text-slate-800 mb-1">{item.label}</div>
                  <div className="text-slate-500 leading-relaxed">{DESCRIPTIONS[item.feature]}</div>
                  <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex justify-between">
                    <span className="text-slate-400">SHAP value</span>
                    <span className="font-mono font-semibold" style={{ color }}>{item.shap_value.toFixed(6)}</span>
                  </div>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {shapData.top_risk_feature && (
        <div className="mt-5 flex items-center gap-2 px-3 py-2.5 rounded-xl"
             style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <Sparkles size={13} className="text-red-500 flex-shrink-0" />
          <span className="text-xs text-slate-600">
            <span className="font-semibold text-red-600">{shapData.top_risk_feature}</span>
            {' '}is the top risk-contributing factor.
          </span>
        </div>
      )}
    </div>
  )
}
