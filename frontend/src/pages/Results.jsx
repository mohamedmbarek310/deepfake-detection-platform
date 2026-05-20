import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Shield, ArrowLeft, Download, Share2, Upload as UploadIcon,
  AlertTriangle, CheckCircle2, AlertCircle, FileText, Calendar,
  Activity, Eye, Loader2, LogOut, Sparkles, TrendingUp,
  Clock, Film, AlertOctagon, Camera, Image as ImageIcon,
  Edit3, Info, MapPin, Cpu, Layers
} from 'lucide-react'
import { getReport, logout, downloadPdfReport, createShareLink } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

function Results() {
  const { scanId } = useParams()
  const navigate   = useNavigate()
  const username   = localStorage.getItem('username')

  const [scan, setScan]                = useState(null)
  const [loading, setLoading]          = useState(true)
  const [error, setError]              = useState('')
  const [shareNotification, setShareNotification] = useState('')

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
  // Handle PDF download
  // ─────────────────────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    try {
      await downloadPdfReport(scan.scan_id, scan.filename)
    } catch (err) {
      console.error('Failed to download PDF:', err)
      alert('Failed to download PDF report')
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Handle Share Link Generation
  // ─────────────────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      const result = await createShareLink(scan.scan_id)
      await navigator.clipboard.writeText(result.share_url)
      setShareNotification('Link copied to clipboard!')
      setTimeout(() => setShareNotification(''), 3000)
    } catch (err) {
      console.error('Failed to create share link:', err)
      setShareNotification('Failed to create share link')
      setTimeout(() => setShareNotification(''), 3000)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Get colors and labels based on verdict
  // ─────────────────────────────────────────────────────────────────────────
  const getVerdictTheme = (verdict, riskScore) => {
    if (verdict === 'REAL' || riskScore <= 20) {
      return {
        color:       'text-green-600 dark:text-green-400',
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
        color:       'text-yellow-600 dark:text-yellow-400',
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
        color:       'text-orange-600 dark:text-orange-400',
        bg:          'bg-orange-500/10',
        border:      'border-orange-500/30',
        gradient:    'from-orange-500 to-red-500',
        icon:        AlertTriangle,
        label:       'LIKELY FAKE',
        meterColor:  '#f97316',
      }
    }
    return {
      color:       'text-red-600 dark:text-red-400',
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
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center
                      dark:bg-black dark:text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center
                      dark:bg-black dark:text-white">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Scan Not Found</h2>
          <p className="text-gray-600 mb-6 dark:text-gray-400">{error}</p>
          <Link to="/dashboard"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600
                           text-white rounded-lg font-semibold inline-block">
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
    <div className="min-h-screen bg-white text-gray-900
                    dark:bg-black dark:text-white">

      {/* ═══════════════════════════════════════════════════════════════
          SHARE NOTIFICATION TOAST
      ═══════════════════════════════════════════════════════════════ */}
      {shareNotification && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r
                        from-blue-600 to-purple-600 text-white px-6 py-3
                        rounded-xl shadow-2xl flex items-center gap-2
                        animate-bounce">
          <Share2 className="w-5 h-5" />
          {shareNotification}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="border-b border-gray-200 backdrop-blur-sm sticky top-0 z-50
                      bg-white/80
                      dark:border-white/10 dark:bg-black/80">
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
                  className="text-gray-600 hover:text-gray-900 transition
                             dark:text-gray-300 dark:hover:text-white">
              Upload
            </Link>
            <Link to="/history"
                  className="text-gray-600 hover:text-gray-900 transition
                             dark:text-gray-300 dark:hover:text-white">
              History
            </Link>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200
                            dark:border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500
                              to-purple-600 flex items-center justify-center
                              text-white font-bold">
                {username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">{username}</span>
              <button onClick={handleLogout}
                      title="Log out"
                      className="group relative p-2 text-gray-500 hover:text-red-500
                                 transition
                                 dark:text-gray-400 dark:hover:text-red-400">
                <LogOut className="w-5 h-5" />
                <span className="absolute right-0 top-full mt-2 px-3 py-1
                                 bg-white border border-gray-200 rounded-lg text-xs
                                 whitespace-nowrap opacity-0 group-hover:opacity-100
                                 transition pointer-events-none shadow-lg text-gray-700
                                 dark:bg-black dark:border-white/10 dark:text-gray-300">
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
              className="inline-flex items-center gap-2 text-gray-500
                         hover:text-gray-900 mb-6 transition
                         dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start
                        gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <h1 className="text-2xl font-bold truncate">{scan.filename}</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {new Date(scan.created_at).toLocaleString()}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleDownloadPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50
                               border border-gray-200 rounded-lg hover:bg-gray-100
                               transition
                               dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download PDF</span>
            </button>
            <button onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50
                               border border-gray-200 rounded-lg hover:bg-gray-100
                               transition
                               dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
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

          <div className={`absolute -top-20 -right-20 w-64 h-64
                          bg-gradient-to-br ${theme.gradient}
                          rounded-full blur-3xl opacity-20`}></div>

          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            <div>
              <div className="flex items-center gap-3 mb-4">
                <VerdictIcon className={`w-12 h-12 ${theme.color}`} />
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Verdict</div>
                  <div className={`text-4xl font-black ${theme.color}`}>
                    {theme.label}
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6 dark:text-gray-300">{scan.explanation}</p>

              <div className="flex flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                  <div className="text-2xl font-bold">{scan.confidence}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Frames Analyzed</div>
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
            color="text-blue-600 dark:text-blue-400"
            iconBg="from-blue-500 to-cyan-500"
          />
          <StatBox
            icon={AlertTriangle}
            label="Fake Frames"
            value={scan.fake_frames}
            color="text-red-600 dark:text-red-400"
            iconBg="from-red-500 to-orange-500"
            subtitle={`${fakePercent.toFixed(1)}% of total`}
          />
          <StatBox
            icon={CheckCircle2}
            label="Real Frames"
            value={scan.real_frames}
            color="text-green-600 dark:text-green-400"
            iconBg="from-green-500 to-emerald-500"
            subtitle={`${realPercent.toFixed(1)}% of total`}
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FRAME DISTRIBUTION BAR
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                        rounded-2xl p-6 mb-8
                        dark:bg-white/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            Frame Distribution
          </h3>

          {/* Visual bar */}
          <div className="flex h-12 rounded-xl overflow-hidden bg-gray-200
                          dark:bg-black/40">
            {fakePercent > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500
                              flex items-center justify-center font-semibold text-sm text-white"
                   style={{ width: `${fakePercent}%` }}>
                {fakePercent > 15 && `${scan.fake_frames} Fake`}
              </div>
            )}
            {realPercent > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-emerald-500
                              flex items-center justify-center font-semibold text-sm text-white"
                   style={{ width: `${realPercent}%` }}>
                {realPercent > 15 && `${scan.real_frames} Real`}
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-gray-500 mt-3
                          dark:text-gray-400">
            <span>0 frames</span>
            <span>{scan.total_frames} frames</span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            AI EXPLANATION CARD
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                        rounded-2xl p-6 mb-8
                        dark:bg-white/5 dark:border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            AI Analysis
          </h3>
          <p className="text-gray-700 leading-relaxed dark:text-gray-300">{scan.explanation}</p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            METADATA FORENSICS PANEL
        ─────────────────────────────────────────────────────────────── */}
        {scan.metadata && Object.keys(scan.metadata).length > 0 && (
          <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                          rounded-2xl p-6 mb-8
                          dark:bg-white/5 dark:border-white/10">

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              Digital Forensics
            </h3>

            {/* Suspicious flags */}
            {scan.metadata.suspicious_flags &&
             scan.metadata.suspicious_flags.length > 0 && (
              <div className="mb-6 space-y-2">
                {scan.metadata.suspicious_flags.map((flag, i) => (
                  <FlagAlert key={i} flag={flag} />
                ))}
              </div>
            )}

            {/* Warnings */}
            {scan.metadata.warnings &&
             scan.metadata.warnings.length > 0 && (
              <div className="mb-6 space-y-2">
                {scan.metadata.warnings.map((warning, i) => (
                  <div key={i}
                       className="flex items-center gap-2 p-3
                                  bg-yellow-500/10 border border-yellow-500/30
                                  rounded-lg text-sm text-yellow-700
                                  dark:text-yellow-300">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            )}

            {/* File Info Grid */}
            {scan.metadata.file_info && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase
                               tracking-wider dark:text-gray-400">
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
                  {scan.metadata.file_info.format && (
                    <MetadataRow
                      icon={FileText}
                      label="Format"
                      value={scan.metadata.file_info.format}
                    />
                  )}
                </div>
              </div>
            )}

            {/* EXIF Data */}
            {scan.metadata.exif_data &&
             Object.keys(scan.metadata.exif_data).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase
                               tracking-wider dark:text-gray-400">
                  EXIF Metadata
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80
                                overflow-y-auto pr-2">
                  {Object.entries(scan.metadata.exif_data)
                    .slice(0, 20)
                    .map(([key, value]) => (
                    <ExifRow key={key} keyName={key} value={value} />
                  ))}
                </div>
              </div>
            )}

            {/* No metadata message */}
            {(!scan.metadata.exif_data ||
              Object.keys(scan.metadata.exif_data).length === 0) &&
             (!scan.metadata.warnings || scan.metadata.warnings.length === 0) && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No metadata available for this file</p>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            ACTION BUTTONS
        ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-3">
          <Link to="/upload"
                className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600
                           text-white rounded-xl font-semibold hover:shadow-2xl
                           hover:shadow-blue-500/50 transition-all
                           flex items-center justify-center gap-2">
            <UploadIcon className="w-5 h-5" />
            Analyze Another File
          </Link>
          <Link to="/history"
                className="flex-1 py-4 bg-gray-50 border border-gray-200
                           rounded-xl font-semibold hover:bg-gray-100 transition-all
                           flex items-center justify-center gap-2
                           dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10">
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
          className="stroke-gray-200 dark:stroke-white/5"
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
        <div className="text-xs text-gray-500 mt-1 tracking-widest dark:text-gray-400">/ 100</div>
        <div className="text-xs text-gray-500 mt-2 dark:text-gray-400">Risk Score</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Flag Alert (Suspicious indicator)
// ─────────────────────────────────────────────────────────────────────────────
function FlagAlert({ flag }) {
  const severityConfig = {
    high: {
      bg:    'bg-red-500/10 border-red-500/30',
      color: 'text-red-600 dark:text-red-400',
      icon:  AlertOctagon,
    },
    medium: {
      bg:    'bg-orange-500/10 border-orange-500/30',
      color: 'text-orange-600 dark:text-orange-400',
      icon:  AlertTriangle,
    },
    low: {
      bg:    'bg-yellow-500/10 border-yellow-500/30',
      color: 'text-yellow-600 dark:text-yellow-400',
      icon:  AlertCircle,
    },
  }

  const config = severityConfig[flag.severity] || severityConfig.low
  const Icon   = config.icon

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.bg}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
      <div className="flex-1">
        <div className={`text-xs uppercase tracking-wider font-bold ${config.color}`}>
          {flag.type.replace(/_/g, ' ')}
        </div>
        <div className="text-sm text-gray-700 mt-0.5 dark:text-gray-200">{flag.message}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Metadata Row
// ─────────────────────────────────────────────────────────────────────────────
function MetadataRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200
                    rounded-lg
                    dark:bg-black/30 dark:border-white/5">
      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0 dark:text-gray-400" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: EXIF Row
// ─────────────────────────────────────────────────────────────────────────────
function ExifRow({ keyName, value }) {
  return (
    <div className="flex justify-between gap-2 p-2 bg-white border border-gray-200
                    rounded-lg text-sm
                    dark:bg-black/30 dark:border-white/5">
      <span className="text-gray-500 font-medium flex-shrink-0 dark:text-gray-400">{keyName}:</span>
      <span className="text-gray-700 truncate text-right dark:text-gray-200">{value}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component: Stat Box
// ─────────────────────────────────────────────────────────────────────────────
function StatBox({ icon: Icon, label, value, color, iconBg, subtitle }) {
  return (
    <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                    rounded-2xl p-5 hover:border-blue-500/30 transition-all
                    dark:bg-white/5 dark:border-white/10">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br
                       ${iconBg} mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-600 text-sm mt-1 dark:text-gray-400">{label}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1 dark:text-gray-500">{subtitle}</div>
      )}
    </div>
  )
}

export default Results