#!/usr/bin/env python3
"""
DS3231 RTC wrapper.

The kernel dtoverlay handles the actual timekeeping — this script is a
convenience wrapper for triggering manual hwclock operations from the backend.

Usage:
    python3 rtc.py read   → {"datetime": "2026-04-02T09:15:00"}
    python3 rtc.py sync   → {"ok": true}
"""

import json
import subprocess
import sys
from datetime import datetime


def cmd_read() -> None:
    result = subprocess.run(
        ["hwclock", "-r", "--iso-8601=seconds"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        print(json.dumps({"error": result.stderr.strip()}))
        sys.exit(1)

    # hwclock --iso-8601 outputs e.g. "2026-04-02T09:15:00+0200"
    raw = result.stdout.strip()
    # Normalise to a plain ISO datetime (drop timezone offset for simplicity)
    try:
        dt = datetime.fromisoformat(raw)
        print(json.dumps({"datetime": dt.strftime("%Y-%m-%dT%H:%M:%S")}))
    except ValueError:
        print(json.dumps({"datetime": raw}))


def cmd_sync() -> None:
    """Write current system time (from NTP) into the DS3231 hardware clock."""
    result = subprocess.run(
        ["hwclock", "-w"],
        capture_output=True,
        text=True,
        timeout=5,
    )
    if result.returncode != 0:
        print(json.dumps({"ok": False, "error": result.stderr.strip()}))
        sys.exit(1)

    print(json.dumps({"ok": True}))


def main() -> None:
    if len(sys.argv) < 2 or sys.argv[1] not in ("read", "sync"):
        sys.stderr.write("Usage: rtc.py read|sync\n")
        sys.exit(1)

    if sys.argv[1] == "read":
        cmd_read()
    else:
        cmd_sync()


if __name__ == "__main__":
    main()
