'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProfileImageUploadProps {
  currentAvatarUrl: string | null
  initials: string
  userId: string
  onUploadComplete: (newUrl: string) => void
}

export function ProfileImageUpload({
  currentAvatarUrl,
  initials,
  userId,
  onUploadComplete,
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Seules les images sont acceptees')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image trop volumineuse (max 2 Mo)')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Create preview
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path)

      // Update profile
      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: publicUrl }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message)
      }

      onUploadComplete(publicUrl)
      setPreviewUrl(publicUrl)
    } catch (err: unknown) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du telechargement')
      setPreviewUrl(currentAvatarUrl)
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return

    setIsUploading(true)
    setError(null)

    try {
      // Update profile to remove avatar_url
      const response = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: null }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message)
      }

      setPreviewUrl(null)
      onUploadComplete('')
    } catch (err: unknown) {
      console.error('Remove error:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Photo de profil"
            className="w-16 h-16 rounded-full object-cover border-2 border-[#E2E4E6] dark:border-[#30363D]"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#17191F] dark:bg-[#58A6FF] flex items-center justify-center text-white text-xl font-semibold">
            {initials}
          </div>
        )}

        {/* Upload overlay */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
          aria-label="Changer la photo"
        >
          {isUploading ? (
            <svg className="animate-spin w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Selectionner une image"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1.5 text-sm font-medium text-[#0066FF] hover:bg-[#0066FF]/5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Telechargement...' : 'Changer la photo'}
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={isUploading}
              className="px-3 py-1.5 text-sm font-medium text-[#B42318] hover:bg-[#FDE8E5] rounded-lg transition-colors disabled:opacity-50"
            >
              Supprimer
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#B42318] dark:text-[#F87171]">{error}</p>
        )}

        <p className="text-xs text-[#9BA0A6] dark:text-[#8B949E]">
          JPG, PNG ou GIF. Max 2 Mo.
        </p>
      </div>
    </div>
  )
}
