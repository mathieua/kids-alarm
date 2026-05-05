#!/usr/bin/env python3
"""
BH1750 ambient light sensor daemon.

Reads lux from the BH1750 every 5 seconds and writes one newline-delimited
JSON record to stdout. The Node.js backend spawns this script as a child
process and reads its stdout line-by-line to control screen brightness.

Output format:
    {"lux": 342.5, "ts": 1712000000}
"""

import json
import sys
import time

try:
    import board
    import adafruit_bh1750
except ImportError:
    sys.stderr.write("adafruit-circuitpython-bh1750 not installed — run install.sh\n")
    sys.exit(1)


def main() -> None:
    i2c = board.I2C()
    sensor = adafruit_bh1750.BH1750(i2c)

    while True:
        try:
            lux = sensor.lux
            record = {"lux": round(lux, 2), "ts": int(time.time())}
            sys.stdout.write(json.dumps(record) + "\n")
            sys.stdout.flush()
        except Exception as exc:
            sys.stderr.write(f"BH1750 read error: {exc}\n")
            sys.stderr.flush()

        time.sleep(5)


if __name__ == "__main__":
    main()
