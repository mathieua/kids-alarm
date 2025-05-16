import MPV from 'node-mpv';
import path from 'path';
import process from 'process';

class AudioService {
  private mpv: MPV;
  private currentFilePath: string | null = null;
  private isPlaying: boolean = false;
  private currentVolume: number = 100;
  private progress: number = 0;
  private duration: number = 0;
  private progressInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.mpv = new MPV({
      audio_only: true,
      auto_restart: true,
      time_update: 1, // Update time position every second
    });

    this.mpv.on('stopped', () => {
      console.log('Playback stopped');
      this.isPlaying = false;
      this.currentFilePath = null;
      this.progress = 0;
      this.stopProgressUpdates();
    });

    this.mpv.on('paused', () => {
      console.log('Playback paused');
      this.isPlaying = false;
      this.stopProgressUpdates();
    });

    this.mpv.on('started', () => {
      console.log('Playback started');
      this.isPlaying = true;
      this.startProgressUpdates();
      this.tryUpdateDuration();
    });

    this.mpv.on('timeposition', (time: number) => {
      console.log('Time position updated:', time);
      this.progress = time;
    });

    this.mpv.on('duration', (time: number) => {
      if (typeof time === 'number' && !isNaN(time) && time > 0) {
        console.log('Duration event updated:', time);
        this.duration = time;
      }
    });
  }

  private async tryUpdateDuration() {
    try {
      let duration = await (this.mpv as any).getProperty('duration');
      if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
        console.log('Duration property fetched:', duration);
        this.duration = duration;
        return;
      }
      // Fallback to calculated method
      const timePos = await (this.mpv as any).getProperty('time-pos');
      const remaining = await (this.mpv as any).getProperty('playtime-remaining');
      if (typeof timePos === 'number' && typeof remaining === 'number') {
        const total = timePos + remaining;
        console.log('Fallback calculated duration:', total);
        this.duration = total;
      }
    } catch (error) {
      console.error('Error updating duration:', error);
    }
  }

  private startProgressUpdates() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.progressInterval = setInterval(async () => {
      if (this.isPlaying) {
        try {
          const timePos = await (this.mpv as any).getProperty('time-pos');
          this.progress = timePos;
          // Always try to keep duration up to date
          let duration = await (this.mpv as any).getProperty('duration');
          if (typeof duration === 'number' && !isNaN(duration) && duration > 0) {
            this.duration = duration;
          } else {
            const remaining = await (this.mpv as any).getProperty('playtime-remaining');
            if (typeof timePos === 'number' && typeof remaining === 'number') {
              this.duration = timePos + remaining;
            }
          }
        } catch (error) {
          console.error('Error updating progress/duration:', error);
        }
      }
    }, 1000);
  }

  private stopProgressUpdates() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  async play(filePath: string, volume: number = 100): Promise<{ message: string; status: any }> {
    try {
      const absolutePath = path.resolve(process.cwd(), '..', filePath);
      console.log(`Attempting to play file: ${filePath} (resolved: ${absolutePath}) with volume: ${volume}`);
      
      this.currentFilePath = filePath;
      this.currentVolume = volume;
      
      await this.mpv.load(absolutePath, 'replace');
      await this.mpv.volume(volume);
      
      await this.tryUpdateDuration();
      
      this.isPlaying = true;
      this.startProgressUpdates();
      
      return {
        message: 'Playback started',
        status: {
          isPlaying: true,
          volume: this.currentVolume,
          currentFilePath: this.currentFilePath,
          progress: this.progress,
          duration: this.duration
        }
      };
    } catch (error) {
      console.error('Error in play method:', error);
      throw error;
    }
  }

  async pause(): Promise<{ message: string; status: any }> {
    try {
      await this.mpv.pause();
      this.isPlaying = false;
      this.stopProgressUpdates();
      return {
        message: 'Playback paused',
        status: {
          isPlaying: false,
          volume: this.currentVolume,
          currentFilePath: this.currentFilePath,
          progress: this.progress,
          duration: this.duration
        }
      };
    } catch (error) {
      console.error('Error in pause method:', error);
      throw error;
    }
  }

  async resume(): Promise<{ message: string; status: any }> {
    try {
      await this.mpv.resume();
      this.isPlaying = true;
      this.startProgressUpdates();
      return {
        message: 'Playback resumed',
        status: {
          isPlaying: true,
          volume: this.currentVolume,
          currentFilePath: this.currentFilePath,
          progress: this.progress,
          duration: this.duration
        }
      };
    } catch (error) {
      console.error('Error in resume method:', error);
      throw error;
    }
  }

  async stop(): Promise<{ message: string; status: any }> {
    try {
      await this.mpv.stop();
      this.isPlaying = false;
      this.currentFilePath = null;
      this.progress = 0;
      this.stopProgressUpdates();
      return {
        message: 'Playback stopped',
        status: {
          isPlaying: false,
          volume: this.currentVolume,
          currentFilePath: null,
          progress: 0,
          duration: this.duration
        }
      };
    } catch (error) {
      console.error('Error in stop method:', error);
      throw error;
    }
  }

  async setVolume(volume: number): Promise<{ message: string; status: any }> {
    try {
      this.currentVolume = volume;
      await this.mpv.volume(volume);
      return {
        message: 'Volume updated',
        status: {
          isPlaying: this.isPlaying,
          volume: this.currentVolume,
          currentFilePath: this.currentFilePath,
          progress: this.progress,
          duration: this.duration
        }
      };
    } catch (error) {
      console.error('Error in setVolume method:', error);
      throw error;
    }
  }

  getStatus(): { isPlaying: boolean; volume: number; currentFilePath: string | null; progress: number; duration: number } {
    console.log('Getting status:', {
      isPlaying: this.isPlaying,
      volume: this.currentVolume,
      currentFilePath: this.currentFilePath,
      progress: this.progress,
      duration: this.duration
    });
    return {
      isPlaying: this.isPlaying,
      volume: this.currentVolume,
      currentFilePath: this.currentFilePath,
      progress: this.progress,
      duration: this.duration
    };
  }

  async seek(position: number): Promise<{ message: string; status: any }> {
    try {
      if (!this.currentFilePath) {
        throw new Error('No file is currently playing');
      }
      
      console.log(`Seeking to position: ${position} (current position: ${this.progress})`);
      
      // First pause playback
      const wasPlaying = this.isPlaying;
      if (wasPlaying) {
        console.log('Pausing playback before seek');
        await (this.mpv as any).pause();
      }
      
      // Get current position
      const currentPos = await (this.mpv as any).getProperty('time-pos');
      console.log('Current position before seek:', currentPos);
      
      // Calculate relative position
      const relativePos = position - currentPos;
      console.log('Seeking relative position:', relativePos);
      
      // Perform seek
      if (relativePos !== 0) {
        console.log('Performing seek operation');
        await (this.mpv as any).seek(relativePos, 'relative');
      }
      
      // Wait a short moment to ensure the seek operation is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the actual position after seeking
      const actualPosition = await (this.mpv as any).getProperty('time-pos');
      console.log('Actual position after seek:', actualPosition);
      
      // Validate the position is close to what we requested
      const positionDiff = Math.abs(actualPosition - position);
      if (positionDiff > 1) { // If difference is more than 1 second
        console.log('Position difference too large, attempting to correct');
        await (this.mpv as any).seek(position, 'absolute');
        await new Promise(resolve => setTimeout(resolve, 100));
        const correctedPosition = await (this.mpv as any).getProperty('time-pos');
        console.log('Corrected position:', correctedPosition);
        this.progress = correctedPosition;
      } else {
        this.progress = actualPosition;
      }
      
      // Resume playback if it was playing before
      if (wasPlaying) {
        console.log('Resuming playback after seek');
        await (this.mpv as any).resume();
      }
      
      const status = this.getStatus();
      console.log('Final status after seek:', status);
      
      return {
        message: `Seeked to position ${position}`,
        status
      };
    } catch (error) {
      console.error('Error in seek method:', error);
      // Try to resume playback if it was playing before
      if (this.isPlaying) {
        try {
          console.log('Attempting to resume playback after seek error');
          await (this.mpv as any).resume();
        } catch (resumeError) {
          console.error('Error resuming playback after seek:', resumeError);
        }
      }
      throw error;
    }
  }
}

export default new AudioService(); 