import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { useLanguage } from '@/hooks/useLanguage'

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

interface ImageSlotUploaderProps {
  slot: string
  label: string
}

// Upload/replace/remove control for a single CMS image slot. Reused by the
// per-section editors and by the global Images manager — this is the write
// side of the SiteImage/SectionImage read components.
export function ImageSlotUploader({ slot, label }: ImageSlotUploaderProps) {
  const { language } = useLanguage()
  const isHe = language === 'he'
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [version, setVersion] = useState(0)
  const [hasImage, setHasImage] = useState(true)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const dataUrl = await readAsDataUrl(file)
      const [prefix, base64] = dataUrl.split(',')
      const mimeType = /data:(.*);base64/.exec(prefix)?.[1] || file.type
      await apiRequest('PUT', `/api/admin/images/${encodeURIComponent(slot)}`, {
        mimeType,
        filename: file.name,
        dataBase64: base64,
      })
      setHasImage(true)
      setVersion((v) => v + 1)
      toast({ title: isHe ? 'התמונה עודכנה' : 'Image updated' })
    } catch {
      toast({ title: isHe ? 'שגיאה' : 'Error', description: isHe ? 'העלאת התמונה נכשלה' : 'Failed to upload image', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    try {
      await apiRequest('DELETE', `/api/admin/images/${encodeURIComponent(slot)}`)
      setHasImage(false)
      setVersion((v) => v + 1)
    } catch {
      toast({ title: isHe ? 'שגיאה' : 'Error', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center">
          {hasImage && (
            <img
              src={`/api/images/${encodeURIComponent(slot)}?v=${version}`}
              alt=""
              className="h-full w-full object-cover"
              onError={() => setHasImage(false)}
            />
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          {uploading ? (isHe ? 'מעלה...' : 'Uploading...') : (isHe ? 'העלאה' : 'Upload')}
        </Button>
        {hasImage && (
          <Button type="button" size="icon" variant="ghost" onClick={handleRemove}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
