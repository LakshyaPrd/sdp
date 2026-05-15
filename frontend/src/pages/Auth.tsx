import { SignUp, SignIn } from "@clerk/clerk-react"
import { Rocket } from "lucide-react"
import { Link } from "react-router-dom"

const clerkAppearance = {
  layout: {
    logoPlacement: "none" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#ffffff",
    colorBackground: "#18181b",
    colorInputBackground: "#27272a",
    colorInputText: "#f4f4f5",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    colorDanger: "#f87171",
    colorSuccess: "#4ade80",
    borderRadius: "0.75rem",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  elements: {
    rootBox: "w-full",
    card: "bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50 rounded-2xl",
    headerTitle: "text-white text-2xl font-bold",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButton: "bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 hover:border-zinc-600 transition-all rounded-xl",
    socialButtonsBlockButtonText: "font-semibold",
    dividerLine: "bg-zinc-800",
    dividerText: "text-zinc-500 text-xs",
    formFieldLabel: "text-zinc-400 text-sm font-medium",
    formFieldInput: "bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 rounded-xl focus:border-white focus:ring-1 focus:ring-white transition-all",
    formButtonPrimary: "bg-white text-black font-bold hover:bg-zinc-100 rounded-xl transition-all shadow-lg",
    footerActionLink: "text-blue-400 hover:text-blue-300 font-semibold",
    footerActionText: "text-zinc-500",
    identityPreviewText: "text-white",
    identityPreviewEditButtonIcon: "text-zinc-400",
    otpCodeFieldInput: "bg-zinc-800 border-zinc-700 text-white",
    formResendCodeLink: "text-blue-400 hover:text-blue-300",
    alertText: "text-red-300",
    badge: "bg-zinc-800 text-zinc-300 border-zinc-700",
  },
}

export function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start deploying in seconds. No credit card required."
      altText="Already have an account?"
      altLink="/signin"
      altLinkText="Sign in"
    >
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/signin"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  )
}

export function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your deployments."
      altText="Don't have an account?"
      altLink="/signup"
      altLinkText="Sign up free"
    >
      <SignIn
        routing="path"
        path="/signin"
        signUpUrl="/signup"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthLayout>
  )
}

function AuthLayout({
  children,
  title,
  subtitle,
  altText,
  altLink,
  altLinkText,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  altText: string
  altLink: string
  altLinkText: string
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-900 border-r border-zinc-800 p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Rocket className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">DeployHub</span>
        </Link>

        <div>
          <blockquote className="text-xl font-medium text-white leading-relaxed mb-4">
            "Deploying used to take hours of setup. With DeployHub it takes seconds — just push and it's live."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
              RK
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Rahul Kumar</p>
              <p className="text-zinc-500 text-xs">Senior Developer @ TechCorp</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span>© 2026 DeployHub</span>
          <span>·</span>
          <span>SDP Major Project</span>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-zinc-950">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Rocket className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-xl text-white">DeployHub</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            <p className="text-zinc-500">{subtitle}</p>
          </div>
          {children}
          <p className="text-center text-zinc-500 text-sm mt-4">
            {altText}{" "}
            <Link to={altLink} className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              {altLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
