import { request } from './axiosClient'

const TASK_API_URL = import.meta.env.VITE_TASK_API_URL || 'http://localhost:5000'

export const taskApi = {
  getTasks: (token) => request(TASK_API_URL, '/tasks', { method: 'GET', token }),

  createTask: (task, token) =>
    request(TASK_API_URL, '/tasks', {
      method: 'POST',
      body: task,
      token,
    }),

  updateTaskStatus: (id, status, token) =>
    request(TASK_API_URL, `/tasks/${id}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    }),

  deleteTask: (id, token) =>
    request(TASK_API_URL, `/tasks/${id}`, {
      method: 'DELETE',
      token,
    }),
}
