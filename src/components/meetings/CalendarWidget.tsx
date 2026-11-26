'use client'

import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { MeetingCard, type MeetingData } from './MeetingCard'

interface CalendarWidgetProps {
  meetings: MeetingData[]
  onDateSelect?: (date: Date) => void
  onMeetingClick?: (meeting: MeetingData) => void
  onAddMeeting?: (date: Date) => void
}

export function CalendarWidget({
  meetings,
  onDateSelect,
  onMeetingClick,
  onAddMeeting,
}: CalendarWidgetProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday start
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    const grouped: Record<string, MeetingData[]> = {}
    meetings.forEach((meeting) => {
      const dateKey = format(new Date(meeting.start_time), 'yyyy-MM-dd')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(meeting)
    })
    return grouped
  }, [meetings])

  // Selected date meetings
  const selectedDateMeetings = useMemo(() => {
    if (!selectedDate) return []
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return meetingsByDate[dateKey] || []
  }, [selectedDate, meetingsByDate])

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="bg-white/80 dark:bg-[#161B22]/80 backdrop-blur-sm border border-black/[0.08] dark:border-[#30363D] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-black/[0.06] dark:border-[#30363D]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0D0F14] dark:text-[#E6EDF3] capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </h3>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                <polyline points="15,18 9,12 15,6" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-3 py-1.5 text-xs font-medium text-[#0066FF] hover:bg-[#0066FF]/10 rounded-lg transition-colors"
            >
              Aujourd'hui
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4E525A] dark:text-[#8B949E]">
                <polyline points="9,18 15,12 9,6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-[#9BA0A6] dark:text-[#8B949E] py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day: Date, index: number) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayMeetings = meetingsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDate && isSameDay(day, selectedDate)
            const isTodayDate = isToday(day)

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  relative aspect-square p-1 rounded-xl text-sm transition-all duration-200
                  ${!isCurrentMonth ? 'text-[#9BA0A6] dark:text-[#4E525A]' : 'text-[#0D0F14] dark:text-[#E6EDF3]'}
                  ${isSelected ? 'bg-[#0066FF] text-white' : ''}
                  ${isTodayDate && !isSelected ? 'bg-[#0066FF]/10 text-[#0066FF] font-semibold' : ''}
                  ${!isSelected && isCurrentMonth ? 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]' : ''}
                `}
              >
                <span className="block">{format(day, 'd')}</span>
                {dayMeetings.length > 0 && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayMeetings.slice(0, 3).map((meeting, i) => (
                      <span
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{ backgroundColor: isSelected ? 'white' : meeting.color }}
                      />
                    ))}
                    {dayMeetings.length > 3 && (
                      <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/60' : 'bg-[#9BA0A6]'}`} />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Meetings */}
      {selectedDate && (
        <div className="border-t border-black/[0.06] dark:border-[#30363D] p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] capitalize">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </h4>
            {onAddMeeting && (
              <button
                onClick={() => onAddMeeting(selectedDate)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0066FF] hover:bg-[#0066FF]/10 rounded-lg transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Ajouter
              </button>
            )}
          </div>

          {selectedDateMeetings.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedDateMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E] text-center py-4">
              Aucun rendez-vous prevu
            </p>
          )}
        </div>
      )}

      {/* Upcoming Meetings (if no date selected) */}
      {!selectedDate && (
        <div className="border-t border-black/[0.06] dark:border-[#30363D] p-4">
          <h4 className="text-sm font-medium text-[#0D0F14] dark:text-[#E6EDF3] mb-3">
            Prochains rendez-vous
          </h4>
          {meetings.length > 0 ? (
            <div className="space-y-2">
              {meetings
                .filter((m) => new Date(m.start_time) >= new Date())
                .slice(0, 3)
                .map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    compact
                  />
                ))}
            </div>
          ) : (
            <p className="text-sm text-[#9BA0A6] dark:text-[#8B949E] text-center py-4">
              Aucun rendez-vous a venir
            </p>
          )}
        </div>
      )}
    </div>
  )
}
