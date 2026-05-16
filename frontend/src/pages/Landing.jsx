import { Link } from 'react-router-dom'
import {
  Shield, Brain, Eye, FileText, Zap, BarChart3,
  ArrowRight, CheckCircle2, Sparkles, Lock, Activity,
  Upload, Cpu, Search
} from 'lucide-react'

function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════════
          ANIMATED BACKGROUND GRID
      ═══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 z-0 opacity-20">
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

      {/* Glowing orbs in background */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="fixed top-1/2 left-1/2 w-96 h-96 bg-red-500 rounded-full
                      mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

      {/* ═══════════════════════════════════════════════════════════════
          NAVBAR
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="relative z-10 flex justify-between items-center
                      px-8 py-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-500" />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400
                           to-purple-500 bg-clip-text text-transparent">
            DeepGuard AI
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login"
                className="px-6 py-2 text-gray-300 hover:text-white transition">
            Sign In
          </Link>
          <Link to="/register"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600
                           rounded-lg hover:shadow-lg hover:shadow-blue-500/50
                           transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-8 py-20 text-center max-w-6xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8
                        bg-blue-500/10 border border-blue-500/30 rounded-full">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300">
            AI-Powered Deepfake Detection Platform
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-7xl md:text-8xl font-black mb-6 leading-tight">
          <span className="block bg-gradient-to-r from-white via-blue-200 to-white
                           bg-clip-text text-transparent">
            Detect. Analyze.
          </span>
          <span className="block bg-gradient-to-r from-blue-400 via-purple-500
                           to-red-500 bg-clip-text text-transparent">
            Protect.
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
          Advanced AI technology to detect deepfakes, analyze digital forensics,
          and generate professional reports — protecting truth in the age of
          synthetic media.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600
                           to-purple-600 rounded-xl text-lg font-semibold
                           hover:shadow-2xl hover:shadow-blue-500/50
                           transition-all flex items-center justify-center gap-2">
            Start Free Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
          <Link to="/login"
                className="px-8 py-4 border border-gray-700 rounded-xl
                           text-lg font-semibold hover:border-blue-500
                           hover:bg-blue-500/10 transition-all">
            Sign In
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>99.2% Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Video + Image Support</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span>Forensics Reports</span>
          </div>
        </div>

      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS BAR
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: '99.2%', label: 'Detection Accuracy', icon: Shield },
            { num: '<30s',  label: 'Analysis Time',      icon: Zap },
            { num: 'AI',    label: 'Powered Engine',     icon: Brain },
            { num: '100%',  label: 'Forensics Coverage', icon: Lock },
          ].map((stat, i) => (
            <div key={i}
                 className="p-6 bg-white/5 backdrop-blur-sm border border-white/10
                            rounded-2xl hover:border-blue-500/50 transition-all
                            hover:scale-105">
              <stat.icon className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-4xl font-bold bg-gradient-to-r from-white
                              to-blue-300 bg-clip-text text-transparent">
                {stat.num}
              </div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES GRID
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Powerful{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-500
                               bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to detect and analyze deepfakes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'AI Detection',
                desc: 'Vision Transformer model with 99% accuracy on deepfake detection',
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                icon: BarChart3,
                title: 'Risk Scoring',
                desc: '0-100 authenticity score with detailed confidence levels',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: Eye,
                title: 'Explainability',
                desc: 'Grad-CAM heatmaps showing exactly where manipulation was detected',
                gradient: 'from-orange-500 to-red-500',
              },
              {
                icon: Activity,
                title: 'Frame Analysis',
                desc: 'Every video analyzed frame-by-frame with timeline visualization',
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                icon: Search,
                title: 'Digital Forensics',
                desc: 'EXIF metadata analysis and compression artifact detection',
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                icon: FileText,
                title: 'Pro Reports',
                desc: 'Professional PDF forensics reports for legal and journalism use',
                gradient: 'from-indigo-500 to-purple-500',
              },
            ].map((feature, i) => (
              <div key={i}
                   className="group p-8 bg-white/5 backdrop-blur-sm
                              border border-white/10 rounded-2xl
                              hover:border-blue-500/50 transition-all
                              hover:scale-105 cursor-pointer">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br
                                ${feature.gradient} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              How It{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-500
                               bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              4 simple steps to detect deepfakes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Upload, title: 'Upload', desc: 'Upload your video or image' },
              { icon: Cpu,    title: 'Process', desc: 'AI analyzes frame by frame' },
              { icon: Eye,    title: 'Detect',  desc: 'Get verdict + heatmap' },
              { icon: FileText, title: 'Report', desc: 'Download forensics PDF' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="p-6 bg-white/5 backdrop-blur-sm
                                border border-white/10 rounded-2xl text-center
                                hover:border-purple-500/50 transition-all">
                  <div className="inline-flex w-16 h-16 items-center justify-center
                                  rounded-full bg-gradient-to-br from-purple-500
                                  to-pink-500 mb-4">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-sm text-purple-400 mb-2">Step {i + 1}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 px-8 py-20">
        <div className="max-w-4xl mx-auto p-12 bg-gradient-to-br from-blue-600/20
                        to-purple-600/20 backdrop-blur-sm border border-white/10
                        rounded-3xl text-center">
          <h2 className="text-5xl font-bold mb-4">
            Ready to{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500
                             bg-clip-text text-transparent">
              Detect Truth?
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join the platform that fights deepfakes with AI
          </p>
          <Link to="/register"
                className="inline-flex items-center gap-2 px-10 py-5
                           bg-gradient-to-r from-blue-600 to-purple-600
                           rounded-xl text-lg font-semibold
                           hover:shadow-2xl hover:shadow-blue-500/50
                           transition-all group">
            Start Free Analysis
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 px-8 py-12 border-t border-white/10
                         text-center text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-blue-500" />
          <span className="font-bold text-white">DeepGuard AI</span>
        </div>
        <p className="text-sm">
          AI-Powered Deepfake Detection &amp; Digital Forensics Platform
        </p>
        <p className="text-xs mt-2">
          PFE Project by Mohamed Mbarek &middot; 2026
        </p>
      </footer>

    </div>
  )
}

export default Landing