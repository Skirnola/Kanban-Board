import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { MongoClient } from 'mongodb'
import pg from 'pg'

const { Pool } = pg

const PORT = process.env.PORT || 8082
const DATABASE_URL = process.env.DATABASE_URL
const MONGO_URI = process.env.MONGO_URI

const app = express()
const pool = new Pool({ connectionString: DATABASE_URL })
const mongoClient = new MongoClient(MONGO_URI)

let mongoDb

app.use(cors())
app.use(express.json())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const connectMongo = async (attempt = 1) => {
  try {
    await mongoClient.connect()
    mongoDb = mongoClient.db()
    console.log('DB Admin connected to MongoDB')
  } catch (error) {
    if (attempt >= 12) throw error
    console.log(`DB Admin waiting for MongoDB... retry ${attempt}/12`)
    await sleep(2500)
    return connectMongo(attempt + 1)
  }
}

const connectPostgres = async (attempt = 1) => {
  try {
    await pool.query('SELECT 1')
    console.log('DB Admin connected to PostgreSQL')
  } catch (error) {
    if (attempt >= 12) throw error
    console.log(`DB Admin waiting for PostgreSQL... retry ${attempt}/12`)
    await sleep(2500)
    return connectPostgres(attempt + 1)
  }
}

const safePostgresUsers = async () => {
  try {
    const result = await pool.query(`
      SELECT id, email, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `)

    return { rows: result.rows, error: null }
  } catch (error) {
    return { rows: [], error: error.message }
  }
}

