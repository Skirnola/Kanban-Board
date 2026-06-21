function BoardHeader({ user, onLogout }) {
  return (
    <header className="board-header">
      <div className="header-copy">
        <span className="eyebrow">Collaborative Kanban</span>
        <h1>Team Workspace</h1>
        <p>Signed in as {user?.email}</p>
        <div className="workspace-chip" aria-hidden="true">
          <span /> Live sprint surface
        </div>
      </div>

      <div className="header-actions">
        <button type="button" className="secondary-button">
          Create New Board
        </button>
        <button type="button" className="ghost-button" onClick={onLogout}>
          Logout
        </button>
      </div>
      <div className="header-prism" aria-hidden="true" />
    </header>
  )
}

export default BoardHeader
