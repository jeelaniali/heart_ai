import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, RefreshCw, Loader2 } from 'lucide-react'
import AnimatedCard from '../components/AnimatedCard.jsx'
import ShapSection  from '../components/ShapSection.jsx'
import { explainPrediction } from '../services/api.js'

export default function Explainability({ patientData }) {
  const [shapData, setShapData] = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleExplain = async () => {
    if (!patientData) return
    setLoading(true); setError(null)
    try { setShapData(await explainPrediction(patientData)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <motion.div key="explainability"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Control card */}
      <AnimatedCard delay={0.05}>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: '#eff6ff' }}>
            <BrainCircuit size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm">SHAP Deep Explainer</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Computes Shapley values via DeepExplainer with 100-sample background distribution.
              {patientData ? ' Patient data ready.' : ' Run a prediction from Dashboard first.'}
            </p>
          </div>
          <button onClick={handleExplain} disabled={!patientData || loading} className="btn-primary">
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Computing...</>
              : <><RefreshCw size={14} /> Explain</>}
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
          <div className="card p-10 flex flex-col items-center gap-4">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="font-display font-medium text-slate-700 mb-1">Computing SHAP Values</p>
              <p className="text-sm text-slate-400">This may take 15–30 seconds...</p>
            </div>
          </div>
        </AnimatedCard>
      )}

      {!loading && shapData && (
        <AnimatedCard delay={0.1}>
          <ShapSection shapData={shapData} />
        </AnimatedCard>
      )}

      {!loading && !shapData && !error && (
        <AnimatedCard delay={0.1}>
          <div className="card p-10 text-center">
            <BrainCircuit size={36} className="text-slate-200 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-400 mb-2">No Explanation Yet</h3>
            <p className="text-sm text-slate-400">
              {patientData ? 'Click "Explain" to compute SHAP attributions.' : 'Run a prediction on the Dashboard first.'}
            </p>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  )
}
