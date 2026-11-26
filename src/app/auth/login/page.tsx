'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-card rounded-[20px] shadow-[0_12px_32px_-4px_rgba(13,15,20,0.12)] dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.4)] p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#17191F] rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff"/>
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2"/>
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2"/>
              </svg>
            </div>
            <span className="text-xl font-semibold text-foreground">ProspectHub</span>
          </div>

          <h1 className="text-[23.5px] font-semibold text-foreground text-center mb-2">
            Connexion
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            Entrez vos identifiants pour acceder a votre compte
          </p>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full mb-6"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            Continuer avec Google
          </Button>

          <div className="flex items-center gap-4 text-muted-foreground text-sm mb-6">
            <div className="flex-1 h-px bg-border" />
            <span>ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[10px] bg-[#FDE8E5] text-[#B42318] text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@entreprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="mb-0">Mot de passe</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-foreground hover:underline"
                >
                  Mot de passe oublie ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Se connecter
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Pas encore de compte ?{' '}
            <Link href="/auth/register" className="text-foreground font-medium hover:underline">
              Creer un compte
            </Link>
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          En vous connectant, vous acceptez nos{' '}
          <Link href="/terms" className="underline">CGU</Link>
          {' '}et notre{' '}
          <Link href="/privacy" className="underline">Politique de confidentialite</Link>
        </p>
      </div>
    </div>
  )
}
