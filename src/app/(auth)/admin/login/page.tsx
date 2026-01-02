"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Command } from "lucide-react"
import { appConfig } from "@/config/app"

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (err) {
      console.error("Sign in error:", err)
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Google sign-in button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium text-foreground shadow-sm transition-all duration-200 hover:bg-accent hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
      </button>

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">
          {error === "AccessDenied"
            ? "You are not authorized to access this application."
            : "An error occurred during sign in. Please try again."}
        </div>
      )}
    </>
  )
}

function LoginFormFallback() {
  return (
    <button
      disabled
      className="relative flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 text-sm font-medium text-foreground shadow-sm opacity-60"
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
      <span>Loading...</span>
    </button>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Geometric grid background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary/5 via-primary/3 to-transparent blur-3xl" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[380px] px-4">
        <div className="group rounded-2xl border border-border/50 bg-card/80 p-8 shadow-2xl shadow-black/5 backdrop-blur-xl transition-all duration-500 hover:border-border hover:shadow-black/10 dark:shadow-black/20 dark:hover:shadow-black/30">
          {/* Logo and branding */}
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              {/* Animated ring */}
              <div className="absolute inset-0 -m-1 animate-[spin_8s_linear_infinite] rounded-full bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100" />

              {/* Icon container */}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-105">
                <Command className="h-7 w-7" />
              </div>
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {appConfig.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin Console
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">
                Sign in
              </span>
            </div>
          </div>

          {/* Login form with Suspense */}
          <Suspense fallback={<LoginFormFallback />}>
            <LoginForm />
          </Suspense>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access restricted to authorized administrators
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 flex items-center justify-center gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 transition-colors duration-300"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Corner accent */}
      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 bg-gradient-to-tl from-primary/5 to-transparent" />
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 bg-gradient-to-br from-primary/5 to-transparent" />
    </div>
  )
}
