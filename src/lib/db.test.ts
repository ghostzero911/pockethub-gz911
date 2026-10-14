import { beforeEach, describe, expect, it, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'

import type { TaskRecord } from './db'

describe('database operations', () => {
  let db: typeof import('./db')

  beforeEach(async () => {
    vi.resetModules()

    // Give each test its own isolated IndexedDB instance.
    vi.stubGlobal('indexedDB', new IDBFactory())

    // Import the database module only after replacing IndexedDB.
    db = await import('./db')
  })

  it('creates a task and retrieves it', async () => {
    const id = await db.addTask('Write documentation')
    const tasks = await db.getTasks()

    expect(id).toBeTypeOf('number')
    expect(tasks).toHaveLength(1)
    expect(tasks[0]).toMatchObject({
      id,
      title: 'Write documentation',
      completed: false,
    })
  })

  it('trims whitespace from a task title', async () => {
    await db.addTask('  Prepare release  ')

    const tasks = await db.getTasks()

    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe('Prepare release')
  })

  it('saves a scheduled date and deadline', async () => {
    await db.addTask(
      'Finish report',
      '2026-10-15T09:00',
      '2026-10-16T17:00',
    )

    const tasks = await db.getTasks()

    expect(tasks[0].scheduledAt).toBe('2026-10-15T09:00')
    expect(tasks[0].deadlineAt).toBe('2026-10-16T17:00')
  })

  it('updates a task', async () => {
    const id = await db.addTask('Original title')
    const tasks = await db.getTasks()

    const task: TaskRecord = {
      ...tasks[0],
      title: 'Updated title',
      completed: true,
    }

    await db.updateTask(task)

    const updatedTasks = await db.getTasks()

    expect(updatedTasks).toHaveLength(1)
    expect(updatedTasks[0]).toMatchObject({
      id,
      title: 'Updated title',
      completed: true,
    })
  })

  it('deletes a task', async () => {
    const id = await db.addTask('Temporary task')

    await db.deleteTask(id)

    expect(await db.getTasks()).toHaveLength(0)
  })

    it('creates a note and retrieves it', async () => {
    const id = await db.addNote('Meeting notes', 'Discuss project timeline')

    const notes = await db.getNotes()

    expect(id).toBeTypeOf('number')
    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({
      id,
      title: 'Meeting notes',
      content: 'Discuss project timeline',
    })
  })

  it('creates a note with default values', async () => {
    const id = await db.addNote()

    const notes = await db.getNotes()

    expect(notes).toHaveLength(1)
    expect(notes[0]).toMatchObject({
      id,
      title: 'Untitled note',
      content: '',
    })
  })

  it('updates an existing note', async () => {
    const id = await db.addNote('Original title', 'Original content')
    const notes = await db.getNotes()

    await db.updateNote({
      ...notes[0],
      title: 'Updated title',
      content: 'Updated content',
    })

    const updatedNotes = await db.getNotes()

    expect(updatedNotes).toHaveLength(1)
    expect(updatedNotes[0]).toMatchObject({
      id,
      title: 'Updated title',
      content: 'Updated content',
    })
  })

  it('deletes a note', async () => {
    const id = await db.addNote('Temporary note', 'This will be deleted')

    await db.deleteNote(id)

    expect(await db.getNotes()).toHaveLength(0)
  })
})