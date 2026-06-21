import mongoose from 'mongoose'
import Task, { allowedStatuses } from '../models/Task.js'

const ensureValidStatus = (status) => {
  if (!allowedStatuses.includes(status)) {
    const error = new Error('Invalid task status')
    error.statusCode = 400
    throw error
  }
}

const ensureValidTaskInput = ({ title, description }) => {
  if (!title || !title.trim()) {
    const error = new Error('Task title is required')
    error.statusCode = 400
    throw error
  }

  if (!description || !description.trim()) {
    const error = new Error('Task description is required')
    error.statusCode = 400
    throw error
  }
}

const ensureValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Task not found')
    error.statusCode = 404
    throw error
  }
}

export const createTaskForUser = async (userId, taskInput) => {
  ensureValidTaskInput(taskInput)

  return Task.create({
    userId,
    title: taskInput.title.trim(),
    description: taskInput.description.trim(),
    status: 'todo',
  })
}

export const getTasksForUser = (userId) =>
  Task.find({ userId }).sort({ createdAt: -1 })

export const updateTaskStatusForUser = async (userId, taskId, status) => {
  ensureValidId(taskId)
  ensureValidStatus(status)

  const task = await Task.findOneAndUpdate(
    { _id: taskId, userId },
    { status },
    { new: true, runValidators: true },
  )

  if (!task) {
    const error = new Error('Task not found')
    error.statusCode = 404
    throw error
  }

  return task
}

export const deleteTaskForUser = async (userId, taskId) => {
  ensureValidId(taskId)

  const task = await Task.findOneAndDelete({ _id: taskId, userId })

  if (!task) {
    const error = new Error('Task not found')
    error.statusCode = 404
    throw error
  }

  return task
}
