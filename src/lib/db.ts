import { openDB, type DBSchema } from 'idb'

export type TaskRecord = {
  id: number
  title: string
  completed: boolean
  createdAt: number
  // Use ISO date-time strings, e.g. "2026-10-16T14:30".
  scheduledAt?: string 
  deadlineAt?: string
}

export type NoteRecord = {
  id: number
  title: string
  content: string
  updatedAt: number
}

interface PocketHubDB extends DBSchema {
  tasks: {
    key: number
    value: TaskRecord
    indexes: { 'by-createdAt': number }
  }
  notes: {
    key: number
    value: NoteRecord
    indexes: { 'by-updatedAt': number }
  }
}

const dbPromise = openDB<PocketHubDB>('pockethub-db', 1, {
  upgrade(db) {
    const tasks = db.createObjectStore('tasks', {
      keyPath: 'id',
      autoIncrement: true,
    })
    tasks.createIndex('by-createdAt', 'createdAt')

    const notes = db.createObjectStore('notes', {
      keyPath: 'id',
      autoIncrement: true,
    })
    notes.createIndex('by-updatedAt', 'updatedAt')
  },
})

export async function getTasks(): Promise<TaskRecord[]> {
  const db = await dbPromise
  return db.getAllFromIndex('tasks', 'by-createdAt')
}

export async function addTask(
  title: string,
  scheduledAt?: string,
  deadlineAt?: string,
): Promise<number> {
  const db = await dbPromise

  const task: Omit<TaskRecord, 'id'> = {
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
    ...(scheduledAt ? { scheduledAt } : {}),
    ...(deadlineAt ? { deadlineAt } : {}),
  }

  return db.add('tasks', task as TaskRecord)
}

export async function updateTask(task: TaskRecord): Promise<void> {
  const db = await dbPromise
  await db.put('tasks', task)
}

export async function deleteTask(id: number): Promise<void> {
  const db = await dbPromise
  await db.delete('tasks', id)
}

export async function getNotes(): Promise<NoteRecord[]> {
  const db = await dbPromise
  return db.getAllFromIndex('notes', 'by-updatedAt')
}

export async function addNote(
  title = 'Untitled note',
  content = '',
): Promise<number> {
  const db = await dbPromise

  const note: Omit<NoteRecord, 'id'> = {
    title,
    content,
    updatedAt: Date.now(),
  }

  return db.add('notes', note as NoteRecord)
}

export async function updateNote(note: NoteRecord): Promise<void> {
  const db = await dbPromise
  await db.put('notes', {
    ...note,
    updatedAt: Date.now(),
  })
}

export async function deleteNote(id: number): Promise<void> {
  const db = await dbPromise
  await db.delete('notes', id)
}
