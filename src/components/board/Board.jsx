import { useMemo } from 'react'
import { useDragAndDrop } from '../../hooks/useDragAndDrop'
import { useTasks } from '../../hooks/useTasks'
import { groupTasksByStatus, isValidStatus, STATUSES } from '../../utils/taskUtils'
import Column from './Column'

function Board({ token }) {
  const {
    tasks,
    loading,
    error,
    setError,
    createTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks(token)

  const groupedTasks = useMemo(() => groupTasksByStatus(tasks), [tasks])

  const moveTask = async (taskId, status) => {
    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.status === status || !isValidStatus(status)) return

    try {
      await updateTaskStatus(taskId, status)
    } catch (err) {
      setError(err.message || 'Could not update task status')
    }
  }

  const drag = useDragAndDrop(moveTask)

  const handleCreate = async (task) => {
    try {
      setError('')
      await createTask(task)
    } catch (err) {
      setError(err.message || 'Could not create task')
    }
  }

  const handleDelete = async (taskId) => {
    try {
      setError('')
      await deleteTask(taskId)
    } catch (err) {
      setError(err.message || 'Could not delete task')
    }
  }

  if (loading) {
    return <div className="state-card">Loading your board...</div>
  }

  return (
    <>
      {error && <div className="alert error board-alert">{error}</div>}

      <section
        className={`kanban-board ${drag.draggedTaskId ? 'is-dragging' : ''}`}
        aria-label="Kanban board"
      >
        {STATUSES.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={groupedTasks[column.id] || []}
            canCreate={column.id === 'todo'}
            onCreate={handleCreate}
            onDelete={handleDelete}
            onDragStart={drag.onDragStart}
            onDragEnd={drag.onDragEnd}
            onDragOver={drag.onDragOver}
            onDrop={drag.onDrop}
            busy={Boolean(drag.draggedTaskId)}
          />
        ))}
      </section>
    </>
  )
}

export default Board
