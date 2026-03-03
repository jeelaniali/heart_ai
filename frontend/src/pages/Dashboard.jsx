import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, RotateCcw, Loader2, Stethoscope } from 'lucide-react'

import AnimatedCard from '../components/AnimatedCard.jsx'
import HeroRiskCard from '../components/HeroRiskCard.jsx'
import MetricCards  from '../components/MetricCards.jsx'
import { predictRisk } from '../services/api.js'

const DEFAULT = {
  age: 52, sex: 1, cp: 0, trestbps: 125, chol: 212,
  fbs: 0, restecg: 1, thalach: 168, exang: 0,
  oldpeak: 1.0, slope: 2, ca: 2, thal: 3,
}

const FIELDS = [
  {
    key: 'age', label: 'Age', type: 'number',
    unit: 'years', min: 1, max: 120, step: 1,
    placeholder: 'e.g. 52',
  },
  {
    key: 'sex', label: 'Sex', type: 'select',
    options: [
      { value: 0, label: 'Female' },
      { value: 1, label: 'Male'   },
    ],
  },
  {
    key: 'cp', label: 'Chest Pain Type', type: 'select',
    options: [
      { value: 0, label: 'Typical Angina'   },
      { value: 1, label: 'Atypical Angina'  },
      { value: 2, label: 'Non-Anginal Pain' },
      { value: 3, label: 'Asymptomatic'     },
    ],
  },
  {
    key: 'trestbps', label: 'Resting Blood Pressure', type: 'number',
    unit: 'mm Hg', min: 50, max: 300, step: 1,
    placeholder: 'e.g. 120',
  },
  {
    key: 'chol', label: 'Serum Cholesterol', type: 'number',
    unit: 'mg/dl', min: 50, max: 700, step: 1,
    placeholder: 'e.g. 200',
  },
  {
    key: 'fbs', label: 'Fasting Blood Sugar > 120 mg/dl', type: 'select',
    options: [
      { value: 0, label: 'Normal  (≤ 120 mg/dl)' },
      { value: 1, label: 'High    (> 120 mg/dl)'  },
    ],
  },
  {
    key: 'restecg', label: 'Resting ECG Result', type: 'select',
    options: [
      { value: 0, label: 'Normal'                       },
      { value: 1, label: 'ST-T Wave Abnormality'        },
      { value: 2, label: 'Left Ventricular Hypertrophy' },
    ],
  },
  {
    key: 'thalach', label: 'Maximum Heart Rate', type: 'number',
    unit: 'bpm', min: 50, max: 250, step: 1,
    placeholder: 'e.g. 150',
  },
  {
    key: 'exang', label: 'Exercise Induced Angina', type: 'select',
    options: [
      { value: 0, label: 'No'  },
      { value: 1, label: 'Yes' },
    ],
  },
  {
    key: 'oldpeak', label: 'ST Depression (Oldpeak)', type: 'number',
    unit: 'mm', min: 0, max: 10, step: 0.1,
    placeholder: 'e.g. 1.0',
  },
  {
    key: 'slope', label: 'Peak Exercise ST Slope', type: 'select',
    options: [
      { value: 0, label: 'Upsloping'   },
      { value: 1, label: 'Flat'        },
      { value: 2, label: 'Downsloping' },
    ],
  },
  {
    key: 'ca', label: 'Major Vessels (Fluoroscopy)', type: 'select',
    options: [
      { value: 0, label: '0 vessels' },
      { value: 1, label: '1 vessel'  },
      { value: 2, label: '2 vessels' },
      { value: 3, label: '3 vessels' },
    ],
  },
  {
    key: 'thal', label: 'Thalassemia', type: 'select',
    options: [
      { value: 1, label: 'Normal'            },
      { value: 2, label: 'Fixed Defect'      },
      { value: 3, label: 'Reversible Defect' },
    ],
  },
]

const inputBase = {
  width: '100%',
  borderRadius: 12,
  padding: '10px 14px',
  fontSize: 14,
  border: '1.5px solid rgba(0,0,0,0.08)',
  background: '#f8fafc',
  color: '#0f172a',
  outline: 'none',
  fontFamily: 'DM Sans, sans-serif',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
}

