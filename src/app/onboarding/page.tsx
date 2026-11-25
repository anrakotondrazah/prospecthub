'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const INDUSTRIES = [
  { id: 'tech', label: 'Technologie / SaaS', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { id: 'consulting', label: 'Conseil / Services', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
  { id: 'marketing', label: 'Marketing / Communication', icon: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z' },
  { id: 'finance', label: 'Finance / Assurance', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { id: 'construction', label: 'BTP / Construction', icon: 'M2 20h20M5 20V8h3v12M10 20V4h4v16M18 20v-6h3v6' },
  { id: 'energy', label: 'Energie / Environnement', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'health', label: 'Sante / Pharma', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
  { id: 'retail', label: 'Commerce / Distribution', icon: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' },
  { id: 'other', label: 'Autre secteur', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z' },
]

const ROLES = [
  { id: 'founder', label: 'Fondateur / CEO' },
  { id: 'sales', label: 'Commercial / Business Dev' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'operations', label: 'Operations' },
  { id: 'consultant', label: 'Consultant' },
  { id: 'other', label: 'Autre' },
]

const COMPANY_SIZES = [
  { id: '1-10', label: '1-10 employes' },
  { id: '11-50', label: '11-50 employes' },
  { id: '51-200', label: '51-200 employes' },
  { id: '201-500', label: '201-500 employes' },
  { id: '501-1000', label: '501-1000 employes' },
  { id: '1000+', label: '1000+ employes' },
]

type Step = 'welcome' | 'industry' | 'role' | 'company' | 'setup'

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [industry, setIndustry] = useState('')
  const [role, setRole] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [website, setWebsite] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [setupProgress, setSetupProgress] = useState(0)
  const isSubmittingRef = useRef(false)
  const router = useRouter()
  const supabase = createClient()

  const steps: Step[] = ['welcome', 'industry', 'role', 'company', 'setup']
  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100

  useEffect(() => {
    if (step === 'setup') {
      const interval = setInterval(() => {
        setSetupProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => router.push('/dashboard'), 500)
            return 100
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(interval)
    }
  }, [step, router])

  const handleComplete = async () => {
    if (isSubmittingRef.current || isLoading) return
    isSubmittingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user already has an organization
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (existingProfile?.organization_id) {
        router.push('/dashboard')
        return
      }

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          uuid: crypto.randomUUID(),
          name: companyName,
          industry,
          company_size: companySize as '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+',
          website: website || null,
        })
        .select()
        .single()

      if (orgError) {
        setError('Erreur lors de la creation de l\'organisation. Veuillez reessayer.')
        setIsLoading(false)
        isSubmittingRef.current = false
        return
      }

      // Update user profile with organization link
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
          job_title: role,
          onboarding_completed: true,
        })
        .eq('id', user.id)
        .select()

      if (profileError) {
        setError('Erreur lors de la mise a jour du profil. Veuillez reessayer.')
        setIsLoading(false)
        isSubmittingRef.current = false
        return
      }

      setStep('setup')
    } catch {
      setError('Une erreur inattendue s\'est produite. Veuillez reessayer.')
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#E8F5E9] flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-[#0D0F14] mb-3">
              Bienvenue sur ProspectHub
            </h1>
            <p className="text-lg text-[#4E525A] mb-8 max-w-md mx-auto">
              Configurons votre espace de travail en quelques etapes rapides.
            </p>
            <Button onClick={() => setStep('industry')} className="px-8">
              Commencer
            </Button>
          </div>
        )

      case 'industry':
        return (
          <div>
            <h1 className="text-[28px] font-bold text-[#0D0F14] mb-2 text-center">
              Quel est votre secteur?
            </h1>
            <p className="text-[#4E525A] mb-8 text-center">
              Cela nous aide a personnaliser votre experience
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              {INDUSTRIES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setIndustry(item.id)}
                  className={`flex items-center gap-4 p-4 rounded-[12px] border-2 transition-all text-left ${
                    industry === item.id
                      ? 'border-[#17191F] bg-[#F5F7F9]'
                      : 'border-[#E2E4E6] hover:border-[#C9CCD0]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17191F" strokeWidth="2">
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <span className="font-medium text-[#0D0F14]">{item.label}</span>
                  {industry === item.id && (
                    <svg className="ml-auto w-5 h-5 text-[#147A3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Button onClick={() => setStep('role')} disabled={!industry} className="px-8">
                Continuer
              </Button>
            </div>
          </div>
        )

      case 'role':
        return (
          <div>
            <h1 className="text-[28px] font-bold text-[#0D0F14] mb-2 text-center">
              Quel est votre role?
            </h1>
            <p className="text-[#4E525A] mb-8 text-center">
              Pour adapter l&apos;interface a vos besoins
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {ROLES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setRole(item.id)}
                  className={`p-4 rounded-[12px] border-2 transition-all text-center ${
                    role === item.id
                      ? 'border-[#17191F] bg-[#F5F7F9]'
                      : 'border-[#E2E4E6] hover:border-[#C9CCD0]'
                  }`}
                >
                  <span className="font-medium text-[#0D0F14]">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center gap-3 mt-8">
              <Button variant="outline" onClick={() => setStep('industry')}>
                Retour
              </Button>
              <Button onClick={() => setStep('company')} disabled={!role} className="px-8">
                Continuer
              </Button>
            </div>
          </div>
        )

      case 'company':
        return (
          <div className="max-w-md mx-auto">
            <h1 className="text-[28px] font-bold text-[#0D0F14] mb-2 text-center">
              Votre entreprise
            </h1>
            <p className="text-[#4E525A] mb-8 text-center">
              Derniere etape avant de commencer
            </p>

            {error && (
              <div className="p-3 mb-6 rounded-[10px] bg-[#FDE8E5] text-[#B42318] text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
                <Input
                  id="companyName"
                  placeholder="Ma Societe SAS"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setError(null) }}
                />
              </div>

              <div>
                <Label>Taille de l&apos;equipe</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {COMPANY_SIZES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { setCompanySize(item.id); setError(null) }}
                      className={`p-3 rounded-[10px] border text-sm transition-all ${
                        companySize === item.id
                          ? 'border-[#17191F] bg-[#F5F7F9] font-medium'
                          : 'border-[#E2E4E6] hover:border-[#C9CCD0]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="website">Site web (optionnel)</Label>
                <Input
                  id="website"
                  placeholder="https://www.entreprise.fr"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <Button variant="outline" onClick={() => setStep('role')} disabled={isLoading}>
                Retour
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!companyName || !companySize || isLoading}
                isLoading={isLoading}
                className="px-8"
              >
                Terminer
              </Button>
            </div>
          </div>
        )

      case 'setup':
        return (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#17191F] flex items-center justify-center">
              <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            <h1 className="text-[28px] font-bold text-[#0D0F14] mb-3">
              Preparation de votre espace...
            </h1>
            <p className="text-[#4E525A] mb-8">
              Nous configurons tout pour vous
            </p>
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-[#E2E4E6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#17191F] transition-all duration-100"
                  style={{ width: `${setupProgress}%` }}
                />
              </div>
              <p className="text-sm text-[#9BA0A6] mt-2">{setupProgress}%</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col">
      {step !== 'welcome' && step !== 'setup' && (
        <div className="h-1 bg-[#E2E4E6]">
          <div
            className="h-full bg-[#17191F] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-center justify-center gap-3 pt-8 pb-4">
        <div className="w-10 h-10 bg-[#17191F] rounded-[10px] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#fff" />
            <path d="M2 17l10 5 10-5" stroke="#fff" strokeWidth="2" />
            <path d="M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" />
          </svg>
        </div>
        <span className="text-xl font-semibold text-[#0D0F14]">ProspectHub</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
