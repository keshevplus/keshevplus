import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Image } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { ImageSlotUploader } from './ImageSlotUploader'

const GLOBAL_IMAGE_SLOTS = [
  { slot: 'logo', labelHe: 'לוגו', labelEn: 'Logo' },
  { slot: 'hero.image', labelHe: 'תמונת הירו', labelEn: 'Hero image' },
  { slot: 'about.photo', labelHe: 'תמונת אודות', labelEn: 'About photo' },
]

// Global, site-wide image slots (logo, hero photo, about photo) — the main
// touchpoints for rebranding this template for a different business. Images
// used inside individual CMS sections are uploaded from the Sections tab
// instead, right next to the content they belong to.
const ImagesManager = () => {
  const { language } = useLanguage()
  const isHe = language === 'he'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Image className="h-5 w-5 text-muted-foreground" />
          <CardTitle>{isHe ? 'תמונות האתר' : 'Site Images'}</CardTitle>
        </div>
        <CardDescription>
          {isHe
            ? 'החלפת התמונות המרכזיות של האתר (לוגו, תמונת הירו, תמונת אודות). תמונות של מקטעים חדשים מנוהלות בלשונית "מקטעים".'
            : 'Replace the site\'s core images (logo, hero photo, about photo). Images for individual CMS sections are managed from the Sections tab.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {GLOBAL_IMAGE_SLOTS.map(({ slot, labelHe, labelEn }) => (
          <ImageSlotUploader key={slot} slot={slot} label={isHe ? labelHe : labelEn} />
        ))}
      </CardContent>
    </Card>
  )
}

export default ImagesManager
