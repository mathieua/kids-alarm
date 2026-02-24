# Kids Multimedia Alarm Clock - Project Specification

## Overview

A Raspberry Pi-based multimedia alarm clock designed for children ages 7-11, featuring a touchscreen interface, physical controls, media playback, and parental management capabilities.

---

## Hardware

### Prototype Hardware (Available Now)

| Component | Model | Notes |
|-----------|-------|-------|
| Computer | Raspberry Pi 4 (4GB) | Main processing unit |
| Display | Official Raspberry Pi 7" Touchscreen (Gen 1) | 800x480, landscape orientation |
| Audio | USB Speaker | Temporary for prototype |
| Input | Breadboard with buttons/knobs | For physical controls |

### Additional Hardware Required

| Component | Recommended Model | Est. Price | Priority |
|-----------|------------------|------------|----------|
| RTC Module | DS3231 (I2C) | ~$6 | **Critical** - Pi loses time on power loss |
| Light Sensor | BH1750 (I2C) | ~$4 | High - Auto screen dimming |
| MicroSD Card | 64GB+ A2 rated | ~$12 | High - Fast random I/O |
| Power Supply | Official Pi 5.1V/3A | ~$8 | High - Stability |

### V1 Hardware Upgrades (May)

| Component | Recommended Model | Est. Price | Notes |
|-----------|------------------|------------|-------|
| DAC + Amplifier | HiFiBerry MiniAmp | ~$24 | Major audio quality improvement |
| Speakers | 2x 3W 4Ω drivers | ~$10 | Match to enclosure design |
| Rotary Encoder | KY-040 | ~$3 | Better than potentiometer for volume |
| Tactile Buttons | Cherry MX or similar | ~$8 | Quality feel for kids |
| Enclosure | 3D printed | Materials only | Custom design |

### Budget Summary

- **Prototype target:** ~$155 (assuming Pi + screen already owned)
- **V1 target:** Under $200 total

---

## Software Stack

### Primary Technologies

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Electron | Leverages existing React/TS skills, good Pi 4 performance |
| UI | React + TypeScript | Developer familiarity, rapid iteration |
| Database | SQLite | Offline-first, simple, reliable |
| Audio | Howler.js | Cross-platform, good API |
| GPIO | onoff / pigpio | Node.js GPIO bindings |
| Scheduling | node-cron | Alarm scheduling |
| API Server | Express | Parent portal backend |

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ALARM CLOCK DEVICE                      │
├─────────────────────────────────────────────────────────────┤
│  Electron App                                                │
│  ├── Renderer (React/TypeScript UI)                         │
│  │   ├── Clock/Weather View                                 │
│  │   ├── Media Browser/Player                               │
│  │   ├── Alarm Manager                                      │
│  │   └── Settings                                           │
│  │                                                          │
│  └── Main Process (Node.js)                                 │
│      ├── Audio Engine (howler.js)                           │
│      ├── Hardware I/O (GPIO via onoff/pigpio)               │
│      ├── Local SQLite Database                              │
│      ├── Alarm Scheduler (node-cron + RTC sync)             │
│      ├── REST API Server (Express) ←── Parent Portal        │
│      └── File Watcher (media library)                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  System Services                                            │
│  ├── systemd service (auto-start, watchdog, restart)        │
│  ├── Network manager (WiFi client + AP provisioning mode)   │
│  └── RTC daemon (hwclock sync)                              │
└─────────────────────────────────────────────────────────────┘
          │
          │ Local Network (REST API)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                      PARENT PORTAL                           │
│  (Web app running on same Pi, accessed via browser)         │
│  ├── Media Library Management                               │
│  ├── Alarm Schedule Configuration                           │
│  ├── Device Settings                                        │
│  ├── YouTube Music Import Tool                              │
│  └── iTunes Import (future)                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Specifications

### Core Features (Prototype - End of Week)

#### Clock/Weather Display
- Large, readable time display (12hr or 24hr configurable)
- Current date with day of week
- Weather: current temp, conditions, icon
- Weather source: OpenWeatherMap API (free tier)
- Auto-dim based on ambient light sensor

#### Media Player
- Browse local media files (flat list initially)
- Playback controls: play, pause, next, previous
- Volume control (touch + physical)
- Now playing display with artwork (if available)
- Supported formats: MP3, M4A, OGG, WAV

