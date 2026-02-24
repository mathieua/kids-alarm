import { useState } from 'react'
import { useSyncDevice } from '../hooks/useSyncDevice'
import type { UsbDevice, SyncDiff, SyncProgress, SyncSummary } from '../types/portal.types'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

// ---- Waiting view ----

function WaitingView() {
  return (
    <div style={styles.center}>
      <div style={styles.icon}>🎵</div>
      <h2 style={styles.waitTitle}>No MP3 player detected</h2>
      <p style={styles.waitSubtitle}>Plug the MP3 player into the USB port to begin sync.</p>
      <p style={styles.waitHint}>The page will update automatically within a few seconds.</p>
    </div>
  )
}

// ---- Ready view ----

interface ReadyViewProps {
  device: UsbDevice
  diff: SyncDiff | null
  isDiffLoading: boolean
  onSync: (deleteOrphans: string[]) => void
  onRefresh: () => void
}

function ReadyView({ device, diff, isDiffLoading, onSync, onRefresh }: ReadyViewProps) {
  const usedBytes = device.totalBytes - device.freeBytes
  const usedPct = device.totalBytes > 0 ? Math.round((usedBytes / device.totalBytes) * 100) : 0
  const toCopySize = diff?.toCopy.reduce((s, f) => s + f.sizeBytes, 0) ?? 0
  const hasSpaceIssue = toCopySize > device.freeBytes

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Sync to MP3 Player</h1>

      {/* Device card */}
      <div style={styles.deviceCard}>
        <div style={styles.deviceRow}>
          <span style={styles.deviceIcon}>💾</span>
          <div>
            <div style={styles.deviceLabel}>{device.label}</div>
            <div style={styles.deviceSub}>
              {formatBytes(usedBytes)} used of {formatBytes(device.totalBytes)}
            </div>
          </div>
        </div>
        <div style={styles.storageBarTrack}>
          <div style={{ ...styles.storageBarFill, width: `${usedPct}%` }} />
        </div>
      </div>

      {/* Diff summary */}
      {isDiffLoading && <p style={styles.muted}>Analysing library…</p>}
      {diff && !isDiffLoading && (
        <div style={styles.diffSummary}>
          <DiffStat label="To copy" value={diff.toCopy.length} accent="#a6e3a1" />
          <DiffStat label="Already synced" value={diff.toSkip.length} accent="#89b4fa" />
          <DiffStat label="Orphans on device" value={diff.orphans.length} accent="#fab387" />
        </div>
      )}

      {hasSpaceIssue && diff && (
        <div style={styles.warning}>
          ⚠️ Not enough free space. Need {formatBytes(toCopySize)} but only {formatBytes(device.freeBytes)} available.
          Some files may not be copied.
        </div>
      )}

      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary, opacity: isDiffLoading ? 0.5 : 1 }}
          disabled={isDiffLoading}
          onClick={() => {
            if (diff && diff.orphans.length > 0) {
              // Handled by parent — triggers reviewing state via fetchDiff
            }
            onSync([])
          }}
        >
          Sync Now
        </button>
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onRefresh}>
          Refresh
        </button>
      </div>
    </div>
  )
}

function DiffStat({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={styles.diffStat}>
      <span style={{ ...styles.diffStatValue, color: accent }}>{value}</span>
      <span style={styles.diffStatLabel}>{label}</span>
    </div>
  )
}

// ---- Orphan review view ----

interface OrphanReviewViewProps {
  device: UsbDevice
  diff: SyncDiff
  onSync: (deleteOrphans: string[]) => void
}

