import { useEffect, useState, type ReactNode } from 'react'
import './App.css'
import TasksPage from './features/tasks/TasksPage'
import NotesPage from './features/notes/NotesPage'
import CalculatorPage from './features/calculator/CalculatorPage'
import { getTasks, updateTask, type TaskRecord } from './lib/db'

type IconName =
  | 'grid'
  | 'check'
  | 'note'
  | 'calculator'
  | 'plus'
  | 'arrow'
  | 'search'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }

  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    check: (
      <>
        <path d="m5 12 4 4L19 6" />
        <path d="M21 12a9 9 0 1 1-5.4-8.25" />
      </>
    ),
    note: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M8 13h8M8 17h6" />
      </>
    ),
    calculator: (
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M8 6h8v4H8zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
  }

  return <svg {...common}>{paths[name]}</svg>
}

const tools: {
  name: string
  description: string
  icon: IconName
  color: string
}[] = [
    {
      name: 'To-do list',
      description: 'What should be done today',
      icon: 'check',
      color: 'mint',
    },
    {
      name: 'Notes',
      description: 'Keep your thought in writing',
      icon: 'note',
      color: 'lavender',
    },
    {
      name: 'Calculator',
      description: 'Simple math calculations',
      icon: 'calculator',
      color: 'peach',
    },
  ]

