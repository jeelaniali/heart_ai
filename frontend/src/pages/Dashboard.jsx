import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, RotateCcw, Loader2, ChevronRight, Stethoscope } from 'lucide-react'

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
  { key: 'age',      label: 'Age',             unit: 'years',  min: 1,  max: 120, step: 1   },
  { key: 'sex',      label: 'Sex',             unit: '0=F 1=M',min: 0,  max: 1,   step: 1   },
  { key: 'cp',       label: 'Chest Pain Type', unit: '0–3',    min: 0,  max: 3,   step: 1   },
  { key: 'trestbps', label: 'Resting BP',      unit: 'mm Hg',  min: 50, max: 300, step: 1   },
  { key: 'chol',     label: 'Cholesterol',     unit: 'mg/dl',  min: 50, max: 700, step: 1   },
  { key: 'fbs',      label: 'Fasting BS >120', unit: '0 / 1',  min: 0,  max: 1,   step: 1   },
  { key: 'restecg',  label: 'Resting ECG',     unit: '0–2',    min: 0,  max: 2,   step: 1   },
  { key: 'thalach',  label: 'Max Heart Rate',  unit: 'bpm',    min: 50, max: 250, step: 1   },
  { key: 'exang',    label: 'Exercise Angina', unit: '0 / 1',  min: 0,  max: 1,   step: 1   },
  { key: 'oldpeak',  label: 'ST Depression',   unit: 'mm',     min: 0,  max: 10,  step: 0.1 },
  { key: 'slope',    label: 'ST Slope',        unit: '0–2',    min: 0,  max: 2,   step: 1   },
  { key: 'ca',       label: 'Major Vessels',   unit: '0–3',    min: 0,  max: 3,   step: 1   },
  { key: 'thal',     label: 'Thalassemia',     unit: '1–3',    min: 1,  max: 3,   step: 1   },
]

export default function Dashboard({ patientData, setPatientData, lastResult, setLastResult }) {
  const [form,    setForm]    = useState(DEFAULT)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: parseFloat(val) }))

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

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
      style={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {/* Top layout: Form + Hero */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Patient Input Form */}
        <AnimatedCard delay={0.05} className="xl:col-span-2">
          <div className="card p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                   style={{ background: '#eff6ff' }}>
                <Stethoscope size={17} className="text-blue-600" />
              </div>
              <div>
                <div className="section-label">Input</div>
                <h3 className="section-title">Patient Parameters</h3>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 480 }}>
              {FIELDS.map(({ key, label, unit, min, max, step }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-500 block mb-1.5"
                         style={{ fontFamily: 'Outfit, sans-serif' }}>
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="input-field pr-16"
                      value={form[key]}
                      min={min} max={max} step={step}
                      onChange={e => handleChange(key, e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2
                                     text-xs text-slate-400 pointer-events-none font-mono">
                      {unit}
                    </span>
                  </div>
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

            <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <button onClick={handleSubmit} disabled={loading}
                      className="btn-primary flex-1 justify-center">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Analyzing...</>
                  : <><Send size={15} /> Run Analysis</>}
              </button>
              <button onClick={handleReset} className="btn-ghost">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </AnimatedCard>

        {/* Hero Risk + metrics */}
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
                <h3 className="font-display font-semibold text-slate-600 mb-2">
                  Ready for Analysis
                </h3>
                <p className="text-sm text-slate-400 max-w-xs mx-auto">
                  Fill in the 13 clinical parameters and click Run Analysis to compute cardiac risk.
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
