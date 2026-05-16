import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Shield, ArrowLeft, Download, Share2, Upload as UploadIcon,
  AlertTriangle, CheckCircle2, AlertCircle, FileText, Calendar,
  Activity, Eye, Loader2, LogOut, Sparkles, TrendingUp,
  Clock, Film, AlertOctagon
} from 'lucide-react'
import { getReport, logout } from '../services/api'

function Results() {
  const { scanId } = useParams()
  const navigate   = useNavigate()
  const username   = localStorage.getItem('username')

  const [scan, setScan]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch scan result on page load
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchScan = async () => {
      try {
        const data = await getReport(scanId)
        setScan(data)
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load scan')
      } finally {
        setLoading(false)
      }
    }
    fetchScan()
  }, [scanId])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Get colors and labels based on verdict
  // ─────────────────────────────────────────────────────────────────────────
  const getVerdictTheme = (verdict, riskScore) => {
    if (verdict === 'REAL' || riskScore <= 20) {
      return {
        color:       'text-green-400',
        bg:          'bg-green-500/10',
        border:      'border-green-500/30',
        gradient:    'from-green-500 to-emerald-500',
        icon:        CheckCircle2,
        label:       'AUTHENTIC',
        meterColor:  '#22c55e',
      }
    }
    if (riskScore <= 50) {
      return {
        color:       'text-yellow-400',
        bg:          'bg-yellow-500/10',
        border:      'border-yellow-500/30',
        gradient:    'from-yellow-500 to-orange-500',
        icon:        AlertCircle,
        label:       'SUSPICIOUS',
        meterColor:  '#eab308',
      }
    }
    if (riskScore <= 80) {
      return {
        color:       'text-orange-400',
        bg:          'bg-orange-500/10',
        border:      'border-orange-500/30',
        gradient:    'from-orange-500 to-red-500',
        icon:        AlertTriangle,
        label:       'LIKELY FAKE',
        meterColor:  '#f97316',
      }
    }
    return {
      color:       'text-red-400',
      bg:          'bg-red-500/10',
      border:      'border-red-500/30',
      gradient:    'from-red-500 to-pink-600',
      icon:        AlertOctagon,
      label:       'HIGHLY FAKE',
      meterColor:  '#ef4444',
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

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Scan Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600
                           rounded-lg font-semibold inline-block">
            Back to Dashboard
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
          NAVBAR
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50
                      bg-black/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <Link to="/dashboard" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400
                             to-purple-500 bg-clip-text text-transparent">
              DeepGuard AI
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/upload"
                  className="text-gray-300 hover:text-white transition">
              Upload
            </Link>
            <Link to="/history"
                  className="text-gray-300 hover:text-white transition">
              History
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500
                              to-purple-600 flex items-center justify-center font-bold">
                {username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-300">{username}</span>
              <button onClick={handleLogout}
                      title="Log out"
                      className="group relative p-2 text-gray-400
                                 hover:text-red-400 transition">
                <LogOut className="w-5 h-5" />
                <span className="absolute right-0 top-full mt-2 px-3 py-1
                                 bg-black border border-white/10 rounded-lg text-xs
                                 whitespace-nowrap opacity-0 group-hover:opacity-100
                                 transition pointer-events-none shadow-lg">
                  Log out
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Back link */}
        <Link to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400
                         hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start
                        gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <h1 className="text-2xl font-bold truncate">{scan.filename}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              {new Date(scan.created_at).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5
                               border border-white/10 rounded-lg hover:bg-white/10
                               transition">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download PDF</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5
                               border border-white/10 rounded-lg hover:bg-white/10
                               transition">
              <Share2 className="w-4 h-4" />
              <span className="hidden md:inline">Share</span>
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            VERDICT HERO CARD
        ─────────────────────────────────────────────────────────────── */}
        <div className={`relative overflow-hidden rounded-3xl p-8 mb-8
                         ${theme.bg} border ${theme.border}`}>

          {/* Glowing accent */}
          <div className={`absolute -top-20 -right-20 w-64 h-64
                          bg-gradient-to-br ${theme.gradient}
                          rounded-full blur-3xl opacity-20`}></div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left: Verdict */}
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

            {/* Right: Risk Meter */}
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
            FRAME DISTRIBUTION BAR
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10
                        rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-400" />
            Frame Distribution
          </h3>

          {/* Visual bar */}
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
            AI EXPLANATION CARD
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
            ACTION BUTTONS
        ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-3">
          <Link to="/upload"
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600
                           rounded-xl font-semibold hover:shadow-2xl
                           hover:shadow-blue-500/50 transition-all
                           flex items-center justify-center gap-2">
            <UploadIcon className="w-5 h-5" />
            Analyze Another File
          </Link>
          <Link to="/history"
                className="flex-1 py-4 bg-white/5 border border-white/10
                           rounded-xl font-semibold hover:bg-white/10 transition-all
                           flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            View All Scans
          </Link>
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component: Risk Meter (circular gauge)
// ─────────────────────────────────────────────────────────────────────────────
function RiskMeter({ score, color }) {
  const radius        = 90
  const circumference = 2 * Math.PI * radius
  const offset        = circumference - (score / 100) * circumference

  return (
    <div className="relative w-56 h-56">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
        />
        {/* Score ring */}
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-black" style={{ color }}>{score}</div>
        <div className="text-xs text-gray-400 mt-1 tracking-widest">/ 100</div>
        <div className="text-xs text-gray-400 mt-2">Risk Score</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component: Stat Box
// ─────────────────────────────────────────────────────────────────────────────
function StatBox({ icon: Icon, label, value, color, iconBg, subtitle }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10
                    rounded-2xl p-5 hover:border-blue-500/30 transition-all">
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

export default Results