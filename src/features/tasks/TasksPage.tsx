import { useEffect, useState, type SyntheticEvent } from 'react'
import { addTask, deleteTask, getTasks, updateTask, type TaskRecord } from '../../lib/db'

function formatDateTime(value?: string): string | null {
  if (!value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [title, setTitle] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [deadlineAt, setDeadlineAt] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editScheduledAt, setEditScheduledAt] = useState('')
  const [editDeadlineAt, setEditDeadlineAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [now] = useState(() => Date.now())

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch(() => setError('Could not load tasks. Please refresh the page.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()

    const cleanTitle = title.trim()
    if (!cleanTitle) return

    try {
      const id = await addTask(
        cleanTitle,
        scheduledAt || undefined,
        deadlineAt || undefined,
      )

      setTasks((current) => [
        ...current,
        {
          id,
          title: cleanTitle,
          completed: false,
          createdAt: Date.now(),
          ...(scheduledAt ? { scheduledAt } : {}),
          ...(deadlineAt ? { deadlineAt } : {}),
        },
      ])

      setTitle('')
      setScheduledAt('')
      setDeadlineAt('')
      setError('')
    } catch {
      setError('Could not save this task.')
    }
  }

  async function handleToggle(task: TaskRecord) {
    const updated = { ...task, completed: !task.completed }

    try {
      await updateTask(updated)
      setTasks((current) =>
        current.map((item) => item.id === task.id ? updated : item),
      )
      setError('')
    } catch {
      setError('Could not update this task.')
    }
  }

  function startEditing(task: TaskRecord) {
    setEditingTaskId(task.id)
    setEditScheduledAt(task.scheduledAt ?? '')
    setEditDeadlineAt(task.deadlineAt ?? '')
    setError('')
  }

  async function handleSaveDetails(task: TaskRecord) {
    const updated: TaskRecord = {
      ...task,
      scheduledAt: editScheduledAt || undefined,
      deadlineAt: editDeadlineAt || undefined,
    }

    try {
      await updateTask(updated)

      setTasks((current) =>
        current.map((item) => item.id === task.id ? updated : item),
      )

      setEditingTaskId(null)
      setError('')
    } catch {
      setError('Could not save the task schedule.')
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id)
      setTasks((current) => current.filter((task) => task.id !== id))

      if (editingTaskId === id) {
        setEditingTaskId(null)
      }

      setError('')
    } catch {
      setError('Could not delete this task.')
    }
  }

  const completed = tasks.filter((task) => task.completed).length

  return (
    <section className="page-content">
      <div className="page-intro">
        <span className="eyebrow">STAY ON TRACK</span>
        <h1>To-do list</h1>
        <p>Small steps still move you forward.</p>
      </div>

      <div className="panel-card task-manager">
        <div className="task-manager-summary">
          <div>
            <h2>Your tasks</h2>
            <p>
              {completed} completed · {tasks.length - completed} remaining
            </p>
          </div>
          <span className="count-badge">{tasks.length}</span>
        </div>

        <form className="task-form" onSubmit={handleAdd}>
          <input
            aria-label="New task"
            placeholder="What needs to get done?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={180}
            required
          />

          <div className="task-datetime-fields">
            <label className="task-field">
              <span>Schedule (optional)</span>
              <input
                type="datetime-local"
                aria-label="Task scheduled date and time"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
            </label>

            <label className="task-field">
              <span>Deadline (optional)</span>
              <input
                type="datetime-local"
                aria-label="Task deadline date and time"
                value={deadlineAt}
                onChange={(event) => setDeadlineAt(event.target.value)}
              />
            </label>
          </div>

          <button type="submit" className="primary-button">
            Add task
          </button>
        </form>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="empty-state">Loading your tasks…</p>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-symbol">✓</span>
            <strong>A fresh start.</strong>
            <p>Add a task above and take it one step at a time.</p>
          </div>
        ) : (
          <div className="managed-task-list">
            {tasks.map((task) => {
              const scheduledLabel = formatDateTime(task.scheduledAt)
              const deadlineLabel = formatDateTime(task.deadlineAt)

              const isOverdue =
                !task.completed &&
                !!deadlineLabel &&
                !!task.deadlineAt &&
                new Date(task.deadlineAt).getTime() < now

              const isEditing = editingTaskId === task.id

              return (
                <div className="managed-task-row" key={task.id}>
                  <div className="managed-task-main">
                    <label className="managed-task-label">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => void handleToggle(task)}
                      />
                      <span
                        className={`managed-task-title ${
                          task.completed ? 'completed' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                    </label>

                    <div className="task-meta">
                      {scheduledLabel && (
                        <span className="task-meta-item">
                          <span aria-hidden="true">◷</span>
                          Planned: {scheduledLabel}
                        </span>
                      )}

                      {deadlineLabel && (
                        <span
                          className={`task-meta-item ${
                            isOverdue ? 'task-overdue' : ''
                          }`}
                        >
                          <span aria-hidden="true">⌛</span>
                          {isOverdue ? 'Overdue: ' : 'Due: '}
                          {deadlineLabel}
                        </span>
                      )}

                      {!scheduledLabel && !deadlineLabel && (
                        <span className="task-meta-item task-no-date">
                          No schedule or deadline
                        </span>
                      )}
                    </div>

                    {isEditing && (
                      <div className="task-edit-panel">
                        <label className="task-field">
                          <span>Schedule</span>
                          <input
                            type="datetime-local"
                            aria-label={`Schedule for ${task.title}`}
                            value={editScheduledAt}
                            onChange={(event) =>
                              setEditScheduledAt(event.target.value)
                            }
                          />
                        </label>

                        <label className="task-field">
                          <span>Deadline</span>
                          <input
                            type="datetime-local"
                            aria-label={`Deadline for ${task.title}`}
                            value={editDeadlineAt}
                            onChange={(event) =>
                              setEditDeadlineAt(event.target.value)
                            }
                          />
                        </label>

                        <div className="task-edit-actions">
                          <button
                            type="button"
                            className="primary-button"
                            onClick={() => void handleSaveDetails(task)}
                          >
                            Save details
                          </button>

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => setEditingTaskId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="managed-task-actions">
                    {!isEditing && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => startEditing(task)}
                        aria-label={`Edit schedule and deadline for ${task.title}`}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      className="delete-button"
                      type="button"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => void handleDelete(task.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}