#### Basic Alarm
- Set alarm time
- Enable/disable alarm
- Alarm fires with sound playback
- Gradual volume increase over ~30 seconds
- Snooze: 5 minutes (touch or physical button)
- Dismiss: touch or physical button
- Auto-dismiss: 5 minutes (configurable later)

#### Sleep Timer
- Set timer duration (15, 30, 45, 60 min or custom)
- Auto-stops media playback when timer expires
- Optional: gradual volume decrease before stop

### V1 Features (May)

#### Enhanced Alarm System
- Multiple alarms with individual schedules
- Per-day scheduling (weekdays, weekends, specific days)
- Custom alarm sounds (select from media library)
- Configurable snooze duration
- Configurable auto-dismiss duration

#### Media Organization
- Playlists support
- Categories: Lullabies, Music, Audiobooks
- Album artwork display
- Basic metadata display (artist, album, duration)

#### Parent Portal (Web)
- Accessible at `http://<device-ip>:3000/admin`
- Local network only (no auth needed initially)
- Media library management:
  - Upload files
  - Organize into categories
  - Edit metadata
  - Delete files
- Alarm configuration
- Device settings:
  - Volume limits
  - Screen brightness limits
  - Sleep timer defaults
- YouTube Music import:
  - Paste URL
  - Auto-download audio + thumbnail
  - Add to library

#### Physical Controls
- Volume knob (rotary encoder)
- Play/pause button
- Next/previous buttons
- Snooze/dismiss button (shared)

### Future Features (V1.5+)

- Battery power + power management
- iTunes library import
- Family calendar integration
- Theming/customization
- OTA updates
- Games (with Bluetooth controller)
- Video playback
- Karaoke mode

---

## User Interface Specifications

### General UI Guidelines

- **Orientation:** Landscape (800x480 native)
- **Target users:** Ages 7-11
- Large touch targets (minimum 48x48px, prefer 64x64px+)
- High contrast, readable fonts
- Simple navigation (minimal nesting)
- Visual feedback for all interactions

### Screen Layout

```
┌────────────────────────────────────────────────────────────┐
│  [Status Bar: Time | WiFi | Battery? | Settings]           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                    [Main Content Area]                     │
│                                                            │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  [Nav: Clock] [Media] [Alarms] [Sleep]                     │
└────────────────────────────────────────────────────────────┘
```

### Views

#### Clock View (Default/Home)
- Large time display (center, dominant)
- Date below time
- Weather widget (corner)
- Next alarm indicator (if set)
- Tap anywhere to temporarily boost brightness

#### Media Browser View
- Grid or list of available media
- Album art thumbnails
- Tap to play
- Long-press for options (future)

#### Now Playing View
- Album artwork (large)
- Track title, artist
- Progress bar (scrubbable)
- Playback controls
- Volume slider
- Sleep timer button

#### Alarm Setup View
- Time picker (scroll wheels or +/- buttons)
- Days selector (checkboxes or toggle buttons)
- Sound selector
- Enable/disable toggle
- Save/cancel buttons

#### Settings View (minimal for kids)
- Brightness slider
- Volume limit slider
- 12hr/24hr toggle
- (Most settings in parent portal)

### Night Mode
- Triggered by: low ambient light OR manual toggle OR schedule
- Reduced brightness
- Red-shifted colors (easier on eyes)
- Simplified display (time only, larger)

---

## Hardware Interface Specifications

### GPIO Pin Assignments (Tentative)

| Function | GPIO Pin | Notes |
|----------|----------|-------|
| Play/Pause Button | GPIO 17 | Pull-up, active low |
| Next Button | GPIO 27 | Pull-up, active low |
| Previous Button | GPIO 22 | Pull-up, active low |
| Snooze/Dismiss Button | GPIO 23 | Pull-up, active low |
| Rotary Encoder CLK | GPIO 5 | Volume control |
| Rotary Encoder DT | GPIO 6 | Volume control |
| Rotary Encoder SW | GPIO 13 | Encoder button (mute?) |
| I2C SDA | GPIO 2 | For RTC + Light Sensor |
| I2C SCL | GPIO 3 | For RTC + Light Sensor |

### I2C Devices

| Device | Address | Purpose |
|--------|---------|---------|
| DS3231 RTC | 0x68 | Real-time clock |
| BH1750 Light Sensor | 0x23 | Ambient light detection |

