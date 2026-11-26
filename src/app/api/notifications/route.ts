import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
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

    // Fetch notifications for the current user
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des notifications' },
        { status: 500 }
      )
    }

    // Count unread notifications
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unread_count: unreadCount,
    })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
