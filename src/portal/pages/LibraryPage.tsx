import { useMediaLibrary } from '../hooks/useMediaLibrary'
import { CategoryTabs } from '../components/library/CategoryTabs'
import { LibrarySearch } from '../components/library/LibrarySearch'
import { ArtistGroup } from '../components/library/ArtistGroup'
import { EmptyState } from '../components/library/EmptyState'
import type { MediaItem } from '../types/portal.types'

export function LibraryPage() {
  const { items, isLoading, activeCategory, setCategory, searchQuery, setSearchQuery, deleteItem, updateItem } = useMediaLibrary()

  // Group by artist
  const byArtist = items.reduce<Record<string, MediaItem[]>>((acc, item) => {
    if (!acc[item.artist]) acc[item.artist] = []
    acc[item.artist].push(item)
    return acc
  }, {})

  const artists = Object.keys(byArtist).sort()

  return (
    <div>
      <div style={styles.topRow}>
        <h1 style={styles.heading}>Media Library</h1>
        <span style={styles.count}>{items.length} tracks</span>
      </div>
      <CategoryTabs active={activeCategory} onChange={setCategory} />
      <LibrarySearch value={searchQuery} onChange={setSearchQuery} />
      <div style={styles.list}>
        {isLoading && <div style={styles.loading}>Loading...</div>}
        {!isLoading && artists.length === 0 && (
          <EmptyState message={searchQuery ? 'No tracks match your search' : 'No tracks in this category'} />
        )}
        {artists.map(artist => (
          <ArtistGroup
            key={artist}
            artist={artist}
            tracks={byArtist[artist]}
            onDelete={deleteItem}
            onUpdate={updateItem}
          />
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  topRow: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 20 },
  heading: { fontSize: 24, fontWeight: 700, margin: 0, color: '#cdd6f4' },
  count: { fontSize: 13, color: '#585b70' },
  list: { marginTop: 20 },
  loading: { color: '#585b70', padding: 40, textAlign: 'center' },
}
