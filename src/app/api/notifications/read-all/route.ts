import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH() {
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

    // Update all unread notifications for the current user
    // RLS policy ensures user can only update their own notifications
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (updateError) {
      console.error('Error marking all notifications as read:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour des notifications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Toutes les notifications ont ete marquees comme lues',
    })
  } catch (error) {
    console.error('Mark all as read API error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