const safeMongoTasks = async () => {
  try {
    const rows = await mongoDb
      .collection('tasks')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return {
      rows: rows.map((task) => ({
        id: task._id.toString(),
        userId: task.userId,
        title: task.title,
        description: task.description,
        status: task.status,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
      error: null,
    }
  } catch (error) {
    return { rows: [], error: error.message }
  }
}

const getSnapshot = async () => {
  const [usersResult, tasksResult] = await Promise.all([
    safePostgresUsers(),
    safeMongoTasks(),
  ])

  const userEmailById = new Map(
    usersResult.rows.map((user) => [String(user.id), user.email]),
  )

  const tasks = tasksResult.rows.map((task) => ({
    ...task,
    ownerEmail: userEmailById.get(String(task.userId)) || 'Unknown user',
  }))

  const statusCounts = tasks.reduce(
    (counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1
      return counts
    },
    { todo: 0, 'in-progress': 0, done: 0 },
  )

  return {
    generatedAt: new Date().toISOString(),
    postgres: {
      database: 'auth_db',
      table: 'users',
      error: usersResult.error,
      users: usersResult.rows,
    },
    mongo: {
      database: 'tasks_db',
      collection: 'tasks',
      error: tasksResult.error,
      tasks,
    },
    summary: {
      users: usersResult.rows.length,
      tasks: tasks.length,
      statusCounts,
    },
  }
}

const adminHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Kanban Database Admin</title>
  <style>
    :root {
      color: #162033;
      background: #eef2f8;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      --ink: #121827;
      --muted: #667085;
      --paper: #fbfcff;
      --paper-soft: #f5f7fc;
      --line: #dce3ef;
      --line-dark: #c5cfdf;
      --blue: #5267ff;
      --cyan: #16a7c7;
      --green: #12a66a;
      --amber: #d58a00;
      --red: #c02a3b;
      --shadow: 0 26px 70px rgba(33, 42, 68, .15);
      --shadow-hard: 10px 12px 0 rgba(18, 24, 39, .08);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-width: 320px;
      min-height: 100vh;
      overflow-x: hidden;
      background: #eef2f8;
    }

    button, input, select { font: inherit; }

    button { cursor: pointer; }

    main {
      position: relative;
      isolation: isolate;
      min-height: 100vh;
      padding: 24px;
      background: #eef2f8;
      overflow: hidden;
    }

    main::before {
      content: '';
      position: fixed;
      inset: 22px;
      z-index: -3;
      border: 1px solid rgba(18, 24, 39, .06);
      border-radius: 34px;
      pointer-events: none;
    }

    .scene {
      position: fixed;
      inset: 0;
      z-index: -2;
      pointer-events: none;
      perspective: 1000px;
    }

    .dot-field {
      position: absolute;
      inset: 0;
      opacity: .28;
    }

    .dot-field::before {
      content: '';
      position: absolute;
      top: 80px;
      left: 8%;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #9aa6ba;
      box-shadow:
        52px 0 #9aa6ba, 104px 0 #9aa6ba, 156px 0 #9aa6ba, 208px 0 #9aa6ba,
        0 52px #9aa6ba, 52px 52px #9aa6ba, 104px 52px #9aa6ba, 156px 52px #9aa6ba, 208px 52px #9aa6ba,
        0 104px #9aa6ba, 52px 104px #9aa6ba, 104px 104px #9aa6ba, 156px 104px #9aa6ba, 208px 104px #9aa6ba,
        0 156px #9aa6ba, 52px 156px #9aa6ba, 104px 156px #9aa6ba, 156px 156px #9aa6ba, 208px 156px #9aa6ba;
    }

    .plate {
      position: absolute;
      left: 50%;
      bottom: -160px;
      width: min(1080px, 130vw);
      height: 280px;
      border: 1px solid rgba(18, 24, 39, .08);
      border-radius: 50%;
      background: #e3e9f3;
      box-shadow: inset 0 20px 80px rgba(18, 24, 39, .05);
      transform: translateX(-50%) rotateX(66deg);
    }

    .cube {
      position: absolute;
      width: 74px;
      height: 74px;
      transform-style: preserve-3d;
      animation: float-cube 7s ease-in-out infinite;
    }

    .cube::before,
    .cube::after,
    .cube span {
      content: '';
      position: absolute;
      inset: 0;
      border: 1px solid rgba(18, 24, 39, .12);
      border-radius: 18px;
      background: #ffffff;
      box-shadow: 0 22px 46px rgba(33, 42, 68, .12);
    }

    .cube::before { transform: rotateY(90deg) translateZ(37px); background: #dde5f2; }
    .cube::after { transform: rotateX(90deg) translateZ(37px); background: #f5f7fc; }
    .cube span { transform: translateZ(37px); }

    .cube-one { top: 118px; right: 7%; transform: rotateX(-20deg) rotateY(38deg) rotateZ(8deg); }
    .cube-two { bottom: 145px; left: 5%; width: 54px; height: 54px; animation-delay: -3s; transform: rotateX(-18deg) rotateY(-36deg); }
    .cube-two::before { transform: rotateY(90deg) translateZ(27px); }
    .cube-two::after { transform: rotateX(90deg) translateZ(27px); }
    .cube-two span { transform: translateZ(27px); }

    .shell {
      width: min(1380px, 100%);
      margin: 0 auto;
    }

    .hero,
    .card {
      border: 1px solid rgba(255, 255, 255, .88);
      background: rgba(251, 252, 255, .82);
      box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, .9);
      backdrop-filter: blur(18px);
    }

    .hero {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      min-height: 230px;
      padding: 28px;
      margin-bottom: 18px;
      overflow: hidden;
      border-radius: 34px;
      animation: rise .55s ease both;
    }

    .hero::after {
      content: '';
      position: absolute;
      right: 38px;
      bottom: -44px;
      width: 190px;
      height: 190px;
      border: 1px solid rgba(18, 24, 39, .12);
      border-radius: 38px;
      background: #ffffff;
      box-shadow: var(--shadow-hard), 0 28px 60px rgba(33, 42, 68, .12);
      transform: rotateX(58deg) rotateZ(34deg);
      animation: float-prism 6s ease-in-out infinite;
    }

    .hero-copy {
      position: relative;
      z-index: 1;
      max-width: 740px;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      margin-bottom: 9px;
      color: #44546f;
      font-size: 12px;
      font-weight: 950;
      letter-spacing: .16em;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: '';
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 0 7px rgba(18, 166, 106, .12);
      animation: ping 1.8s ease-in-out infinite;
    }

    h1 {
      margin: 0;
      color: var(--ink);
      font-size: clamp(36px, 5vw, 70px);
      line-height: .92;
      letter-spacing: -.07em;
    }

    h2 {
      margin: 0;
      color: var(--ink);
      font-size: 22px;
      letter-spacing: -.035em;
    }

    p {
      color: var(--muted);
      line-height: 1.65;
    }

    .hero p { max-width: 650px; margin-bottom: 0; }

    .hero-actions {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    .connection-stack {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .chip,
    .badge,
    .status-badge,
    code {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border-radius: 999px;
      font-weight: 900;
      white-space: nowrap;
    }

    .chip {
      padding: 8px 11px;
      border: 1px solid #dce3ef;
      color: #334155;
      background: #ffffff;
      box-shadow: 0 10px 24px rgba(33, 42, 68, .08);
      font-size: 13px;
    }

    .chip::before,
    .status-badge::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }

    .button,
    button {
      position: relative;
      border: 1px solid #121827;
      border-radius: 16px;
      padding: 13px 17px;
      color: #ffffff;
      background: #121827;
      box-shadow: 7px 8px 0 rgba(18, 24, 39, .12);
      font-weight: 950;
      transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    }

    button:hover {
      transform: translate(-2px, -2px);
      box-shadow: 10px 11px 0 rgba(18, 24, 39, .13);
      background: #1f2937;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }

    .stat {
      position: relative;
      min-height: 146px;
      padding: 20px;
      overflow: hidden;
      border-radius: 28px;
      animation: lift-in .55s ease both;
      transform-style: preserve-3d;
      transition: transform .2s ease, box-shadow .2s ease;
    }

    .stat:nth-child(2) { animation-delay: .05s; }
    .stat:nth-child(3) { animation-delay: .1s; }
    .stat:nth-child(4) { animation-delay: .15s; }

    .stat:hover {
      transform: perspective(800px) translateY(-5px) rotateX(5deg) rotateY(-3deg);
      box-shadow: 0 34px 80px rgba(33, 42, 68, .18), inset 0 1px 0 rgba(255, 255, 255, .9);
    }

    .stat::after {
      content: '';
      position: absolute;
      right: 18px;
      bottom: 18px;
      width: 42px;
      height: 42px;
      border-radius: 14px;
      background: #edf1f8;
      border: 1px solid #dce3ef;
      box-shadow: 6px 7px 0 rgba(18, 24, 39, .06);
      transform: rotate(10deg);
    }

    .stat strong {
      display: block;
      color: var(--ink);
      font-size: 42px;
      letter-spacing: -.055em;
    }

    .stat span {
      color: var(--muted);
      font-weight: 900;
    }

    .section {
      padding: 18px;
      margin-bottom: 18px;
      border-radius: 30px;
      animation: rise .55s ease both;
    }

    .section-title {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    .section-title p { margin: 8px 0 0; }

    .badge {
      padding: 8px 11px;
      color: #41506b;
      border: 1px solid #dce3ef;
      background: #f7f9fd;
      font-size: 13px;
    }

    .toolbar {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin: 14px 0 16px;
    }

    input,
    select {
      min-width: 230px;
      border: 1px solid var(--line);
      border-radius: 16px;
      padding: 13px 14px;
      outline: 0;
      color: var(--ink);
      background: #ffffff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9), 0 10px 24px rgba(33, 42, 68, .05);
      transition: border-color .18s ease, transform .18s ease, box-shadow .18s ease;
    }

    input:focus,
    select:focus {
      border-color: #5267ff;
      box-shadow: 0 0 0 4px rgba(82, 103, 255, .12), 0 10px 24px rgba(33, 42, 68, .06);
      transform: translateY(-1px);
    }

    .error {
      padding: 12px 14px;
      margin-bottom: 12px;
      border: 1px solid #f5b7c0;
      border-radius: 16px;
      color: #9f1239;
      background: #fff1f3;
      font-weight: 850;
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid #e3e9f3;
      border-radius: 22px;
      background: #ffffff;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .9);
    }

    table {
      width: 100%;
      min-width: 840px;
      border-collapse: separate;
      border-spacing: 0;
      background: #ffffff;
    }

    th,
    td {
      padding: 14px 15px;
      border-bottom: 1px solid #edf1f7;
      text-align: left;
      vertical-align: top;
    }

    th {
      position: sticky;
      top: 0;
      z-index: 1;
      color: #47516b;
      background: #f7f9fd;
      font-size: 12px;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    td {
      color: #28344f;
      font-size: 14px;
    }

    tr {
      transition: background .16s ease, transform .16s ease;
    }

    tbody tr:hover {
      background: #fafcff;
    }

    tbody tr:last-child td { border-bottom: 0; }

    code {
      padding: 5px 8px;
      max-width: 210px;
      overflow: hidden;
      color: #3e4d68;
      background: #eef2f7;
      font-size: 12px;
      text-overflow: ellipsis;
      vertical-align: middle;
    }

    .muted { color: #8490a4; }

    .desc {
      max-width: 360px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .status-badge {
      padding: 6px 10px;
      border: 1px solid #dce3ef;
      font-size: 12px;
      letter-spacing: .05em;
      text-transform: uppercase;
    }

    .status-todo {
      color: #4056d6;
      background: #eef1ff;
      border-color: #d8ddff;
    }

    .status-in-progress {
      color: #9a6200;
      background: #fff5df;
      border-color: #ffe2a8;
    }

    .status-done {
      color: #087647;
      background: #e8f8ef;
      border-color: #c7efd8;
    }

    .row-empty td {
      padding: 26px 15px;
      text-align: center;
      font-weight: 850;
    }

    @keyframes rise {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes lift-in {
      from { opacity: 0; transform: translateY(18px) rotateX(4deg); }
      to { opacity: 1; transform: translateY(0) rotateX(0); }
    }

    @keyframes ping {
      0%, 100% { box-shadow: 0 0 0 6px rgba(18, 166, 106, .10); }
      50% { box-shadow: 0 0 0 10px rgba(18, 166, 106, .16); }
    }

    @keyframes float-cube {
      0%, 100% { margin-top: 0; }
      50% { margin-top: -18px; }
    }

    @keyframes float-prism {
      0%, 100% { transform: rotateX(58deg) rotateZ(34deg) translateY(0); }
      50% { transform: rotateX(58deg) rotateZ(41deg) translateY(-12px); }
    }

    @media (max-width: 900px) {
      main { padding: 12px; }
      main::before { inset: 10px; border-radius: 24px; }
      .hero { align-items: flex-start; flex-direction: column; min-height: 0; }
      .hero::after { right: -30px; opacity: .45; }
      .hero-actions { align-items: stretch; width: 100%; }
      .connection-stack { justify-content: flex-start; }
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
      .hero, .section, .stat { border-radius: 24px; }
      input, select, button { width: 100%; }
      .dot-field, .cube { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
      }
    }
  </style>
</head>
<body>
  <main>
    <div class="scene" aria-hidden="true">
      <div class="dot-field"></div>
      <div class="cube cube-one"><span></span></div>
      <div class="cube cube-two"><span></span></div>
      <div class="plate"></div>
    </div>

    <div class="shell">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">Combined Database Viewer</span>
          <h1>Kanban DB Admin</h1>
          <p>Read-only control surface for PostgreSQL users and MongoDB tasks. Clean, direct, and built so you can inspect the database without touching the app flow.</p>
        </div>
        <div class="hero-actions">
          <div class="connection-stack" aria-label="Connected databases">
            <span class="chip">PostgreSQL auth_db</span>
            <span class="chip">MongoDB tasks_db</span>
          </div>
          <button id="refresh" type="button">Refresh data</button>
        </div>
      </section>

      <section class="grid" aria-label="Database summary">
        <div class="card stat"><strong id="usersCount">-</strong><span>PostgreSQL Users</span></div>
        <div class="card stat"><strong id="tasksCount">-</strong><span>MongoDB Tasks</span></div>
        <div class="card stat"><strong id="todoCount">-</strong><span>To-Do</span></div>
        <div class="card stat"><strong id="doneCount">-</strong><span>Done</span></div>
      </section>

      <section class="card section">
        <div class="section-title">
          <div>
            <h2>All Tasks + Owners</h2>
            <p class="muted">MongoDB <code>tasks_db.tasks</code> joined with PostgreSQL users by userId.</p>
          </div>
          <span class="badge" id="updatedAt">Loading...</span>
        </div>
        <div class="toolbar">
          <input id="search" placeholder="Search title, email, status..." />
          <select id="statusFilter">
            <option value="all">All statuses</option>
            <option value="todo">To-Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div id="taskError"></div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task ID</th><th>Owner</th><th>Title</th><th>Description</th><th>Status</th><th>Created</th><th>Updated</th>
              </tr>
            </thead>
            <tbody id="tasksBody"></tbody>
          </table>
        </div>
      </section>

      <section class="card section">
        <div class="section-title">
          <div>
            <h2>Users</h2>
            <p class="muted">PostgreSQL <code>auth_db.users</code>. Password hashes are intentionally hidden.</p>
          </div>
        </div>
        <div id="userError"></div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Email</th><th>Created</th><th>Updated</th></tr></thead>
            <tbody id="usersBody"></tbody>
          </table>
        </div>
      </section>
    </div>
  </main>

  <script>
    let snapshot = null
    const $ = (id) => document.getElementById(id)
    const fmt = (value) => value ? new Date(value).toLocaleString() : '-'
    const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]))

    function render() {
      if (!snapshot) return
      const { summary, postgres, mongo, generatedAt } = snapshot
      $('usersCount').textContent = summary.users
      $('tasksCount').textContent = summary.tasks
      $('todoCount').textContent = summary.statusCounts.todo || 0
      $('doneCount').textContent = summary.statusCounts.done || 0
      $('updatedAt').textContent = 'Updated ' + fmt(generatedAt)

      $('userError').innerHTML = postgres.error ? '<div class="error">' + esc(postgres.error) + '</div>' : ''
      $('taskError').innerHTML = mongo.error ? '<div class="error">' + esc(mongo.error) + '</div>' : ''

      $('usersBody').innerHTML = postgres.users.length
        ? postgres.users.map((user) => '<tr><td><code>' + esc(user.id) + '</code></td><td>' + esc(user.email) + '</td><td>' + fmt(user.created_at) + '</td><td>' + fmt(user.updated_at) + '</td></tr>').join('')
        : '<tr class="row-empty"><td colspan="4" class="muted">No users yet.</td></tr>'

      const query = $('search').value.toLowerCase().trim()
      const status = $('statusFilter').value
      const tasks = mongo.tasks.filter((task) => {
        const searchable = [task.id, task.ownerEmail, task.userId, task.title, task.description, task.status].join(' ').toLowerCase()
        return (!query || searchable.includes(query)) && (status === 'all' || task.status === status)
      })

      $('tasksBody').innerHTML = tasks.length
        ? tasks.map((task) => '<tr><td><code>' + esc(task.id) + '</code></td><td>' + esc(task.ownerEmail) + '<br><span class="muted">userId: ' + esc(task.userId) + '</span></td><td>' + esc(task.title) + '</td><td class="desc" title="' + esc(task.description) + '">' + esc(task.description) + '</td><td><span class="status-badge status-' + esc(task.status) + '">' + esc(task.status) + '</span></td><td>' + fmt(task.createdAt) + '</td><td>' + fmt(task.updatedAt) + '</td></tr>').join('')
        : '<tr class="row-empty"><td colspan="7" class="muted">No tasks found.</td></tr>'
    }

    async function load() {
      $('updatedAt').textContent = 'Loading...'
      const response = await fetch('/api/snapshot')
      snapshot = await response.json()
      render()
    }

    $('refresh').addEventListener('click', load)
    $('search').addEventListener('input', render)
    $('statusFilter').addEventListener('change', render)
    load().catch((error) => {
      $('updatedAt').textContent = 'Failed to load'
      $('taskError').innerHTML = '<div class="error">' + esc(error.message) + '</div>'
    })
  </script>
</body>
</html>`

app.get('/api/snapshot', async (req, res) => {
  res.json(await getSnapshot())
})

app.get('/api/users', async (req, res) => {
  const users = await safePostgresUsers()
  res.json(users)
})

app.get('/api/tasks', async (req, res) => {
  const tasks = await safeMongoTasks()
  res.json(tasks)
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'db-admin' })
})

app.get('/', (req, res) => {
  res.type('html').send(adminHtml)
})

Promise.all([connectPostgres(), connectMongo()])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`DB Admin running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Failed to start DB Admin', error)
    process.exit(1)
  })
