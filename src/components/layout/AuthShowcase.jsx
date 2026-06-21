function AuthShowcase() {
  return (
    <div className="auth-showcase" aria-hidden="true">
      <div className="showcase-board">
        <div className="showcase-lane lane-todo">
          <span />
          <b />
          <b />
        </div>
        <div className="showcase-lane lane-progress">
          <span />
          <b />
        </div>
        <div className="showcase-lane lane-done">
          <span />
          <b />
          <b />
        </div>
      </div>
      <div className="showcase-cube cube-one" />
      <div className="showcase-cube cube-two" />
      <div className="showcase-glow" />
    </div>
  )
}

export default AuthShowcase
