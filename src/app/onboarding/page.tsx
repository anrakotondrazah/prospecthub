'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OnboardingStep } from '@/components/onboarding/OnboardingStep'
import { ProgressBar } from '@/components/onboarding/ProgressBar'

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

const REGIONS = [
  { id: 'ile-de-france', label: 'Ile-de-France' },
  { id: 'auvergne-rhone-alpes', label: 'Auvergne-Rhone-Alpes' },
  { id: 'nouvelle-aquitaine', label: 'Nouvelle-Aquitaine' },
  { id: 'occitanie', label: 'Occitanie' },
  { id: 'hauts-de-france', label: 'Hauts-de-France' },
  { id: 'grand-est', label: 'Grand Est' },
  { id: 'provence-alpes-cote-azur', label: 'Provence-Alpes-Cote d\'Azur' },
  { id: 'bretagne', label: 'Bretagne' },
  { id: 'pays-de-la-loire', label: 'Pays de la Loire' },
  { id: 'normandie', label: 'Normandie' },
  { id: 'bourgogne-franche-comte', label: 'Bourgogne-Franche-Comte' },
  { id: 'centre-val-de-loire', label: 'Centre-Val de Loire' },
  { id: 'corse', label: 'Corse' },
]

const COMPANY_SIZES = [
  { id: '1-10', label: '1-10 employes' },
  { id: '11-50', label: '11-50 employes' },
  { id: '51-200', label: '51-200 employes' },
  { id: '201-500', label: '201-500 employes' },
  { id: '501-1000', label: '501-1000 employes' },
  { id: '1000+', label: '1000+ employes' },
]

const EMAIL_TEMPLATES = [
  {
    id: 'intro',
    name: 'Introduction simple',
    subject: 'Bonjour {{prenom}}',
    preview: 'Bonjour {{prenom}},\n\nJe me permets de vous contacter car...'
  },
  {
    id: 'value',
    name: 'Proposition de valeur',
    subject: '{{entreprise}} : augmentez votre chiffre d\'affaires',
    preview: 'Bonjour {{prenom}},\n\nNous aidons des entreprises comme {{entreprise}} a...'
  },
  {
    id: 'question',
    name: 'Question ouverte',
    subject: 'Question rapide pour {{entreprise}}',
    preview: 'Bonjour {{prenom}},\n\nAvez-vous deja envisage de...'
  },
]