function OrphanReviewView({ device, diff, onSync }: OrphanReviewViewProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (rel: string) => setChecked(prev => {
    const next = new Set(prev)
    if (next.has(rel)) next.delete(rel); else next.add(rel)
    return next
  })
  const selectAll = () => setChecked(new Set(diff.orphans.map(o => o.relativePath)))
  const deselectAll = () => setChecked(new Set())

  const freedBytes = diff.orphans
    .filter(o => checked.has(o.relativePath))
    .reduce((s, o) => s + o.sizeBytes, 0)

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>Files on device not in library</h1>
      <p style={styles.muted}>
        These files exist on <strong>{device.label}</strong> but are not in your library.
        Check the ones you want to permanently delete before syncing.
      </p>

      <div style={styles.orphanControls}>
        <button style={styles.linkBtn} onClick={selectAll}>Select all</button>
        <span style={styles.divider}>·</span>
        <button style={styles.linkBtn} onClick={deselectAll}>Deselect all</button>
        {freedBytes > 0 && (
          <span style={styles.muted}> — {formatBytes(freedBytes)} will be freed</span>
        )}
      </div>

      <div style={styles.orphanList}>
        {diff.orphans.map(o => (
          <label key={o.relativePath} style={styles.orphanRow}>
            <input
              type="checkbox"
              checked={checked.has(o.relativePath)}
              onChange={() => toggle(o.relativePath)}
              style={styles.checkbox}
            />
            <span style={styles.orphanPath}>{o.relativePath}</span>
            <span style={styles.orphanSize}>{formatBytes(o.sizeBytes)}</span>
          </label>
        ))}
      </div>

      {checked.size > 0 && (
        <p style={styles.warningText}>
          ⚠️ Checked files will be permanently deleted from the MP3 player.
        </p>
      )}

      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...styles.btnDanger }}
          onClick={() => onSync([...checked])}
          disabled={checked.size === 0}
        >
          Delete Selected &amp; Sync
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary }}
          onClick={() => onSync([])}
        >
          Skip &amp; Sync
        </button>
      </div>
    </div>
  )
}

// ---- Syncing view ----

interface SyncingViewProps {
  progress: SyncProgress | null
  diff: SyncDiff | null
}

