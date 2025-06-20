import React, { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

// Componente para item arrastável
const SortableItem = React.memo(({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`draggable-item ${isDragging ? 'dragging' : ''}`}
    >
      <div 
        className="drag-handle" 
        {...attributes} 
        {...listeners}
        role="button"
        aria-label="Arrastar para reordenar"
        tabIndex={0}
      >
        <GripVertical size={16} className="text-gray-400 hover:text-gray-600" />
      </div>
      <div className="draggable-content">
        {children}
      </div>
    </div>
  )
})

// Componente principal da lista arrastável
const DraggableList = ({ items, onReorder, renderItem, keyExtractor }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Memoiza os IDs para evitar recriações desnecessárias
  const itemIds = useMemo(() => {
    return items.map((item, index) => keyExtractor(item, index))
  }, [items, keyExtractor])

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over?.id && over?.id) {
      const oldIndex = itemIds.indexOf(active.id)
      const newIndex = itemIds.indexOf(over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex)
        onReorder(newItems)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={itemIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="draggable-list">
          {items.map((item, index) => {
            const itemId = keyExtractor(item, index)
            return (
              <SortableItem key={itemId} id={itemId}>
                {renderItem(item, index)}
              </SortableItem>
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}

export default DraggableList