export const STATUSES = [
  { id: 'todo', title: 'To-Do', hint: 'Plan and prioritize new work.' },
  { id: 'in-progress', title: 'In Progress', hint: 'Tasks currently being built.' },
  { id: 'done', title: 'Done', hint: 'Completed and shipped work.' },
]

export const normalizeTask = (task) => ({
  ...task,
  id: task.id || task._id,
})

export const groupTasksByStatus = (tasks) =>
  STATUSES.reduce((groups, column) => {
    groups[column.id] = tasks
      .map(normalizeTask)
      .filter((task) => task.status === column.id)
    return groups
  }, {})

export const isValidStatus = (status) =>
  STATUSES.some((column) => column.id === status)
