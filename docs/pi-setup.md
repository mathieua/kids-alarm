# Raspberry Pi Setup Guide

Setup instructions for the Kids Alarm Clock on a **Raspberry Pi 4** running **Raspberry Pi OS Lite (64-bit)**.

---

## 1. Flash the SD Card

Use [Raspberry Pi Imager](https://www.raspberrypi.com/software/).

- **OS:** Raspberry Pi OS Lite (64-bit)
- **Storage:** your SD card (64GB+ A2 recommended)

Before writing, click the **gear icon** (or `Ctrl+Shift+X`) to open advanced options and configure:

| Setting | Value |
|---------|-------|
| Hostname | `alarm-clock` |
| Enable SSH | Yes (use password auth) |
| Username | `pi` |
| Password | *(set a strong password)* |
| WiFi SSID | *(your primary network)* |
| WiFi password | *(your WiFi password)* |
| Locale / timezone | `Europe/Paris` |

Write the image, then **eject and re-insert** the SD card so the boot partition mounts.

---

## 2. Add a Second WiFi Network

Raspberry Pi Imager only supports one WiFi network. To add more, edit the boot partition (FAT32, mounts automatically on macOS) before the first boot.

Open `/Volumes/bootfs/custom.toml` (created by the Imager) and add a `[wlan]` section if not already there. Then, after first boot, SSH in and add additional networks with:

```bash
sudo nmcli device wifi connect "SecondNetworkSSID" password "SecondNetworkPassword"
```

To verify all configured networks:
```bash
nmcli connection show
```

To set a connection to auto-connect:
```bash
sudo nmcli connection modify "SecondNetworkSSID" connection.autoconnect yes
```

The Pi will automatically connect to whichever configured network is in range.

---

## 3. First Boot

Insert the SD card into the Pi and power it on. First boot takes **2–3 minutes** while the OS initializes.

Once booted, verify it's reachable from your Mac:
```bash
ping alarm-clock.local
```

SSH in:
```bash
ssh pi@alarm-clock.local
```

---

## 4. Run the Setup Script

From your Mac, copy the setup script to the Pi and run it. Use `nohup` so it survives SSH disconnects (it takes ~10 minutes):

```bash
scp scripts/setup-pi.sh pi@alarm-clock.local:~/
ssh pi@alarm-clock.local "nohup bash ~/setup-pi.sh > ~/setup.log 2>&1 &"
# Monitor progress:
ssh pi@alarm-clock.local "tail -f ~/setup.log"
```

This installs:
- X11 minimal desktop
- Node.js 20 LTS
- Chromium + Electron dependencies
- I2C tools (for RTC and light sensor)
- `yt-dlp` (for YouTube import)
- USB audio as default ALSA output (`~/.asoundrc`)
- Configures GPU memory, I2C, touchscreen rotation, and auto-login

Reboot after it completes:
```bash
sudo reboot
```

---

## 5. Deploy the App

From your Mac, in the project root:

```bash
# Build the app locally
npm run build

# Copy to Pi (excludes node_modules — these must be installed on-device for ARM)
rsync -av --exclude node_modules --exclude .git . pi@alarm-clock.local:~/alarm-clock/

# Install dependencies on Pi (use nohup — downloads ARM Electron binary, takes a few minutes)
ssh pi@alarm-clock.local "cd ~/alarm-clock && nohup npm install > ~/npm-install.log 2>&1 &"
ssh pi@alarm-clock.local "tail -f ~/npm-install.log"  # monitor progress

# Reboot to auto-start
ssh pi@alarm-clock.local "sudo reboot"
```

The app auto-starts on every boot via `~/.xinitrc` → `NODE_ENV=production npm start`.

> **Note:** `NODE_ENV=production` is required — without it Electron tries to connect to the Vite dev server at `localhost:5173` and shows a blank page.

---

## 6. Hardware Notes

### I2C Devices

| Device | Address | Purpose |
|--------|---------|---------|
| DS3231 RTC | `0x68` | Real-time clock (prevents time loss on power cycle) |
| BH1750 Light Sensor | `0x23` | Ambient light → auto screen dimming |

Verify I2C devices are detected after connecting hardware:
```bash
sudo i2cdetect -y 1
```

### GPIO Pin Assignments

| Function | GPIO Pin |
|----------|----------|
| Play/Pause | 17 |
| Next | 27 |
| Previous | 22 |
| Snooze/Dismiss | 23 |
| Rotary Encoder CLK | 5 |
| Rotary Encoder DT | 6 |
| Rotary Encoder SW | 13 |
| I2C SDA | 2 |
| I2C SCL | 3 |

---

## 7. Troubleshooting

### WiFi not configured yet / moving to a new network

If the Pi can't find a known network, it will enter **AP provisioning mode**:

1. On your phone or laptop, connect to the `AlarmClock-Setup` WiFi network
2. Navigate to `http://192.168.4.1:3000/setup`
3. Enter your WiFi credentials and submit
4. The Pi will connect to the new network and resume normal operation

*(See WiFi Provisioning Mode section in SPEC.md for implementation details)*

### Pi not visible at alarm-clock.local
- Wait ~3 minutes after first boot
- Ensure the Pi is connected to the same network as your Mac
- Check the router's DHCP table for a device named `alarm-clock`
- SSH by IP if mDNS fails: `ssh pi@<ip-address>`

### Wrong time after power loss
The Pi has no hardware clock — time resets on power loss until the DS3231 RTC is installed and synced:
```bash
sudo hwclock --systohc   # Write system time to RTC
sudo hwclock --hctosys   # Read RTC back to system (on boot)
```

### App doesn't auto-start
Check that `~/.xinitrc` exists and `startx` is in `~/.bashrc`. Re-run `setup-pi.sh` if needed.