export default function Dashboard({ patientData, setPatientData, lastResult, setLastResult }) {
  const [form,    setForm]    = useState(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [focused, setFocused] = useState(null)

  const handleChange = (key, val) =>
    setForm(p => ({ ...p, [key]: parseFloat(val) }))

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const r = await predictRisk(form)
      setLastResult(r); setPatientData(form)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  const handleReset = () => {
    setForm(DEFAULT); setLastResult(null)
    setPatientData(null); setError(null)
  }

  const focusStyle = (key) => focused === key
    ? { borderColor: '#2563eb', boxShadow: '0 0 0 3px rgba(37,99,235,0.10)', background: '#fff' }
    : {}

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
      style={{ maxWidth: 1400, margin: '0 auto' }}
    >
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Patient Form */}
        <AnimatedCard delay={0.05} className="xl:col-span-2">
          <div className="card p-6 h-full flex flex-col">

            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: '#eff6ff' }}>
                <Stethoscope size={17} className="text-blue-600" />
              </div>
              <div>
                <div className="section-label">Clinical Input</div>
                <h3 className="section-title">Patient Parameters</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: 520 }}>
              {FIELDS.map(({ key, label, type, unit, min, max, step, placeholder, options }) => (
                <div key={key}>
                  <label
                    className="block text-xs font-semibold text-slate-500 mb-1.5"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {label}
                  </label>

                  {type === 'select' ? (
                    <div className="relative">
                      <select
                        value={form[key]}
                        onChange={e => handleChange(key, e.target.value)}
                        onFocus={() => setFocused(key)}
                        onBlur={() => setFocused(null)}
                        style={{ ...inputBase, paddingRight: 36, cursor: 'pointer', ...focusStyle(key) }}
                      >
                        {options.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      {/* Custom chevron arrow */}
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 5l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={form[key]}
                        min={min} max={max} step={step}
                        placeholder={placeholder}
                        onChange={e => handleChange(key, e.target.value)}
                        onFocus={() => setFocused(key)}
                        onBlur={() => setFocused(null)}
                        style={{ ...inputBase, paddingRight: unit ? 64 : 14, ...focusStyle(key) }}
                      />
                      {unit && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2
                                         text-xs text-slate-400 pointer-events-none font-mono">
                          {unit}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 px-4 py-3 rounded-xl text-sm text-red-600"
                style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
              >
                {error}
              </motion.div>
            )}

            <div className="flex gap-3 mt-5 pt-4"
                 style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button onClick={handleSubmit} disabled={loading}
                      className="btn-primary flex-1 justify-center">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
                  : <><Send size={15} /> Run Analysis</>}
              </button>
              <button onClick={handleReset} className="btn-ghost px-3">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </AnimatedCard>

        {/* Results */}
        <div className="xl:col-span-3 space-y-6">
          <AnimatedCard delay={0.1}>
            {loading
              ? <SkeletonCard height={280} />
              : <HeroRiskCard result={lastResult} />}
          </AnimatedCard>

          {!loading && patientData && (
            <AnimatedCard delay={0.15}>
              <MetricCards patientData={patientData} />
            </AnimatedCard>
          )}

          {!lastResult && !loading && (
            <AnimatedCard delay={0.2}>
              <div className="card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                     style={{ background: '#f8fafc' }}>
                  <Send size={22} className="text-slate-300" />
                </div>
                <h3 className="font-display font-semibold text-slate-500 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Fill in the 13 clinical parameters and click Run Analysis
                  to compute the cardiac risk probability.
                </p>
              </div>
            </AnimatedCard>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonCard({ height }) {
  return (
    <div className="card p-6" style={{ height }}>
      <div className="skeleton h-3 w-24 mb-4 rounded-full" />
      <div className="skeleton h-6 w-40 mb-3 rounded-xl" />
      <div className="skeleton h-3 w-full mb-2 rounded-full" />
      <div className="skeleton h-3 w-3/4 rounded-full" />
    </div>
  )
}
