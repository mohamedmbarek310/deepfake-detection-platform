import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, User, Mail, Lock, ArrowRight, AlertCircle,
         CheckCircle2, Loader2, Eye, EyeOff } from 'lucide-react'
import { registerUser } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

function Register() {
  const navigate = useNavigate()

  const [username, setUsername]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [loading, setLoading]           = useState(false)

  // ─────────────────────────────────────────────────────────────────────────
  // Handle registration submission
  // ─────────────────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Quick password length check
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      await registerUser(username, email, password)
      setSuccess('Account created successfully! Redirecting to login...')

      // Redirect to login after 2 seconds
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center
                    relative overflow-hidden py-8
                    dark:bg-black dark:text-white">

      {/* Theme toggle in top-right corner */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      {/* Register Card */}
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
        <div className="p-8 bg-white border border-gray-200 backdrop-blur-xl
                        rounded-2xl shadow-2xl
                        dark:bg-white/5 dark:border-white/10">

          <h1 className="text-3xl font-bold mb-2 text-center">Create Account</h1>
          <p className="text-gray-600 text-center mb-8 dark:text-gray-400">
            Join the platform that fights deepfakes
          </p>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10
                            border border-red-500/30 rounded-lg text-red-600
                            dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10
                            border border-green-500/30 rounded-lg text-green-600
                            dark:text-green-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">

            {/* Username field */}
            <div>
              <label className="block text-sm text-gray-600 mb-2 dark:text-gray-400">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200
                             rounded-lg focus:outline-none focus:border-blue-500
                             transition text-gray-900
                             dark:bg-black/40 dark:border-white/10 dark:text-white"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label className="block text-sm text-gray-600 mb-2 dark:text-gray-400">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200
                             rounded-lg focus:outline-none focus:border-blue-500
                             transition text-gray-900
                             dark:bg-black/40 dark:border-white/10 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password field with show/hide toggle */}
            <div>
              <label className="block text-sm text-gray-600 mb-2 dark:text-gray-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200
                             rounded-lg focus:outline-none focus:border-blue-500
                             transition text-gray-900
                             dark:bg-black/40 dark:border-white/10 dark:text-white"
                  placeholder="At least 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-blue-500 transition
                             dark:text-gray-500 dark:hover:text-blue-400"
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
                         text-white rounded-lg font-semibold hover:shadow-2xl
                         hover:shadow-blue-500/50 transition-all flex items-center
                         justify-center gap-2 disabled:opacity-50
                         disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-gray-600 text-sm mt-6 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:text-blue-600
                                         font-semibold
                                         dark:text-blue-400 dark:hover:text-blue-300">
              Sign In
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <Link to="/" className="block text-center text-gray-500 text-sm mt-6
                                hover:text-gray-700 transition
                                dark:text-gray-500 dark:hover:text-gray-300">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Register