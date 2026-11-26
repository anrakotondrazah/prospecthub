import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

    // Get organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    // Get query params for filtering
    const searchParams = request.nextUrl.searchParams
    const entityType = searchParams.get('entity_type') // 'lead' | 'deal' | 'company'
    const entityId = searchParams.get('entity_id')
    const status = searchParams.get('status')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('meetings')
      .select(`
        id,
        uuid,
        title,
        description,
        meeting_type,
        start_time,
        end_time,
        duration_minutes,
        location,
        video_link,
        status,
        color,
        created_at,
        organizer:organizer_id (
          first_name,
          last_name,
          avatar_url
        ),
        associated_company:associated_company_id (
          name
        ),
        associated_deal:associated_deal_id (
          name,
          value
        )
      `)
      .eq('organization_id', profile.organization_id)
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1)

    // Apply entity filter
    if (entityType && entityId) {
      const entityIdNum = parseInt(entityId, 10)
      if (isNaN(entityIdNum)) {
        return NextResponse.json(
          { success: false, message: 'entity_id invalide' },
          { status: 400 }
        )
      }

      switch (entityType) {
        case 'lead':
          query = query.eq('associated_lead_id', entityIdNum)
          break
        case 'deal':
          query = query.eq('associated_deal_id', entityIdNum)
          break
        case 'company':
          query = query.eq('associated_company_id', entityIdNum)
          break
        default:
          return NextResponse.json(
            { success: false, message: 'entity_type invalide (lead, deal, company)' },
            { status: 400 }
          )
      }
    }

    // Filter by status
    if (status) {
      query = query.eq('status', status)
    }

    // Filter by date range
    if (startDate) {
      query = query.gte('start_time', startDate)
    }
    if (endDate) {
      query = query.lte('start_time', endDate)
    }

    const { data: meetings, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching meetings:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des rendez-vous' },
        { status: 500 }
      )
    }

    // Get attendees count for each meeting
    const meetingsWithAttendees = await Promise.all(
      (meetings || []).map(async (meeting) => {
        const { count } = await supabase
          .from('meeting_attendees')
          .select('*', { count: 'exact', head: true })
          .eq('meeting_id', meeting.id)

        return {
          ...meeting,
          attendees_count: count || 0,
        }
      })
    )

    return NextResponse.json({
      success: true,
      meetings: meetingsWithAttendees,
    })
  } catch (error) {
    console.error('Meetings API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

    // Get organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    const body = await request.json()

    const {
      title,
      description,
      meeting_type,
      start_time,
      end_time,
      timezone,
      location,
      video_link,
      associated_lead_id,
      associated_company_id,
      associated_deal_id,
      reminder_before_minutes,
      color,
      attendees,
    } = body

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Le titre est obligatoire' },
        { status: 400 }
      )
    }

    if (!start_time || !end_time) {
      return NextResponse.json(
        { success: false, message: 'Les horaires sont obligatoires' },
        { status: 400 }
      )
    }

    const validMeetingTypes = ['call', 'video', 'in_person', 'demo', 'discovery', 'closing']
    if (meeting_type && !validMeetingTypes.includes(meeting_type)) {
      return NextResponse.json(
        { success: false, message: 'Type de rendez-vous invalide' },
        { status: 400 }
      )
    }

    // Insert meeting
    const { data: meeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        organization_id: profile.organization_id,
        title: title.trim(),
        description: description?.trim() || null,
        meeting_type: meeting_type || 'video',
        start_time,
        end_time,
        timezone: timezone || 'Europe/Paris',
        location: location?.trim() || null,
        video_link: video_link?.trim() || null,
        organizer_id: user.id,
        associated_lead_id: associated_lead_id || null,
        associated_company_id: associated_company_id || null,
        associated_deal_id: associated_deal_id || null,
        reminder_before_minutes: reminder_before_minutes || 15,
        color: color || '#0066FF',
        created_by: user.id,
      })
      .select(`
        id,
        uuid,
        title,
        description,
        meeting_type,
        start_time,
        end_time,
        duration_minutes,
        location,
        video_link,
        status,
        color,
        created_at
      `)
      .single()

    if (insertError) {
      console.error('Error creating meeting:', insertError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la creation du rendez-vous' },
        { status: 500 }
      )
    }

    // Add organizer as attendee
    await supabase.from('meeting_attendees').insert({
      meeting_id: meeting.id,
      user_id: user.id,
      is_organizer: true,
      response_status: 'accepted',
    })

    // Add other attendees if provided
    if (attendees && Array.isArray(attendees) && attendees.length > 0) {
      const attendeeInserts = attendees.map((attendee: { user_id?: string; lead_id?: number; email?: string }) => ({
        meeting_id: meeting.id,
        user_id: attendee.user_id || null,
        lead_id: attendee.lead_id || null,
        email: attendee.email || null,
        response_status: 'pending',
      }))

      await supabase.from('meeting_attendees').insert(attendeeInserts)
    }

    return NextResponse.json({
      success: true,
      meeting,
    }, { status: 201 })
  } catch (error) {
    console.error('Meetings API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

    // Get organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID du rendez-vous requis' },
        { status: 400 }
      )
    }

    // Build update object
    const updateData: Record<string, unknown> = {}

    if (updates.title !== undefined) updateData.title = updates.title.trim()
    if (updates.description !== undefined) updateData.description = updates.description?.trim() || null
    if (updates.meeting_type !== undefined) updateData.meeting_type = updates.meeting_type
    if (updates.start_time !== undefined) updateData.start_time = updates.start_time
    if (updates.end_time !== undefined) updateData.end_time = updates.end_time
    if (updates.location !== undefined) updateData.location = updates.location?.trim() || null
    if (updates.video_link !== undefined) updateData.video_link = updates.video_link?.trim() || null
    if (updates.status !== undefined) {
      updateData.status = updates.status
      if (updates.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }
      if (updates.status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString()
      }
    }
    if (updates.outcome !== undefined) updateData.outcome = updates.outcome
    if (updates.outcome_notes !== undefined) updateData.outcome_notes = updates.outcome_notes

    // Update meeting
    const { data: meeting, error: updateError } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', profile.organization_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating meeting:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour du rendez-vous' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      meeting,
    })
  } catch (error) {
    console.error('Meetings API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Non authentifie' },
        { status: 401 }
      )
    }

    // Get organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return NextResponse.json(
        { success: false, message: 'Organisation non trouvee' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('id')

    if (!meetingId) {
      return NextResponse.json(
        { success: false, message: 'ID du rendez-vous requis' },
        { status: 400 }
      )
    }

    // Delete meeting (cascade will handle attendees)
    const { error: deleteError } = await supabase
      .from('meetings')
      .delete()
      .eq('id', parseInt(meetingId))
      .eq('organization_id', profile.organization_id)

    if (deleteError) {
      console.error('Error deleting meeting:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la suppression du rendez-vous' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Rendez-vous supprime',
    })
  } catch (error) {
    console.error('Meetings API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
