# Kids Alarm

A music player application for kids, featuring playlists and easy controls.

## Prerequisites

### Backend Requirements

- Node.js (v14 or higher)
- MPV media player (required for audio playback)

#### Installing MPV

**macOS:**
```bash
brew install mpv
```

**Linux/Raspberry Pi:**
```bash
sudo apt-get update
sudo apt-get install mpv
```

**Windows:**
Download from [mpv.io](https://mpv.io/installation/)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd kids-alarm
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- **Playlist Management**
  - Create and manage playlists
  - Add songs to playlists
  - View playlist contents

- **Audio Playback**
  - Play/pause/resume audio
  - Volume control
  - Stop playback
  - Real-time volume adjustment without interrupting playback

## API Endpoints

### Audio Control

- `POST /api/audio/play` - Start playback
  ```json
  {
    "filePath": "path/to/song.mp3",
    "volume": 80
  }
  ```

- `POST /api/audio/pause` - Pause playback
- `POST /api/audio/resume` - Resume playback
- `POST /api/audio/stop` - Stop playback
- `POST /api/audio/volume` - Set volume (0-100)
  ```json
  {
    "volume": 80
  }
  ```
- `GET /api/audio/status` - Get playback status

## Development

### Project Structure

```
kids-alarm/
├── backend/           # Node.js backend
│   ├── src/
│   │   ├── routes/   # API routes
│   │   └── services/ # Business logic
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   └── types/
│   └── package.json
└── media/           # Audio files
```

## License

[Your License] 