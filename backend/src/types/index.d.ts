declare module 'node-mpv' {
  import { EventEmitter } from 'events';
  interface MPVOptions {
    audio_only?: boolean;
    auto_restart?: boolean;
    [key: string]: any;
  }
  class MPV extends EventEmitter {
    constructor(options?: MPVOptions);
    load(file: string, mode?: string): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
    volume(volume: number): Promise<void>;
    on(event: string, listener: (...args: any[]) => void): this;
  }
  export = MPV;
}

// Shared types
export interface Song {
  id: string;
  title: string;
  artist: string;
  filePath: string;
  thumbnail?: string;
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
} 