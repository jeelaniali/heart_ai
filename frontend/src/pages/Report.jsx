import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Printer, Loader2 } from 'lucide-react'
import AnimatedCard  from '../components/AnimatedCard.jsx'
import MedicalReport from '../components/MedicalReport.jsx'
import { generateReport } from '../services/api.js'

export default function Report({ patientData }) {
  const [report,  setReport]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleGenerate = async () => {
    if (!patientData) return
    setLoading(true); setError(null)
    try { setReport(await generateReport(patientData)) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <motion.div key="report"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6" style={{ maxWidth: 900, margin: '0 auto' }}>

      <AnimatedCard delay={0.05}>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ background: '#eff6ff' }}>
            <FileText size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-slate-800 text-sm">Smart Report Generator</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Synthesises prediction, clinical findings, and lifestyle advisory into a structured clinical document.
              {patientData ? ' Patient data ready.' : ' Load patient from Dashboard first.'}
            </p>
          </div>
          <div className="flex gap-2">
            {report && (
              <button onClick={() => window.print()} className="btn-ghost">
                <Printer size={14} /> Print
              </button>
            )}
            <button onClick={handleGenerate} disabled={!patientData || loading} className="btn-primary">
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                : <><FileText size={14} /> Generate</>}
            </button>
          </div>
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
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <div className="text-center">
              <p className="font-display font-medium text-slate-700 mb-1">Generating Medical Report</p>
              <p className="text-sm text-slate-400">Compiling clinical data and advisories...</p>
            </div>
            <div className="w-full space-y-2">
              {[80,55,90,65,40].map((w,i) => (
                <div key={i} className="skeleton h-2.5 rounded-full" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </AnimatedCard>
      )}

      {!loading && report && (
        <AnimatedCard delay={0.1}>
          <MedicalReport report={report} />
        </AnimatedCard>
      )}

      {!loading && !report && !error && (
        <AnimatedCard delay={0.1}>
          <div className="card p-10 text-center">
            <FileText size={36} className="text-slate-200 mx-auto mb-4" />
            <h3 className="font-display font-semibold text-slate-400 mb-2">No Report Generated</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {patientData ? 'Click "Generate" to produce a comprehensive clinical report.' : 'Load patient from Dashboard first.'}
            </p>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  )
}
