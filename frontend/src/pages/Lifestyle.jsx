import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HeartHandshake, Sparkles, Loader2 } from 'lucide-react'
import AnimatedCard      from '../components/AnimatedCard.jsx'
import LifestyleAdvisory from '../components/LifestyleAdvisory.jsx'
import { generateReport } from '../services/api.js'

export default function Lifestyle({ patientData }) {
  const [advice,  setAdvice]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleGenerate = async () => {
    if (!patientData) return
    setLoading(true); setError(null)
    try {
      const r = await generateReport(patientData)
      setAdvice(r.lifestyle_advice)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <motion.div key="lifestyle"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6" style={{ maxWidth: 800, margin: '0 auto' }}>

      <AnimatedCard delay={0.05}>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: '#f0fdf4' }}>
            <HeartHandshake size={20} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Clinical Advisory Engine</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates clinical parameters against AHA/ACC guideline thresholds.
              {patientData ? ' Patient data available.' : ' Load patient from Dashboard first.'}
            </p>
          </div>
          <button onClick={handleGenerate} disabled={!patientData || loading} className="btn-primary">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
              : <><Sparkles size={14} /> Generate</>}
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
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-5 flex items-center gap-4">
              <div className="skeleton w-8 h-8 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-28 rounded-full" />
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-3/4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && advice && (
        <AnimatedCard delay={0.1}>
          <LifestyleAdvisory advice={advice} />
        </AnimatedCard>
      )}

      {!loading && !advice && !error && (
        <AnimatedCard delay={0.1}>
          <div className="card p-10 text-center">
            <HeartHandshake size={36} className="text-slate-200 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-400 mb-2">No Advisory Generated</h3>
            <p className="text-sm text-slate-400">
              {patientData ? 'Click "Generate" for personalised clinical recommendations.' : 'Load patient from Dashboard first.'}
            </p>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  )
}
