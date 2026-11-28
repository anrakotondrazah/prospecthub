import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Corps de requete invalide' },
        { status: 400 }
      )
    }

    const { action } = body

    if (action === 'change_password') {
      const { currentPassword, newPassword } = body

      // Validate inputs
      if (!currentPassword || typeof currentPassword !== 'string') {
        return NextResponse.json(
          { success: false, message: 'Mot de passe actuel requis' },
          { status: 400 }
        )
      }

      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, message: 'Nouveau mot de passe requis (minimum 8 caracteres)' },
          { status: 400 }
        )
      }

      // Verify user has email
      if (!user.email) {
        console.error('User has no email:', user.id)
        return NextResponse.json(
          { success: false, message: 'Email utilisateur introuvable' },
          { status: 500 }
        )
      }

      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (signInError) {
        return NextResponse.json(
          { success: false, message: 'Mot de passe actuel incorrect' },
          { status: 400 }
        )
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Erreur lors du changement de mot de passe' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Mot de passe modifie avec succes',
      })
    }

    if (action === 'get_sessions') {
      // Not implemented - requires Supabase Admin API or custom session tracking
      return NextResponse.json(
        { success: false, message: 'Fonctionnalite non disponible actuellement' },
        { status: 501 }
      )
    }

    if (action === 'revoke_session') {
      // Not implemented - requires Supabase Admin API
      return NextResponse.json(
        { success: false, message: 'Fonctionnalite non disponible actuellement' },
        { status: 501 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Action non reconnue' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Security API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
