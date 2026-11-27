'use client'

import { useState, useCallback } from 'react'
import { CalendarWidget } from '@/components/meetings/CalendarWidget'
import { MeetingCard, type MeetingData } from '@/components/meetings/MeetingCard'
import { ScheduleMeetingModal, type Meeting } from '@/components/meetings/ScheduleMeetingModal'
import { FillButton } from '@/components/ui/buttons'

interface MeetingsPageClientProps {
  initialMeetings: MeetingData[]
  organizationId: number
  userId: string
  error?: string
}

export function MeetingsPageClient({
  initialMeetings,
  organizationId,
  userId,
  error,
}: MeetingsPageClientProps) {
  const [meetings, setMeetings] = useState<MeetingData[]>(initialMeetings)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const handleMeetingCreated = useCallback((newMeeting: Meeting) => {
    // Transform Meeting to MeetingData format
    const meetingData: MeetingData = {
      id: newMeeting.id,
      uuid: newMeeting.uuid,
      title: newMeeting.title,
      description: newMeeting.description,
      meeting_type: newMeeting.meeting_type,
      start_time: newMeeting.start_time,
      end_time: newMeeting.end_time,
      duration_minutes: newMeeting.duration_minutes,
      location: newMeeting.location,
      video_link: newMeeting.video_link,
      status: newMeeting.status,
      color: newMeeting.color,
    }
    setMeetings((prev) => [...prev, meetingData].sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    ))
  }, [])

  const handleAddMeeting = useCallback((date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }, [])

  const handleOpenModal = useCallback(() => {
    setSelectedDate(undefined)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedDate(undefined)
  }, [])

  // Filter upcoming meetings for the list
  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.start_time) >= new Date()
  )

  if (error) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
              Reunions
            </h1>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
              Planifiez et gerez vos rendez-vous
            </p>
          </div>
        </div>
        <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-2xl p-12">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#FDE8E5] dark:bg-[#B42318]/10 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-2">Erreur de chargement</p>
            <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl lg:text-[23.5px] font-semibold text-[#0D0F14] dark:text-[#E6EDF3] mb-1">
            Reunions
          </h1>
          <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
            Planifiez et gerez vos rendez-vous
          </p>
        </div>
        <FillButton onClick={handleOpenModal}>
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Planifier
          </span>
        </FillButton>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget - Takes 1 column on mobile, 1 column on desktop */}
        <div className="lg:col-span-1">
          <CalendarWidget
            meetings={meetings}
            onAddMeeting={handleAddMeeting}
          />
        </div>

        {/* Upcoming Meetings - Takes 1 column on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-black/[0.06] dark:border-[#30363D]">
              <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3]">
                Prochaines reunions
              </h3>
              <p className="text-sm text-[#4E525A] dark:text-[#8B949E]">
                {upcomingMeetings.length} reunion{upcomingMeetings.length !== 1 ? 's' : ''} a venir
              </p>
            </div>

            <div className="p-4">
              {upcomingMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F7F9] dark:bg-[#21262D] flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#9BA0A6] dark:text-[#8B949E]">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <p className="text-[#0D0F14] dark:text-[#E6EDF3] font-medium mb-2">
                    Aucune reunion planifiee
                  </p>
                  <p className="text-sm text-[#4E525A] dark:text-[#8B949E] mb-4">
                    Commencez par planifier votre premiere reunion
                  </p>
                  <button
                    onClick={handleOpenModal}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0066FF] hover:bg-[#0066FF]/10 rounded-xl transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Planifier une reunion
                  </button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {upcomingMeetings.map((meeting) => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMeetingCreated={handleMeetingCreated}
        organizationId={organizationId}
        userId={userId}
        defaultDate={selectedDate}
      />
    </div>
  )
}
