import { useState } from 'react'

function TaskModal({ onCreate, disabled }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !description.trim()) return

    await onCreate({ title: title.trim(), description: description.trim() })
    setTitle('')
    setDescription('')
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Task title"
        required
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Short task description"
        rows="3"
        required
      />
      <button type="submit" className="add-task-button" disabled={disabled}>
        + Add Task
      </button>
    </form>
  )
}

export default TaskModal
