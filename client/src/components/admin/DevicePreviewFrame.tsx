import { Button } from '@/components/ui/button'
import { Tv, Monitor, Laptop, Tablet, Smartphone, type LucideIcon } from 'lucide-react'
import type { RefObject } from 'react'

export type PreviewViewport = 'tv' | 'desktop' | 'laptop' | 'tablet' | 'mobile'

interface ViewportSpec {
  width: number
  height: number
  labelHe: string
  labelEn: string
  icon: LucideIcon
}

// Real device dimensions (not just a width with an arbitrary/scrolling
// height) so the preview shows an accurate aspect ratio per breakpoint,
// scaled down to fit rather than cropped.
export const PREVIEW_VIEWPORTS: Record<PreviewViewport, ViewportSpec> = {
  tv: { width: 1920, height: 1080, labelHe: 'טלוויזיה', labelEn: 'TV', icon: Tv },
  desktop: { width: 1440, height: 900, labelHe: 'מחשב שולחני', labelEn: 'Desktop', icon: Monitor },
  laptop: { width: 1280, height: 800, labelHe: 'מחשב נייד', labelEn: 'Laptop', icon: Laptop },
  tablet: { width: 768, height: 1024, labelHe: 'טאבלט', labelEn: 'Tablet', icon: Tablet },
  mobile: { width: 375, height: 812, labelHe: 'נייד (לאורך)', labelEn: 'Mobile (portrait)', icon: Smartphone },
}

const VIEWPORT_ORDER: PreviewViewport[] = ['tv', 'desktop', 'laptop', 'tablet', 'mobile']

export function ViewportSwitcher({
  viewport,
  onChange,
  isHe,
}: {
  viewport: PreviewViewport
  onChange: (v: PreviewViewport) => void
  isHe: boolean
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {VIEWPORT_ORDER.map((key) => {
        const spec = PREVIEW_VIEWPORTS[key]
        const Icon = spec.icon
        return (
          <Button
            key={key}
            size="sm"
            variant={viewport === key ? 'default' : 'ghost'}
            onClick={() => onChange(key)}
            title={isHe ? spec.labelHe : spec.labelEn}
            data-testid={`button-viewport-${key}`}
          >
            <Icon className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline text-xs">{isHe ? spec.labelHe : spec.labelEn}</span>
          </Button>
        )
      })}
    </div>
  )
}

interface DeviceFrameProps {
  viewport: PreviewViewport
  iframeRef: RefObject<HTMLIFrameElement>
  src: string
  onLoad: () => void
  title: string
  maxWidth?: number
  maxHeight?: number
}

// Scales the iframe via CSS transform so the true device width x height
// (and therefore its real aspect ratio) is preserved, rather than just
// setting a width and letting height scroll arbitrarily.
export function DeviceFrame({ viewport, iframeRef, src, onLoad, title, maxWidth = 880, maxHeight = 560 }: DeviceFrameProps) {
  const device = PREVIEW_VIEWPORTS[viewport]
  const scale = Math.min(1, maxWidth / device.width, maxHeight / device.height)
  const displayWidth = device.width * scale
  const displayHeight = device.height * scale

  return (
    <div className="flex justify-center bg-muted/30 py-4 overflow-auto">
      <div style={{ width: displayWidth, height: displayHeight }}>
        <div
          className="border rounded-md shadow bg-white dark:bg-neutral-900 overflow-hidden"
          style={{
            width: device.width,
            height: device.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          <iframe
            ref={iframeRef}
            src={src}
            onLoad={onLoad}
            style={{ width: device.width, height: device.height, border: 'none' }}
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
