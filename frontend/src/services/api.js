/**
 * services/api.js
 * Centralized Axios API client for Heart AI backend.
 * All endpoints communicate through this single module.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// ── Request interceptor ──────────────────────────────────────────────────────
client.interceptors.request.use(
  (config) => config,
  (error)  => Promise.reject(error),
)

// ── Response interceptor — normalize errors ──────────────────────────────────
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail =
      error?.response?.data?.detail ||
      error?.response?.data?.error  ||
      error?.message                ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(detail))
  },
)

// ── API Methods ──────────────────────────────────────────────────────────────

/**
 * POST /predict
 * @param {Object} patientData - 13 clinical features
 * @returns {Promise<PredictionResponse>}
 */
export const predictRisk = (patientData) =>
  client.post('/predict', patientData)

/**
 * POST /explain
 * @param {Object} patientData - 13 clinical features
 * @returns {Promise<ExplainResponse>}
 */
export const explainPrediction = (patientData) =>
  client.post('/explain', patientData)

/**
 * POST /sensitivity
 * @param {Object} patientData - 13 clinical features
 * @returns {Promise<SensitivityResponse>}
 */
export const analyzeSensitivity = (patientData) =>
  client.post('/sensitivity', patientData)

/**
 * POST /report
 * @param {Object} patientData - 13 clinical features
 * @returns {Promise<ReportResponse>}
 */
export const generateReport = (patientData) =>
  client.post('/report', patientData)

/**
 * GET /health
 * @returns {Promise<{ status: string, model_loaded: boolean, scaler_loaded: boolean }>}
 */
export const checkHealth = () =>
  client.get('/health')

/**
 * GET /features
 * @returns {Promise<{ features: Array }>}
 */
export const getFeatures = () =>
  client.get('/features')

export default client
