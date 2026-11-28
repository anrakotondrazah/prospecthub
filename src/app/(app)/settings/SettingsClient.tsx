'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { TabBar } from '@/components/ui/TabBar'
import { LogoutButton, AnimatedCheckbox, SaveButton } from '@/components/ui/buttons'
import { createClient } from '@/lib/supabase/client'

interface SettingsClientProps {
  fullName: string
  email: string
  initials: string
  firstName: string
  lastName: string
  orgName: string
  orgIndustry: string
  children: ReactNode // ThemeSettings
}

export function SettingsClient({
  fullName,
  email,
  initials,
  firstName,
  lastName,
  orgName,
  orgIndustry,
  children,
}: SettingsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewLead: true,
    emailWeeklyReport: false,
    emailTaskReminder: true,
    browserNotifications: false,
  })

  // Load preferences on mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch('/api/settings/preferences')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.settings?.notifications) {
            setNotifications({
              emailNewLead: data.settings.notifications.email_new_lead ?? true,
              emailWeeklyReport: data.settings.notifications.email_weekly_report ?? false,
              emailTaskReminder: data.settings.notifications.email_task_reminder ?? true,
              browserNotifications: data.settings.notifications.browser ?? false,
            })
          }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error)
      }
    }
    loadPreferences()
  }, [])

  const tabs = [
    {
      id: 'profile',
      label: 'Profil',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Securite',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: 'account',
      label: 'Compte',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setIsLoggingOut(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsSaving(true)
    setSaveMessage(null)
    try {
      const response = await fetch('/api/settings/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: {
            email_new_lead: notifications.emailNewLead,
            email_weekly_report: notifications.emailWeeklyReport,
            email_task_reminder: notifications.emailTaskReminder,
            browser: notifications.browserNotifications,
          },
        }),
      })
      const data = await response.json()
      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Preferences enregistrees' })
      } else {
        setSaveMessage({ type: 'error', text: data.message || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caracteres' })
      return
    }

    setIsChangingPassword(true)
    setPasswordMessage(null)
    try {
      const response = await fetch('/api/settings/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPasswordMessage({ type: 'success', text: 'Mot de passe modifie avec succes' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: data.message || 'Erreur lors du changement' })
      }
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordMessage({ type: 'error', text: 'Erreur de connexion' })
    } finally {
      setIsChangingPassword(false)
      setTimeout(() => setPasswordMessage(null), 5000)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">Paramètres</h1>
        <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
          Gérez votre compte et vos preferences
        </p>
      </div>

      {/* TabBar Navigation */}
      <div className="mb-6">
        <TabBar
          tabs={tabs}
          defaultTab="profile"
          onChange={setActiveTab}
          variant="pill"
          className="max-w-md"
        />
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Profil</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 lg:w-16 h-14 lg:h-16 rounded-full bg-[#17191F] dark:bg-[#58A6FF] flex items-center justify-center text-white text-lg lg:text-xl font-semibold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">{fullName}</p>
                    <p className="text-sm text-[#4E525A] dark:text-[#8B949E] truncate">{email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Prenom</label>
                    <input
                      id="firstName"
                      type="text"
                      defaultValue={firstName}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                      disabled
                      aria-describedby="firstName-hint"
                    />
                    <p id="firstName-hint" className="sr-only">Modification non disponible</p>
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Nom</label>
                    <input
                      id="lastName"
                      type="text"
                      defaultValue={lastName}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                      disabled
                      aria-describedby="lastName-hint"
                    />
                    <p id="lastName-hint" className="sr-only">Modification non disponible</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Organisation</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="orgName" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Nom</label>
                    <input
                      id="orgName"
                      type="text"
                      defaultValue={orgName}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="orgIndustry" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Secteur</label>
                    <input
                      id="orgIndustry"
                      type="text"
                      defaultValue={orgIndustry}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-[#F5F7F9] dark:bg-[#0D1117] text-[#9BA0A6] dark:text-[#8B949E] cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <>
              {/* ThemeSettings passed as children */}
              {children}

              {/* Notifications */}
              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">Notifications</h2>
                  <div className="flex items-center gap-3">
                    {saveMessage && (
                      <span className={`text-sm ${saveMessage.type === 'success' ? 'text-[#147A3A]' : 'text-[#B42318]'}`}>
                        {saveMessage.text}
                      </span>
                    )}
                    <SaveButton onClick={handleSaveNotifications} disabled={isSaving}>
                      {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </SaveButton>
                  </div>
                </div>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-6">
                  Configurez vos preferences de notification
                </p>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Nouveaux leads</p>
                      <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">Recevez un email pour chaque nouveau lead</p>
                    </div>
                    <AnimatedCheckbox
                      id="notif-new-lead"
                      checked={notifications.emailNewLead}
                      onChange={(checked) => setNotifications(prev => ({ ...prev, emailNewLead: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Rapport hebdomadaire</p>
                      <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">Résumé de votre activité chaque lundi</p>
                    </div>
                    <AnimatedCheckbox
                      id="notif-weekly"
                      checked={notifications.emailWeeklyReport}
                      onChange={(checked) => setNotifications(prev => ({ ...prev, emailWeeklyReport: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Rappels de taches</p>
                      <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">Notifications pour les taches a venir</p>
                    </div>
                    <AnimatedCheckbox
                      id="notif-tasks"
                      checked={notifications.emailTaskReminder}
                      onChange={(checked) => setNotifications(prev => ({ ...prev, emailTaskReminder: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Notifications navigateur</p>
                      <p className="text-xs text-[#4E525A] dark:text-[#8B949E]">Alertes en temps réel dans votre navigateur</p>
                    </div>
                    <AnimatedCheckbox
                      id="notif-browser"
                      checked={notifications.browserNotifications}
                      onChange={(checked) => setNotifications(prev => ({ ...prev, browserNotifications: checked }))}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <>
              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Changer le mot de passe</h2>
                {passwordMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    passwordMessage.type === 'success'
                      ? 'bg-[#E8F5E9] text-[#147A3A] dark:bg-[#147A3A]/20 dark:text-[#4ADE80]'
                      : 'bg-red-50 text-[#B42318] dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                      Mot de passe actuel
                    </label>
                    <input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                      autoComplete="current-password"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                      Nouveau mot de passe
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                      autoComplete="new-password"
                      minLength={8}
                    />
                    <p className="mt-1 text-xs text-[#9BA0A6] dark:text-[#8B949E]">Minimum 8 caracteres</p>
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                      Confirmer le mot de passe
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#E2E4E6] dark:border-[#30363D] rounded-[10px] text-sm bg-white dark:bg-[#0D1117] text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                      autoComplete="new-password"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="h-10 px-4 text-sm font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Authentification a deux facteurs</h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  Renforcez la securite de votre compte avec la verification en deux etapes.
                </p>
                <div className="flex items-center justify-between p-4 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF3E0] dark:bg-[#E65100]/20 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E65100" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">2FA non active</p>
                      <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Application TOTP recommandee</p>
                    </div>
                  </div>
                  <button
                    className="h-9 px-4 text-sm font-medium text-[#9BA0A6] border border-[#E2E4E6] dark:border-[#30363D] rounded-lg cursor-not-allowed"
                    disabled
                    title="Bientot disponible"
                  >
                    Configurer
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Sessions actives</h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  Gerez les appareils connectes a votre compte.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#E8F5E9] dark:bg-[#147A3A]/20 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3]">Session actuelle</p>
                        <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">Navigateur - En ligne</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-[#E8F5E9] dark:bg-[#147A3A]/20 text-[#147A3A] dark:text-[#4ADE80] rounded-md">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <>
              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Plan actuel</h2>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-[#0D0F14] dark:text-[#E6EDF3]">Free</span>
                  <span className="px-2 py-1 text-xs font-semibold uppercase rounded bg-[#F5F7F9] dark:bg-[#0D1117] text-[#4E525A] dark:text-[#8B949E]">
                    Actuel
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  <li className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    50 leads/mois
                  </li>
                  <li className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    1 utilisateur
                  </li>
                  <li className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#147A3A" strokeWidth="2" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Export CSV
                  </li>
                </ul>
                <button
                  className="w-full h-10 text-sm font-medium text-white/60 bg-[#17191F]/60 dark:bg-white/10 rounded-[10px] cursor-not-allowed"
                  disabled
                  title="Bientôt disponible"
                >
                  Passer a Pro
                </button>
              </div>

              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Session</h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  Connecte en tant que <span className="font-medium text-[#0D0F14] dark:text-[#E6EDF3]">{email}</span>
                </p>
                <div className="flex items-center gap-4">
                  <LogoutButton onClick={handleLogout} />
                  {isLoggingOut && (
                    <span className="text-sm text-[#4E525A] dark:text-[#8B949E]">Déconnexion...</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-red-200 dark:border-red-900/50 p-4 lg:p-6 transition-colors duration-200">
                <h2 className="text-lg font-semibold text-[#B42318] dark:text-red-400 mb-4">Zone de danger</h2>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                  Actions irreversibles sur votre compte
                </p>
                <button
                  className="w-full h-10 text-sm font-medium text-[#B42318]/60 dark:text-red-400/60 border border-[#B42318]/60 dark:border-red-400/60 rounded-[10px] cursor-not-allowed"
                  disabled
                  title="Bientôt disponible"
                >
                  Supprimer le compte
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Quick Links (visible on all tabs) */}
        <div className="space-y-6 order-first lg:order-last">
          <div className="bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 lg:p-6 transition-colors duration-200">
            <h2 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-4">Configuration</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/settings/properties"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.03] dark:hover:bg-white/[0.05] hover:text-[#0D0F14] dark:hover:text-[#E6EDF3] transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
                  </svg>
                  <span>Proprietes personnalisées</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

          {/* Mobile: Show plan info */}
          <div className="lg:hidden bg-white dark:bg-[#161B22] rounded-[14px] border border-[#E2E4E6] dark:border-[#30363D] p-4 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">Plan actuel</p>
                <p className="text-lg font-bold text-[#0D0F14] dark:text-[#E6EDF3]">Free</p>
              </div>
              <button
                onClick={() => setActiveTab('account')}
                className="text-sm text-[#0066FF] dark:text-[#58A6FF] font-medium"
              >
                Voir details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
