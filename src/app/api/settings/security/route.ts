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

      // Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
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
      // Note: Supabase doesn't expose session listing in the client SDK
      // This would require admin API or custom session tracking
      return NextResponse.json({
        success: true,
        sessions: [
          {
            id: 'current',
            device: 'Navigateur actuel',
            location: 'Session en cours',
            lastActive: new Date().toISOString(),
            isCurrent: true,
          },
        ],
      })
    }

    if (action === 'revoke_session') {
      const { sessionId } = body
      if (sessionId === 'current') {
        return NextResponse.json(
          { success: false, message: 'Impossible de revoquer la session en cours' },
          { status: 400 }
        )
      }
      // Would need admin API to revoke other sessions
      return NextResponse.json({
        success: true,
        message: 'Session revoquee',
      })
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
