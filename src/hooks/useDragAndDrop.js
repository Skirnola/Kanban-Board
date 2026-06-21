import { useState } from 'react'

export const useDragAndDrop = (onDropTask) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null)

  const onDragStart = (taskId, event) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', taskId)
    setDraggedTaskId(taskId)
  }

  const onDragEnd = () => {
    setDraggedTaskId(null)
  }

  const onDragOver = (event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }

  const onDrop = (status, event) => {
    event.preventDefault()
    const taskId = draggedTaskId || event.dataTransfer.getData('text/plain')
    if (!taskId) return
    onDropTask(taskId, status)
    setDraggedTaskId(null)
  }

  return { draggedTaskId, onDragStart, onDragEnd, onDragOver, onDrop }
}
