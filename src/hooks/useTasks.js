import { useCallback, useEffect, useState } from 'react'
import { taskApi } from '../api/taskApi'
import { normalizeTask } from '../utils/taskUtils'

export const useTasks = (token) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTasks = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError('')
      const data = await taskApi.getTasks(token)
      setTasks((data || []).map(normalizeTask))
    } catch (err) {
      setError(err.message || 'Unable to load tasks')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const createTask = async ({ title, description }) => {
    const created = normalizeTask(await taskApi.createTask({ title, description }, token))
    setTasks((current) => [created, ...current])
    return created
  }

  const updateTaskStatus = async (taskId, status) => {
    const previousTasks = tasks
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, status } : task)),
    )

    try {
      const updated = normalizeTask(await taskApi.updateTaskStatus(taskId, status, token))
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updated : task)),
      )
    } catch (err) {
      setTasks(previousTasks)
      throw err
    }
  }

  const deleteTask = async (taskId) => {
    const previousTasks = tasks
    setTasks((current) => current.filter((task) => task.id !== taskId))

    try {
      await taskApi.deleteTask(taskId, token)
    } catch (err) {
      setTasks(previousTasks)
      throw err
    }
  }

  return {
    tasks,
    loading,
    error,
    setError,
    reload: loadTasks,
    createTask,
    updateTaskStatus,
    deleteTask,
  }
}
