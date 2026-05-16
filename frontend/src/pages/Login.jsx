import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, ArrowRight, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { loginUser } from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [username, setUsername]       = useState('')
  const [password, setPassword]       = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // Handle login submission
  // ─────────────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(username, password)
      localStorage.setItem('token',    data.access_token)
      localStorage.setItem('username', data.username)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center
                    relative overflow-hidden">

      {/* Background grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
               `,
               backgroundSize: '50px 50px',
             }}
        />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">

        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-10 h-10 text-blue-500" />
          <span className="text-3xl font-bold bg-gradient-to-r from-blue-400
                           to-purple-500 bg-clip-text text-transparent">
            DeepGuard AI
          </span>
        </Link>

        {/* Form Card */}
        <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10
                        rounded-2xl shadow-2xl">

          <h1 className="text-3xl font-bold mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-400 text-center mb-8">
            Sign in to continue your analysis
          </p>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10
                            border border-red-500/30 rounded-lg text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username field */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10
                             rounded-lg focus:outline-none focus:border-blue-500
                             transition"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Password field with show/hide toggle */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-black/40 border border-white/10
                             rounded-lg focus:outline-none focus:border-blue-500
                             transition"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-500 hover:text-blue-400 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600
                         rounded-lg font-semibold hover:shadow-2xl
                         hover:shadow-blue-500/50 transition-all flex items-center
                         justify-center gap-2 disabled:opacity-50
                         disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300
                                            font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <Link to="/" className="block text-center text-gray-500 text-sm mt-6
                                hover:text-gray-300 transition">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Login