import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  Shield, Upload as UploadIcon, X, FileVideo, Image as ImageIcon,
  Loader2, AlertCircle, ArrowLeft, Sparkles, Cpu, Eye, FileText,
  LogOut, ArrowRight
} from 'lucide-react'
import { analyzeMedia, logout } from '../services/api'
import ThemeToggle from '../components/ThemeToggle'

function Upload() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  const [file, setFile]               = useState(null)
  const [preview, setPreview]         = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [statusText, setStatusText]   = useState('')

  // ─────────────────────────────────────────────────────────────────────────
  // Handle file drop or selection
  // ─────────────────────────────────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setError('')

    // Create preview URL
    const url = URL.createObjectURL(selectedFile)
    setPreview(url)
  }, [])

  const MAX_FILE_SIZE = 100 * 1024 * 1024   // 100 MB

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors?.[0]
      let message = 'File not accepted'

      if (error?.code === 'file-too-large') {
        const fileSize = (rejectedFiles[0].file.size / (1024 * 1024)).toFixed(1)
        message = `File too large (${fileSize} MB). Maximum size is 100 MB.`
      } else if (error?.code === 'file-invalid-type') {
        message = 'Invalid file type. Please upload an image or video.'
      } else if (error?.message) {
        message = error.message
      }

      setError(message)
    },
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Remove selected file
  // ─────────────────────────────────────────────────────────────────────────
  const removeFile = () => {
    setFile(null)
    setPreview(null)
    setError('')
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Format file size for display
  // ─────────────────────────────────────────────────────────────────────────
  const formatSize = (bytes) => {
    if (bytes < 1024)            return `${bytes} B`
    if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Submit file for analysis
  // ─────────────────────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError('')

    try {
      // Show status messages while analyzing
      setStatusText('Uploading file...')
      await new Promise(r => setTimeout(r, 500))

      setStatusText('Extracting faces from frames...')
      // The actual analysis call (this is the long step)
      const result = await analyzeMedia(file)

      setStatusText('Analysis complete!')
      await new Promise(r => setTimeout(r, 500))

      // Redirect to results page
      navigate(`/results/${result.scan_id}`)
    } catch (err) {
      // Get error message from backend, or use default
      const backendError = err.response?.data?.detail
      const statusCode   = err.response?.status

      let errorMessage = 'Analysis failed. Try a different file.'

      if (backendError) {
        errorMessage = backendError
      } else if (statusCode === 401) {
        errorMessage = 'Session expired. Please log in again.'
      } else if (statusCode === 413) {
        errorMessage = 'File too large. Maximum size is 100MB.'
      } else if (statusCode === 500) {
        errorMessage = 'Server error. Please try again or contact support.'
      } else if (!err.response) {
        errorMessage = 'Cannot connect to server. Make sure the backend is running.'
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Handle logout
  // ─────────────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isVideo = file?.type.startsWith('video/')

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
            <Link to="/upload" className="text-blue-500 font-semibold dark:text-blue-400">
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
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Back link */}
        <Link to="/dashboard"
              className="inline-flex items-center gap-2 text-gray-500
                         hover:text-gray-900 mb-6 transition
                         dark:text-gray-400 dark:hover:text-white">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4
                          bg-blue-500/10 border border-blue-500/30 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span className="text-sm text-blue-600 dark:text-blue-300">
              AI-Powered Detection
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500
                             bg-clip-text text-transparent">
              Analyze Media
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload a video or image to detect deepfakes
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            LOADING STATE
        ─────────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="bg-gray-50 border border-blue-500/30 backdrop-blur-sm
                          rounded-2xl p-12 text-center
                          dark:bg-white/5">
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-500 animate-spin" />
            <h2 className="text-2xl font-bold mb-3">Analyzing...</h2>
            <p className="text-gray-600 mb-2 dark:text-gray-400">{statusText}</p>
            <p className="text-sm text-gray-500">
              This may take 30-60 seconds depending on file size
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-8">
              {[
                { icon: UploadIcon, label: 'Upload' },
                { icon: Cpu,         label: 'Process' },
                { icon: Eye,         label: 'Analyze' },
                { icon: FileText,    label: 'Report' },
              ].map((step, i) => (
                <div key={i}
                     className="p-4 bg-white border border-gray-200 rounded-xl
                                dark:bg-black/40 dark:border-white/5">
                  <step.icon className="w-5 h-5 text-blue-500 mx-auto mb-2
                                        dark:text-blue-400" />
                  <div className="text-xs text-gray-600 dark:text-gray-400">{step.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (

          /* ───────────────────────────────────────────────────────────
              UPLOAD FORM
          ─────────────────────────────────────────────────────────── */
          <>
            {/* Error display */}
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 bg-red-500/10
                              border border-red-500/30 rounded-lg text-red-600
                              dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* If no file: show drop zone */}
            {!file && (
              <div {...getRootProps()}
                   className={`relative border-2 border-dashed rounded-2xl p-12
                              cursor-pointer transition-all
                              ${isDragActive
                                ? 'border-blue-500 bg-blue-500/10 scale-105'
                                : 'border-gray-300 hover:border-blue-500/50 bg-gray-50 dark:border-white/10 dark:bg-white/5'}`}>
                <input {...getInputProps()} />

                <div className="text-center">
                  <div className={`inline-flex p-4 rounded-2xl mb-4
                                  bg-gradient-to-br from-blue-500 to-purple-600
                                  ${isDragActive ? 'scale-110' : ''}
                                  transition-transform`}>
                    <UploadIcon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {isDragActive ? 'Drop the file here' : 'Drag & drop file here'}
                  </h2>
                  <p className="text-gray-600 mb-4 dark:text-gray-400">
                    or click to browse from your computer
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-xs
                                  text-gray-500">
                    <span className="px-3 py-1 bg-white border border-gray-200
                                     rounded-full dark:bg-white/5 dark:border-transparent">MP4</span>
                    <span className="px-3 py-1 bg-white border border-gray-200
                                     rounded-full dark:bg-white/5 dark:border-transparent">AVI</span>
                    <span className="px-3 py-1 bg-white border border-gray-200
                                     rounded-full dark:bg-white/5 dark:border-transparent">MOV</span>
                    <span className="px-3 py-1 bg-white border border-gray-200
                                     rounded-full dark:bg-white/5 dark:border-transparent">JPG</span>
                    <span className="px-3 py-1 bg-white border border-gray-200
                                     rounded-full dark:bg-white/5 dark:border-transparent">PNG</span>
                    <span className="px-3 py-1 bg-white border border-gray-200
                                     rounded-full dark:bg-white/5 dark:border-transparent">GIF</span>
                  </div>
                </div>
              </div>
            )}

            {/* If file selected: show preview */}
            {file && (
              <div className="space-y-4">

                {/* File info bar */}
                <div className="flex items-center justify-between p-4
                                bg-gray-50 border border-gray-200 rounded-xl
                                dark:bg-white/5 dark:border-white/10">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isVideo ? (
                      <FileVideo className="w-8 h-8 text-blue-500 flex-shrink-0
                                            dark:text-blue-400" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-purple-500 flex-shrink-0
                                            dark:text-purple-400" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{file.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatSize(file.size)} • {file.type}
                      </div>
                    </div>
                  </div>
                  <button onClick={removeFile}
                          className="p-2 hover:bg-red-500/20 rounded-lg
                                     text-gray-500 hover:text-red-500 transition
                                     dark:text-gray-400 dark:hover:text-red-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl
                                overflow-hidden
                                dark:bg-white/5 dark:border-white/10">
                  {isVideo ? (
                    <video src={preview} controls
                           className="w-full max-h-96 mx-auto" />
                  ) : (
                    <img src={preview} alt="Preview"
                         className="w-full max-h-96 object-contain mx-auto" />
                  )}
                </div>

                {/* Analyze button */}
                <button onClick={handleAnalyze}
                        className="w-full py-4 bg-gradient-to-r from-blue-600
                                   to-purple-600 text-white rounded-xl text-lg
                                   font-semibold hover:shadow-2xl
                                   hover:shadow-blue-500/50 transition-all
                                   flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Analyze Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default Upload