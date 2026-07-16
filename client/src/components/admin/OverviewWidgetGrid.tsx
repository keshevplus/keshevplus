import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GripVertical, Pencil, Check, Plus, X, type LucideIcon } from 'lucide-react'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

export interface OverviewWidgetDef {
  value: string
  icon: LucideIcon
  he: string
  en: string
  heDesc: string
  enDesc: string
}

interface OverviewWidgetGridProps {
  widgets: OverviewWidgetDef[]
  badgeMap: Record<string, number>
  onNavigate: (tab: string) => void
}

const LAYOUT_ENDPOINT = '/api/admin/dashboard-layout'

const WidgetCard = ({ widget, badgeCount, isHe, onNavigate }: {
  widget: OverviewWidgetDef
  badgeCount: number
  isHe: boolean
  onNavigate: (tab: string) => void
}) => (
  <Card
    className="hover-elevate cursor-pointer h-full"
    onClick={() => onNavigate(widget.value)}
    data-testid={`widget-card-${widget.value}`}
  >
    <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{isHe ? widget.he : widget.en}</CardTitle>
      <div className="flex items-center gap-2">
        {badgeCount > 0 && (
          <Badge variant="destructive" data-testid={`badge-widget-${widget.value}`}>
            {badgeCount} {isHe ? 'חדשות' : 'new'}
          </Badge>
        )}
        <widget.icon className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-xs text-muted-foreground">{isHe ? widget.heDesc : widget.enDesc}</p>
    </CardContent>
  </Card>
)

const SortableWidgetCard = ({ widget, badgeCount, isHe, isEditing, onRemove }: {
  widget: OverviewWidgetDef
  badgeCount: number
  isHe: boolean
  isEditing: boolean
  onRemove: (value: string) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widget.value })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className={cn('relative', isDragging && 'z-10 opacity-70')}>
      <Card className="h-full" data-testid={`widget-card-${widget.value}`}>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
              aria-label={isHe ? 'גרירה לסידור מחדש' : 'Drag to reorder'}
              data-testid={`button-drag-${widget.value}`}
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <CardTitle className="text-sm font-medium">{isHe ? widget.he : widget.en}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {badgeCount > 0 && (
              <Badge variant="destructive">{badgeCount} {isHe ? 'חדשות' : 'new'}</Badge>
            )}
            <widget.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <button
              type="button"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(widget.value)}
              aria-label={isHe ? 'הסרת ווידג׳ט' : 'Remove widget'}
              data-testid={`button-remove-widget-${widget.value}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{isHe ? widget.heDesc : widget.enDesc}</p>
        </CardContent>
      </Card>
    </div>
  )
}

const OverviewWidgetGrid = ({ widgets, badgeMap, onNavigate }: OverviewWidgetGridProps) => {
  const { language, isRTL } = useLanguage()
  const isHe = language === 'he'
  const catalogIds = widgets.map(w => w.value)

  const [order, setOrder] = useState<string[]>(catalogIds)
  const [isEditing, setIsEditing] = useState(false)
  const [addPopoverOpen, setAddPopoverOpen] = useState(false)
  const hasUserEditedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    fetch(LAYOUT_ENDPOINT, { credentials: 'include' })
      .then(res => (res.ok ? res.json() : null))
      .then((data: { widgets?: string[] } | null) => {
        if (cancelled || hasUserEditedRef.current || !data?.widgets) return
        const saved = data.widgets.filter(id => catalogIds.includes(id))
        const missing = catalogIds.filter(id => !saved.includes(id))
        setOrder([...saved, ...missing])
      })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const widgetByValue = new Map(widgets.map(w => [w.value, w]))
  const visibleWidgets = order.filter(id => widgetByValue.has(id))
  const hiddenWidgets = catalogIds.filter(id => !order.includes(id))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder(current => {
      const oldIndex = current.indexOf(String(active.id))
      const newIndex = current.indexOf(String(over.id))
      if (oldIndex === -1 || newIndex === -1) return current
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  const handleRemove = (value: string) => {
    setOrder(current => current.filter(id => id !== value))
  }

  const handleAdd = (value: string) => {
    setOrder(current => [...current, value])
  }

  const handleDone = async () => {
    setIsEditing(false)
    try {
      await fetch(LAYOUT_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ widgets: order }),
      })
    } catch {}
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {isHe ? 'האפליקציות שלי' : 'My apps'}
        </h2>
        <div className="flex items-center gap-2">
          {isEditing && (
            <Popover open={addPopoverOpen} onOpenChange={setAddPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" disabled={hiddenWidgets.length === 0} data-testid="button-add-widget">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {isHe ? 'הוספת ווידג׳ט' : 'Add widget'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align={isRTL ? 'start' : 'end'}>
                {hiddenWidgets.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{isHe ? 'כל הווידג׳טים מוצגים' : 'All widgets are shown'}</p>
                ) : (
                  <div className="space-y-1">
                    {hiddenWidgets.map(id => {
                      const w = widgetByValue.get(id)!
                      return (
                        <button
                          key={id}
                          type="button"
                          className="w-full flex items-center gap-2 rounded-md border p-2 text-start text-sm transition hover:bg-muted"
                          onClick={() => { handleAdd(id); setAddPopoverOpen(false) }}
                          data-testid={`button-add-widget-${id}`}
                        >
                          <w.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          {isHe ? w.he : w.en}
                        </button>
                      )
                    })}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          )}
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleDone()
              } else {
                hasUserEditedRef.current = true
                setIsEditing(true)
              }
            }}
            data-testid="button-toggle-customize"
          >
            {isEditing ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Pencil className="h-3.5 w-3.5 mr-1.5" />}
            {isEditing ? (isHe ? 'סיום' : 'Done') : (isHe ? 'התאמה אישית' : 'Customize')}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={visibleWidgets} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleWidgets.map(id => (
                <SortableWidgetCard
                  key={id}
                  widget={widgetByValue.get(id)!}
                  badgeCount={badgeMap[id] ?? 0}
                  isHe={isHe}
                  isEditing={isEditing}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWidgets.map(id => (
            <WidgetCard
              key={id}
              widget={widgetByValue.get(id)!}
              badgeCount={badgeMap[id] ?? 0}
              isHe={isHe}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default OverviewWidgetGrid
