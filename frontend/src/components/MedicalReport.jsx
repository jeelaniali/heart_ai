import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, User, Heart, Shield, Printer } from 'lucide-react'

const RISK_STYLE = {
  Critical: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  High:     { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  Moderate: { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  Low:      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
}

export default function MedicalReport({ report }) {
  if (!report) return null
  const { patient_summary, sections, clinical_findings, generated_at, disclaimer } = report
  const s = RISK_STYLE[patient_summary.risk_level] || RISK_STYLE.Low

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card overflow-hidden"
    >
      {/* Report Header */}
      <div className="px-8 py-6"
           style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                          boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">
                Cardiac Risk Assessment Report
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                AI-Generated Clinical Summary · Heart AI v2.0
              </p>
            </div>
          </div>
          <div>
            <span className="font-display font-bold text-sm px-4 py-2 rounded-xl"
                  style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
              {patient_summary.risk_level} Risk · {patient_summary.probability}%
            </span>
          </div>
        </div>

        {/* Patient meta strip */}
        <div className="mt-5 flex flex-wrap gap-6">
          {[
            { icon: User,   label: 'Patient',    value: `${patient_summary.sex}, ${patient_summary.age}y` },
            { icon: Heart,  label: 'Risk Score',  value: `${patient_summary.probability}%` },
            { icon: Shield, label: 'Verdict',     value: patient_summary.prediction },
            { icon: Clock,  label: 'Generated',   value: generated_at },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white"
                   style={{ border: '1px solid rgba(0,0,0,0.07)' }}>
                <Icon size={13} className="text-slate-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400">{label}</div>
                <div className="text-xs font-semibold text-slate-700 font-mono">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Sections */}
      <div className="p-8 space-y-7">
        {sections?.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.35 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background: '#2563eb' }} />
              <h4 className="font-display font-semibold text-slate-800">{section.title}</h4>
            </div>
            <div className="ml-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line pl-3"
                 style={{ borderLeft: '2px solid #f1f5f9' }}>
              {section.content}
            </div>
          </motion.div>
        ))}

        {/* Clinical Findings */}
        {clinical_findings?.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 rounded-full bg-cyan-500" />
              <h4 className="font-display font-semibold text-slate-800">Clinical Observations</h4>
            </div>
            <ul className="ml-4 space-y-2 pl-3" style={{ borderLeft: '2px solid #f1f5f9' }}>
              {clinical_findings.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />

        {/* Disclaimer */}
        <div className="rounded-xl p-4"
             style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">{disclaimer}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span style={{ fontFamily: 'Outfit, sans-serif' }}>Heart AI · Cardiac Intelligence Platform</span>
          <span className="font-mono">{generated_at}</span>
        </div>
      </div>
    </motion.div>
  )
}
