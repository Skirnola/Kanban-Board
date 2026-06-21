import TaskCard from './TaskCard'
import TaskModal from './TaskModal'

function Column({
  column,
  tasks,
  canCreate,
  onCreate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  busy,
}) {
  return (
    <section
      className={`kanban-column ${column.id}`}
      onDragOver={onDragOver}
      onDrop={(event) => onDrop(column.id, event)}
    >
      <div className="column-header">
        <div>
          <h2>{column.title}</h2>
          <p>{column.hint}</p>
        </div>
        <span className="task-count">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {!tasks.length && <div className="empty-column">Drop tasks here</div>}
      </div>

      {canCreate && <TaskModal onCreate={onCreate} disabled={busy} />}
    </section>
  )
}

export default Column
