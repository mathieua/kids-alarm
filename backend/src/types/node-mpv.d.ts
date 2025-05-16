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