import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addNote, deleteNote, getNotes, updateNote, type NoteRecord } from '../../lib/db'
import NotesPage from './NotesPage'

vi.mock('../../lib/db', () => ({
  addNote: vi.fn(),
  deleteNote: vi.fn(),
  getNotes: vi.fn(),
  updateNote: vi.fn(),
}))

const sampleNotes: NoteRecord[] = [
  {
    id: 1,
    title: 'Shopping list',
    content: 'Milk, bread, and eggs',
    updatedAt: 200,
  },
  {
    id: 2,
    title: 'Project ideas',
    content: 'Build a productivity app',
    updatedAt: 100,
  },
]

async function renderNotes(notes: NoteRecord[] = sampleNotes) {
  vi.mocked(getNotes).mockResolvedValue(notes)

  render(<NotesPage />)

  await waitFor(() => {
    expect(getNotes).toHaveBeenCalled()
  })

  if (notes.length > 0) {
    await screen.findByRole('textbox', { name: 'Note title' })
  } else {
    await screen.findByText('Your next good idea can start here.')
  }
}

describe('Notes page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(addNote).mockResolvedValue(3)
    vi.mocked(updateNote).mockResolvedValue(undefined)
    vi.mocked(deleteNote).mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
  })

  it('displays the Notes heading and saved notes', async () => {
    await renderNotes()

    expect(
      screen.getByRole('heading', { name: 'Notes' }),
    ).toBeInTheDocument()

    expect(screen.getByText('Shopping list')).toBeInTheDocument()
    expect(screen.getByText('Project ideas')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Shopping list')).toBeInTheDocument()
    expect(
      screen.getByDisplayValue('Milk, bread, and eggs'),
    ).toBeInTheDocument()
  })

  it('shows an empty state when there are no notes', async () => {
    await renderNotes([])

    expect(
      screen.getByText('Your next good idea can start here.'),
    ).toBeInTheDocument()

    expect(screen.getByText('No note selected')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: 'Create note' }),
    ).toHaveLength(2)
  })

  it('creates a new note from the list button', async () => {
    await renderNotes()

    await userEvent.click(
      screen.getByRole('button', { name: 'Create note' }),
    )

    await waitFor(() => {
      expect(addNote).toHaveBeenCalledOnce()
    })

    expect(
      screen.getByRole('textbox', { name: 'Note title' }),
    ).toHaveValue('Untitled note')

    expect(
      screen.getByRole('textbox', { name: 'Note content' }),
    ).toHaveValue('')
  })

  it('creates a note from the empty editor state', async () => {
    await renderNotes([])

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Create note' })[1],
    )

    await waitFor(() => {
      expect(addNote).toHaveBeenCalledOnce()
    })

    expect(
      screen.getByRole('textbox', { name: 'Note title' }),
    ).toHaveValue('Untitled note')
  })

  it('saves changes to a note', async () => {
    await renderNotes()

    const titleInput = screen.getByRole('textbox', {
      name: 'Note title',
    })
    const contentInput = screen.getByRole('textbox', {
      name: 'Note content',
    })

    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Updated shopping list')
    await userEvent.clear(contentInput)
    await userEvent.type(contentInput, 'Coffee and fruit')

    await userEvent.click(
      screen.getByRole('button', { name: 'Save note' }),
    )

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Updated shopping list',
          content: 'Coffee and fruit',
        }),
      )
    })

    expect(
      screen.getByRole('textbox', { name: 'Note title' }),
    ).toHaveValue('Updated shopping list')

    expect(
      screen.getByText('Updated shopping list'),
    ).toBeInTheDocument()
  })

  it('uses Untitled note when the title is blank', async () => {
    await renderNotes()

    await userEvent.clear(
      screen.getByRole('textbox', { name: 'Note title' }),
    )

    await userEvent.click(
      screen.getByRole('button', { name: 'Save note' }),
    )

    await waitFor(() => {
      expect(updateNote).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          title: 'Untitled note',
        }),
      )
    })
  })

  it('switches the editor when another note is selected', async () => {
    await renderNotes()

    await userEvent.click(
      screen.getByRole('button', { name: /Project ideas/ }),
    )

    expect(
      screen.getByRole('textbox', { name: 'Note title' }),
    ).toHaveValue('Project ideas')

    expect(
      screen.getByRole('textbox', { name: 'Note content' }),
    ).toHaveValue('Build a productivity app')
  })

  it('deletes the selected note and selects the next note', async () => {
    await renderNotes()

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete' }),
    )

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith(1)
    })

    expect(
      screen.getByRole('textbox', { name: 'Note title' }),
    ).toHaveValue('Project ideas')

    expect(screen.queryByText('Shopping list')).not.toBeInTheDocument()
  })

  it('shows the empty editor after deleting the last note', async () => {
    await renderNotes([sampleNotes[0]])

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete' }),
    )

    await waitFor(() => {
      expect(deleteNote).toHaveBeenCalledWith(1)
    })

    expect(screen.getByText('No note selected')).toBeInTheDocument()
    expect(
      screen.getByText('Your next good idea can start here.'),
    ).toBeInTheDocument()
  })

  it('shows an error when loading notes fails', async () => {
    vi.mocked(getNotes).mockRejectedValue(
      new Error('Database unavailable'),
    )

    render(<NotesPage />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your notes.',
    )
  })
  
  it('shows an error when creating a note fails', async () => {
    await renderNotes([])
  
    vi.mocked(addNote).mockRejectedValue(
      new Error('Create failed'),
    )
  
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Create note' })[0],
    )
  
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not create a note.',
    )
  })

  it('shows an error when saving a note fails', async () => {
    await renderNotes()
    vi.mocked(updateNote).mockRejectedValue(new Error('Save failed'))

    await userEvent.click(
      screen.getByRole('button', { name: 'Save note' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not save this note.',
    )
  })

  it('shows an error when deleting a note fails', async () => {
    await renderNotes()
    vi.mocked(deleteNote).mockRejectedValue(new Error('Delete failed'))

    await userEvent.click(
      screen.getByRole('button', { name: 'Delete' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not delete this note.',
    )
  })
})