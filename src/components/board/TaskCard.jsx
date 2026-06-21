function TaskCard({ task, onDelete, onDragStart, onDragEnd }) {
  return (
    <article
      className={`task-card ${task.status}`}
      draggable
      onDragStart={(event) => onDragStart(task.id, event)}
      onDragEnd={onDragEnd}
    >
      <span className="card-pin" aria-hidden="true" />
      <div className="task-card-topline">
        <span className={`status-pill ${task.status}`}>{task.status}</span>
        <span className="drag-grip" aria-hidden="true">•••</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}
      >
        Remove
      </button>
    </article>
  )
}

export default TaskCard
