'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const supabase = createClient()

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when complete
    if (newCode.every((c) => c) && newCode.join('').length === 6) {
      handleVerify(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = [...code]
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newCode[i] = char
    })
    setCode(newCode)

    if (pastedData.length === 6) {
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (codeString: string) => {
    setIsLoading(true)
    setError(null)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: codeString,
      type: 'signup',
    })

    if (verifyError) {
      setError('Code invalide ou expiré. Veuillez réessayer.')
      setIsLoading(false)
      return
    }

    router.push('/onboarding')
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })

    if (error) {
      setError(error.message)
      return
    }

    setResendCooldown(60)
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-[20px] shadow-[0_12px_32px_-4px_rgba(13,15,20,0.12)] p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#17191F] rounded-[10px] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
                <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
                <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#0D0F14]">ProspectHub</span>
          </div>

          {/* Email Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h1 className="text-[23.5px] font-semibold text-[#0D0F14] text-center mb-2">
            Vérifiéz votre email
          </h1>
          <p className="text-sm text-[#4E525A] text-center mb-8">
            Nous avons envoyé un code a 6 chiffres a<br />
            <span className="font-medium text-[#0D0F14]">{email}</span>
          </p>

          {error && (
            <div className="p-3 rounded-[10px] bg-[#FDE8E5] text-[#B42318] text-sm text-center mb-6">
              {error}
            </div>
          )}

          {/* Code Input */}
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-semibold border border-[#E2E4E6] rounded-[10px] focus:outline-none focus:ring-2 focus:ring-[#17191F] focus:border-transparent transition-all"
                disabled={isLoading}
              />
            ))}
          </div>

          <Button
            type="button"
            className="w-full mb-4"
            disabled={code.some((c) => !c) || isLoading}
            isLoading={isLoading}
            onClick={() => handleVerify(code.join(''))}
          >
            Vérifiér
          </Button>

          <p className="text-sm text-[#4E525A] text-center">
            Vous n&apos;avez pas recu le code ?{' '}
            {resendCooldown > 0 ? (
              <span className="text-[#9BA0A6]">Renvoyér dans {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-[#17191F] font-medium hover:underline"
              >
                Renvoyér
              </button>
            )}
          </p>

          <div className="text-center mt-6 pt-6 border-t border-[#E2E4E6]">
            <Link href="/auth/register" className="text-sm text-[#17191F] font-medium hover:underline">
              Modifier l&apos;email
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#17191F] border-t-transparent rounded-full" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