function SyncingView({ progress, diff }: SyncingViewProps) {
  const total = progress?.total ?? diff?.toCopy.length ?? 0
  const copied = progress?.copied ?? 0
  const pct = total > 0 ? Math.round((copied / total) * 100) : 0
  const speed = progress?.bytesPerSecond ?? 0

  return (
    <div style={styles.center}>
      <h2 style={styles.waitTitle}>Syncing…</h2>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${pct}%` }} />
      </div>
      <p style={styles.progressLabel}>{copied} / {total} files ({pct}%)</p>
      {progress?.currentFile && (
        <p style={styles.currentFile}>{progress.currentFile}</p>
      )}
      {speed > 0 && (
        <p style={styles.muted}>{formatBytes(speed)}/s</p>
      )}
    </div>
  )
}

// ---- Complete view ----

interface CompleteViewProps {
  summary: SyncSummary
  onEject: () => void
  onReset: () => void
}

function CompleteView({ summary, onEject, onReset }: CompleteViewProps) {
  return (
    <div style={styles.center}>
      <div style={styles.icon}>✅</div>
      <h2 style={styles.waitTitle}>Sync complete</h2>
      <div style={styles.summaryGrid}>
        <SummaryStat label="Copied" value={summary.copied} />
        <SummaryStat label="Skipped" value={summary.skipped} />
        <SummaryStat label="Deleted" value={summary.deleted} />
        <SummaryStat label="Duration" value={`${summary.durationSeconds}s`} />
      </div>
      <div style={styles.actions}>
        <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={onEject}>
          Eject device
        </button>
        <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onReset}>
          Sync again
        </button>
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={styles.summaryStat}>
      <span style={styles.summaryValue}>{value}</span>
      <span style={styles.summaryLabel}>{label}</span>
    </div>
  )
}

// ---- Error view ----

function ErrorView({ error, onReset }: { error: string | null; onReset: () => void }) {
  return (
    <div style={styles.center}>
      <div style={styles.icon}>❌</div>
      <h2 style={styles.waitTitle}>Sync failed</h2>
      <p style={styles.errorMsg}>{error ?? 'Unknown error'}</p>
      <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onReset}>Try again</button>
    </div>
  )
}

// ---- Main SyncPage ----

export function SyncPage() {
  const { device, diff, isDiffLoading, syncStatus, progress, summary, fetchDiff, startSync, eject, reset, error } = useSyncDevice()

  if (!device) return <WaitingView />
  if (syncStatus === 'syncing') return <SyncingView progress={progress} diff={diff} />
  if (syncStatus === 'complete') return <CompleteView summary={summary!} onEject={eject} onReset={reset} />
  if (syncStatus === 'error') return <ErrorView error={error} onReset={reset} />
  if (syncStatus === 'reviewing' && diff) return <OrphanReviewView device={device} diff={diff} onSync={startSync} />

  return <ReadyView device={device} diff={diff} isDiffLoading={isDiffLoading} onSync={startSync} onRefresh={fetchDiff} />
}

// ---- Styles ----

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 600 },
  heading: { fontSize: 24, fontWeight: 700, margin: '0 0 24px', color: '#cdd6f4' },
  center: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px', textAlign: 'center' },
  icon: { fontSize: 48, marginBottom: 16 },
  waitTitle: { fontSize: 20, fontWeight: 600, color: '#cdd6f4', margin: '0 0 8px' },
  waitSubtitle: { color: '#a6adc8', margin: '0 0 8px' },
  waitHint: { color: '#585b70', fontSize: 13, margin: 0 },
  muted: { color: '#a6adc8', fontSize: 14, margin: '0 0 16px' },
  deviceCard: {
    background: '#1e1e2e',
    border: '1px solid #313244',
    borderRadius: 8,
    padding: '16px 20px',
    marginBottom: 24,
  },
  deviceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  deviceIcon: { fontSize: 28 },
  deviceLabel: { fontWeight: 600, color: '#cdd6f4', fontSize: 16 },
  deviceSub: { fontSize: 13, color: '#a6adc8', marginTop: 2 },
  storageBarTrack: { height: 6, background: '#313244', borderRadius: 3, overflow: 'hidden' },
  storageBarFill: { height: '100%', background: '#89b4fa', borderRadius: 3, transition: 'width 0.3s' },
  diffSummary: { display: 'flex', gap: 24, marginBottom: 24 },
  diffStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  diffStatValue: { fontSize: 28, fontWeight: 700 },
  diffStatLabel: { fontSize: 12, color: '#a6adc8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  warning: {
    background: '#45475a',
    border: '1px solid #fab387',
    borderRadius: 6,
    padding: '10px 14px',
    fontSize: 13,
    color: '#fab387',
    marginBottom: 20,
  },
  actions: { display: 'flex', gap: 12, marginTop: 24 },
  btn: { padding: '10px 20px', borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 },
  btnPrimary: { background: '#cba6f7', color: '#1e1e2e' },
  btnSecondary: { background: '#313244', color: '#cdd6f4' },
  btnDanger: { background: '#f38ba8', color: '#1e1e2e' },
  orphanControls: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 },
  linkBtn: { background: 'none', border: 'none', color: '#89b4fa', cursor: 'pointer', padding: 0, fontSize: 14 },
  divider: { color: '#585b70' },
  orphanList: { border: '1px solid #313244', borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
  orphanRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    borderBottom: '1px solid #313244',
    cursor: 'pointer',
  },
  checkbox: { accentColor: '#cba6f7', flexShrink: 0 },
  orphanPath: { flex: 1, fontSize: 13, color: '#cdd6f4', fontFamily: 'monospace' },
  orphanSize: { fontSize: 12, color: '#585b70', flexShrink: 0 },
  warningText: { color: '#f38ba8', fontSize: 13, margin: '0 0 8px' },
  progressTrack: { width: 320, height: 8, background: '#313244', borderRadius: 4, overflow: 'hidden', margin: '16px 0 8px' },
  progressFill: { height: '100%', background: '#a6e3a1', borderRadius: 4, transition: 'width 0.3s' },
  progressLabel: { color: '#cdd6f4', fontWeight: 600, margin: '0 0 8px' },
  currentFile: { color: '#a6adc8', fontSize: 12, fontFamily: 'monospace', maxWidth: 400, wordBreak: 'break-all', margin: '0 0 8px' },
  summaryGrid: { display: 'flex', gap: 32, margin: '24px 0' },
  summaryStat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 28, fontWeight: 700, color: '#a6e3a1' },
  summaryLabel: { fontSize: 12, color: '#a6adc8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  errorMsg: { color: '#f38ba8', fontSize: 14, maxWidth: 400, margin: '0 0 24px' },
}
