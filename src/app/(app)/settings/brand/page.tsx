'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface BrandSettings {
  logo_url: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
}

const DEFAULT_COLORS = {
  primary: '#0066FF',
  secondary: '#17191F',
  accent: '#16A34A',
}

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Par defaut)' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
]

export default function BrandSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [organizationId, setOrganizationId] = useState<number | null>(null)

  const [brandSettings, setBrandSettings] = useState<BrandSettings>({
    logo_url: null,
    primary_color: DEFAULT_COLORS.primary,
    secondary_color: DEFAULT_COLORS.secondary,
    accent_color: DEFAULT_COLORS.accent,
    font_family: 'Inter',
  })

  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadBrandSettings() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        if (!profile?.organization_id) return
        setOrganizationId(profile.organization_id)

        const { data: org } = await supabase
          .from('organizations')
          .select('logo_url, settings')
          .eq('id', profile.organization_id)
          .single()

        if (org) {
          const settings = org.settings as Record<string, unknown> || {}
          setBrandSettings({
            logo_url: org.logo_url || null,
            primary_color: (settings.brand_primary_color as string) || DEFAULT_COLORS.primary,
            secondary_color: (settings.brand_secondary_color as string) || DEFAULT_COLORS.secondary,
            accent_color: (settings.brand_accent_color as string) || DEFAULT_COLORS.accent,
            font_family: (settings.brand_font_family as string) || 'Inter',
          })
        }
      } catch (error) {
        console.error('Error loading brand settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadBrandSettings()
  }, [])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !organizationId) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Seules les images sont acceptees' })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image trop volumineuse (max 2 Mo)' })
      return
    }

    setIsUploadingLogo(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const fileExt = file.name.split('.').pop()
      const fileName = `${organizationId}/logo_${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, { cacheControl: '3600', upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path)

      const { error: updateError } = await supabase
        .from('organizations')
        .update({ logo_url: publicUrl })
        .eq('id', organizationId)

      if (updateError) throw updateError

      setBrandSettings(prev => ({ ...prev, logo_url: publicUrl }))
      setMessage({ type: 'success', text: 'Logo mis a jour' })
    } catch (error) {
      console.error('Logo upload error:', error)
      setMessage({ type: 'error', text: 'Erreur lors du telechargement' })
    } finally {
      setIsUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    if (!organizationId) return

    setIsUploadingLogo(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('organizations')
        .update({ logo_url: null })
        .eq('id', organizationId)

      if (error) throw error

      setBrandSettings(prev => ({ ...prev, logo_url: null }))
      setMessage({ type: 'success', text: 'Logo supprime' })
    } catch (error) {
      console.error('Remove logo error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleSaveColors = async () => {
    if (!organizationId) return

    setIsSaving(true)
    setMessage(null)

    try {
      const supabase = createClient()

      const { data: org, error: readError } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single()

      if (readError) {
        console.error('Error reading settings:', readError)
        setMessage({ type: 'error', text: 'Erreur de lecture des parametres' })
        setIsSaving(false)
        return
      }

      const currentSettings = (org?.settings as Record<string, unknown>) || {}

      const { error } = await supabase
        .from('organizations')
        .update({
          settings: {
            ...currentSettings,
            brand_primary_color: brandSettings.primary_color,
            brand_secondary_color: brandSettings.secondary_color,
            brand_accent_color: brandSettings.accent_color,
            brand_font_family: brandSettings.font_family,
          },
        })
        .eq('id', organizationId)

      if (error) throw error

      setMessage({ type: 'success', text: 'Parametres sauvegardes' })
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const resetToDefaults = () => {
    setBrandSettings(prev => ({
      ...prev,
      primary_color: DEFAULT_COLORS.primary,
      secondary_color: DEFAULT_COLORS.secondary,
      accent_color: DEFAULT_COLORS.accent,
      font_family: 'Inter',
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[#4E525A] dark:text-[#8B949E] mb-2">
          <Link href="/settings" className="hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-colors">
            Parametres
          </Link>
          <span>/</span>
          <span className="text-[#0D0F14] dark:text-[#E6EDF3]">Identite de marque</span>
        </div>
        <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
          Identite de marque
        </h1>
        <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
          Personnalisez l'apparence de votre espace
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-[#E8F5E9] dark:bg-[#147A3A]/20 text-[#147A3A] dark:text-[#4ADE80]'
            : 'bg-[#FDE8E5] dark:bg-[#B42318]/20 text-[#B42318] dark:text-[#F87171]'
        }`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {message.type === 'success' ? (
              <polyline points="20 6 9 17 4 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Logo</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {brandSettings.logo_url ? (
                  <img
                    src={brandSettings.logo_url}
                    alt="Logo"
                    className="w-24 h-24 rounded-xl object-contain border border-[#E2E4E6] dark:border-[#30363D] bg-[#F5F7F9] dark:bg-[#0D1117]"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#E2E4E6] dark:border-[#30363D] flex items-center justify-center bg-[#F5F7F9] dark:bg-[#0D1117]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9BA0A6" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="px-4 py-2 text-sm font-medium text-[#0066FF] border border-[#0066FF] rounded-xl hover:bg-[#0066FF]/5 transition-colors disabled:opacity-50"
                  >
                    {isUploadingLogo ? 'Telechargement...' : 'Changer le logo'}
                  </button>
                  {brandSettings.logo_url && (
                    <button
                      onClick={handleRemoveLogo}
                      disabled={isUploadingLogo}
                      className="px-4 py-2 text-sm font-medium text-[#B42318] hover:bg-[#FDE8E5] rounded-xl transition-colors disabled:opacity-50"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
                <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
                  PNG, JPG ou SVG. Recommande: 200x200px
                </p>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">Couleurs</h2>
              <button
                onClick={resetToDefaults}
                className="text-xs text-[#4E525A] dark:text-[#8B949E] hover:text-[#0066FF] transition-colors"
              >
                Reinitialiser
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                  Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandSettings.primary_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-[#E2E4E6] dark:border-[#30363D] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandSettings.primary_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="flex-1 h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-lg text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3] uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandSettings.secondary_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-[#E2E4E6] dark:border-[#30363D] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandSettings.secondary_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="flex-1 h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-lg text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3] uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                  Couleur d'accent
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandSettings.accent_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-10 h-10 rounded-lg border border-[#E2E4E6] dark:border-[#30363D] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={brandSettings.accent_color}
                    onChange={(e) => setBrandSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="flex-1 h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-lg text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3] uppercase"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Typographie</h2>
            <div>
              <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Police de caracteres
              </label>
              <select
                value={brandSettings.font_family}
                onChange={(e) => setBrandSettings(prev => ({ ...prev, font_family: e.target.value }))}
                className="w-full max-w-xs h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-lg text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3]"
              >
                {FONT_OPTIONS.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSaveColors}
              disabled={isSaving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] rounded-xl transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Apercu</h2>
            <div
              className="p-4 rounded-xl border border-[#E2E4E6] dark:border-[#30363D]"
              style={{ fontFamily: brandSettings.font_family }}
            >
              <div className="flex items-center gap-3 mb-4">
                {brandSettings.logo_url ? (
                  <img src={brandSettings.logo_url} alt="Logo" className="w-8 h-8 rounded object-contain" />
                ) : (
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: brandSettings.primary_color }}
                  >
                    P
                  </div>
                )}
                <span className="font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">ProspectHub</span>
              </div>
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: brandSettings.primary_color }}
                >
                  Bouton principal
                </button>
                <button
                  className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: brandSettings.secondary_color }}
                >
                  Bouton secondaire
                </button>
                <div
                  className="px-3 py-1 text-xs font-medium text-white rounded-full inline-block"
                  style={{ backgroundColor: brandSettings.accent_color }}
                >
                  Badge accent
                </div>
              </div>
            </div>
          </div>

          {/* Brand Voice (Placeholder) */}
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-6">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Voix de marque</h2>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
              Generez automatiquement le ton de vos communications
            </p>
            <button
              className="w-full px-4 py-2 text-sm font-medium text-[#9BA0A6] border border-[#E2E4E6] dark:border-[#30363D] rounded-xl cursor-not-allowed"
              disabled
              title="Bientot disponible"
            >
              Generer avec l'IA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
