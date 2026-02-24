import { useSync } from '../hooks/useSync'
import type { SyncProgress, SyncSummary, UsbDevice, SyncDiff } from '../types'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

// ---- Ready view ----

interface ReadyViewProps {
  device: UsbDevice
  diff: SyncDiff | null
  isDiffLoading: boolean
  onSync: () => void
}

function ReadyView({ device, diff, isDiffLoading, onSync }: ReadyViewProps) {
  const usedBytes = device.totalBytes - device.freeBytes
  const usedPct = device.totalBytes > 0 ? Math.round((usedBytes / device.totalBytes) * 100) : 0

  return (
    <div style={s.page}>
      <div style={s.deviceRow}>
        <span style={s.deviceIcon}>💾</span>
        <div>
          <div style={s.deviceName}>{device.label}</div>
          <div style={s.deviceSub}>{formatBytes(usedBytes)} / {formatBytes(device.totalBytes)}</div>
        </div>
      </div>

      <div style={s.storageBar}>
        <div style={{ ...s.storageBarFill, width: `${usedPct}%` }} />
      </div>

      {isDiffLoading && <p style={s.muted}>Analysing library…</p>}
      {diff && !isDiffLoading && (
        <div style={s.stats}>
          <Stat value={diff.toCopy.length} label="To copy" color="#a6e3a1" />
          <Stat value={diff.toSkip.length} label="Already synced" color="#6366f1" />
          {diff.orphans.length > 0 && (
            <Stat value={diff.orphans.length} label="Extras on device" color="#fab387" />
          )}
        </div>
      )}

      <button
        style={{ ...s.btn, opacity: isDiffLoading ? 0.4 : 1 }}
        disabled={isDiffLoading}
        onClick={onSync}
      >
        Sync Now
      </button>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={s.stat}>
      <span style={{ ...s.statValue, color }}>{value}</span>
      <span style={s.statLabel}>{label}</span>
    </div>
  )
}

// ---- Syncing view ----

function SyncingView({ progress }: { progress: SyncProgress | null }) {
  const total = progress?.total ?? 0
  const copied = progress?.copied ?? 0
  const pct = total > 0 ? Math.round((copied / total) * 100) : 0

  return (
    <div style={s.center}>
      <p style={s.statusTitle}>Syncing…</p>
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${pct}%` }} />
      </div>
      <p style={s.progressLabel}>{copied} / {total} files ({pct}%)</p>
      {progress?.currentFile && (
        <p style={s.currentFile}>{progress.currentFile}</p>
      )}
      {(progress?.bytesPerSecond ?? 0) > 0 && (
        <p style={s.muted}>{formatBytes(progress!.bytesPerSecond)}/s</p>
      )}
    </div>
  )
}

// ---- Complete view ----

function CompleteView({ summary, onEject, onReset }: { summary: SyncSummary; onEject: () => void; onReset: () => void }) {
  return (
    <div style={s.center}>
      <div style={s.bigIcon}>✅</div>
      <p style={s.statusTitle}>Sync complete</p>
      <div style={s.stats}>
        <Stat value={summary.copied} label="Copied" color="#a6e3a1" />
        <Stat value={summary.skipped} label="Skipped" color="#6366f1" />
        <Stat value={summary.durationSeconds} label="Seconds" color="#89b4fa" />
      </div>
      <div style={s.btnRow}>
        <button style={{ ...s.btn, ...s.btnSecondary }} onClick={onEject}>Eject</button>
        <button style={{ ...s.btn, ...s.btnSecondary }} onClick={onReset}>Sync again</button>
      </div>
    </div>
  )
}

// ---- Error view ----

function ErrorView({ error, onReset }: { error: string | null; onReset: () => void }) {
  return (
    <div style={s.center}>
      <div style={s.bigIcon}>❌</div>
      <p style={s.statusTitle}>Sync failed</p>
      <p style={s.errorMsg}>{error ?? 'Unknown error'}</p>
      <button style={{ ...s.btn, ...s.btnSecondary }} onClick={onReset}>Try again</button>
    </div>
  )
}

// ---- Main ----

export function Sync() {
  const { device, diff, isDiffLoading, syncStatus, progress, summary, startSync, eject, reset, error } = useSync()

  if (!device) {
    return (
      <div style={s.center}>
        <div style={s.bigIcon}>🔌</div>
        <p style={s.statusTitle}>No device detected</p>
        <p style={s.muted}>Plug in the MP3 player to start syncing.</p>
      </div>
    )
  }

  if (syncStatus === 'syncing') return <SyncingView progress={progress} />
  if (syncStatus === 'complete') return <CompleteView summary={summary!} onEject={eject} onReset={reset} />
  if (syncStatus === 'error') return <ErrorView error={error} onReset={reset} />

  return <ReadyView device={device} diff={diff} isDiffLoading={isDiffLoading} onSync={startSync} />
}

// ---- Styles ----

const s: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 32px',
    gap: 16,
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 12,
    padding: '0 32px',
    textAlign: 'center',
  },
  bigIcon: { fontSize: 56, lineHeight: 1 },
  deviceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    alignSelf: 'stretch',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: '12px 16px',
  },
  deviceIcon: { fontSize: 32 },
  deviceName: { fontSize: 20, fontWeight: 700, color: '#fff' },
  deviceSub: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  storageBar: {
    alignSelf: 'stretch',
    height: 8,
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  storageBarFill: { height: '100%', background: '#6366f1', borderRadius: 4, transition: 'width 0.3s' },
  stats: { display: 'flex', gap: 28, marginTop: 4 },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 36, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  muted: { color: 'rgba(255,255,255,0.5)', fontSize: 15, margin: 0 },
  btn: {
    marginTop: 8,
    padding: '14px 40px',
    borderRadius: 10,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.12)',
    fontSize: 16,
    padding: '12px 28px',
    marginTop: 0,
  },
  btnRow: { display: 'flex', gap: 12, marginTop: 8 },
  statusTitle: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 },
  progressTrack: {
    width: 360,
    height: 10,
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', background: '#a6e3a1', borderRadius: 5, transition: 'width 0.3s' },
  progressLabel: { color: '#fff', fontWeight: 600, fontSize: 18, margin: 0 },
  currentFile: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'monospace',
    maxWidth: 400,
    wordBreak: 'break-all',
    margin: 0,
  },
  errorMsg: { color: '#f38ba8', fontSize: 15, maxWidth: 360, margin: 0 },
}
