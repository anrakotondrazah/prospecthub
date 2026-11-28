'use client'

import { format, isToday, isTomorrow, differenceInMinutes } from 'date-fns'
import { fr } from 'date-fns/locale'

export interface MeetingData {
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
  organizer?: {
    first_name: string
    last_name: string
    avatar_url: string | null
  }
  attendees_count?: number
  associated_company?: {
    name: string
  }
  associated_deal?: {
    name: string
    value: number
  }
}

interface MeetingCardProps {
  meeting: MeetingData
  compact?: boolean
  onJoin?: (meeting: MeetingData) => void
  onReschedule?: (meeting: MeetingData) => void
  onCancel?: (meeting: MeetingData) => void
}

const MEETING_TYPE_ICONS: Record<string, string> = {
  call: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  in_person: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
  demo: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  discovery: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  closing: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  scheduled: { label: 'Planifie', bg: 'bg-[#F5F7F9]', text: 'text-[#9BA0A6]' },
  confirmed: { label: 'Confirme', bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]' },
  in_progress: { label: 'En cours', bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]' },
  completed: { label: 'Terminé', bg: 'bg-[#F3F4F6]', text: 'text-[#6B7280]' },
  cancelled: { label: 'Annulé', bg: 'bg-[#FDE8E5]', text: 'text-[#B42318]' },
  no_show: { label: 'No-show', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' },
}

export function MeetingCard({ meeting, compact = false, onJoin, onReschedule, onCancel }: MeetingCardProps) {
  const startTime = new Date(meeting.start_time)
  const endTime = new Date(meeting.end_time)
  const now = new Date()

  const isHappening = startTime <= now && endTime >= now
  const isUpcoming = startTime > now
  const minutesUntil = differenceInMinutes(startTime, now)
  const isStartingSoon = minutesUntil > 0 && minutesUntil <= 15

  const statusConfig = STATUS_CONFIG[meeting.status] || STATUS_CONFIG.scheduled

  const formatMeetingDate = () => {
    if (isToday(startTime)) return 'Aujourd\'hui'
    if (isTomorrow(startTime)) return 'Demain'
    return format(startTime, 'EEEE d MMMM', { locale: fr })
  }

  const formatMeetingTime = () => {
    return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`
  }

  if (compact) {
    return (
      <div
        className="p-3 rounded-xl border-l-4 bg-white/80 dark:bg-[#161B22]/80 hover:bg-white dark:hover:bg-[#161B22] hover:shadow-sm transition-all duration-200 cursor-default"
        style={{ borderLeftColor: meeting.color }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] truncate">
              {meeting.title}
            </p>
            <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              {formatMeetingTime()}
            </p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={meeting.color}
            strokeWidth="1.5"
          >
            <path d={MEETING_TYPE_ICONS[meeting.meeting_type]} />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="group p-4 bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-xl hover:bg-white dark:hover:bg-[#161B22] hover:shadow-md hover:border-black/[0.12] dark:hover:border-[#30363D] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Type Icon */}
          <div
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${meeting.color}15` }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={meeting.color}
              strokeWidth="1.5"
            >
              <path d={MEETING_TYPE_ICONS[meeting.meeting_type]} />
            </svg>
          </div>

          {/* Title & Meta */}
          <div className="min-w-0">
            <h4 className="font-medium text-sm text-[#0D0F14] dark:text-[#E6EDF3] line-clamp-1">
              {meeting.title}
            </h4>
            {meeting.associated_company && (
              <p className="text-xs text-[#4E525A] dark:text-[#8B949E] truncate">
                {meeting.associated_company.name}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={`flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${statusConfig.bg} ${statusConfig.text}`}>
          {isHappening ? 'En cours' : statusConfig.label}
        </span>
      </div>

      {/* Time & Date */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-[#4E525A] dark:text-[#8B949E]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="capitalize">{formatMeetingDate()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#4E525A] dark:text-[#8B949E]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          <span>{formatMeetingTime()}</span>
        </div>
        <span className="text-[#9BA0A6] dark:text-[#8B949E]">
          ({meeting.duration_minutes} min)
        </span>
      </div>

      {/* Location / Video Link */}
      {(meeting.location || meeting.video_link) && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-[#4E525A] dark:text-[#8B949E]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {meeting.video_link ? (
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            ) : (
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            )}
          </svg>
          <span className="truncate">
            {meeting.video_link || meeting.location}
          </span>
        </div>
      )}

      {/* Deal Info */}
      {meeting.associated_deal && (
        <div className="mt-3 p-2 bg-[#F5F7F9] dark:bg-[#0D1117] rounded-lg flex items-center justify-between">
          <span className="text-xs text-[#4E525A] dark:text-[#8B949E]">
            {meeting.associated_deal.name}
          </span>
          <span className="text-xs font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
            {meeting.associated_deal.value.toLocaleString('fr-FR')} EUR
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-[#30363D] flex items-center justify-between">
        {/* Organizer & Attendees */}
        <div className="flex items-center gap-2">
          {meeting.organizer && (
            <div className="flex items-center gap-1.5">
              {meeting.organizer.avatar_url ? (
                <img
                  src={meeting.organizer.avatar_url}
                  alt=""
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                  <span className="text-[9px] font-medium text-[#0066FF]">
                    {meeting.organizer.first_name?.[0]}{meeting.organizer.last_name?.[0]}
                  </span>
                </div>
              )}
            </div>
          )}
          {meeting.attendees_count && meeting.attendees_count > 1 && (
            <span className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
              +{meeting.attendees_count - 1} participant{meeting.attendees_count > 2 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Actions */}
        {isUpcoming && meeting.status !== 'cancelled' && (
          <div className="flex items-center gap-2">
            {isStartingSoon && meeting.video_link && onJoin && (
              <button
                onClick={() => onJoin(meeting)}
                className="px-3 py-1.5 bg-[#16A34A] text-white rounded-lg text-xs font-medium hover:bg-[#15803D] transition-colors flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Rejoindre
              </button>
            )}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onReschedule && (
                <button
                  onClick={() => onReschedule(meeting)}
                  className="p-1.5 rounded-lg hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
                  title="Reporter"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                    <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {onCancel && (
                <button
                  onClick={() => onCancel(meeting)}
                  className="p-1.5 rounded-lg hover:bg-[#FDE8E5] transition-colors"
                  title="Annulér"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
