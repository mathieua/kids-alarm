# leo-clock HAT — PCB Design

Simple passthrough board that plugs onto the Pi 4 40-pin header and breaks
out GPIO signals to 5 keyed JST-XH connectors. Includes one onboard resistor
(LED current-limiting). No active components.

---

## Board overview

```
  ┌──────────────────────────────────────────┐
  │  J1        J2        J3       J4      J5  │
  │ BTNS      ENC      SNOOZE    RTC    LIGHT  │
  │ 4-pin    4-pin     4-pin    4-pin   4-pin  │
  │                                            │
  │                       R1 (100Ω)            │
  │                                            │
  │         U1 — 2×20 female header            │
  │         (plugs onto Pi GPIO header)        │
  └──────────────────────────────────────────┘
```

---

## Connector pinouts (JST-XH, 2.54 mm pitch)

All connectors: pin 1 is always **GND** for safe mating.

### J1 — Play buttons (4-pin)
| Pin | Net       | Pi GPIO | Pi physical pin |
|-----|-----------|---------|-----------------|
|  1  | GND       | —       | any GND         |
|  2  | PLAY_PAUSE| GPIO6   | pin 31          |
|  3  | SKIP      | GPIO13  | pin 33          |
|  4  | PREVIOUS  | GPIO5   | pin 29          |

Buttons wire between their signal pin and GND (active LOW, internal pull-up
on Pi).

### J2 — Rotary encoder / volume (4-pin)
| Pin | Net | Pi GPIO   | Pi physical pin |
|-----|-----|-----------|-----------------|
|  1  | GND | —         | any GND         |
|  2  | CLK | GPIO17    | pin 11          |
|  3  | DT  | GPIO27    | pin 13          |
|  4  | SW  | GPIO22    | pin 15          |

Bare mechanical encoder — no VCC needed (internal pull-ups on Pi).

### J3 — Snooze button + LED (4-pin)
| Pin | Net      | Note                                     |
|-----|----------|------------------------------------------|
|  1  | GND      | common ground                            |
|  2  | SNOOZE   | GPIO24, pin 18 — button to GND           |
|  3  | LED_A    | GPIO26 → R1 (100Ω onboard) → this pin   |
|  4  | LED_K    | GND — LED cathode (can tie to pin 1)     |

LED anode → J3 pin 3, LED cathode → J3 pin 4 (or pin 1).
R1 is on the PCB so the LED cable is just two bare wires.

### J4 — RTC / DS3231 (4-pin)
| Pin | Net | Pi GPIO | Pi physical pin |
|-----|-----|---------|-----------------|
|  1  | GND | —       | any GND         |
|  2  | 3V3 | 3.3V    | pin 17          |
|  3  | SDA | GPIO2   | pin 3           |
|  4  | SCL | GPIO3   | pin 5           |

I²C address: 0x68. No external pull-ups needed (Pi 4 has hardware pull-ups
on GPIO2/3).

### J5 — Light sensor / BH1750 (4-pin)
| Pin | Net | Pi GPIO | Pi physical pin |
|-----|-----|---------|-----------------|
|  1  | GND | —       | any GND         |
|  2  | 3V3 | 3.3V    | pin 17          |
|  3  | SDA | GPIO2   | pin 3           |
|  4  | SCL | GPIO3   | pin 5           |

I²C address: 0x23. Shares bus with DS3231 — wire SDA/SCL in parallel with J4.

---

## Netlist summary

| Net        | Pi pin(s) | Connects to                     |
|------------|-----------|---------------------------------|
| GND        | 6,9,14,20,25,30,34,39 | J1p1, J2p1, J3p1, J4p1, J5p1 |
| 3V3        | 17        | J4p2, J5p2                      |
| GPIO2/SDA  | 3         | J4p3, J5p3                      |
| GPIO3/SCL  | 5         | J4p4, J5p4                      |
| GPIO5      | 29        | J1p4                            |
| GPIO6      | 31        | J1p2                            |
| GPIO13     | 33        | J1p3                            |
| GPIO17/CLK | 11        | J2p2                            |
| GPIO24     | 18        | J3p2                            |
| GPIO22/SW  | 15        | J2p4                            |
| GPIO26     | 37        | R1 pin 1                        |
| GPIO27/DT  | 13        | J2p3                            |
| LED_A      | —         | R1 pin 2 → J3p3                 |

---

## Bill of materials

| Ref | Value / Part               | Qty | Notes                        |
|-----|----------------------------|-----|------------------------------|
| U1  | 2×20 female stacking header, 2.54 mm | 1 | 8.5 mm standard if mounted away from heatsink; 15 mm if stacking over a heatsink |
| J1  | JST B4B-XH-A (4-pin, right-angle or vertical) | 1 | play buttons |
| J2  | JST B4B-XH-A               | 1   | encoder                      |
| J3  | JST B4B-XH-A               | 1   | snooze + LED                 |
| J4  | JST B4B-XH-A               | 1   | RTC                          |
| J5  | JST B4B-XH-A               | 1   | light sensor                 |
| R1  | 100Ω 0805 or through-hole  | 1   | LED current limiting         |

Total unique parts: 3 types (header, JST connector ×5, resistor ×1).

---

## KiCad schematic notes

Libraries to add:
- `Connector_JST` → `JST_XH_B4B-XH-A` for J1–J5
- `Connector_PinHeader_2.54mm` → `PinHeader_2x20_P2.54mm_Vertical` for U1
- `Device` → `R` for R1

Suggested page layout:
1. Place U1 (40-pin header) on the left, pins labelled.
2. Add power symbols: `PWR_FLAG`, `GND`, `+3V3`.
3. Fan out GPIO signals to the right using short wires + net labels.
4. Place J1–J5 on the right, wired to matching net labels.
5. Place R1 between net `GPIO26` and net `LED_A`.

PCB layout tips:
- Keep board width ≤ 65 mm (Pi header width) for a clean HAT form factor.
- Place all JST connectors along one edge pointing outward for easy cable routing.
- Use 0.3 mm minimum trace width (well within JLCPCB 2-layer cheapest tier).
- Add mounting holes at Pi HAT positions: (3.5, 3.5), (61.5, 3.5), (3.5, 52.5), (61.5, 52.5) mm from board origin.
