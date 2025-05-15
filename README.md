# Kids Alarm Clock

A touchscreen-based alarm clock application designed for children, running on Raspberry Pi with a 7" touchscreen display.

## Features

- Current time and next alarm display
- Lullaby mode with timer
- Theme customization
- Music player with local MP3 support
- Weather information
- Important dates display (birthdays, etc.)

## Prerequisites

- Raspberry Pi (tested on Pi 4)
- 7" touchscreen display
- Node.js (v16 or higher)
- npm or yarn

## Project Structure

```
/project-root
/frontend         → React app
/backend          → Express server
/media            → MP3 files
/config           → Configuration files
/shared           → Shared types/interfaces
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   PORT=3001
   OPENWEATHER_API_KEY=your_api_key_here
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Configuration Files

The application uses several JSON configuration files located in the `/config` directory:

- `alarms.json`: Alarm settings and schedules
- `themes.json`: UI theme configurations
- `dates.json`: Important dates and events

## Development

- Frontend runs on port 3000
- Backend runs on port 3001
- API documentation available at `/api-docs` when running the backend

## License

MIT 