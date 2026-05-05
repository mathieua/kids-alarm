# leo-clock — Hardware Integration Spec

DS3231 · BH1750 · Rotary Encoder · Physical Buttons  
_Claude Code implementation handoff — April 2026_

---

## 1. Overview

This document specifies the full hardware integration layer for leo-clock. It covers wiring, Linux OS setup, software drivers, and systemd service definitions for four hardware components added to the base Raspberry Pi 4 + 7" DSI touchscreen system.

**Scope:**
- DS3231 RTC — real-time clock via I2C, hardware clock sync
- BH1750 light sensor — ambient lux reading via I2C, auto-dimming trigger
- Rotary encoder — volume control + mute via GPIO
- 4 physical buttons — play/pause, skip, previous, snooze via GPIO

> The Javra USB speaker requires no driver work. The DAC/amp board is not part of this build.

---

## 2. Hardware summary

| Component | Interface | Address / Pins | Purpose |
|-----------|-----------|----------------|---------|
| DS3231 RTC | I2C | 0x68, GPIO2/3 | Hardware clock — time kept when Pi is off |
| BH1750 | I2C | 0x23, GPIO2/3 | Ambient light → screen brightness |
| Rotary encoder | GPIO | 17 (CLK), 27 (DT), 22 (SW) | Volume up/down · push = mute |
| 4 × button | GPIO | 5, 6, 13, 19 | Play/pause · skip · previous · snooze |
| Javra USB speaker | USB | USB port | Audio output — no driver needed |

---

## 3. GPIO pin map

| BCM GPIO | Physical pin | Function | Pull / Mode |
|----------|--------------|----------|-------------|
| GPIO2 (SDA) | Pin 3 | I2C data — DS3231 + BH1750 | Hardware pull-up (built-in) |
| GPIO3 (SCL) | Pin 5 | I2C clock — DS3231 + BH1750 | Hardware pull-up (built-in) |
| GPIO17 | Pin 11 | Encoder CLK | Internal pull-up, active LOW |
| GPIO27 | Pin 13 | Encoder DT | Internal pull-up, active LOW |
| GPIO22 | Pin 15 | Encoder SW (mute) | Internal pull-up, active LOW |
| GPIO5 | Pin 29 | Button: play/pause | Internal pull-up, active LOW |
| GPIO6 | Pin 31 | Button: skip | Internal pull-up, active LOW |
| GPIO13 | Pin 33 | Button: previous | Internal pull-up, active LOW |
| GPIO19 | Pin 35 | Button: snooze | Internal pull-up, active LOW |
| GPIO26 | Pin 37 | Snooze button LED | Output, drives LED via 100Ω resistor |
| Pin 2 or 4 | — | 5V for DS3231, BH1750 | Power rail |
| Pin 6, 9, 14, 20 | — | GND shared rail | All components share ground |

> GPIO2/3 have dedicated hardware pull-ups on the Pi 4 board — do not add external pull-ups to the I2C lines.

> All button and encoder pins use the Pi's internal BCM pull-ups configured in software. No external resistors needed for wire runs under 30 cm.

---

## 4. Wiring

### 4.1 I2C bus (DS3231 + BH1750)

Both modules share the same two-wire I2C bus. Wire them in parallel — SDA of both chips to GPIO2, SCL of both to GPIO3.

| DS3231 / BH1750 pin | Pi pin |
|---------------------|--------|
| VCC | Pin 2 or 4 (5V) |
| GND | Any GND pin (6, 9, 14, 20…) |
| SDA | Pin 3 (GPIO2) |
| SCL | Pin 5 (GPIO3) |

> ⚠ Do not connect both VCC lines to the same physical header pin — use separate pins from the 5V rail, or use a breadboard/terminal block.

### 4.2 Rotary encoder

The encoder has 5 pins: CLK, DT, SW, VCC (+), GND. Some modules label VCC as `+` and GND as `GND` — confirm with your specific module's datasheet.

