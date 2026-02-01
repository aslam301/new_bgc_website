'use client'

import { useState, useEffect } from 'react'
import { Trash2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Photo {
  id: string
  photo_url: string
  caption?: string
  uploaded_by: string
  created_at: string
  profiles?: {
    username: string
    full_name: string
  }
}

interface PhotoGalleryProps {
  eventId?: string
  communityId?: string
  albumName?: string
  type: 'event' | 'community'
  allowDelete?: boolean
}

export function PhotoGallery({
  eventId,
  communityId,
  albumName,
  type,
  allowDelete = false,
}: PhotoGalleryProps) {
  const { user } = useAuth()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchPhotos = async () => {
    try {
      const params = new URLSearchParams({ type })
      if (eventId) params.append('event_id', eventId)
      if (communityId) params.append('community_id', communityId)
      if (albumName) params.append('album_name', albumName)

      const res = await fetch(`/api/photos?${params}`)
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [eventId, communityId, albumName, type])

  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return

    setDeleting(photoId)
    try {
      const res = await fetch(`/api/photos/${photoId}?type=${type}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPhotos(photos.filter((p) => p.id !== photoId))
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(null)
        }
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-coral border-t-transparent mx-auto"></div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-card border-2 border-ink">
        <p className="text-sm text-muted-foreground">No photos yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square bg-card border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] hover:shadow-[3px_3px_0_0_hsl(var(--ink))] transition-all cursor-pointer overflow-hidden"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={photo.photo_url}
              alt={photo.caption || 'Photo'}
              className="w-full h-full object-cover"
            />

            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-ink/80 text-white p-2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                {photo.caption}
              </div>
            )}

            {allowDelete && user?.id === photo.uploaded_by && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(photo.id)
                }}
                disabled={deleting === photo.id}
                className="absolute top-2 right-2 p-2 bg-coral text-white border-2 border-ink shadow-[2px_2px_0_0_hsl(var(--ink))] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-ink/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-coral transition-colors"
            >
              <X size={32} />
            </button>

            <img
              src={selectedPhoto.photo_url}
              alt={selectedPhoto.caption || 'Photo'}
              className="w-full border-4 border-ink shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]"
            />

            {selectedPhoto.caption && (
              <div className="mt-4 bg-card border-2 border-ink p-4">
                <p className="text-sm font-mono">{selectedPhoto.caption}</p>
                {selectedPhoto.profiles && (
                  <p className="text-xs text-muted-foreground mt-2">
                    By {selectedPhoto.profiles.full_name || selectedPhoto.profiles.username}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