### Button Behavior

| Button | Short Press | Long Press (2s) |
|--------|-------------|-----------------|
| Play/Pause | Toggle playback | Stop playback |
| Next | Next track | Fast forward (hold) |
| Previous | Previous track / Restart | Rewind (hold) |
| Snooze/Dismiss | Snooze (during alarm) | Dismiss alarm |
| Encoder Button | Mute toggle | - |

---

## Data Models

### SQLite Schema (Initial)

```sql
-- Media tracks
CREATE TABLE tracks (
  id INTEGER PRIMARY KEY,
  filename TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  album TEXT,
  duration_seconds INTEGER,
  artwork_path TEXT,
  category TEXT, -- 'lullaby', 'music', 'audiobook'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Playlists
CREATE TABLE playlists (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_tracks (
  playlist_id INTEGER REFERENCES playlists(id),
  track_id INTEGER REFERENCES tracks(id),
  position INTEGER,
  PRIMARY KEY (playlist_id, track_id)
);

-- Alarms
CREATE TABLE alarms (
  id INTEGER PRIMARY KEY,
  time TEXT NOT NULL, -- HH:MM format
  days TEXT NOT NULL, -- JSON array: [0,1,2,3,4,5,6] (0=Sunday)
  enabled INTEGER DEFAULT 1,
  sound_track_id INTEGER REFERENCES tracks(id),
  snooze_minutes INTEGER DEFAULT 5,
  auto_dismiss_minutes INTEGER DEFAULT 5,
  gradual_volume INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Default settings
INSERT INTO settings (key, value) VALUES
  ('volume', '70'),
  ('brightness', '80'),
  ('time_format', '12'),
  ('weather_location', ''),
  ('weather_api_key', ''),
  ('night_mode_start', '20:00'),
  ('night_mode_end', '07:00');
```

---

## File Structure

```
alarm-clock/
├── package.json
├── tsconfig.json
├── electron-builder.json
├── .gitignore
├── README.md
├── SPEC.md                    # This file
│
├── electron/                   # Main process
│   ├── main.ts                # Entry point
│   ├── preload.ts             # Context bridge
│   └── services/
│       ├── audio.ts           # Playback engine
│       ├── gpio.ts            # Hardware buttons/knobs
│       ├── alarm.ts           # Scheduler
│       ├── database.ts        # SQLite wrapper
│       ├── weather.ts         # OpenWeatherMap client
│       ├── rtc.ts             # RTC read/write
│       ├── lightsensor.ts     # BH1750 driver
│       └── api.ts             # REST server for parent portal
│
├── src/                        # React renderer
│   ├── index.tsx
│   ├── App.tsx
│   ├── views/
│   │   ├── Clock.tsx
│   │   ├── MediaBrowser.tsx
│   │   ├── NowPlaying.tsx
│   │   ├── AlarmSetup.tsx
│   │   └── Settings.tsx
│   ├── components/
│   │   ├── TimeDisplay.tsx
│   │   ├── WeatherWidget.tsx
│   │   ├── TrackList.tsx
│   │   ├── PlaybackControls.tsx
│   │   └── Navigation.tsx
│   ├── hooks/
│   │   ├── useAudio.ts
│   │   ├── useAlarms.ts
│   │   └── useSettings.ts
│   ├── styles/
│   │   └── global.css
│   └── types/
│       └── index.ts
│
├── parent-portal/              # Parent web interface
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── views/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MediaManager.tsx
│   │   │   ├── AlarmManager.tsx
│   │   │   ├── YouTubeImport.tsx
│   │   │   └── Settings.tsx
│   │   └── components/
│   └── ...
│
├── scripts/
│   ├── setup-pi.sh            # Initial Pi configuration
│   ├── install-deps.sh        # Install system dependencies
│   ├── yt-import.ts           # YouTube Music downloader
│   └── sync-rtc.sh            # RTC synchronization
│
├── media/                      # Default media location
│   ├── lullabies/
│   ├── music/
│   └── audiobooks/
│
└── data/                       # Runtime data
    ├── alarm-clock.db         # SQLite database
    └── artwork/               # Cached artwork
```

---

## Development Phases

### Phase 1: Working Prototype (This Week)

**Goal:** Clock displays, music plays, one button works

