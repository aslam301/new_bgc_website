'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  eventId?: string
  communityId: string
  albumName?: string
  type: 'event' | 'community'
  onUploadComplete?: () => void
}

export function PhotoUpload({
  eventId,
  communityId,
  albumName,
  type,
  onUploadComplete,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [caption, setCaption] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError('')
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError('')

    try {
      const supabase = createClient()

      // Upload to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = type === 'event'
        ? `event-photos/${eventId}/${fileName}`
        : `community-photos/${communityId}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Save to database
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo_url: publicUrl,
          caption,
          event_id: eventId,
          community_id: communityId,
          album_name: albumName,
          type,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      // Reset form
      setSelectedFile(null)
      setPreviewUrl(null)
      setCaption('')

      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-card border-2 border-ink p-6 shadow-[4px_4px_0_0_hsl(var(--ink))]">
      <h3 className="text-sm font-black uppercase tracking-wider mb-4">
        Upload Photo
      </h3>

      {error && (
        <div className="bg-coral/10 border-2 border-coral text-coral px-3 py-2 text-xs font-bold mb-4">
          {error}
        </div>
      )}

      {!previewUrl ? (
        <label className="block cursor-pointer">
          <div className="border-2 border-dashed border-ink bg-background p-8 text-center hover:bg-card transition-colors">
            <Upload className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="text-sm font-bold text-foreground mb-1">
              Click to upload photo
            </p>
            <p className="text-xs text-muted-foreground">
              Max 5MB, JPG/PNG
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-cover border-2 border-ink"
            />
            <button
              onClick={() => {
                setPreviewUrl(null)
                setSelectedFile(null)
              }}
              className="absolute top-2 right-2 p-2 bg-coral text-white border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))]"
              disabled={uploading}
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2">
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 bg-background border-2 border-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Add a caption..."
              disabled={uploading}
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-3 bg-coral text-white font-bold text-sm border-2 border-ink shadow-[3px_3px_0_0_hsl(var(--ink))] hover:shadow-[4px_4px_0_0_hsl(var(--ink))] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Uploading...
              </>
            ) : (
              'Upload Photo'
            )}
          </button>
        </div>
      )}
    </div>
  )
}
