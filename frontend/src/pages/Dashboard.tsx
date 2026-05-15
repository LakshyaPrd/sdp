import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, useClerk } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import {
  Rocket, Github, Search, Plus, MoreVertical, ExternalLink,
  Clock, CheckCircle2, XCircle, Loader2, ArrowRight, Terminal,
  Globe, LogOut, Settings, User, Trash2, RefreshCw, BarChart2,
  ChevronDown, Star, Book
} from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

const BACKEND_URL = "http://localhost:3000"
const DEPLOY_URL  = "http://localhost:3001"

type Stage = "idle" | "cloning" | "installing" | "building" | "deployed" | "failed"

const stageMessages: Record<Stage, string> = {
  idle: "",
  cloning: "Cloning repository…",
  installing: "Installing dependencies…",
  building: "Building project…",
  deployed: "Deployment successful!",
  failed: "Deployment failed.",
}

const stageOrder: Stage[] = ["cloning", "installing", "building", "deployed"]

interface Project {
  id: string
  name: string
  status: "deployed" | "failed" | "building"
  url: string
  date: string
  repo?: string
}

const DEMO_PROJECTS: Project[] = [];

/* ─── Modal: New Deployment ───────────────────────────────────────── */
function DeployModal({
  onClose,
  onDeployed,
}: {
  onClose: () => void
  onDeployed: (p: Project) => void
}) {
  const { user } = useUser()
  const [repoUrl, setRepoUrl] = useState("")
  const [stage, setStage]     = useState<Stage>("idle")
  const [logs,  setLogs]      = useState<string[]>([])
  const [deployId, setDeployId] = useState("")
  const [repos, setRepos] = useState<any[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logsEndRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRepos = async () => {
      const githubAccount = user?.externalAccounts.find(acc => acc.provider === 'github')
      if (githubAccount && githubAccount.username) {
        setLoadingRepos(true)
        try {
          const res = await axios.get(`https://api.github.com/users/${githubAccount.username}/repos?sort=updated&per_page=100`)
          setRepos(res.data)
        } catch (err) {
          console.error("Failed to fetch repos", err)
        } finally {
          setLoadingRepos(false)
        }
      }
    }
    fetchRepos()
  }, [user])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const handleDeploy = async () => {
    if (!repoUrl.trim()) return
    setStage("cloning")
    setLogs([])
    setDeployId("")

    try {
      const res  = await axios.post(`${BACKEND_URL}/deploy`, { repoUrl })
      const id   = res.data.id
      setDeployId(id)
      setLogs([`Started deployment: ${id}`])

      intervalRef.current = setInterval(async () => {
        try {
          const { data } = await axios.get(`${BACKEND_URL}/status?id=${id}`)
          if (data.logs?.length) setLogs(data.logs)
          if (["cloning","installing","building","deployed","failed"].includes(data.status)) {
            setStage(data.status as Stage)
          }
          if (data.status === "deployed") {
            const url = data.port
              ? `http://localhost:${data.port}`
              : `${DEPLOY_URL}/${id}`
            onDeployed({ id, name: repoUrl.split("/").pop() || "new-project", status: "deployed", url, date: "Just now", repo: repoUrl })
            toast.success("Deployment complete!")
            clearInterval(intervalRef.current!)
          }
          if (data.status === "failed") { clearInterval(intervalRef.current!); toast.error("Deployment failed!") }
        } catch { /* ignore poll errors */ }
      }, 2000)
    } catch (err: any) {
      setLogs([`Error: ${err.message}`])
      setStage("failed")
      toast.error("Could not reach deploy service")
    }
  }

  const canClose = stage === "idle" || stage === "deployed" || stage === "failed"

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => canClose && onClose()}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit   ={{ opacity: 0, scale: 0.94, y: 24 }}
        className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold">New Deployment</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Paste a GitHub repo URL to deploy instantly</p>
          </div>
          <button onClick={() => canClose && onClose()} className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-7 space-y-5">
          {stage === "idle" ? (
            <div className="space-y-6">
              <div>
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3 block">Import from GitHub</label>
                
                {loadingRepos ? (
                  <div className="flex flex-col items-center justify-center py-10 bg-zinc-800/30 border border-zinc-800 rounded-xl">
                    <Loader2 className="w-8 h-8 text-zinc-600 animate-spin mb-2" />
                    <p className="text-sm text-zinc-500">Fetching your repositories...</p>
                  </div>
                ) : repos.length > 0 ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                      <input 
                        type="text"
                        placeholder="Search your repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-800/50 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-700 transition-colors"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-zinc-800 rounded-xl divide-y divide-zinc-800 bg-zinc-900/50 custom-scrollbar">
                      {repos
                        .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(repo => (
                        <button
                          key={repo.id}
                          onClick={() => setRepoUrl(repo.html_url)}
                          className={`w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors text-left group ${repoUrl === repo.html_url ? 'bg-white/5 border-l-2 border-white' : ''}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Book className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 shrink-0" />
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-zinc-200 truncate">{repo.name}</p>
                              <p className="text-[10px] text-zinc-500 truncate">{repo.updated_at ? `Updated ${new Date(repo.updated_at).toLocaleDateString()}` : ''}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-zinc-500 shrink-0">
                            {repo.stargazers_count > 0 && (
                              <div className="flex items-center gap-1 text-[10px]">
                                <Star className="w-3 h-3" /> {repo.stargazers_count}
                              </div>
                            )}
                            <ChevronDown className="w-4 h-4 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 bg-zinc-800/30 border border-zinc-700 border-dashed rounded-xl px-6 text-center">
                    <Github className="w-10 h-10 text-zinc-700 mb-3" />
                    <p className="text-sm font-medium text-zinc-400 mb-1">No repositories found</p>
                    <p className="text-xs text-zinc-500">Make sure your GitHub account is connected to Clerk with public repo access.</p>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-800"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-500">Or enter URL manually</span>
                </div>
              </div>

              <div>
                <div className="flex items-center bg-zinc-800 border border-zinc-700 rounded-xl px-4 gap-3 focus-within:border-white transition-colors">
                  <Github className="w-5 h-5 text-zinc-500 shrink-0" />
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={e => setRepoUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && repoUrl.trim() && handleDeploy()}
                    placeholder="https://github.com/username/repo"
                    className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 outline-none py-4"
                  />
                </div>
              </div>
              <button
                onClick={handleDeploy}
                disabled={!repoUrl.trim()}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                Deploy to DeployHub <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Status pill */}
              <div className={`flex items-center justify-between p-4 rounded-xl border ${stage === "failed" ? "bg-red-500/10 border-red-500/30" : stage === "deployed" ? "bg-green-500/10 border-green-500/30" : "bg-blue-500/10 border-blue-500/30"}`}>
                <div className="flex items-center gap-3">
                  {stage === "failed"   ? <XCircle      className="w-6 h-6 text-red-400" /> :
                   stage === "deployed" ? <CheckCircle2 className="w-6 h-6 text-green-400" /> :
                                          <Loader2      className="w-6 h-6 text-blue-400 animate-spin" />}
                  <div>
                    <p className="font-semibold text-sm">{stageMessages[stage]}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{deployId || "Initialising…"}</p>
                  </div>
                </div>
                {stage === "deployed" && (
                  <a
                    href={deployPort ? `http://localhost:${deployPort}` : `${DEPLOY_URL}/${deployId}`}
                    target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 bg-green-500 text-black text-xs font-bold rounded-lg hover:bg-green-400 flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Stage steps */}
              <div className="flex items-center gap-2">
                {stageOrder.map((s, i) => {
                  const currentIdx = stageOrder.indexOf(stage)
                  const done   = currentIdx > i || stage === "deployed"
                  const active = s === stage
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex-1 h-1.5 rounded-full transition-all duration-700 ${done ? "bg-green-500" : active ? "bg-blue-500 animate-pulse" : "bg-zinc-800"}`} />
                    </React.Fragment>
                  )
                })}
              </div>

              {/* Logs */}
              <div className="bg-black border border-zinc-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
                  <Terminal className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Build Logs</span>
                  <div className="ml-auto flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  </div>
                </div>
                <div className="p-4 max-h-52 overflow-y-auto font-mono text-xs text-zinc-400 space-y-1">
                  {logs.length === 0 && <p className="text-zinc-600">Waiting for output…</p>}
                  {logs.map((l, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-zinc-700 select-none">›</span>
                      <span className={l.includes("error") || l.includes("Error") ? "text-red-400" : l.includes("warn") ? "text-yellow-400" : ""}>{l}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>

              {(stage === "deployed" || stage === "failed") && (
                <button
                  onClick={() => { setStage("idle"); setRepoUrl(""); setLogs([]); setDeployId("") }}
                  className="w-full py-3 bg-zinc-800 text-white text-sm font-semibold rounded-xl hover:bg-zinc-700 transition-all"
                >
                  Deploy Another Project
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Project Card ────────────────────────────────────────────────── */
function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all group relative"
    >
      <div className="flex items-start justify-between mb-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${project.status === "deployed" ? "bg-green-500/10" : project.status === "failed" ? "bg-red-500/10" : "bg-blue-500/10"}`}>
          <Globe className={`w-5 h-5 ${project.status === "deployed" ? "text-green-400" : project.status === "failed" ? "text-red-400" : "text-blue-400"}`} />
        </div>

        {/* Context menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-600 hover:text-zinc-300">
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: 1,   y: 0  }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                className="absolute right-0 top-9 z-10 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl py-1 w-40"
                onMouseLeave={() => setMenuOpen(false)}
              >
                {project.url && (
                  <a href={project.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                  </a>
                )}
                <button className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors w-full">
                  <RefreshCw className="w-3.5 h-3.5" /> Redeploy
                </button>
                <button
                  onClick={() => { onDelete(project.id); setMenuOpen(false) }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <h3 className="font-bold text-white text-lg mb-1 truncate">{project.name}</h3>
      {project.repo && <p className="text-xs text-zinc-600 mb-3 truncate font-mono">{project.repo}</p>}

      <div className="flex items-center gap-2 mb-5">
        <div className={`w-2 h-2 rounded-full ${project.status === "deployed" ? "bg-green-500 animate-pulse" : project.status === "failed" ? "bg-red-500" : "bg-blue-500 animate-pulse"}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${project.status === "deployed" ? "text-green-400" : project.status === "failed" ? "text-red-400" : "text-blue-400"}`}>
          {project.status}
        </span>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
        <div className="flex items-center gap-1.5 text-zinc-600">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{project.date}</span>
        </div>
        {project.url && (
          <a href={project.url} target="_blank" rel="noreferrer" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
            Open <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  )
}

/* ─── Main Dashboard ──────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [projects, setProjects]       = useState<Project[]>(DEMO_PROJECTS)
  const [search, setSearch]           = useState("")
  const [showDeploy, setShowDeploy]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/projects`);
      const data = res.data.map((p: any) => ({
        ...p,
        url: p.port
          ? `http://localhost:${p.port}`
          : p.status === 'deployed' ? `${DEPLOY_URL}/${p.id}` : ''
      }));
      setProjects(data);
    } catch (e) {
      console.error("Failed to fetch projects", e);
    }
  };

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 10000);
    return () => clearInterval(interval);
  }, []);

  const filtered = projects.filter(p => {
    const name = p.name || p.id || "";
    return name.toLowerCase().includes(search.toLowerCase());
  })
  const deployedCount = projects.filter(p => p.status === "deployed").length
  const failedCount   = projects.filter(p => p.status === "failed").length

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* ── Sidebar / Top nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/70 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Rocket className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-xl tracking-tight">DeployHub</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDeploy(true)}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(p => !p)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors border border-zinc-800 hover:border-zinc-700"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">
                  {user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="text-sm text-zinc-300 hidden sm:block max-w-[120px] truncate">
                  {user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "User"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1,   y: 0  }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    className="absolute right-0 top-11 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl py-1.5 w-52"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-semibold text-white truncate">{user?.fullName || "User"}</p>
                      <p className="text-xs text-zinc-500 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <div className="border-t border-zinc-800 my-1" />
                      <button
                        onClick={() => signOut({ redirectUrl: "/" })}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto pt-24 pb-20 px-4 sm:px-6">
        {/* ── Welcome & stats ── */}
        <div className="mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl font-extrabold mb-1">
              Welcome back, {user?.firstName || "Developer"} 👋
            </h1>
            <p className="text-zinc-500 text-sm">Here's what's happening with your projects.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8"
          >
            {[
              { label: "Total Projects",  value: projects.length,   icon: <Globe className="w-5 h-5 text-blue-400" />,   color: "border-blue-500/20 bg-blue-500/5"  },
              { label: "Deployed",        value: deployedCount,     icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, color: "border-green-500/20 bg-green-500/5" },
              { label: "Failed",          value: failedCount,       icon: <XCircle className="w-5 h-5 text-red-400" />,   color: "border-red-500/20 bg-red-500/5"   },
              { label: "Deployments",     value: "∞",               icon: <BarChart2 className="w-5 h-5 text-purple-400" />, color: "border-purple-500/20 bg-purple-500/5" },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-5 flex items-center gap-4 ${s.color}`}>
                <div className="shrink-0">{s.icon}</div>
                <div>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <h2 className="text-xl font-bold">Your Projects</h2>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-zinc-600 transition-colors w-full sm:w-60"
              />
            </div>
            <button
              onClick={() => setShowDeploy(true)}
              className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Deploy
            </button>
          </div>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-1">No projects found</p>
            <p className="text-sm">Try a different search or deploy a new project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtered.map(p => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onDelete={id => setProjects(prev => prev.filter(x => x.id !== id))}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* ── Deploy Modal ── */}
      <AnimatePresence>
        {showDeploy && (
          <DeployModal
            onClose={() => setShowDeploy(false)}
            onDeployed={p => setProjects(prev => {
              if (prev.find(x => x.id === p.id)) return prev;
              return [p, ...prev];
            })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
