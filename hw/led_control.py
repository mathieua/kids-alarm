#!/usr/bin/env python3
"""
Snooze LED control daemon.

Reads newline-delimited JSON commands from stdin and drives GPIO26 HIGH/LOW.
Spawned by the Node.js backend; the backend writes commands to its stdin pipe.

Commands:
    {"on": true}
    {"on": false}

Uses lgpio (compatible with Debian Trixie / kernel 6.x).
"""

import json
import signal
import sys

try:
    import lgpio
except ImportError:
    sys.stderr.write("lgpio not installed — run: sudo apt install python3-lgpio\n")
    sys.exit(1)

PIN_LED = 26


def main() -> None:
    h = lgpio.gpiochip_open(0)
    lgpio.gpio_claim_output(h, PIN_LED, 0)  # initial LOW

    def cleanup(signum, frame):
        lgpio.gpio_write(h, PIN_LED, 0)
        lgpio.gpiochip_close(h)
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            cmd = json.loads(line)
            lgpio.gpio_write(h, PIN_LED, 1 if cmd.get("on") else 0)
        except (json.JSONDecodeError, KeyError):
            sys.stderr.write(f"Bad command: {line!r}\n")

    lgpio.gpio_write(h, PIN_LED, 0)
    lgpio.gpiochip_close(h)


if __name__ == "__main__":
    main()
