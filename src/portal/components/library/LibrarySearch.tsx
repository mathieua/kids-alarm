import { useState, useEffect } from 'react'

interface Props {
  value: string
  onChange: (q: string) => void
}

export function LibrarySearch({ value, onChange }: Props) {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => onChange(local), 300)
    return () => clearTimeout(timer)
  }, [local, onChange])

  return (
    <input
      type="search"
      placeholder="Search by title or artist..."
      value={local}
      onChange={e => setLocal(e.target.value)}
      style={styles.input}
    />
  )
}

const styles: Record<string, React.CSSProperties> = {
  input: {
    width: '100%',
    maxWidth: 400,
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #45475a',
    background: '#181825',
    color: '#cdd6f4',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  },
}
