import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

interface NotificationSettings {
  email_new_lead?: boolean
  email_weekly_report?: boolean
  email_task_reminder?: boolean
  browser?: boolean
}

interface UserSettings {
  notifications?: NotificationSettings
  locale?: string
  theme?: 'light' | 'dark' | 'system'
}

// GET - Fetch current user preferences
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Non authentifie' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation des preferences' },
        { status: 500 }
      )
    }

    // Default settings if none exist
    const defaultSettings: UserSettings = {
      notifications: {
        email_new_lead: true,
        email_weekly_report: false,
        email_task_reminder: true,
        browser: false,
      },
      locale: 'fr_FR',
      theme: 'system',
    }

    const settings = profile?.settings || defaultSettings

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH - Update user preferences
export async function PATCH(request: NextRequest) {
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

    // Get current settings
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single()

    const currentSettings = (profile?.settings || {}) as UserSettings

    // Merge new settings with current
    const updatedSettings: UserSettings = {
      ...currentSettings,
    }

    // Update notifications if provided
    if (body.notifications && typeof body.notifications === 'object') {
      updatedSettings.notifications = {
        ...currentSettings.notifications,
        ...body.notifications,
      }
    }

    // Update locale if provided
    if (typeof body.locale === 'string') {
      updatedSettings.locale = body.locale
    }

    // Update theme if provided
    if (body.theme && ['light', 'dark', 'system'].includes(body.theme)) {
      updatedSettings.theme = body.theme
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating settings:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la sauvegarde des preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json({ success: false, message: 'Erreur serveur' }, { status: 500 })
  }
}
