import { motion } from "framer-motion"
import { Rocket, Shield, Zap, Globe, Github, Terminal, ArrowRight, CheckCircle, GitBranch, Activity } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@clerk/clerk-react"
import { Navbar } from "../components/Navbar"

const stats = [
  { value: "10M+", label: "Deployments" },
  { value: "99.99%", label: "Uptime" },
  { value: "<100ms", label: "Build Start" },
  { value: "150+", label: "Edge Regions" },
]

const features = [
  {
    icon: <Zap className="w-6 h-6 text-yellow-400" />,
    color: "from-yellow-500/20 to-orange-500/10",
    border: "border-yellow-500/20",
    title: "Lightning Fast Builds",
    description: "Zero-config deployments with smart caching. Your code goes live in seconds, not minutes.",
  },
  {
    icon: <Shield className="w-6 h-6 text-blue-400" />,
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
    title: "Secure by Default",
    description: "Every deployment is isolated with automatic HTTPS, DDoS protection, and WAF included.",
  },
  {
    icon: <Globe className="w-6 h-6 text-green-400" />,
    color: "from-green-500/20 to-emerald-500/10",
    border: "border-green-500/20",
    title: "Global Edge Network",
    description: "Deploy to 150+ edge locations worldwide. Your users always get the fastest experience.",
  },
  {
    icon: <GitBranch className="w-6 h-6 text-purple-400" />,
    color: "from-purple-500/20 to-pink-500/10",
    border: "border-purple-500/20",
    title: "Git-Driven Workflow",
    description: "Push to GitHub and watch your app deploy automatically. Preview links for every PR.",
  },
  {
    icon: <Activity className="w-6 h-6 text-red-400" />,
    color: "from-red-500/20 to-rose-500/10",
    border: "border-red-500/20",
    title: "Real-Time Analytics",
    description: "Live dashboards, build logs, performance metrics, and error tracking out of the box.",
  },
  {
    icon: <Terminal className="w-6 h-6 text-zinc-400" />,
    color: "from-zinc-500/20 to-zinc-600/10",
    border: "border-zinc-500/20",
    title: "Powerful CLI",
    description: "Deploy with a single command. Full control over your workflows from the terminal.",
  },
]

const logLines = [
  { text: "Cloning repository...", color: "text-zinc-400", delay: 0 },
  { text: "✓ Cloned in 1.2s", color: "text-green-400", delay: 0.3 },
  { text: "Installing dependencies...", color: "text-zinc-400", delay: 0.6 },
  { text: "✓ Installed 342 packages", color: "text-green-400", delay: 0.9 },
  { text: "Building project...", color: "text-zinc-400", delay: 1.2 },
  { text: "✓ Build completed in 8.4s", color: "text-green-400", delay: 1.5 },
  { text: "🚀 Deployed! → https://my-app.deployhub.dev", color: "text-blue-400 font-bold", delay: 1.8 },
]

export default function LandingPage() {
  const { isSignedIn } = useAuth()

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
          <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full" />
          <div className="absolute top-[40%] left-[-5%] w-[300px] h-[300px] bg-cyan-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 rounded-full px-4 py-1.5 text-sm font-medium text-zinc-400 mb-8 hover:border-zinc-600 transition-colors cursor-default backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>The open-source Vercel alternative</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
              Deploy instantly.<br />Scale effortlessly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            DeployHub gives you Vercel-grade infrastructure for your projects. 
            Push to GitHub, get a live URL. That simple.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to={isSignedIn ? "/dashboard" : "/signup"}>
              <button className="px-8 py-4 bg-white text-black rounded-full font-bold text-base hover:bg-zinc-100 transition-all flex items-center gap-2 group shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]">
                {isSignedIn ? "Go to Dashboard" : "Start Deploying Free"}
                <Rocket className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </Link>
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <button className="px-8 py-4 bg-zinc-900/80 text-white border border-zinc-700 rounded-full font-bold text-base hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center gap-2 backdrop-blur-sm">
                <Github className="w-5 h-5" />
                View on GitHub
              </button>
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── LIVE TERMINAL DEMO ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl shadow-black/50"
          >
            {/* Window chrome */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                <Terminal className="w-3 h-3" />
                deployhub — deploy
              </div>
              <div className="w-16" />
            </div>
            {/* Terminal content */}
            <div className="p-6 font-mono text-sm space-y-2">
              <p className="text-zinc-500 mb-3">$ deployhub deploy --repo https://github.com/user/my-app</p>
              {logLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: line.delay }}
                  viewport={{ once: true }}
                  className={line.color}
                >
                  {line.text}
                </motion.p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Features</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Everything you need to ship</h2>
            <p className="text-zinc-500 text-lg max-w-xl mx-auto">
              Production-grade infrastructure without the complexity. Start deploying in minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`p-7 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.border} hover:border-opacity-40 transition-all group`}
              >
                <div className="w-12 h-12 bg-zinc-900/80 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Ready to ship faster?</h2>
              <p className="text-zinc-400 text-lg mb-8 max-w-lg mx-auto">
                Join thousands of developers already deploying with DeployHub.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to={isSignedIn ? "/dashboard" : "/signup"}>
                  <button className="px-10 py-4 bg-white text-black font-bold rounded-full text-base hover:bg-zinc-100 transition-all flex items-center gap-2 shadow-xl">
                    <CheckCircle className="w-5 h-5" />
                    {isSignedIn ? "Open Dashboard" : "Get Started Free"}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 px-4 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Rocket className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">DeployHub</span>
          </div>
          <div className="text-zinc-500 text-sm">
            © 2026 DeployHub. Built for developers.
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Twitter</a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">GitHub</a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
