import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react"
import { Link } from "react-router-dom"
import { Rocket, LayoutDashboard } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Rocket className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">DeployHub</span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/" className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/80 px-3 py-1.5 rounded-lg transition-all">Home</Link>
          <a href="#features" className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/80 px-3 py-1.5 rounded-lg transition-all">Features</a>
          <a href="#about" className="text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/80 px-3 py-1.5 rounded-lg transition-all">About</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              }
            }} />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <button className="text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-full transition-all border border-zinc-700 hover:border-zinc-600">
                Sign In
              </button>
            </SignInButton>
            <Link to="/signup">
              <button className="text-sm font-bold text-black bg-white hover:bg-zinc-100 px-4 py-2 rounded-full transition-all shadow-md">
                Get Started
              </button>
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}
