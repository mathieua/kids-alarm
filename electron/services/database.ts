import Database from 'better-sqlite3'
import * as path from 'path'
import * as fs from 'fs'

export interface Alarm {
  id: number
  time: string
  enabled: boolean
  sound_path: string | null
  snooze_minutes: number
  auto_dismiss_minutes: number
  created_at: string
}

export interface MediaItem {
  id: number
  title: string
  artist: string
  category: 'lullabies' | 'music' | 'audiobooks'
  duration_seconds: number
  file_path: string
  thumbnail_url: string | null
  source_url: string | null
  created_at: string
}

export interface ImportJob {
  id: number
  youtube_url: string
  status: 'pending' | 'downloading' | 'converting' | 'complete' | 'error'
  progress_percent: number
  error_message: string | null
  media_item_id: number | null
  created_at: string
}

let db: Database.Database

export function initDatabase(dataDir: string): void {
  const dbPath = path.join(dataDir, 'portal.db')
  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS media_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('lullabies', 'music', 'audiobooks')),
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      file_path TEXT NOT NULL UNIQUE,
      thumbnail_url TEXT,
      source_url TEXT,
      created_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS alarms (
      id INTEGER PRIMARY KEY,
      time TEXT NOT NULL DEFAULT '07:00',
      enabled INTEGER NOT NULL DEFAULT 0,
      sound_path TEXT,
      snooze_minutes INTEGER NOT NULL DEFAULT 5,
      auto_dismiss_minutes INTEGER NOT NULL DEFAULT 5,
      created_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS import_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      youtube_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'downloading', 'converting', 'complete', 'error')),
      progress_percent INTEGER NOT NULL DEFAULT 0,
      error_message TEXT,
      media_item_id INTEGER REFERENCES media_items(id),
      created_at DATETIME NOT NULL DEFAULT (datetime('now'))
    );
  `)

  // Migrate existing alarms table if sound_path column is missing
  try {
    db.exec(`ALTER TABLE alarms ADD COLUMN sound_path TEXT`)
  } catch {
    // Column already exists — no-op
  }
}

// ---- Media Items ----

export function getMediaItems(filters: { category?: string; artist?: string } = {}): MediaItem[] {
  let query = 'SELECT * FROM media_items WHERE 1=1'
  const params: string[] = []
  if (filters.category) {
    query += ' AND category = ?'
    params.push(filters.category)
  }
  if (filters.artist) {
    query += ' AND artist = ?'
    params.push(filters.artist)
  }
  query += ' ORDER BY artist, title'
  return db.prepare(query).all(...params) as MediaItem[]
}

export function getMediaItem(id: number): MediaItem | undefined {
  return db.prepare('SELECT * FROM media_items WHERE id = ?').get(id) as MediaItem | undefined
}

export function insertMediaItem(item: Omit<MediaItem, 'id' | 'created_at'>): MediaItem {
  const stmt = db.prepare(`
    INSERT INTO media_items (title, artist, category, duration_seconds, file_path, thumbnail_url, source_url)
    VALUES (@title, @artist, @category, @duration_seconds, @file_path, @thumbnail_url, @source_url)
  `)
  const result = stmt.run(item)
  return getMediaItem(result.lastInsertRowid as number)!
}

export function updateMediaItem(id: number, patch: Partial<Pick<MediaItem, 'title' | 'artist' | 'category'>>): MediaItem | undefined {
  const fields = Object.keys(patch).map(k => `${k} = @${k}`).join(', ')
  if (!fields) return getMediaItem(id)
  db.prepare(`UPDATE media_items SET ${fields} WHERE id = @id`).run({ ...patch, id })
  return getMediaItem(id)
}

export function deleteMediaItem(id: number): void {
  db.prepare('DELETE FROM media_items WHERE id = ?').run(id)
}

export function mediaItemExistsByPath(filePath: string): boolean {
  return !!db.prepare('SELECT id FROM media_items WHERE file_path = ?').get(filePath)
}

export function getCategories(): { category: string; count: number }[] {
  return db.prepare(`
    SELECT category, COUNT(*) as count FROM media_items GROUP BY category ORDER BY category
  `).all() as { category: string; count: number }[]
}

export function getArtists(category?: string): { artist: string; count: number }[] {
  if (category) {
    return db.prepare(`
      SELECT artist, COUNT(*) as count FROM media_items WHERE category = ? GROUP BY artist ORDER BY artist
    `).all(category) as { artist: string; count: number }[]
  }
  return db.prepare(`
    SELECT artist, COUNT(*) as count FROM media_items GROUP BY artist ORDER BY artist
  `).all() as { artist: string; count: number }[]
}

// ---- Import Jobs ----

export function createImportJob(youtubeUrl: string): ImportJob {
  const result = db.prepare(`
    INSERT INTO import_jobs (youtube_url) VALUES (?)
  `).run(youtubeUrl)
  return getImportJob(result.lastInsertRowid as number)!
}

export function getImportJob(id: number): ImportJob | undefined {
  return db.prepare('SELECT * FROM import_jobs WHERE id = ?').get(id) as ImportJob | undefined
}

export function getImportJobs(limit = 20): ImportJob[] {
  return db.prepare('SELECT * FROM import_jobs ORDER BY created_at DESC LIMIT ?').all(limit) as ImportJob[]
}

export function updateImportJob(id: number, patch: Partial<Pick<ImportJob, 'status' | 'progress_percent' | 'error_message' | 'media_item_id'>>): void {
  const fields = Object.keys(patch).map(k => `${k} = @${k}`).join(', ')
  if (!fields) return
  db.prepare(`UPDATE import_jobs SET ${fields} WHERE id = @id`).run({ ...patch, id })
}

// ---- Alarms ----

export function getAlarm(): Alarm | undefined {
  const row = db.prepare('SELECT * FROM alarms WHERE id = 1').get() as (Omit<Alarm, 'enabled'> & { enabled: number }) | undefined
  if (!row) return undefined
  return { ...row, enabled: row.enabled === 1 }
}

export function upsertAlarm(time: string, enabled: boolean, soundPath?: string | null): Alarm {
  db.prepare(`
    INSERT INTO alarms (id, time, enabled, sound_path) VALUES (1, @time, @enabled, @sound_path)
    ON CONFLICT(id) DO UPDATE SET time = @time, enabled = @enabled, sound_path = @sound_path
  `).run({ time, enabled: enabled ? 1 : 0, sound_path: soundPath ?? null })
  return getAlarm()!
}
