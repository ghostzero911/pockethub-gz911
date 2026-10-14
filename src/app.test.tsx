import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getTasks, updateTask, type TaskRecord } from './lib/db'

vi.mock('./lib/db', () => ({
  getTasks: vi.fn(),
  updateTask: vi.fn(),
  addTask: vi.fn(),
  deleteTask: vi.fn(),
  addNote: vi.fn(),
  getNotes: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}))

vi.mock('./features/tasks/TasksPage', () => ({
  default: () => <div>Task Manager Page</div>,
}))

vi.mock('./features/notes/NotesPage', () => ({
  default: () => <div>Notes Page</div>,
}))

vi.mock('./features/calculator/CalculatorPage', () => ({
  default: () => <div>Calculator Page</div>,
}))

const sampleTasks = [
  {
    id: 1,
    title: 'Prepare report',
    completed: false,
  },
  {
    id: 2,
    title: 'Review notes',
    completed: true,
  },
] as TaskRecord[]

async function renderOverview(tasks: TaskRecord[] = sampleTasks) {
  vi.mocked(getTasks).mockResolvedValue(tasks)

  render(<App />)

  await screen.findByText('Prepare report').catch(() => undefined)

  await waitFor(() => {
    expect(getTasks).toHaveBeenCalled()
  })
}

describe('Overview dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(updateTask).mockImplementation(async () => undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('shows the dashboard heading and quick-access tools', async () => {
    await renderOverview()

    expect(
      screen.getByRole('heading', {
        name: 'Get a little more organized.',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('heading', { name: 'Quick access' }),
    ).toBeInTheDocument()

    expect(
      screen.getAllByRole('button', { name: /To-do list/i }).length,
    ).toBeGreaterThan(0)
  })

  it('loads saved tasks and displays the completion count', async () => {
    await renderOverview()

    expect(await screen.findByText('Prepare report')).toBeInTheDocument()
    expect(screen.getByText('Review notes')).toBeInTheDocument()

    const taskCard = screen
      .getByRole('heading', { name: 'Your scheduled tasks' })
      .closest('section')

    expect(taskCard).not.toBeNull()

    expect(within(taskCard as HTMLElement).getByText('1/2')).toBeInTheDocument()
    expect(
      within(taskCard as HTMLElement).getByText('50% complete'),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no tasks', async () => {
    await renderOverview([])

    expect(await screen.findByText('No tasks yet.')).toBeInTheDocument()
    expect(screen.getByText('0/0')).toBeInTheDocument()
    expect(screen.getByText('0% complete')).toBeInTheDocument()
  })

  it('marks a task complete and updates the dashboard progress', async () => {
    await renderOverview()

    const taskCheckboxes = screen.getAllByRole('checkbox')
    const unfinishedTask = taskCheckboxes[0]

    fireEvent.click(unfinishedTask)

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Prepare report',
          completed: true,
        }),
      )
    })

    await waitFor(() => {
      const taskCard = screen
        .getByRole('heading', { name: 'Your scheduled tasks' })
        .closest('section') as HTMLElement

      expect(within(taskCard).getByText('2/2')).toBeInTheDocument()
      expect(within(taskCard).getByText('100% complete')).toBeInTheDocument()
    })
  })

  it('navigates to the task manager', async () => {
    await renderOverview()

    fireEvent.click(
      screen.getByRole('button', { name: 'Open task manager' }),
    )

    expect(screen.getByText('Task Manager Page')).toBeInTheDocument()
  })

  it('navigates to Notes and Calculator', async () => {
    await renderOverview()

    fireEvent.click(
      screen.getByRole('button', { name: 'Open notes' }),
    )

    expect(screen.getByText('Notes Page')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Calculator' }),
    )

    expect(screen.getByText('Calculator Page')).toBeInTheDocument()
  })

  it('reloads tasks when returning to Overview', async () => {
    await renderOverview()

    vi.mocked(getTasks).mockResolvedValue([
      {
        id: 3,
        title: 'Newly saved task',
        completed: false,
      } as TaskRecord,
    ])

    fireEvent.click(
      screen.getByRole('button', { name: 'To-do list' }),
    )

    expect(screen.getByText('Task Manager Page')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Overview' }),
    )

    expect(
      await screen.findByText('Newly saved task'),
    ).toBeInTheDocument()
  })

  it('shows an error if saved tasks cannot be loaded', async () => {
    vi.mocked(getTasks).mockRejectedValue(new Error('Database unavailable'))

    render(<App />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Could not load your tasks. Please try again.',
    )
  })

  it('shows an error if updating a task fails', async () => {
    vi.mocked(getTasks).mockResolvedValue(sampleTasks)
    vi.mocked(updateTask).mockRejectedValue(
      new Error('Update failed'),
    )

    render(<App />)

    await screen.findByText('Prepare report')

    fireEvent.click(screen.getAllByRole('checkbox')[0])

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(
      'Could not update this task. Please try again.',
    )
  })
})