type Step = 1 | 2 | 3 | 4

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [companyName, setCompanyName] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [companySize, setCompanySize] = useState('')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [revealedLead, setRevealedLead] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [showCelebration, setShowCelebration] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isSubmittingRef = useRef(false)
  const router = useRouter()
  const supabase = createClient()

  // Mock leads data pour l'étape 3
  const mockLeads = [
    { id: 1, name: 'TechCorp Solutions', sector: 'Technologie', region: 'Ile-de-France', employees: '50-200' },
    { id: 2, name: 'Conseil Plus', sector: 'Conseil', region: 'Auvergne-Rhone-Alpes', employees: '11-50' },
    { id: 3, name: 'Marketing Pro', sector: 'Marketing', region: 'Nouvelle-Aquitaine', employees: '1-10' },
  ]

  // Celebration après révélation du lead
  useEffect(() => {
    if (revealedLead && !showCelebration) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [revealedLead, showCelebration])

  const toggleIndustry = (id: string) => {
    setSelectedIndustries(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleRegion = (id: string) => {
    setSelectedRegions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const handleRevealLead = () => {
    setRevealedLead(true)
  }

  const handleSendEmail = () => {
    // Logique d'envoi d'email
    router.push('/dashboard')
  }

  const handleSkipEmail = () => {
    router.push('/dashboard')
  }

  const saveOnboardingData = () => {
    // Sauvegarde dans localStorage
    const onboardingData = {
      companyName,
      selectedIndustries,
      companySize,
      selectedRegions,
      completedAt: new Date().toISOString(),
    }
    localStorage.setItem('onboarding_data', JSON.stringify(onboardingData))
  }

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
          industry: selectedIndustries[0] || 'other',
          company_size: companySize as '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+',
        })
        .select()
        .single()

      if (orgError) {
        setError('Erreur lors de la creation de l\'organisation. Veuillez reessayer.')
        setIsLoading(false)
        isSubmittingRef.current = false
        return
      }

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: org.id,
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

      saveOnboardingData()
      router.push('/dashboard')
    } catch (err) {
      console.error('Erreur onboarding completion:', err)
      setError('Une erreur inattendue s\'est produite. Veuillez reessayer.')
    } finally {
      setIsLoading(false)
      isSubmittingRef.current = false
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingStep
            step={1}
            title="Bienvenue! Configurons votre espace en 2 minutes."
            description="Parlez-nous de votre activite pour personnaliser vos suggestions."
          >
            {error && (
              <div className="p-3 mb-6 rounded-[10px] bg-[#FDE8E5] text-[#B42318] text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5 max-w-md mx-auto">
              <div>
                <Label htmlFor="companyName">Nom de votre entreprise</Label>
                <Input
                  id="companyName"
                  placeholder="Ma Societe SAS"
                  value={companyName}
                  onChange={(e) => { setCompanyName(e.target.value); setError(null) }}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Secteur d&apos;activite</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {INDUSTRIES.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleIndustry(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-[10px] border-2 transition-all text-left ${
                        selectedIndustries.includes(item.id)
                          ? 'border-[#17191F] bg-[#F5F7F9]'
                          : 'border-[#E2E4E6] hover:border-[#C9CCD0]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-[8px] bg-white flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#17191F" strokeWidth="2">
                          <path d={item.icon} />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-[#0D0F14]">{item.label}</span>
                      {selectedIndustries.includes(item.id) && (
                        <svg className="ml-auto w-5 h-5 text-[#147A3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
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
            </div>

            <div className="flex justify-center mt-8">
              <Button
                onClick={() => setStep(2)}
                disabled={!companyName || selectedIndustries.length === 0 || !companySize}
                className="px-8"
              >
                Continuer
              </Button>
            </div>
          </OnboardingStep>
        )

      case 2:
        return (
          <OnboardingStep
            step={2}
            title="Qui prospectez-vous?"
            description="Selectionnez vos secteurs et zones pour des leads pertinents."
          >
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Secteurs cibles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleIndustry(item.id)}
                      className={`p-3 rounded-[10px] border text-sm transition-all text-left ${
                        selectedIndustries.includes(item.id)
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
                <Label className="text-base font-semibold mb-3 block">Regions cibles</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {REGIONS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleRegion(item.id)}
                      className={`p-3 rounded-[10px] border text-sm transition-all ${
                        selectedRegions.includes(item.id)
                          ? 'border-[#17191F] bg-[#F5F7F9] font-medium'
                          : 'border-[#E2E4E6] hover:border-[#C9CCD0]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <Button variant="outline" onClick={() => setStep(1)}>
                Retour
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedIndustries.length === 0 || selectedRegions.length === 0}
                className="px-8"
              >
                Continuer
              </Button>
            </div>
          </OnboardingStep>
        )

      case 3:
        return (
          <OnboardingStep
            step={3}
            title="Votre premier lead vous attend!"
            description={`Voici ${mockLeads.length} entreprises qui correspondent. Revelez-en une pour tester.`}
          >
            {showCelebration && (
              <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {mockLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-5 rounded-[12px] border-2 border-[#E2E4E6] bg-white hover:border-[#C9CCD0] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-[10px] bg-[#F5F7F9] flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#17191F" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      </svg>
                    </div>
                    <span className="text-xs bg-[#E8F5E9] text-[#147A3A] px-2 py-1 rounded-full font-medium">
                      Verifie
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0D0F14] mb-2">{lead.name}</h3>
                  <div className="space-y-1 text-sm text-[#4E525A]">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      </svg>
                      {lead.region}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      </svg>
                      {lead.employees} employes
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!revealedLead ? (
              <div className="text-center">
                <Button onClick={handleRevealLead} size="lg" className="px-10">
                  Reveler un lead
                </Button>
                <p className="text-sm text-[#9BA0A6] mt-3">1 credit sera utilise</p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="p-4 rounded-[12px] bg-[#E8F5E9] text-[#147A3A] font-medium">
                  Lead revele! Vous pouvez maintenant voir toutes les coordonnees.
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Retour
                  </Button>
                  <Button onClick={() => setStep(4)} className="px-8">
                    Passer a l&apos;email
                  </Button>
                </div>
              </div>
            )}

            {!revealedLead && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="text-sm text-[#9BA0A6] hover:text-[#4E525A] transition-colors"
                >
                  Passer cette etape
                </button>
              </div>
            )}
          </OnboardingStep>
        )

      case 4:
        return (
          <OnboardingStep
            step={4}
            title="Pret a contacter?"
            description="Choisissez un modele et envoyez votre premier email."
          >
            <div className="space-y-4 mb-8">
              {EMAIL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full text-left p-5 rounded-[12px] border-2 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-[#17191F] bg-[#F5F7F9]'
                      : 'border-[#E2E4E6] hover:border-[#C9CCD0]'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-[#0D0F14]">{template.name}</h4>
                    {selectedTemplate === template.id && (
                      <svg className="w-5 h-5 text-[#147A3A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-[#4E525A] mb-2">Objet: {template.subject}</p>
                  <p className="text-xs text-[#9BA0A6] whitespace-pre-line">{template.preview}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleSkipEmail}>
                Plus tard
              </Button>
              <Button
                onClick={handleSendEmail}
                disabled={!selectedTemplate || isLoading}
                isLoading={isLoading}
                className="px-8"
              >
                Envoyer
              </Button>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={handleComplete}
                className="text-sm text-[#9BA0A6] hover:text-[#4E525A] transition-colors"
              >
                Terminer plus tard
              </button>
            </div>
          </OnboardingStep>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col">
      {/* Logo */}
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

      {/* Progress Bar */}
      <ProgressBar currentStep={step} />

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full">
          {renderStep()}
        </div>
      </div>

      {/* Footer info */}
      <div className="text-center pb-8 text-sm text-[#9BA0A6]">
        Etape {step} sur 4
      </div>
    </div>
  )
}
