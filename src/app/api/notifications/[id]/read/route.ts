import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const notificationId = parseInt(id, 10)
    if (isNaN(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'ID de notification invalide' },
        { status: 400 }
      )
    }

    // Update notification to mark as read
    // RLS policy ensures user can only update their own notifications
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error marking notification as read:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour de la notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marquee comme lue',
    })
  } catch (error) {
    console.error('Mark as read API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
