
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  addTask,
  deleteTask,
  getTasks,
  updateTask,
  type TaskRecord,
} from '../../lib/db'
import TasksPage from './TasksPage'

vi.mock('../../lib/db', () => ({
  addTask: vi.fn(),
  deleteTask: vi.fn(),
  getTasks: vi.fn(),
  updateTask: vi.fn(),
}))

const existingTask: TaskRecord = {
  id: 1,
  title: 'Prepare report',
  completed: false,
  createdAt: 1000,
}

async function renderTasks(tasks: TaskRecord[] = []) {
  vi.mocked(getTasks).mockResolvedValue(tasks)

  render(<TasksPage />)

  await waitFor(() => {
    expect(getTasks).toHaveBeenCalled()
  })

  if (tasks.length === 0) {
    await screen.findByText('A fresh start.')
  } else {
    await screen.findByText(tasks[0].title)
  }
}

describe('TasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(getTasks).mockResolvedValue([])
    vi.mocked(addTask).mockResolvedValue(2)
    vi.mocked(updateTask).mockResolvedValue(undefined)
    vi.mocked(deleteTask).mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('shows the empty state when there are no tasks', async () => {
    await renderTasks()

    expect(screen.getByText('A fresh start.')).toBeInTheDocument()
    expect(screen.getByText('0 completed · 0 remaining')).toBeInTheDocument()
  })

  it('adds a task using the form', async () => {
    const user = userEvent.setup()
    await renderTasks()

    await user.type(screen.getByRole('textbox', { name: 'New task' }), 'Read a book')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    await waitFor(() => {
      expect(addTask).toHaveBeenCalledWith('Read a book', undefined, undefined)
    })

    expect(await screen.findByText('Read a book')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'New task' })).toHaveValue('')
  })

  it('adds a task with a schedule and deadline', async () => {
    const user = userEvent.setup()
    await renderTasks()

    await user.type(screen.getByRole('textbox', { name: 'New task' }), 'Submit project')

    fireEvent.change(
      screen.getByLabelText('Task scheduled date and time'),
      { target: { value: '2026-10-15T09:00' } },
    )

    fireEvent.change(
      screen.getByLabelText('Task deadline date and time'),
      { target: { value: '2026-10-16T17:00' } },
    )

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    await waitFor(() => {
      expect(addTask).toHaveBeenCalledWith(
        'Submit project',
        '2026-10-15T09:00',
        '2026-10-16T17:00',
      )
    })

    expect(await screen.findByText('Submit project')).toBeInTheDocument()
  })

  it('marks a task complete and updates its summary', async () => {
    const user = userEvent.setup()
    await renderTasks([existingTask])

    await user.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith({
        ...existingTask,
        completed: true,
      })
    })

    expect(screen.getByText('1 completed · 0 remaining')).toBeInTheDocument()
  })

  it('allows a completed task to be reopened', async () => {
    const user = userEvent.setup()
    await renderTasks([{ ...existingTask, completed: true }])

    await user.click(screen.getByRole('checkbox'))

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith({
        ...existingTask,
        completed: false,
      })
    })

    expect(screen.getByText('0 completed · 1 remaining')).toBeInTheDocument()
  })

  it('edits a task schedule and deadline', async () => {
    const user = userEvent.setup()
    await renderTasks([existingTask])

    await user.click(
      screen.getByRole('button', {
        name: 'Edit schedule and deadline for Prepare report',
      }),
    )

    fireEvent.change(
      screen.getByLabelText('Schedule for Prepare report'),
      { target: { value: '2026-10-20T10:30' } },
    )

    fireEvent.change(
      screen.getByLabelText('Deadline for Prepare report'),
      { target: { value: '2026-10-21T16:00' } },
    )

    await user.click(screen.getByRole('button', { name: 'Save details' }))

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith({
        ...existingTask,
        scheduledAt: '2026-10-20T10:30',
        deadlineAt: '2026-10-21T16:00',
      })
    })

    expect(
      screen.queryByRole('button', { name: 'Save details' }),
    ).not.toBeInTheDocument()
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()
    await renderTasks([existingTask])

    await user.click(
      screen.getByRole('button', { name: 'Delete Prepare report' }),
    )

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith(1)
    })

    expect(screen.getByText('A fresh start.')).toBeInTheDocument()
  })

  it('shows overdue status for an unfinished task with a past deadline', async () => {
    const overdueTask: TaskRecord = {
      ...existingTask,
      deadlineAt: '2020-01-01T09:00',
    }

    await renderTasks([overdueTask])

    expect(screen.getByText(/^Overdue:/)).toBeInTheDocument()
  })

  it('does not show overdue status for a completed task', async () => {
    const completedTask: TaskRecord = {
      ...existingTask,
      completed: true,
      deadlineAt: '2020-01-01T09:00',
    }

    await renderTasks([completedTask])

    expect(screen.queryByText(/^Overdue:/)).not.toBeInTheDocument()
    expect(screen.getByText(/^Due:/)).toBeInTheDocument()
  })
})
