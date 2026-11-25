'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordStrength {
  hasLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasSymbol: boolean
  score: number
}

function checkPasswordStrength(password: string): PasswordStrength {
  const hasLength = password.length >= 12
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const score = [hasLength, hasUpper, hasLower, hasSymbol].filter(Boolean).length

  return { hasLength, hasUpper, hasLower, hasSymbol, score }
}

function PasswordRequirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 text-sm transition-colors ${met ? 'text-[#147A3A]' : 'text-[#9BA0A6]'}`}>
      {met ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )}
      {label}
    </div>
  )
}

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const strength = checkPasswordStrength(password)
  const strengthLevels = ['', 'weak', 'fair', 'good', 'strong']
  const strengthColors = {
    weak: 'bg-[#B42318]',
    fair: 'bg-[#A66A08]',
    good: 'bg-[#5D7D1E]',
    strong: 'bg-[#147A3A]',
  }

  const isFormValid = firstName && lastName && email && strength.score === 4 && acceptTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setIsLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    // Redirect to verify email or onboarding
    if (data.user?.identities?.length === 0) {
      setError('Un compte avec cet email existe deja')
      setIsLoading(false)
      return
    }

    router.push('/auth/verify-email?email=' + encodeURIComponent(email))
  }

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?onboarding=true`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col p-8 max-w-[560px] overflow-y-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-[#17191F] rounded-[10px] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
              <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
              <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-[#0D0F14]">ProspectHub</span>
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-[400px] mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-[28px] font-bold text-[#0D0F14] mb-2">Creer votre compte</h1>
            <p className="text-lg text-[#4E525A]">Commencez a prospecter en 5 minutes</p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border border-[#E2E4E6] rounded-[10px] font-medium text-[#0D0F14] hover:bg-[#F5F7F9] hover:border-[#C9CCD0] transition-colors mb-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            S'inscrire avec Google
          </button>

          <div className="flex items-center gap-4 text-[#9BA0A6] text-sm mb-6">
            <div className="flex-1 h-px bg-[#E2E4E6]" />
            <span>ou</span>
            <div className="flex-1 h-px bg-[#E2E4E6]" />
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[10px] bg-[#FDE8E5] text-[#B42318] text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prenom</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jean"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email professionnel</Label>
              <Input
                id="email"
                type="email"
                placeholder="jean@entreprise.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Creez un mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9BA0A6] hover:text-[#4E525A]"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-sm transition-colors ${
                          i <= strength.score
                            ? strengthColors[strengthLevels[strength.score] as keyof typeof strengthColors]
                            : 'bg-[#E2E4E6]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    <PasswordRequirement met={strength.hasLength} label="12 caracteres minimum" />
                    <PasswordRequirement met={strength.hasUpper} label="Une majuscule" />
                    <PasswordRequirement met={strength.hasLower} label="Une minuscule" />
                    <PasswordRequirement met={strength.hasSymbol} label="Un symbole (!@#$...)" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#C9CCD0] accent-[#17191F]"
                required
              />
              <label htmlFor="terms" className="text-sm text-[#4E525A] leading-relaxed">
                J'accepte les{' '}
                <Link href="/terms" className="text-[#17191F] font-medium hover:underline">
                  Conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-[#17191F] font-medium hover:underline">
                  Politique de confidentialite
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={!isFormValid}
              isLoading={isLoading}
            >
              Creer mon compte
            </Button>
          </form>

          <div className="text-center mt-6 pt-6 border-t border-[#E2E4E6]">
            <p className="text-[#4E525A]">
              Deja un compte ?{' '}
              <Link href="/auth/login" className="text-[#17191F] font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#17191F] to-[#2D3039] items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-[400px] text-white">
          <h3 className="text-2xl font-bold mb-8">Pourquoi ProspectHub?</h3>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Setup en 5 minutes</h4>
                <p className="text-sm text-[#9BA0A6] leading-relaxed">
                  Pas de configuration complexe. Importez vos contacts ou demarrez avec notre base pre-enrichie.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">50 leads gratuits/mois</h4>
                <p className="text-sm text-[#9BA0A6] leading-relaxed">
                  Testez sans engagement. Passez au payant uniquement si ca fonctionne pour vous.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">RGPD compliant</h4>
                <p className="text-sm text-[#9BA0A6] leading-relaxed">
                  Donnees hebergees en France. Votre conformite est notre priorite.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-white/10 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Support reactif</h4>
                <p className="text-sm text-[#9BA0A6] leading-relaxed">
                  Une question? Notre equipe repond en moins de 2h en semaine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
