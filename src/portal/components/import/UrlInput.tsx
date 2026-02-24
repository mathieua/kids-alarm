import { useState } from 'react'

interface Props {
  onFetch: (url: string) => void
  isLoading: boolean
}

export function UrlInput({ onFetch, isLoading }: Props) {
  const [url, setUrl] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (url.trim()) onFetch(url.trim())
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="url"
        placeholder="https://www.youtube.com/watch?v=..."
        value={url}
        onChange={e => setUrl(e.target.value)}
        style={styles.input}
        required
      />
      <button type="submit" disabled={isLoading} style={styles.btn}>
        {isLoading ? 'Fetching...' : 'Fetch Metadata'}
      </button>
    </form>
  )
}

const styles: Record<string, React.CSSProperties> = {
  form: { display: 'flex', gap: 12, maxWidth: 600 },
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #45475a',
    background: '#181825',
    color: '#cdd6f4',
    fontSize: 14,
  },
  btn: {
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#89b4fa',
    color: '#1e1e2e',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}