function formatDateTime(value?: string): string | null {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function App() {
  const navigation: { label: string; icon: IconName }[] = [
    { label: 'Overview', icon: 'grid' },
    { label: 'To-do list', icon: 'check' },
    { label: 'Notes', icon: 'note' },
    { label: 'Calculator', icon: 'calculator' },
  ]

  const [activePage, setActivePage] = useState('Overview')
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [taskError, setTaskError] = useState('')

  useEffect(() => {
    if (activePage !== 'Overview') return
  
    let cancelled = false
  
    getTasks()
      .then((savedTasks) => {
        if (!cancelled) {
          setTasks(savedTasks)
          setTaskError('')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTaskError('Could not load your tasks. Please try again.')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTasksLoading(false)
        }
      })
  
    return () => {
      cancelled = true
    }
  }, [activePage])

  const completedTasks = tasks.filter((task) => task.completed).length

  async function toggleTask(id: number) {
    const task = tasks.find((item) => item.id === id)
    if (!task) return

    const updated = {
      ...task,
      completed: !task.completed,
    }

    try {
      await updateTask(updated)

      setTasks((current) =>
        current.map((item) => item.id === id ? updated : item),
      )

      setTaskError('')
    } catch {
      setTaskError('Could not update this task. Please try again.')
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#home"
          onClick={() => setActivePage('Overview')}
        >
          <span className="brand-mark">pH</span>
          <span>PocketHub</span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-item ${activePage === item.label ? 'active' : ''
                }`}
              key={item.label}
              onClick={() => setActivePage(item.label)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">P</div>

          <div className="profile-copy">
            <strong>PocketHub</strong>
            <span>Personal workspace</span>
          </div>

          <button
            className="icon-button profile-menu"
            aria-label="Workspace options"
            title="Workspace options"
          >
            ···
          </button>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button search-button"
              aria-label="Search"
              title="Search"
            >
              <Icon name="search" size={19} />
            </button>

            <div className="top-avatar">P</div>
          </div>
        </header>

        {activePage === 'To-do list' ? (
          <TasksPage />
        ) : activePage === 'Notes' ? (
          <NotesPage />
        ) : activePage === 'Calculator' ? (
          <CalculatorPage />
        ) : (
          <div className="dashboard-content">
            <section className="welcome-section">
              <div>
                <div className="eyebrow">YOUR PERSONAL WORKSPACE</div>
                <h1>Get a little more organized.</h1>
                <p>A clear mind starts with a simple plan.</p>
              </div>

              <div className="date-pill">
                <span className="date-dot" />
                Your daily workspace
              </div>
            </section>

            <section className="tools-section">
              <div className="section-heading">
                <div>
                  <h2>Quick access</h2>
                  <p>Your everyday essentials</p>
                </div>
                {/* Save it for other time
                <button className="text-button" onClick={() => setActivePage('Overview')}>
                All tools <Icon name="arrow" size={16} />
                </button>
                */}
              </div>

              <div className="tool-grid">
                {tools.map((tool) => (
                  <button className="tool-card" key={tool.name} onClick={() => setActivePage(tool.name)}>
                    <span className={`tool-icon ${tool.color}`}>
                      <Icon name={tool.icon} size={22} />
                    </span>

                    <span className="tool-copy">
                      <strong>{tool.name}</strong>
                      <span>{tool.description}</span>
                    </span>

                    <span className="tool-arrow">
                      <Icon name="arrow" size={17} />
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <div className="content-grid">
              <section className="panel-card tasks-card">
                <div className="section-heading">
                  <div>
                    <h2>Your scheduled tasks</h2>
                    <p>
                      {tasks.length > 0
                        ? 'A quick look at what is on your list'
                        : 'Your plans will show up here'}
                    </p>
                  </div>

                  <span className="count-badge">
                    {completedTasks}/{tasks.length}
                  </span>
                </div>

                {tasksLoading ? (
                  <p className="empty-state">Loading your tasks…</p>
                ) : (
                  <>
                    <div className="task-progress">
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${tasks.length
                                ? (completedTasks / tasks.length) * 100
                                : 0
                              }%`,
                          }}
                        />
                      </div>

                      <span>
                        {tasks.length
                          ? Math.round(
                            (completedTasks / tasks.length) * 100,
                          )
                          : 0}
                        % complete
                      </span>
                    </div>

                    {taskError && (
                      <p className="error-message" role="alert">
                        {taskError}
                      </p>
                    )}

                    {tasks.length === 0 ? (
                      <div className="empty-state">
                        <span className="empty-symbol">
                          <Icon name="check" size={20} />
                        </span>
                        <strong>No tasks yet.</strong>
                        <p>
                          Add your first task and it will appear here
                          automatically.
                        </p>
                      </div>
                    ) : (
                      <div className="task-list">
                        {tasks.map((task) => {
                          const scheduledLabel = formatDateTime(
                            task.scheduledAt,
                          )
                          const deadlineLabel = formatDateTime(
                            task.deadlineAt,
                          )

                          return (
                            <label className="task-row" key={task.id}>
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => void toggleTask(task.id)}
                              />

                              <span
                                className={`custom-checkbox ${task.completed ? 'checked' : ''
                                  }`}
                              >
                                {task.completed && (
                                  <Icon name="check" size={13} />
                                )}
                              </span>

                              <span
                                className={`task-title ${task.completed ? 'completed' : ''
                                  }`}
                              >
                                {task.title}

                                <small>
                                  {scheduledLabel
                                    ? `Planned: ${scheduledLabel}`
                                    : deadlineLabel
                                      ? `Due: ${deadlineLabel}`
                                      : 'No schedule set'}
                                </small>

                                {scheduledLabel && deadlineLabel && (
                                  <small>Due: {deadlineLabel}</small>
                                )}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}

                <button
                  className="add-task-button"
                  onClick={() => setActivePage('To-do list')}
                >
                  <Icon name="plus" size={17} />
                  {tasks.length > 0 ? 'Open task manager' : 'Create a task'}
                </button>
              </section>

              <section className="panel-card notes-card">
                <div className="section-heading">
                  <div>
                    <h2>Keep it simple</h2>
                    <p>A small reminder for today</p>
                  </div>

                  <span className="note-symbol">
                    <Icon name="note" size={20} />
                  </span>
                </div>

                <div className="note-preview">
                  <span className="note-label">A NOTE TO SELF</span>
                  <p>
                    You don’t need to do everything today. Just start with
                    the next useful thing.
                  </p>
                  <span className="note-date">
                    A gentle reminder · Today
                  </span>
                </div>

                <button
                  className="add-task-button"
                  onClick={() => setActivePage('Notes')}
                >
                  Open notes <Icon name="arrow" size={16} />
                </button>
              </section>
            </div>

            <footer className="dashboard-footer">
              <span>Made with love and passion for everyday productivity.</span>
              <span>
                PocketHub <span className="footer-dot">·</span> Copyright 2026 by T.Rifin
              </span>
            </footer>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
