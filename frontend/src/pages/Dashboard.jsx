import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Shield, Upload, FileText, LogOut, BarChart3, AlertTriangle,
  CheckCircle2, Activity, ArrowRight, Loader2, Eye, Clock,
  TrendingUp, AlertCircle
} from 'lucide-react'
import {
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getStats, getHistory, logout } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'
import { useTheme } from '../context/ThemeContext'

function Dashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')
  const { theme } = useTheme()

  const [stats, setStats]     = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  // Detect if currently in dark mode (for chart styling)
  const isDark = theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // ─────────────────────────────────────────────────────────────────────────
  // Fetch dashboard data on page load
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          getStats(),
          getHistory(),
        ])
        setStats(statsData)
        setHistory(historyData)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Handle logout
  // ─────────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate('/login')
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

  // Prepare chart data
  const pieData = [
    { name: 'Fake', value: stats?.fake_scans || 0, color: '#ef4444' },
    { name: 'Real', value: stats?.real_scans || 0, color: '#22c55e' },
  ]

  const lineData = history.slice(0, 10).reverse().map((scan, i) => ({
    name: `#${i + 1}`,
    confidence: scan.confidence,
    risk: scan.risk_score,
  }))

  const recentScans = history.slice(0, 5)

  // Chart styling based on theme
  const gridStroke   = isDark ? '#333'    : '#e5e7eb'
  const axisStroke   = isDark ? '#666'    : '#9ca3af'
  const tooltipBg    = isDark ? '#0f0f0f' : '#ffffff'
  const tooltipBorder = isDark ? '#333'   : '#e5e7eb'

  return (
    <div className="min-h-screen bg-white text-gray-900
                    dark:bg-black dark:text-white">

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
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between
                        gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500
                               bg-clip-text text-transparent">
                {username}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here is your detection activity overview
            </p>
          </div>
          <Link to="/upload"
                className="inline-flex items-center gap-2 px-6 py-3
                           bg-gradient-to-r from-blue-600 to-purple-600 text-white
                           rounded-xl font-semibold hover:shadow-2xl
                           hover:shadow-blue-500/50 transition-all">
            <Upload className="w-5 h-5" />
            New Analysis
          </Link>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            STATS CARDS
        ─────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <StatCard
            icon={Activity}
            label="Total Scans"
            value={stats?.total_scans || 0}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={AlertTriangle}
            label="Fake Detected"
            value={stats?.fake_scans || 0}
            gradient="from-red-500 to-orange-500"
          />
          <StatCard
            icon={CheckCircle2}
            label="Real Detected"
            value={stats?.real_scans || 0}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Risk Score"
            value={`${stats?.avg_risk || 0}`}
            gradient="from-purple-500 to-pink-500"
          />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CHARTS SECTION
        ─────────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Pie chart */}
          <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                          rounded-2xl p-6
                          dark:bg-white/5 dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Detection Distribution
            </h3>

            {stats?.total_scans > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No scans yet" />
            )}
          </div>

          {/* Confidence line chart */}
          <div className="lg:col-span-2 bg-gray-50 border border-gray-200
                          backdrop-blur-sm rounded-2xl p-6
                          dark:bg-white/5 dark:border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500 dark:text-purple-400" />
              Confidence History
            </h3>

            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="name" stroke={axisStroke} />
                  <YAxis stroke={axisStroke} />
                  <Tooltip
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="confidence" stroke="#3b82f6"
                        strokeWidth={3} name="Confidence %" />
                  <Line type="monotone" dataKey="risk" stroke="#a855f7"
                        strokeWidth={3} name="Risk Score" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="No data yet" />
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RECENT ACTIVITY
        ─────────────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                        rounded-2xl p-6
                        dark:bg-white/5 dark:border-white/10">

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Recent Activity
            </h3>
            <Link to="/history"
                  className="text-sm text-blue-500 hover:text-blue-600
                             flex items-center gap-1
                             dark:text-blue-400 dark:hover:text-blue-300">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <RecentScanRow key={scan.scan_id} scan={scan} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4
                                   dark:text-gray-700" />
              <p className="text-gray-500 mb-4 dark:text-gray-400">No scans yet</p>
              <Link to="/upload"
                    className="inline-flex items-center gap-2 px-6 py-3
                               bg-gradient-to-r from-blue-600 to-purple-600
                               text-white rounded-lg font-semibold hover:shadow-xl
                               hover:shadow-blue-500/50 transition-all">
                <Upload className="w-5 h-5" />
                Upload First File
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component: Stat Card
// ─────────────────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="bg-gray-50 border border-gray-200 backdrop-blur-sm
                    rounded-2xl p-5 hover:border-blue-500/50 transition-all
                    hover:scale-105
                    dark:bg-white/5 dark:border-white/10">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br
                       ${gradient} mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-gray-600 text-sm mt-1 dark:text-gray-400">{label}</div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component: Recent Scan Row
// ─────────────────────────────────────────────────────────────────────────────
function RecentScanRow({ scan }) {
  const navigate = useNavigate()

  // Verdict colors
  const verdictColors = {
    REAL:        'text-green-600 bg-green-500/10 border-green-500/30 dark:text-green-400',
    FAKE:        'text-red-600 bg-red-500/10 border-red-500/30 dark:text-red-400',
    SUSPICIOUS:  'text-yellow-600 bg-yellow-500/10 border-yellow-500/30 dark:text-yellow-400',
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white
                    border border-gray-200 rounded-xl
                    hover:border-blue-500/30 transition cursor-pointer
                    dark:bg-black/40 dark:border-white/5"
         onClick={() => navigate(`/results/${scan.scan_id}`)}>

      <div className="flex items-center gap-4 flex-1 min-w-0">
        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-medium truncate">{scan.filename}</div>
          <div className="text-sm text-gray-500">
            {new Date(scan.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">Risk</div>
          <div className="font-bold">{scan.risk_score}/100</div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold
                         border ${verdictColors[scan.verdict] || ''}`}>
          {scan.verdict}
        </span>
        <Eye className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Component: Empty Chart State
// ─────────────────────────────────────────────────────────────────────────────
function EmptyChartState({ message }) {
  return (
    <div className="h-[250px] flex flex-col items-center justify-center
                    text-gray-400 dark:text-gray-500">
      <BarChart3 className="w-12 h-12 mb-2 opacity-30" />
      <p>{message}</p>
    </div>
  )
}

export default Dashboard