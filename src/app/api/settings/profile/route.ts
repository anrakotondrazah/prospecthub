import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch current user profile
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
      .select('id, first_name, last_name, avatar_url, job_title, phone, timezone')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la recuperation du profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// PATCH - Update user profile
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

    const body = await request.json()
    const { first_name, last_name, job_title, phone, timezone, avatar_url } = body

    const updateData: Record<string, unknown> = {}
    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (job_title !== undefined) updateData.job_title = job_title
    if (phone !== undefined) updateData.phone = phone
    if (timezone !== undefined) updateData.timezone = timezone
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'Aucune donnee a mettre a jour' }, { status: 400 })
    }

    updateData.updated_at = new Date().toISOString()

    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('id, first_name, last_name, avatar_url, job_title, phone, timezone')
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Erreur lors de la mise a jour du profil' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profil mis a jour',
      profile,
    })
  } catch (error) {
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
