import { useEffect, useState } from 'react'
import { addNote, deleteNote, getNotes, updateNote, type NoteRecord } from '../../lib/db'

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getNotes()
      .then((items) => {
        setNotes(items)
        if (items.length > 0) {
          setSelectedId(items[0].id)
          setTitle(items[0].title)
          setContent(items[0].content)
        }
      })
      .catch(() => setError('Could not load your notes.'))
      .finally(() => setLoading(false))
  }, [])

  async function createNote() {
    try {
      const id = await addNote()
      const note: NoteRecord = {
        id,
        title: 'Untitled note',
        content: '',
        updatedAt: Date.now(),
      }
      setNotes((current) => [note, ...current])
      setSelectedId(id)
      setTitle(note.title)
      setContent(note.content)
      setError('')
    } catch {
      setError('Could not create a note.')
    }
  }

  function selectNote(note: NoteRecord) {
    setSelectedId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setError('')
  }

  async function saveNote() {
    if (selectedId === null) return

    const note: NoteRecord = {
      id: selectedId,
      title: title.trim() || 'Untitled note',
      content,
      updatedAt: Date.now(),
    }

    try {
      await updateNote(note)
      setNotes((current) =>
        current
          .map((item) => item.id === selectedId ? note : item)
          .sort((a, b) => b.updatedAt - a.updatedAt),
      )
      setTitle(note.title)
      setError('')
    } catch {
      setError('Could not save this note.')
    }
  }

  async function removeNote(id: number) {
    try {
      await deleteNote(id)
      const remaining = notes.filter((note) => note.id !== id)
      setNotes(remaining)

      if (selectedId === id) {
        const next = remaining[0]
        setSelectedId(next?.id ?? null)
        setTitle(next?.title ?? '')
        setContent(next?.content ?? '')
      }
      setError('')
    } catch {
      setError('Could not delete this note.')
    }
  }

  const selectedNote = notes.find((note) => note.id === selectedId)

  return (
    <section className="page-content">
      <div className="page-intro">
        <span className="eyebrow">THOUGHTS, SAVED</span>
        <h1>Notes</h1>
        <p>A place for ideas, lists, and things to remember.</p>
      </div>

      <div className="notes-layout">
        <aside className="panel-card notes-list-panel">
          <div className="notes-list-heading">
            <h2>All notes</h2>
            <button className="small-add-button" onClick={() => void createNote()} aria-label="Create note">+</button>
          </div>

          {loading ? (
            <p className="muted-copy">Loading notes…</p>
          ) : notes.length === 0 ? (
            <p className="muted-copy">Your next good idea can start here.</p>
          ) : (
            <div className="notes-list">
              {notes.map((note) => (
                <button
                  className={`note-list-item ${note.id === selectedId ? 'selected' : ''}`}
                  key={note.id}
                  onClick={() => selectNote(note)}
                >
                  <strong>{note.title || 'Untitled note'}</strong>
                  <span>{note.content.trim().slice(0, 55) || 'No additional text'}</span>
                </button>
              ))}
            </div>
          )}
        </aside>

        <div className="panel-card note-editor">
          {selectedNote ? (
            <>
              <input
                className="note-title-input"
                aria-label="Note title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={120}
                placeholder="Note title"
              />
              <textarea
                className="note-content-input"
                aria-label="Note content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Start writing…"
              />
              <div className="note-editor-footer">
                <button className="delete-button" onClick={() => void removeNote(selectedNote.id)}>
                  Delete
                </button>
                <button className="primary-button" onClick={() => void saveNote()}>
                  Save note
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <strong>No note selected</strong>
              <p>Create a note to get started.</p>
              <button className="primary-button" onClick={() => void createNote()}>
                Create note
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="error-message" role="alert">{error}</p>}
    </section>
  )
}