**Day 1-2: Environment Setup**
- [ ] Install Raspberry Pi OS Lite (64-bit)
- [ ] Install X11 minimal desktop
- [ ] Install Node.js 20 LTS
- [ ] Create Electron + React + TypeScript boilerplate
- [ ] Verify app launches on Pi and displays on touchscreen
- [ ] Initialize git repo

**Day 3-4: Core Features**
- [ ] Clock/Date display (CSS-based, no canvas)
- [ ] Basic media player (scan folder, play MP3s)
- [ ] Simple file browser UI
- [ ] Audio playback via Howler.js
- [ ] One GPIO button triggers play/pause

**Day 5: Integration**
- [ ] Sleep timer functionality
- [ ] Basic alarm (in-memory, fires sound)
- [ ] Light sensor reading → brightness adjustment
- [ ] Demo to kids, gather feedback

**Stretch goals (if time permits):**
- [ ] Prototype enclosure (learning exercise, easy-open design)
- [ ] Additional GPIO buttons
- [ ] Basic persistence

### Phase 2: V1 (Target: End of March)

> **Note:** Detailed scope to be refined after prototype feedback from kids.

**Likely candidates:**
- SQLite persistence (alarms, settings)
- Full GPIO integration (all buttons + rotary encoder)
- Weather API integration
- Night mode
- Parent portal (web UI for media/alarm management)
- YouTube Music import
- iTunes import (simpler than expected — just XML parsing)

**Hardware (can parallel with software):**
- Refined enclosure design
- Possibly still USB speaker (defer amp upgrade if needed)

### Phase 2.1: V1.1 (Target: Mid-April)

> **Note:** Hardware fit & finish — only if not done in V1.

- HiFiBerry MiniAmp + real speakers
- Final enclosure with proper speaker mounting
- Thermal testing and ventilation

### Phase 3: V1.5 (Target: Summer)

> **Note:** To be scoped after V1 is stable and in daily use.

**Likely candidates:**
- Battery + power management (complex — Pi 4 is power-hungry)
- OTA update mechanism
- Family calendar integration (lower priority for ages 7 & 11)
- Games with Bluetooth controller
- Video playback
- Karaoke mode

---

## API Endpoints (Parent Portal)

### Media

```
GET    /api/media                 # List all tracks
GET    /api/media/:id             # Get track details
POST   /api/media                 # Upload new track(s)
PUT    /api/media/:id             # Update track metadata
DELETE /api/media/:id             # Delete track

GET    /api/playlists             # List playlists
POST   /api/playlists             # Create playlist
PUT    /api/playlists/:id         # Update playlist
DELETE /api/playlists/:id         # Delete playlist
```

### Alarms

```
GET    /api/alarms                # List all alarms
POST   /api/alarms                # Create alarm
PUT    /api/alarms/:id            # Update alarm
DELETE /api/alarms/:id            # Delete alarm
POST   /api/alarms/:id/test       # Trigger alarm (for testing)
```

### Device

```
GET    /api/settings              # Get all settings
PUT    /api/settings              # Update settings
GET    /api/status                # Device status (playing, alarm active, etc.)
POST   /api/import/youtube        # Import from YouTube URL
```

---

## YouTube Music Import

### Implementation Notes

- Uses `yt-dlp` for download (must be installed on Pi)
- Personal use only (user has YouTube Music subscription)
- Extracts: audio (MP3), thumbnail, metadata

### Workflow

1. User pastes YouTube Music URL in parent portal
2. Backend validates URL
3. `yt-dlp` downloads audio + thumbnail + metadata
4. Files saved to media directory
5. Track added to SQLite database
6. UI updates to show new track

### Command Example

```bash
yt-dlp \
  -x \
  --audio-format mp3 \
  --audio-quality 0 \
  --write-thumbnail \
  --convert-thumbnails jpg \
  -o "%(title)s.%(ext)s" \
  "https://music.youtube.com/watch?v=..."
```

---

## Raspberry Pi Setup Checklist

### Initial OS Setup

1. Flash Raspberry Pi OS Lite (64-bit) to SD card
2. Enable SSH (create empty `ssh` file in boot partition)
3. Configure WiFi (`wpa_supplicant.conf` in boot partition)
4. Boot and SSH in
5. Run `raspi-config`:
   - Set locale/timezone
   - Enable I2C
   - Set GPU memory to 128MB
   - Expand filesystem

