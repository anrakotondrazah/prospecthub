'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FillButton } from '@/components/ui/buttons'

type ScheduleMeetingModalProps = {
  isOpen: boolean
  onClose: () => void
  onMeetingCreated: (meeting: Meeting) => void
  organizationId: number
  userId: string
  // Optional associations
  leadId?: number
  companyId?: number
  dealId?: number
  // Default date/time
  defaultDate?: Date
}

export interface Meeting {
  id: number
  uuid: string
  title: string
  description: string | null
  meeting_type: 'call' | 'video' | 'in_person' | 'demo' | 'discovery' | 'closing'
  start_time: string
  end_time: string
  duration_minutes: number
  location: string | null
  video_link: string | null
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  color: string
  created_at: string
}

const MEETING_TYPES = [
  { value: 'call', label: 'Appel', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', color: '#16A34A' },
  { value: 'video', label: 'Visio', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', color: '#2563EB' },
  { value: 'in_person', label: 'Physique', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', color: '#7C3AED' },
  { value: 'demo', label: 'Démo', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: '#EA580C' },
  { value: 'discovery', label: 'Decouverte', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', color: '#0891B2' },
  { value: 'closing', label: 'Closing', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#16A34A' },
]

const DURATION_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 heure' },
  { value: 90, label: '1h30' },
  { value: 120, label: '2 heures' },
]

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  onMeetingCreated,
  organizationId,
  userId,
  leadId,
  companyId,
  dealId,
  defaultDate,
}: ScheduleMeetingModalProps) {
  const now = defaultDate || new Date()
  const defaultDateStr = now.toISOString().split('T')[0]
  const defaultTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(Math.ceil(now.getMinutes() / 15) * 15).padStart(2, '0')}`

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [meetingType, setMeetingType] = useState<Meeting['meeting_type']>('video')
  const [date, setDate] = useState(defaultDateStr)
  const [time, setTime] = useState(defaultTimeStr)
  const [duration, setDuration] = useState(30)
  const [location, setLocation] = useState('')
  const [videoLink, setVideoLink] = useState('')
  const [reminderMinutes, setReminderMinutes] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    if (!date || !time) {
      setError('La date et l\'heure sont obligatoires')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Calculate start and end times
      const startTime = new Date(`${date}T${time}:00`)
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000)

      const selectedType = MEETING_TYPES.find(t => t.value === meetingType)

      const { data, error: insertError } = await supabase
        .from('meetings')
        .insert({
          organization_id: organizationId,
          title: title.trim(),
          description: description.trim() || null,
          meeting_type: meetingType,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          location: location.trim() || null,
          video_link: videoLink.trim() || null,
          organizer_id: userId,
          associated_lead_id: leadId || null,
          associated_company_id: companyId || null,
          associated_deal_id: dealId || null,
          reminder_before_minutes: reminderMinutes,
          color: selectedType?.color || '#0066FF',
          created_by: userId,
        })
        .select('id, uuid, title, description, meeting_type, start_time, end_time, duration_minutes, location, video_link, status, color, created_at')
        .single()

      if (insertError) throw insertError

      // Add organizer as attendee
      await supabase
        .from('meeting_attendees')
        .insert({
          meeting_id: data.id,
          user_id: userId,
          is_organizer: true,
          response_status: 'accepted',
        })

      // Reset form
      setTitle('')
      setDescription('')
      setMeetingType('video')
      setDate(defaultDateStr)
      setTime(defaultTimeStr)
      setDuration(30)
      setLocation('')
      setVideoLink('')

      // Callback
      onMeetingCreated(data as Meeting)
      onClose()
    } catch (err: unknown) {
      console.error('Error creating meeting:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la creation'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl rounded-2xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/[0.06] dark:border-[#30363D] sticky top-0 bg-white/95 dark:bg-[#0D1117]/95 backdrop-blur-xl z-10">
          <h2 className="text-xl font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            Planifier un rendez-vous
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] flex items-center justify-center transition-all duration-200 active:scale-95"
            aria-label="Fermer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-[#FDE8E5] dark:bg-[#B42318]/10 border border-[#B42318]/20 rounded-xl flex items-start gap-3 shadow-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#B42318]">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="meeting-title" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Titre <span className="text-[#B42318]">*</span>
            </label>
            <input
              id="meeting-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Point projet Acme Corp"
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Type de rendez-vous
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MEETING_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setMeetingType(type.value as Meeting['meeting_type'])}
                  disabled={isLoading}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 flex flex-col items-center gap-1.5 ${
                    meetingType === type.value
                      ? 'border-2 shadow-sm'
                      : 'bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                  style={meetingType === type.value ? {
                    backgroundColor: `${type.color}10`,
                    borderColor: type.color,
                    color: type.color,
                  } : undefined}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d={type.icon} />
                  </svg>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="meeting-date" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Date <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="meeting-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="meeting-time" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Heure <span className="text-[#B42318]">*</span>
              </label>
              <input
                id="meeting-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
              Duree
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                    duration === opt.value
                      ? 'bg-[#0066FF] text-white'
                      : 'bg-white/80 dark:bg-[#161B22]/80 border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location / Video Link */}
          {meetingType === 'in_person' ? (
            <div>
              <label htmlFor="meeting-location" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Lieu
              </label>
              <input
                id="meeting-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: 15 rue de la Paix, Paris"
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
          ) : meetingType === 'video' || meetingType === 'demo' ? (
            <div>
              <label htmlFor="meeting-link" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
                Lien visio
              </label>
              <input
                id="meeting-link"
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="Ex: https://meet.google.com/xxx"
                className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
                disabled={isLoading}
              />
            </div>
          ) : null}

          {/* Description */}
          <div>
            <label htmlFor="meeting-description" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Description (optionnel)
            </label>
            <textarea
              id="meeting-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez des notes ou un ordre du jour..."
              rows={2}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Reminder */}
          <div>
            <label htmlFor="meeting-reminder" className="block text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">
              Rappel
            </label>
            <select
              id="meeting-reminder"
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl text-sm text-[#0D0F14] dark:text-[#E6EDF3] focus:outline-none focus:border-[#0066FF] focus:ring-3 focus:ring-[#0066FF]/10 transition-all duration-200 shadow-sm hover:border-black/[0.12] dark:hover:border-[#30363D]"
              disabled={isLoading}
            >
              <option value={0}>Pas de rappel</option>
              <option value={5}>5 minutes avant</option>
              <option value={15}>15 minutes avant</option>
              <option value={30}>30 minutes avant</option>
              <option value={60}>1 heure avant</option>
              <option value={1440}>1 jour avant</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-transparent border border-black/[0.08] dark:border-[#30363D] text-[#4E525A] dark:text-[#8B949E] rounded-xl font-medium hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all duration-200 disabled:opacity-50 active:scale-[0.98]"
            >
              Annulér
            </button>
            <FillButton
              disabled={isLoading || !title.trim() || !date || !time}
              className="flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Création...
                </span>
              ) : (
                'Planifier'
              )}
            </FillButton>
          </div>
        </form>
      </div>
    </div>
  )
}
