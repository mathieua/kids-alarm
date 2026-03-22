#!/bin/bash
# Leo Clock — WiFi connectivity check
# Run by systemd at boot (as root, via leo-clock-wifi.service).
#
# Waits up to 30s for any WiFi connection.
# If none, creates an open "leo-clock-setup" hotspot and writes
# /tmp/wifi-ap-mode so the Electron app can enter setup UI.

set -e

HOTSPOT_SSID="leo-clock-setup"
HOTSPOT_CON="leo-clock-setup"
FLAG_FILE="/tmp/wifi-ap-mode"
MAX_WAIT=30
INTERVAL=5

log() {
    local msg="[wifi-check] $*"
    echo "$msg"
    echo "$msg" | systemd-cat -t wifi-check -p info 2>/dev/null || true
}

is_connected() {
    nmcli -t -f STATE general 2>/dev/null | grep -q "^connected$"
}

# Clean up any stale AP flag from a previous (crashed) boot
rm -f "$FLAG_FILE"

# ── Wait for connection ────────────────────────────────────────────────────────
log "Waiting up to ${MAX_WAIT}s for WiFi..."
elapsed=0
while [ "$elapsed" -lt "$MAX_WAIT" ]; do
    if is_connected; then
        log "WiFi connected — normal boot."
        exit 0
    fi
    sleep "$INTERVAL"
    elapsed=$((elapsed + INTERVAL))
    log "No connection yet (${elapsed}s / ${MAX_WAIT}s)..."
done

# ── No WiFi — create hotspot ───────────────────────────────────────────────────
log "No WiFi after ${MAX_WAIT}s. Creating hotspot: $HOTSPOT_SSID"

# Remove any leftover connection with the same name
nmcli connection delete "$HOTSPOT_CON" 2>/dev/null || true

# Create open (no-password) AP; NM assigns 10.42.0.1/24 with built-in DHCP
nmcli device wifi hotspot \
    ifname wlan0 \
    ssid "$HOTSPOT_SSID" \
    con-name "$HOTSPOT_CON" \
    band bg

# Signal setup mode to the Electron app
touch "$FLAG_FILE"

log "Hotspot '$HOTSPOT_SSID' active."
log "Clients connect to the hotspot, then open http://10.42.0.1:3000/setup"
exit 0
