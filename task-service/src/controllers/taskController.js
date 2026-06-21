import {
  createTaskForUser,
  deleteTaskForUser,
  getTasksForUser,
  updateTaskStatusForUser,
} from '../services/taskService.js'

export const createTask = async (req, res, next) => {
  try {
    const task = await createTaskForUser(req.user.id, req.body)
    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await getTasksForUser(req.user.id)
    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await updateTaskStatusForUser(
      req.user.id,
      req.params.id,
      req.body.status,
    )
    res.json(task)
  } catch (error) {
    next(error)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    await deleteTaskForUser(req.user.id, req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
