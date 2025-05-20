export interface Song {
    id: string;
    title: string;
    album: string;
    artist: string;
    filePath: string;
    thumbnail: string;
}

export interface Playlist {
    id: string;
    name: string;
    songs: Song[];
}

export interface AudioStatus {
    isPlaying: boolean;
    volume: number;
    currentFilePath: string | null;
    progress?: number;
    duration?: number;
}
