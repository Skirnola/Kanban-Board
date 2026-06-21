function AppLayout({ children }) {
  return (
    <main className="app-shell">
      <div className="ambient-scene" aria-hidden="true">
        <span className="orb orb-one" />
        <span className="orb orb-two" />
        <span className="orb orb-three" />
        <span className="grid-floor" />
      </div>
      {children}
    </main>
  )
}

export default AppLayout
