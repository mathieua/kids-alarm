interface Props {
  message?: string
}

export function EmptyState({ message = 'No tracks found' }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>🎵</div>
      <div style={styles.text}>{message}</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 60, color: '#585b70' },
  icon: { fontSize: 48, marginBottom: 16 },
  text: { fontSize: 16 },
}
