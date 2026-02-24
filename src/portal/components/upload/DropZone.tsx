import { useState, useRef } from 'react'

interface Props {
  onFile: (file: File) => void
}

export function DropZone({ onFile }: Props) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'audio/mpeg' || file.name.endsWith('.mp3'))) {
      onFile(file)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      style={{ ...styles.zone, ...(dragging ? styles.dragging : {}) }}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept=".mp3,audio/mpeg" onChange={handleChange} style={{ display: 'none' }} />
      <div style={styles.icon}>🎵</div>
      <div style={styles.text}>Drop an MP3 here or <span style={styles.link}>browse</span></div>
      <div style={styles.hint}>Only .mp3 files are accepted</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  zone: {
    border: '2px dashed #45475a',
    borderRadius: 12,
    padding: '48px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    maxWidth: 480,
  },
  dragging: { borderColor: '#89b4fa', background: 'rgba(137,180,250,0.05)' },
  icon: { fontSize: 40, marginBottom: 12 },
  text: { color: '#cdd6f4', fontSize: 16, marginBottom: 8 },
  link: { color: '#89b4fa', textDecoration: 'underline' },
  hint: { color: '#585b70', fontSize: 12 },
}
