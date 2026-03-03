import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Play, Loader2 } from 'lucide-react'
import AnimatedCard        from '../components/AnimatedCard.jsx'
import SensitivityAnalyzer from '../components/SensitivityAnalyzer.jsx'
import { analyzeSensitivity } from '../services/api.js'

export default function Sensitivity({ patientData }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleRun = async () => {
    if (!patientData) return
    setLoading(true); setError(null)
    try { setData(await analyzeSensitivity(patientData)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <motion.div key="sensitivity"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6" style={{ maxWidth: 800, margin: '0 auto' }}>

      <AnimatedCard delay={0.05}>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: '#fff7ed' }}>
            <TrendingUp size={20} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Perturbation Lab</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Perturbs age, BP, cholesterol, heart rate, and ST depression by +10% and measures risk delta.
              {patientData ? ' Patient ready.' : ' Load patient from Dashboard first.'}
            </p>
          </div>
          <button onClick={handleRun} disabled={!patientData || loading} className="btn-primary">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Running...</>
              : <><Play size={14} /> Analyze</>}
          </button>
        </div>
      </AnimatedCard>

      {error && (
        <AnimatedCard>
          <div className="card p-5" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </AnimatedCard>
      )}

      {loading && (
        <AnimatedCard>
          <div className="card p-10 flex flex-col items-center gap-5">
            <div className="flex gap-1.5">
              {[0,1,2,3,4].map(i => (
                <motion.div key={i} className="w-2 rounded-full"
                  style={{ background: '#f97316' }}
                  animate={{ height: [24, 40, 24] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </div>
            <p className="text-sm text-slate-400">Running perturbation analysis...</p>
          </div>
        </AnimatedCard>
      )}

      {!loading && data && (
        <AnimatedCard delay={0.1}>
          <SensitivityAnalyzer data={data} />
        </AnimatedCard>
      )}

      {!loading && !data && !error && (
        <AnimatedCard delay={0.1}>
          <div className="card p-10 text-center">
            <TrendingUp size={36} className="text-slate-200 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-400 mb-2">Ready to Analyze</h3>
            <p className="text-sm text-slate-400">
              {patientData ? 'Click "Analyze" to run sensitivity perturbation.' : 'Load patient from Dashboard first.'}
            </p>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  )
}
