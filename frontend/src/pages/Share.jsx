import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Shield, FileText, Calendar, AlertTriangle, CheckCircle2,
  AlertCircle, AlertOctagon, Sparkles, Activity, Film,
  Layers, Info, Image as ImageIcon, Loader2
} from 'lucide-react'
import { viewSharedScan } from '../services/api'

function Share() {
  const { token } = useParams()

  const [scan, setScan]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch shared scan on page load (NO authentication required)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchScan = async () => {
      try {
        const data = await viewSharedScan(token)
        setScan(data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Share link not found or expired')
      } finally {
        setLoading(false)
      }
    }
    fetchScan()
  }, [token])

  // ─────────────────────────────────────────────────────────────────────────
  // Get verdict theme based on risk score
  // ─────────────────────────────────────────────────────────────────────────
  const getVerdictTheme = (verdict, riskScore) => {
    if (verdict === 'REAL' || riskScore <= 20) {
      return {
        color:      'text-green-400',
        bg:         'bg-green-500/10',
        border:     'border-green-500/30',
        gradient:   'from-green-500 to-emerald-500',
        icon:       CheckCircle2,
        label:      'AUTHENTIC',
        meterColor: '#22c55e',
      }
    }
    if (riskScore <= 50) {
      return {
        color:      'text-yellow-400',
        bg:         'bg-yellow-500/10',
        border:     'border-yellow-500/30',
        gradient:   'from-yellow-500 to-orange-500',
        icon:       AlertCircle,
        label:      'SUSPICIOUS',
        meterColor: '#eab308',
      }
    }
    if (riskScore <= 80) {
      return {
        color:      'text-orange-400',
        bg:         'bg-orange-500/10',
        border:     'border-orange-500/30',
        gradient:   'from-orange-500 to-red-500',
        icon:       AlertTriangle,
        label:      'LIKELY FAKE',
        meterColor: '#f97316',
      }
    }
    return {
      color:      'text-red-400',
      bg:         'bg-red-500/10',
      border:     'border-red-500/30',
      gradient:   'from-red-500 to-pink-600',
      icon:       AlertOctagon,
      label:      'HIGHLY FAKE',
      meterColor: '#ef4444',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Loading state
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    )
  }

  // Error state
  if (error || !scan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Link Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600
                           rounded-lg font-semibold inline-block">
            Go to DeepGuard AI
          </Link>
        </div>
      </div>
    )
  }

  const theme        = getVerdictTheme(scan.verdict, scan.risk_score)
  const VerdictIcon  = theme.icon
  const fakePercent  = (scan.fake_frames / scan.total_frames) * 100
  const realPercent  = (scan.real_frames / scan.total_frames) * 100

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ═══════════════════════════════════════════════════════════════
          MINIMAL NAVBAR (no login, no menu)
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50
                      bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400
                             to-purple-500 bg-clip-text text-transparent">
              DeepGuard AI
            </span>
          </Link>

          <span className="px-3 py-1 text-xs bg-white/5 border border-white/10
                           rounded-full text-gray-400">
            Shared Report
          </span>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h1 className="text-2xl font-bold truncate">{scan.filename}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            {new Date(scan.created_at).toLocaleString()}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            VERDICT HERO CARD
        ─────────────────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl p-8 mb-8
                         ${theme.bg} border ${theme.border}`}>

          <div className={`absolute -top-20 -right-20 w-64 h-64
                          bg-gradient-to-br ${theme.gradient}
                          rounded-full blur-3xl opacity-20`}></div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <VerdictIcon className={`w-12 h-12 ${theme.color}`} />
                <div>
                  <div className="text-sm text-gray-400">Verdict</div>
                  <div className={`text-4xl font-black ${theme.color}`}>
                    {theme.label}
                  </div>
                </div>
              </div>

              <p className="text-gray-300 mb-6">{scan.explanation}</p>

              <div className="flex flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-400">Confidence</div>
                  <div className="text-2xl font-bold">{scan.confidence}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Frames Analyzed</div>
                  <div className="text-2xl font-bold">{scan.total_frames}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <RiskMeter score={scan.risk_score} color={theme.meterColor} />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STATS GRID
        ─────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <StatBox
            icon={Activity}
            label="Total Frames"
            value={scan.total_frames}
            color="text-blue-400"
            iconBg="from-blue-500 to-cyan-500"
          />
          <StatBox
            icon={AlertTriangle}
            label="Fake Frames"
            value={scan.fake_frames}
            color="text-red-400"
            iconBg="from-red-500 to-orange-500"
            subtitle={`${fakePercent.toFixed(1)}% of total`}
          />
          <StatBox
            icon={CheckCircle2}
            label="Real Frames"
            value={scan.real_frames}
            color="text-green-400"
            iconBg="from-green-500 to-emerald-500"
            subtitle={`${realPercent.toFixed(1)}% of total`}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FRAME DISTRIBUTION
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10
                        rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            Frame Distribution
          </h3>

          <div className="flex h-12 rounded-xl overflow-hidden bg-black/40">
            {fakePercent > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500
                              flex items-center justify-center font-semibold text-sm"
                   style={{ width: `${fakePercent}%` }}>
                {fakePercent > 15 && `${scan.fake_frames} Fake`}
              </div>
            )}
            {realPercent > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500
                              flex items-center justify-center font-semibold text-sm"
                   style={{ width: `${realPercent}%` }}>
                {realPercent > 15 && `${scan.real_frames} Real`}
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-400 mt-3">
            <span>0 frames</span>
            <span>{scan.total_frames} frames</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            AI EXPLANATION
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10
                        rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Analysis
          </h3>
          <p className="text-gray-300 leading-relaxed">{scan.explanation}</p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            DIGITAL FORENSICS (read-only)
        ─────────────────────────────────────────────────────────────── */}
        {scan.metadata && Object.keys(scan.metadata).length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10
                          rounded-2xl p-6 mb-8">

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-400" />
              Digital Forensics
            </h3>

            {scan.metadata.warnings &&
             scan.metadata.warnings.length > 0 && (
              <div className="mb-4 space-y-2">
                {scan.metadata.warnings.map((warning, i) => (
                  <div key={i}
                       className="flex items-center gap-2 p-3
                                  bg-yellow-500/10 border border-yellow-500/30
                                  rounded-lg text-sm text-yellow-300">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {scan.metadata.file_info && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase
                               tracking-wider">
                  File Information
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <MetadataRow
                    icon={FileText}
                    label="Filename"
                    value={scan.metadata.file_info.filename}
                  />
                  <MetadataRow
                    icon={Layers}
                    label="Size"
                    value={scan.metadata.file_info.size_readable}
                  />
                  {scan.metadata.file_info.dimensions && (
                    <MetadataRow
                      icon={ImageIcon}
                      label="Dimensions"
                      value={scan.metadata.file_info.dimensions}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            FOOTER
        ─────────────────────────────────────────────────────────────── */}
        <div className="text-center py-6 text-sm text-gray-500 border-t
                        border-white/10">
          <Shield className="w-6 h-6 mx-auto mb-2 text-blue-500" />
          <p className="mb-1">
            Shared via{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500
                             bg-clip-text text-transparent font-bold">
              DeepGuard AI
            </span>
          </p>
          <p className="text-xs">
            AI-Powered Deepfake Detection & Digital Forensics
          </p>
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Risk Meter (same as Results page)
// ─────────────────────────────────────────────────────────────────────────────
function RiskMeter({ score, color }) {
  const radius        = 90
  const circumference = 2 * Math.PI * radius
  const offset        = circumference - (score / 100) * circumference

  return (
    <div className="relative w-56 h-56">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="12" />
        <circle cx="100" cy="100" r={radius}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-black" style={{ color }}>{score}</div>
        <div className="text-xs text-gray-400 mt-1 tracking-widest">/ 100</div>
        <div className="text-xs text-gray-400 mt-2">Risk Score</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Stat Box
// ─────────────────────────────────────────────────────────────────────────────
function StatBox({ icon: Icon, label, value, color, iconBg, subtitle }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10
                    rounded-2xl p-5">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br
                       ${iconBg} mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Metadata Row
// ─────────────────────────────────────────────────────────────────────────────
function MetadataRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-black/30 border border-white/5
                    rounded-lg">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  )
}

export default Share