### Install Dependencies

```bash
# System packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  xserver-xorg \
  xinit \
  x11-xserver-utils \
  chromium-browser \
  git \
  i2c-tools \
  python3-pip \
  ffmpeg

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# yt-dlp (for YouTube import)
sudo pip3 install yt-dlp

# Verify I2C
sudo i2cdetect -y 1
```

### Auto-start Configuration

Create systemd service for the Electron app to start on boot.

---

## Performance Considerations

### Electron Optimizations

- Disable hardware acceleration if GPU issues: `app.disableHardwareAcceleration()`
- Use `will-change` CSS sparingly
- Lazy-load views not immediately visible
- Keep main process lean; heavy lifting in workers if needed

### Memory Management

- Pi 4 (4GB) is comfortable for this workload
- Monitor with `htop`
- Target: <500MB total app memory

### Boot Time

- Pi 4 boots in ~20-40 seconds
- App should launch within 5 seconds of desktop ready
- Consider: splash screen, or clock-only fast-start mode

---

## WiFi Provisioning Mode

### Overview

When the Pi boots and cannot connect to any known WiFi network, it automatically switches to **Access Point (AP) mode**, allowing the user to connect directly from a phone or laptop to configure WiFi credentials — no monitor, keyboard, or SD card editing required.

### Behavior

```
Pi boots
  └── Tries known WiFi networks (timeout: ~30s)
        ├── Connected → normal operation
        └── No network found → activate AP mode
              ├── Hotspot: "AlarmClock-Setup" (no password)
              ├── Pi IP: 192.168.4.1
              └── Serve WiFi setup page at http://192.168.4.1:3000/setup
                    └── User submits credentials
                          ├── Pi saves via nmcli
                          ├── Deactivates AP
                          └── Connects to new network → normal operation
```

### Implementation

- **AP mode:** NetworkManager handles both client and AP mode natively on Bookworm — switch via `nmcli` (no `hostapd`/`dnsmasq` needed)
- **Detection:** A systemd service (or the Electron main process) checks connectivity on boot and triggers AP mode if needed
- **Setup UI:** A `/setup` route in the parent portal (Express) — only active in AP mode — renders a simple WiFi credential form
- **On submission:** Calls `nmcli device wifi connect <ssid> password <pwd>`, then deactivates the AP connection

### Key nmcli Commands

```bash
# Create AP hotspot
nmcli device wifi hotspot ifname wlan0 ssid "AlarmClock-Setup" band bg

# Check current connection
nmcli -t -f NAME,TYPE,STATE connection show --active

# Add a new WiFi network
nmcli device wifi connect "MyNetwork" password "MyPassword"

# Switch back to client mode (deactivate AP)
nmcli connection down "Hotspot"
```

### UX Notes

- AP hotspot name: `AlarmClock-Setup` (no password for easy access)
- The alarm clock screen should show a "Setup WiFi" message with the network name when in AP mode
- After successful connection, show the Pi's new IP / hostname for reference
- Stored credentials persist across reboots (saved by NetworkManager)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Pi loses power overnight, alarm doesn't fire | High | RTC module + fast boot + alarm service independent of app |
| Electron performance issues | Medium | Profile early, have Flutter as backup plan |
| Audio quality poor | Medium | Budget for HiFiBerry, test USB speakers early |
| Kids break touchscreen | Medium | Physical controls for common actions |
| WiFi unreliable | Low | Offline-first design, cache weather |

---

## Success Criteria

### Prototype (End of Week)

- [ ] Shows current time on screen
- [ ] Plays MP3 files from local storage
- [ ] At least one physical button works
- [ ] Kids can demo basic usage

### V1 (May)

- [ ] Reliable alarm that wakes kids up
- [ ] Kids can independently browse and play their music
- [ ] Parent can manage media library from phone/laptop
- [ ] Runs stable for 1+ week without intervention
- [ ] Fits in custom enclosure
- [ ] Sound quality acceptable for music/lullabies

---

## Notes & Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-02-03 | Electron over Flutter | Developer already knows React/TS, faster to prototype |
| 2025-02-03 | SQLite over JSON files | Better query capability, scales to playlists/history |
| 2025-02-03 | Landscape orientation | Better for clock display, matches alarm clock form factor |
| 2025-02-03 | Local network only for parent portal | Simpler security model for V1 |
