import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, ArrowLeft, FileText, Calendar, Eye, Loader2,
  LogOut, AlertTriangle, CheckCircle2, AlertCircle, Upload,
  Filter, Clock, AlertOctagon, Search
} from 'lucide-react'
import { getHistory, logout } from '../services/api'

function History() {
  const navigate   = useNavigate()
  const username   = localStorage.getItem('username')

  const [scans, setScans]     = useState([])
  const [filter, setFilter]   = useState('ALL')
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch all scans on page load
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchScans = async () => {
      try {
        const data = await getHistory()
        setScans(data)
      } catch (err) {
        console.error('Failed to load history:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchScans()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Filter scans based on selected filter and search query
  // ─────────────────────────────────────────────────────────────────────────
  const filteredScans = scans.filter((scan) => {
    // Filter by verdict
    if (filter === 'FAKE' && scan.verdict !== 'FAKE')   return false
    if (filter === 'REAL' && scan.verdict !== 'REAL')   return false
    if (filter === 'SUSPICIOUS' && scan.verdict !== 'SUSPICIOUS') return false

    // Filter by search
    if (search && !scan.filename.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    return true
  })

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

  // Stats summary
  const totalCount = scans.length
  const fakeCount  = scans.filter(s => s.verdict === 'FAKE').length
  const realCount  = scans.filter(s => s.verdict === 'REAL').length

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
                  className="text-blue-400 font-semibold">
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
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Back link */}
        <Link to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400
                         hover:text-white mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Scan{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500
                             bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-gray-400">
            View and manage all your past detections
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Total" value={totalCount} color="text-blue-400" />
          <SummaryCard label="Fake"  value={fakeCount}  color="text-red-400" />
          <SummaryCard label="Real"  value={realCount}  color="text-green-400" />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            FILTERS BAR
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10
                        rounded-2xl p-4 mb-6">

          <div className="flex flex-col md:flex-row gap-4">

            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by filename..."
                className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10
                           rounded-lg focus:outline-none focus:border-blue-500
                           transition"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 flex-wrap">
              <FilterButton active={filter === 'ALL'}
                            onClick={() => setFilter('ALL')}
                            label="All" />
              <FilterButton active={filter === 'FAKE'}
                            onClick={() => setFilter('FAKE')}
                            label="Fake"
                            color="text-red-400 border-red-500/30 bg-red-500/10" />
              <FilterButton active={filter === 'REAL'}
                            onClick={() => setFilter('REAL')}
                            label="Real"
                            color="text-green-400 border-green-500/30 bg-green-500/10" />
              <FilterButton active={filter === 'SUSPICIOUS'}
                            onClick={() => setFilter('SUSPICIOUS')}
                            label="Suspicious"
                            color="text-yellow-400 border-yellow-500/30 bg-yellow-500/10" />
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            SCANS LIST
        ─────────────────────────────────────────────────────────────── */}
        {filteredScans.length > 0 ? (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10
                          rounded-2xl overflow-hidden">

            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b
                            border-white/10 text-sm text-gray-400 font-semibold">
              <div className="col-span-5">File</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Verdict</div>
              <div className="col-span-2">Risk Score</div>
              <div className="col-span-1"></div>
            </div>

            {/* Scan rows */}
            <div className="divide-y divide-white/5">
              {filteredScans.map((scan) => (
                <ScanRow key={scan.scan_id} scan={scan} />
              ))}
            </div>
          </div>
        ) : (

          /* Empty state */
          <div className="bg-white/5 backdrop-blur-sm border border-white/10
                          rounded-2xl p-16 text-center">
            <FileText className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No scans found</h3>
            <p className="text-gray-400 mb-6">
              {scans.length === 0
                ? 'You have no scans yet. Upload your first file!'
                : 'No scans match your filters.'}
            </p>
            {scans.length === 0 && (
              <Link to="/upload"
                    className="inline-flex items-center gap-2 px-6 py-3
                               bg-gradient-to-r from-blue-600 to-purple-600
                               rounded-lg font-semibold hover:shadow-xl
                               hover:shadow-blue-500/50 transition-all">
                <Upload className="w-5 h-5" />
                Upload First File
              </Link>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Summary Stat Card
// ─────────────────────────────────────────────────────────────────────────────
function SummaryCard({ label, value, color }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10
                    rounded-xl p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Filter Button
// ─────────────────────────────────────────────────────────────────────────────
function FilterButton({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border
                 ${active
                   ? color || 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                   : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Individual Scan Row
// ─────────────────────────────────────────────────────────────────────────────
function ScanRow({ scan }) {
  const navigate = useNavigate()

  const verdictConfig = {
    REAL: {
      icon: CheckCircle2,
      color: 'text-green-400 bg-green-500/10 border-green-500/30',
    },
    FAKE: {
      icon: AlertOctagon,
      color: 'text-red-400 bg-red-500/10 border-red-500/30',
    },
    SUSPICIOUS: {
      icon: AlertCircle,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    },
  }

  const config      = verdictConfig[scan.verdict] || verdictConfig.SUSPICIOUS
  const VerdictIcon = config.icon

  return (
    <div onClick={() => navigate(`/results/${scan.scan_id}`)}
         className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4
                    hover:bg-white/5 transition cursor-pointer items-center">

      {/* File */}
      <div className="col-span-5 flex items-center gap-3 min-w-0">
        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold truncate">{scan.filename}</div>
          <div className="text-xs text-gray-500 md:hidden">
            {new Date(scan.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="col-span-2 hidden md:flex items-center gap-2
                      text-sm text-gray-400">
        <Calendar className="w-4 h-4" />
        {new Date(scan.created_at).toLocaleDateString()}
      </div>

      {/* Verdict */}
      <div className="col-span-2">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full
                          text-xs font-semibold border ${config.color}`}>
          <VerdictIcon className="w-3 h-3" />
          {scan.verdict}
        </span>
      </div>

      {/* Risk Score */}
      <div className="col-span-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all
                            ${scan.risk_score <= 20 ? 'bg-green-500' :
                              scan.risk_score <= 50 ? 'bg-yellow-500' :
                              scan.risk_score <= 80 ? 'bg-orange-500' :
                              'bg-red-500'}`}
                 style={{ width: `${scan.risk_score}%` }}>
            </div>
          </div>
          <span className="text-sm font-semibold w-10 text-right">
            {scan.risk_score}
          </span>
        </div>
      </div>

      {/* Action */}
      <div className="col-span-1 flex justify-end">
        <Eye className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}

export default History