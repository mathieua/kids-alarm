#!/usr/bin/env python3
"""
Rotary encoder daemon.

Polls GPIO17 (CLK), GPIO27 (DT), GPIO22 (SW) every 1 ms and emits
newline-delimited JSON events to every client connected on the Unix
domain socket at /tmp/leo-encoder.sock.

Events:
    {"event": "volume_up"}
    {"event": "volume_down"}
    {"event": "mute_toggle"}

Active LOW with internal pull-ups.
CLK/DT: 5 ms software debounce. SW: 50 ms software debounce.
Uses lgpio polling (gpio_read) — the lgpio callback/alert mechanism is
unreliable on kernel 6.x and produces no events even with correct wiring.
"""

import json
import os
import signal
import socket
import sys
import threading
import time

try:
    import lgpio
except ImportError:
    sys.stderr.write("lgpio not installed — run: sudo apt install python3-lgpio\n")
    sys.exit(1)

SOCK_PATH    = "/tmp/leo-encoder.sock"
POLL_SLEEP   = 0.001   # 1 ms — fast enough for encoder, light on CPU
SW_DEBOUNCE  = 0.050   # 50 ms for push button
CLK_DEBOUNCE = 0.005   # 5 ms for encoder CLK

PIN_CLK = 17
PIN_DT  = 27
PIN_SW  = 22

_clients: list[socket.socket] = []
_clients_lock = threading.Lock()
_running = True


def broadcast(event: str) -> None:
    message = (json.dumps({"event": event}) + "\n").encode()
    with _clients_lock:
        dead = []
        for client in _clients:
            try:
                client.sendall(message)
            except OSError:
                dead.append(client)
        for client in dead:
            _clients.remove(client)


def poll_loop(h: int) -> None:
    """Detect CLK falling edges for rotation and SW falling edge for mute."""
    last_clk = lgpio.gpio_read(h, PIN_CLK)
    last_sw  = lgpio.gpio_read(h, PIN_SW)

    while _running:
        clk = lgpio.gpio_read(h, PIN_CLK)
        sw  = lgpio.gpio_read(h, PIN_SW)

        # Encoder rotation — falling edge on CLK
        if clk == 0 and last_clk == 1:
            time.sleep(CLK_DEBOUNCE)
            if lgpio.gpio_read(h, PIN_CLK) == 0:   # still low — real edge
                dt = lgpio.gpio_read(h, PIN_DT)
                broadcast("volume_up" if dt == 1 else "volume_down")

        # Push button — falling edge on SW
        if sw == 0 and last_sw == 1:
            time.sleep(SW_DEBOUNCE)
            if lgpio.gpio_read(h, PIN_SW) == 0:
                broadcast("mute_toggle")

        last_clk = clk
        last_sw  = sw
        time.sleep(POLL_SLEEP)


def run_socket_server() -> None:
    if os.path.exists(SOCK_PATH):
        os.unlink(SOCK_PATH)

    server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    server.bind(SOCK_PATH)
    os.chmod(SOCK_PATH, 0o666)
    server.listen(8)

    while _running:
        try:
            server.settimeout(1.0)
            conn, _ = server.accept()
            with _clients_lock:
                _clients.append(conn)
        except socket.timeout:
            continue
        except OSError:
            break


def main() -> None:
    global _running

    h = lgpio.gpiochip_open(0)
    lgpio.gpio_claim_input(h, PIN_CLK, lgpio.SET_PULL_UP)
    lgpio.gpio_claim_input(h, PIN_DT,  lgpio.SET_PULL_UP)
    lgpio.gpio_claim_input(h, PIN_SW,  lgpio.SET_PULL_UP)

    def cleanup(signum, frame):
        global _running
        _running = False
        lgpio.gpiochip_close(h)
        if os.path.exists(SOCK_PATH):
            os.unlink(SOCK_PATH)
        sys.exit(0)

    signal.signal(signal.SIGTERM, cleanup)
    signal.signal(signal.SIGINT, cleanup)

    threading.Thread(target=run_socket_server, daemon=True).start()
    poll_loop(h)


if __name__ == "__main__":
    main()