| Encoder pin | Pi pin |
|-------------|--------|
| VCC / + | Pin 1 (3.3V) — most encoders accept 3.3V; check your module |
| GND | Any GND pin |
| CLK | Pin 11 (GPIO17) |
| DT | Pin 13 (GPIO27) |
| SW | Pin 15 (GPIO22) |

> Most KY-040-style rotary encoders operate at 3.3V and are safe on Pi GPIO directly. If your module is 5V-only with no onboard level shifter, add a voltage divider on CLK, DT, and SW.

### 4.3 Physical buttons

Each button connects between its GPIO pin and GND. The internal pull-up keeps the pin HIGH when open; pressing connects to GND, pulling LOW. No resistors needed.

| Button | GPIO pin (one leg) | Other leg |
|--------|-------------------|-----------|
| Play / pause | Pin 29 (GPIO5) | Any GND |
| Skip | Pin 31 (GPIO6) | Any GND |
| Previous | Pin 33 (GPIO13) | Any GND |
| Snooze (signal) | Pin 35 (GPIO19) | Any GND |
| Snooze (LED+) | Pin 37 (GPIO26) via 100Ω resistor | LED– to GND |

> All four buttons can share a common GND rail.

### 4.4 Snooze button LED

The snooze button has an embedded LED (forward voltage 2.2V). It is driven directly from GPIO26 via a current-limiting resistor — no transistor needed at this current level.

**Circuit:**
```
GPIO26 (3.3V) → 100Ω resistor → LED+ → LED– → GND
```

**Resistor calculation:**
- Supply: 3.3V
- LED Vf: 2.2V
- Voltage to drop: 1.1V
- Target current: 10mA
- R = 1.1V ÷ 0.010A = 110Ω → use standard **100Ω or 120Ω**

10mA is well within the Pi's per-pin limit of 16mA.

---

## 5. OS configuration

### 5.1 Enable I2C

I2C is disabled by default on Raspberry Pi OS Lite. Enable via raspi-config:

```bash
sudo raspi-config
# Interfacing Options → I2C → Enable
```

Or directly in `/boot/firmware/config.txt`:

```
dtparam=i2c_arm=on
```

Reboot, then verify both devices are visible:

```bash
sudo apt install -y i2c-tools
i2cdetect -y 1
# Expected: 0x23 (BH1750) and 0x68 (DS3231) visible in the grid
```

### 5.2 Set hardware clock (DS3231)

Add to `/boot/firmware/config.txt`:

```
dtoverlay=i2c-rtc,ds3231
```

Add to `/etc/modules`:

```
rtc-ds1307
```

Disable the fake hardware clock (conflicts with DS3231):

```bash
sudo systemctl disable fake-hwclock
sudo apt remove fake-hwclock
```

Sync hardware clock from system time (once, when connected to internet):

```bash
sudo hwclock -w
```

On subsequent boots the system clock is read from the DS3231 — correct time even offline:

```bash
sudo hwclock -s
```

### 5.3 Install Python dependencies

```bash
sudo apt install -y python3-pip python3-smbus
sudo pip3 install smbus2 adafruit-circuitpython-bh1750 RPi.GPIO --break-system-packages
```

> `RPi.GPIO` is used for buttons and encoder. `gpiozero` is an acceptable alternative if already present.

---

## 6. Software drivers

All hardware drivers live at `/opt/leo-clock/hw/`. Each is a standalone Python script exposing a simple interface consumed by the main Node.js backend via `child_process` or a Unix socket.

### 6.1 BH1750 — ambient light driver

**File:** `/opt/leo-clock/hw/light_sensor.py`

Reads lux value from BH1750 every 5 seconds. Writes one JSON line per reading to stdout. The backend uses this value to set screen brightness.

**Output format (stdout, newline-delimited JSON):**
```json
{"lux": 342.5, "ts": 1712000000}
```

**Brightness mapping** (suggested starting point — tune in real use):

