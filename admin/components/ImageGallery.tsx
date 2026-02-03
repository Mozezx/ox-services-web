import { useState } from 'react'
import { TimelineEntry, resolveMediaUrl } from '../lib/api'

interface ImageGalleryProps {
  entries: TimelineEntry[]
  onEdit?: (entry: TimelineEntry) => void
  onDelete?: (entry: TimelineEntry) => void
}

const ImageGallery = ({ entries, onEdit, onDelete }: ImageGalleryProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const getMediaUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    return url
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = 'unset'
  }

  const goToPrevious = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? entries.length - 1 : lightboxIndex - 1)
    }
  }

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === entries.length - 1 ? 0 : lightboxIndex + 1)
    }
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-text-light">
        <span className="material-symbols-outlined text-4xl mb-2">photo_library</span>
        <p>Nenhuma mídia na timeline ainda</p>
      </div>
    )
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-background border border-border cursor-pointer hover:border-primary transition-all hover:shadow-lg"
            onClick={() => openLightbox(index)}
          >
            {entry.type === 'image' ? (
              <img
                src={resolveMediaUrl(entry.thumbnail_url || entry.media_url)}
                alt={entry.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = resolveMediaUrl(entry.media_url) || '/placeholder.png'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 relative">
                {(entry.thumbnail_url || entry.media_url) ? (
                  <img
                    src={resolveMediaUrl(entry.thumbnail_url || entry.media_url)}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : null}
                <span className="material-symbols-outlined text-4xl text-primary relative z-10 drop-shadow">play_circle</span>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-medium truncate">{entry.title}</p>
                <p className="text-white/70 text-xs">{new Date(entry.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Type Badge */}
            <div className="absolute top-2 left-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                entry.type === 'image' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {entry.type === 'image' ? 'Foto' : 'Vídeo'}
              </span>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(entry)
                    }}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-primary hover:text-white transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(entry)
                    }}
                    className="p-1.5 bg-white rounded-lg shadow hover:bg-red-600 hover:text-white transition-colors"
                    title="Excluir"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="lightbox-overlay"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-4xl">chevron_left</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-4xl">chevron_right</span>
          </button>

          {/* Content */}
          <div 
            className="max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {entries[lightboxIndex].type === 'image' ? (
              <img
                src={resolveMediaUrl(entries[lightboxIndex].media_url)}
                alt={entries[lightboxIndex].title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={resolveMediaUrl(entries[lightboxIndex].media_url)}
                poster={(entries[lightboxIndex].thumbnail_url || entries[lightboxIndex].media_url) ? resolveMediaUrl(entries[lightboxIndex].thumbnail_url || entries[lightboxIndex].media_url) : undefined}
                controls
                className="max-w-full max-h-[75vh] rounded-lg"
              />
            )}

            {/* Info */}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{entries[lightboxIndex].title}</h3>
              {entries[lightboxIndex].description && (
                <p className="text-white/70 mt-1">{entries[lightboxIndex].description}</p>
              )}
              <p className="text-white/50 text-sm mt-2">
                {new Date(entries[lightboxIndex].date).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p className="text-white/40 text-xs mt-2">
                {lightboxIndex + 1} de {entries.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery
