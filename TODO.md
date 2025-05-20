# TODO

- [x] Define features
- [x] Create overall architecture
- [x] Create test UI to validate backend
- [x] Test it on raspberry pi.
- [ ] Setup-up multi-screen UI with touch interaction
- [ ] Apply clock design
- [ ] Create new playlist design and player design


## 🔧 Hardware Setup
- [x] Set up Raspberry Pi with OS
- [x] Connect and test touchscreen display
- [x] Connect and test USB speaker
- [ ] Add stereo speakers and amplifier
- [ ] Design and print enclosure (Fusion 360)
- [ ] Add physical buttons (play/pause, volume, power)
- [ ] Add power supply (battery/USB-C) and test charging
- [ ] Add optional fan/cooling solution if needed

## 💾 Software Backend
- [x] Install and configure Python environment
- [ ] Implement backend to download MP3 from YouTube via `yt-dlp`
- [ ] Fetch video title from YouTube
- [ ] Use Spotify API to fetch metadata (artist, album, cover)
- [ ] Store metadata and MP3 file in local storage
- [ ] Assign internal song ID and support playlists
- [ ] Simulated sleep/wake logic
- [ ] GPIO handling for power/sleep/wake

## 📱 Parent Web App
- [ ] Create React + Node.js/Express boilerplate
- [ ] Allow file upload (songs/stories)
- [ ] Show playlist and song metadata (title, artist, cover)
- [ ] Send commands to device (play/pause, sleep, etc.)

## 🎨 User Interface (Touchscreen)
- [ ] Design and build main clock UI (day + night theme)
- [ ] Implement Minecraft-inspired theme for child-friendly UX
- [ ] Add screen brightness control
- [ ] Display battery status
- [ ] Add voice feedback (optional)
- [ ] Add wake-up animation (optional)

## 🧪 Testing & Iteration
- [ ] Test full sleep/wake cycle
- [ ] Test battery life under load
- [ ] User test with child for usability
- [ ] Iterate enclosure design based on feedback