| Lux range | Backlight % | Raw value (0–255) |
|-----------|-------------|-------------------|
| 0–10 (dark room) | 15% | 38 |
| 10–50 (dim) | 30% | 76 |
| 50–200 (normal indoor) | 60% | 153 |
| 200–500 (bright indoor) | 80% | 204 |
| 500+ (sunlight / near window) | 100% | 255 |

**Backlight control path** (Pi 7" gen 1 display):
```
/sys/class/backlight/10-0045/brightness
```
Write an integer 0–255.

### 6.2 DS3231 — RTC driver

**File:** `/opt/leo-clock/hw/rtc.py`

Thin wrapper around `hwclock`. Two operations:

```bash
python3 /opt/leo-clock/hw/rtc.py read
# → {"datetime": "2026-04-02T09:15:00"}

python3 /opt/leo-clock/hw/rtc.py sync
# → {"ok": true}
```

Called by the backend via `child_process.execFile`. In practice the kernel handles DS3231 time sync automatically via the dtoverlay — this script is a convenience wrapper for triggering a manual sync after NTP lock.

### 6.3 Rotary encoder — volume driver

**File:** `/opt/leo-clock/hw/encoder.py`

Persistent daemon. Listens to GPIO17 (CLK), GPIO27 (DT), GPIO22 (SW). Emits events to the backend via Unix domain socket at `/tmp/leo-encoder.sock`.

**Events emitted (newline-delimited JSON):**
```json
{"event": "volume_up"}
{"event": "volume_down"}
{"event": "mute_toggle"}
```

**Implementation notes:**
- Volume step: 1 detent = 2% volume change (50 detents/rotation typical). Make this configurable.
- Use `GPIO.add_event_detect` with `FALLING` edge — do not poll.
- Encoder CLK/DT debounce: 5 ms
- SW (mute) debounce: 50 ms

> ⚠ If the encoder misses steps at fast rotation, increase interrupt priority or switch to the `rpi-rotary-encoder` library.

### 6.4 Physical buttons — button driver

**File:** `/opt/leo-clock/hw/buttons.py`

Persistent daemon. Listens to GPIO5, 6, 13, 19 with internal pull-ups. Emits events to the backend via Unix socket at `/tmp/leo-buttons.sock`.

**Events emitted (newline-delimited JSON):**
```json
{"event": "play_pause"}
{"event": "skip"}
{"event": "previous"}
{"event": "snooze"}
```

**Debounce:** 50 ms for all buttons (in the GPIO edge callback).

> Physical button response must feel instant. The backend should act on socket events synchronously — do not route through the React UI layer.

### 6.5 Snooze LED driver

**Handled directly in the backend** — no separate daemon needed. GPIO26 is set HIGH/LOW by the alarm controller in the Node.js backend.

**Behaviour:**

| Alarm state | LED behaviour |
|-------------|---------------|
| Alarm firing | Flash 500ms on / 500ms off loop |
| Snooze pressed | LED off immediately |
| Alarm dismissed | LED off |
| Normal operation | LED off |

**Implementation note:** use a simple `setInterval` / `clearInterval` in the backend alarm controller. Write GPIO26 via a small Python helper or the `onoff` npm package.

```js
// pseudocode
function startAlarmLED() {
  ledInterval = setInterval(() => toggleGPIO(26), 500)
}
function stopAlarmLED() {
  clearInterval(ledInterval)
  setGPIO(26, LOW)
}
```

The Express backend connects to both Unix sockets and handles events in real time. The React frontend is never in the hardware event path — it only receives state updates via WebSocket after the action has been taken.

### 7.1 Event → action mapping

| Event | Backend action |
|-------|---------------|
| `volume_up` / `volume_down` | Adjust ALSA volume via `amixer`, broadcast new volume via WebSocket |
| `mute_toggle` | Toggle ALSA mute, broadcast state |
| `play_pause` | Toggle mpg123/mpv playback, broadcast state |
| `skip` | Advance to next track in current playlist, broadcast |
| `previous` | Return to previous track or restart current, broadcast |
| `snooze` | Silence alarm for `snooze_duration` (default 9 min, configurable), broadcast |

**Volume control:**
```bash
amixer sset Master 50%       # set absolute
amixer sset Master 2%+       # increment
amixer sset Master 2%-       # decrement
amixer sset Master toggle    # mute/unmute
```

Confirm the correct ALSA card index for the Javra USB speaker:
```bash
aplay -l
# Use -c <card_number> flag if it's not the default card
```

### 7.2 Light sensor integration

The backend spawns `light_sensor.py` as a child process and reads its stdout line by line. On each lux reading it computes the target brightness and writes to the backlight sysfs path.

**Hysteresis rule:** only update brightness if the new target value differs from the current by more than 5% (13 raw units). This prevents rapid flickering near threshold boundaries.

---

## 8. systemd services

Two persistent daemon services — one for buttons, one for the encoder. The light sensor is spawned directly by the main app service.

### 8.1 `/etc/systemd/system/leo-buttons.service`

```ini
[Unit]
Description=leo-clock physical buttons daemon
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/leo-clock/hw/buttons.py
Restart=always
RestartSec=2
User=pi
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 8.2 `/etc/systemd/system/leo-encoder.service`

```ini
[Unit]
Description=leo-clock rotary encoder daemon
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/leo-clock/hw/encoder.py
Restart=always
RestartSec=2
User=pi
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Enable and start both:**

```bash
sudo systemctl enable leo-buttons leo-encoder
sudo systemctl start leo-buttons leo-encoder
sudo systemctl status leo-buttons leo-encoder
```

---

## 9. Testing checklist

Complete in order. Do not move to enclosure design until all items pass.

### 9.1 I2C bus

- [ ] `i2cdetect -y 1` — both `0x23` and `0x68` visible
- [ ] Cover BH1750 with hand — lux reading drops to near 0
- [ ] Disconnect internet, reboot — system clock still correct (DS3231 holdover)

### 9.2 Encoder

- [ ] Rotate CW — `volume_up` events appear in `journalctl -u leo-encoder`
- [ ] Rotate CCW — `volume_down` events appear
- [ ] Press knob — `mute_toggle` event appears
- [ ] Fast spin 10 rotations — no missed steps (count events vs expected)

### 9.3 Buttons

- [ ] Press each button — correct event appears in `journalctl -u leo-buttons`
- [ ] Press and hold snooze 5 seconds — only one event fires (no repeat)
- [ ] Tap play/pause rapidly 10 times — exactly 10 events, none missed or doubled
- [ ] Trigger alarm — snooze LED flashes at ~1Hz
- [ ] Press snooze — LED stops immediately
- [ ] LED off during normal operation

### 9.4 End-to-end

- [ ] Music plays via Javra USB speaker
- [ ] Rotating encoder changes volume audibly and updates UI
- [ ] Pressing encoder mutes / unmutes
- [ ] Buttons control playback correctly
- [ ] Screen dims in a dark room, brightens when light returns
- [ ] Snooze silences alarm for correct duration

---

## 10. Known risks & mitigations

| Risk | Mitigation |
|------|------------|
| Encoder misses steps at fast rotation | Switch to interrupt-based detection; tune debounce; or use `rpi-rotary-encoder` library |
| Button double-fires | Increase debounce to 100 ms if 50 ms is insufficient |
| DS3231 drift after battery removal | Battery is CR2032 — replace every 2–3 years; resync with `hwclock -w` after NTP lock |
| BH1750 address conflict (if second module added later) | Use ADDR pin to switch to 0x5C; no conflict with DS3231 at 0x68 |
| USB speaker not default ALSA device | Set default in `/etc/asound.conf`; use `amixer -c <card>` to target correct card |
| Wire run noise (buttons > 30 cm) | Add 10 kΩ external pull-ups if false triggers occur |

---

_leo-clock · Atelier Maker · Hardware Integration Spec · April 2026_
