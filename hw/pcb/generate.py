#!/usr/bin/env python3
"""
Generates leo-clock-hat.kicad_sch and leo-clock-hat.kicad_pro (KiCad 7 format).
Run: python3 generate.py
"""

import uuid
import os

def u():
    return str(uuid.uuid4())

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Connector definitions: (ref, value, description, [net_pin1, net_pin2, ...])
# ---------------------------------------------------------------------------
CONNECTORS = [
    ("J1", "B4B-XH-A", "Play buttons",    ["GND", "PLAY_PAUSE", "SKIP", "PREVIOUS"]),
    ("J2", "B4B-XH-A", "Encoder",         ["GND", "ENC_CLK",   "ENC_DT", "ENC_SW"]),
    ("J3", "B4B-XH-A", "Snooze + LED",    ["GND", "SNOOZE",    "LED_A",  "LED_K"]),
    ("J4", "B4B-XH-A", "RTC DS3231",      ["GND", "+3V3",      "SDA",    "SCL"]),
    ("J5", "B4B-XH-A", "Light BH1750",    ["GND", "+3V3",      "SDA",    "SCL"]),
]

# Net → Pi physical pin annotation (for reference comments only)
NET_PI_PIN = {
    "GND":        "pins 6/9/14/25/30/34/39",
    "+3V3":       "pin 17",
    "SDA":        "pin 3  (GPIO2)",
    "SCL":        "pin 5  (GPIO3)",
    "PLAY_PAUSE": "pin 31 (GPIO6)",
    "SKIP":       "pin 33 (GPIO13)",
    "PREVIOUS":   "pin 29 (GPIO5)",
    "ENC_CLK":    "pin 11 (GPIO17)",
    "ENC_DT":     "pin 13 (GPIO27)",
    "ENC_SW":     "pin 15 (GPIO22)",
    "SNOOZE":     "pin 18 (GPIO24)",
    "GPIO26":     "pin 37 (GPIO26)",
    "LED_A":      "GPIO26 via R1 (100Ω onboard)",
    "LED_K":      "GND",
}

# ---------------------------------------------------------------------------
# Symbol library definitions (minimal but correct for KiCad 7)
# ---------------------------------------------------------------------------

def sym_conn_01x04():
    """4-pin single-row connector symbol."""
    return """\
    (symbol "Connector:Conn_01x04"
      (pin_names (offset 1.016) hide)
      (in_bom yes) (on_board yes)
      (property "Reference" "J" (at 0 6.35 0)
        (effects (font (size 1.27 1.27))))
      (property "Value" "Conn_01x04" (at 0 -6.35 0)
        (effects (font (size 1.27 1.27))))
      (property "Footprint" "Connector_JST:JST_XH_B4B-XH-A_1x04_P2.50mm_Vertical" (at 0 0 0)
        (effects (font (size 1.27 1.27)) hide))
      (property "Datasheet" "" (at 0 0 0)
        (effects (font (size 1.27 1.27)) hide))
      (symbol "Conn_01x04_0_1"
        (rectangle (start -1.27 -5.08) (end 0 5.08)
          (stroke (width 0.254) (type solid))
          (fill (type none))))
      (symbol "Conn_01x04_1_1"
        (pin passive line (at -3.81 3.81 0) (length 2.54)
          (name "Pin_1" (effects (font (size 1.27 1.27))))
          (number "1" (effects (font (size 1.27 1.27)))))
        (pin passive line (at -3.81 1.27 0) (length 2.54)
          (name "Pin_2" (effects (font (size 1.27 1.27))))
          (number "2" (effects (font (size 1.27 1.27)))))
        (pin passive line (at -3.81 -1.27 0) (length 2.54)
          (name "Pin_3" (effects (font (size 1.27 1.27))))
          (number "3" (effects (font (size 1.27 1.27)))))
        (pin passive line (at -3.81 -3.81 0) (length 2.54)
          (name "Pin_4" (effects (font (size 1.27 1.27))))
          (number "4" (effects (font (size 1.27 1.27)))))))"""

def sym_resistor():
    """Resistor symbol."""
    return """\
    (symbol "Device:R"
      (pin_names (offset 0))
      (in_bom yes) (on_board yes)
      (property "Reference" "R" (at 1.778 0 90)
        (effects (font (size 1.27 1.27))))
      (property "Value" "R" (at -1.778 0 90)
        (effects (font (size 1.27 1.27))))
      (property "Footprint" "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal" (at 0 0 0)
        (effects (font (size 1.27 1.27)) hide))
      (property "Datasheet" "" (at 0 0 0)
        (effects (font (size 1.27 1.27)) hide))
      (symbol "R_0_1"
        (rectangle (start -1.016 -2.286) (end 1.016 2.286)
          (stroke (width 0.254) (type solid))
          (fill (type none))))
      (symbol "R_1_1"
        (pin passive line (at 0 3.81 270) (length 1.524)
          (name "~" (effects (font (size 1.27 1.27))))
          (number "1" (effects (font (size 1.27 1.27)))))
        (pin passive line (at 0 -3.81 90) (length 1.524)
          (name "~" (effects (font (size 1.27 1.27))))
          (number "2" (effects (font (size 1.27 1.27)))))))"""

def sym_pwr(name, y_pin_offset):
    """Generic power symbol (GND or +3V3)."""
    arrow = ""
    if name == "GND":
        arrow = """
        (polyline (pts (xy 0 0) (xy 0 -1.27) (xy 1.27 -1.27) (xy 0 -2.54) (xy -1.27 -1.27) (xy 0 -1.27))
          (stroke (width 0) (type solid))
          (fill (type none)))"""
    else:
        arrow = """
        (polyline (pts (xy -0.762 1.27) (xy 0 2.54) (xy 0.762 1.27))
          (stroke (width 0) (type solid))
          (fill (type none)))"""
    return f"""\
    (symbol "power:{name}"
      (power) (pin_names (offset 0) hide) (in_bom no) (on_board no)
      (property "Reference" "#PWR" (at 0 -3.81 0)
        (effects (font (size 1.27 1.27)) hide))
      (property "Value" "{name}" (at 0 3.81 0)
        (effects (font (size 1.27 1.27))))
      (property "Footprint" "" (at 0 0 0)
        (effects (font (size 1.27 1.27)) hide))
      (property "Datasheet" "" (at 0 0 0)
        (effects (font (size 1.27 1.27)) hide))
      (symbol "{name}_0_1"{arrow})
      (symbol "{name}_1_1"
        (pin power_in line (at 0 {y_pin_offset} 270) (length 0)
          (name "{name}" (effects (font (size 1.27 1.27))))
          (number "1" (effects (font (size 1.27 1.27)))))))"""

# ---------------------------------------------------------------------------
# Instance helpers
# ---------------------------------------------------------------------------

def connector_instance(ref, value, description, nets, x, y):
    """Place a 4-pin JST connector with wires and global labels."""
    pin_y = [y + 3.81, y + 1.27, y - 1.27, y - 3.81]  # pin 1..4 y positions
    lines = []

    lines.append(f"""\
  (symbol (lib_id "Connector:Conn_01x04") (at {x} {y} 0) (mirror x) (unit 1)
    (in_bom yes) (on_board yes) (dnp no)
    (uuid "{u()}")
    (property "Reference" "{ref}" (at {x + 3} {y + 6.35} 0)
      (effects (font (size 1.27 1.27))))
    (property "Value" "{value}" (at {x + 3} {y - 6.35} 0)
      (effects (font (size 1.27 1.27))))
    (property "Footprint" "Connector_JST:JST_XH_B4B-XH-A_1x04_P2.50mm_Vertical" (at {x} {y} 0)
      (effects (font (size 1.27 1.27)) hide))
    (property "Datasheet" "" (at {x} {y} 0)
      (effects (font (size 1.27 1.27)) hide))
    (property "ki_description" "{description}" (at {x} {y} 0)
      (effects (font (size 1.27 1.27)) hide)))""")

    # Wire from each pin to a global label 2.54mm to the left
    wire_x_end = x - 6.35   # connector pin stub end
    label_x    = x - 11.43  # global label position

    for i, (net, py) in enumerate(zip(nets, pin_y)):
        lines.append(f"""\
  (wire (pts (xy {wire_x_end} {py}) (xy {label_x} {py})))
  (global_label (at {label_x} {py} 180) (shape input) (fields_autoplaced yes)
    (effects (font (size 1.27 1.27)) (justify right))
    (uuid "{u()}")
    (property "Value" "{net}" (at 0 -1.27 0) (effects (font (size 1.27 1.27))))
    (pin "~" line (at 0 0 0) (length 2.54)))""")

    return "\n".join(lines)


def resistor_instance(ref, value, x, y, net1, net2):
    """Vertical resistor with global labels on both ends."""
    pin1_y = y - 3.81
    pin2_y = y + 3.81
    label_y1 = pin1_y - 2.54
    label_y2 = pin2_y + 2.54
    return f"""\
  (symbol (lib_id "Device:R") (at {x} {y} 0) (unit 1)
    (in_bom yes) (on_board yes) (dnp no)
    (uuid "{u()}")
    (property "Reference" "{ref}" (at {x + 2.286} {y} 90)
      (effects (font (size 1.27 1.27))))
    (property "Value" "{value}" (at {x - 2.286} {y} 90)
      (effects (font (size 1.27 1.27))))
    (property "Footprint" "Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm_Horizontal" (at {x} {y} 0)
      (effects (font (size 1.27 1.27)) hide))
    (property "Datasheet" "" (at {x} {y} 0)
      (effects (font (size 1.27 1.27)) hide)))
  (wire (pts (xy {x} {pin1_y}) (xy {x} {label_y1})))
  (global_label (at {x} {label_y1} 270) (shape input) (fields_autoplaced yes)
    (effects (font (size 1.27 1.27)))
    (uuid "{u()}")
    (property "Value" "{net1}" (at 0 -1.27 0) (effects (font (size 1.27 1.27))))
    (pin "~" line (at 0 0 0) (length 2.54)))
  (wire (pts (xy {x} {pin2_y}) (xy {x} {label_y2})))
  (global_label (at {x} {label_y2} 90) (shape input) (fields_autoplaced yes)
    (effects (font (size 1.27 1.27)))
    (uuid "{u()}")
    (property "Value" "{net2}" (at 0 -1.27 0) (effects (font (size 1.27 1.27))))
    (pin "~" line (at 0 0 0) (length 2.54)))"""


def note(text, x, y):
    return f"""\
  (text "{text}" (at {x} {y} 0)
    (effects (font (size 1.27 1.27)) (justify left)))"""


# ---------------------------------------------------------------------------
# Schematic assembly
# ---------------------------------------------------------------------------

def build_schematic():
    parts = []

    # --- lib_symbols ---
    parts.append(f"""\
(kicad_sch (version 20230121) (generator eeschema)

  (uuid "{u()}")

  (paper "A4")

  (lib_symbols
{sym_conn_01x04()}
{sym_resistor()}
{sym_pwr("GND", 0)}
{sym_pwr("+3V3", 0)}
  )
""")

    # --- Title note ---
    parts.append(note("leo-clock HAT — GPIO breakout to JST-XH connectors", 20, 15))
    parts.append(note("Pi 4 GPIO header → 5 × JST-XH B4B-XH-A connectors + R1 (100Ω LED)", 20, 18))

    # --- Connectors: stack vertically, x=150 ---
    x_conn = 150
    y_positions = [40, 65, 90, 115, 140]
    for (ref, val, desc, nets), y in zip(CONNECTORS, y_positions):
        parts.append(f"\n  ; {ref} — {desc}")
        parts.append(connector_instance(ref, val, desc, nets, x_conn, y))

    # --- R1 between GPIO26 and LED_A ---
    parts.append("\n  ; R1 — 100Ω LED current limiter (GPIO26 → LED_A)")
    parts.append(resistor_instance("R1", "100", 60, 90, "GPIO26", "LED_A"))

    # --- Pi pin annotations as text notes ---
    parts.append("\n  ; Pi GPIO net annotations")
    ax, ay = 20, 165
    for net, pipin in NET_PI_PIN.items():
        parts.append(note(f"{net} = {pipin}", ax, ay))
        ay += 4

    # --- Close ---
    parts.append("\n)")
    return "\n".join(parts)


def build_project():
    return """\
{
  "board": {
    "3dviewports": [],
    "design_settings": {},
    "layer_presets": [],
    "viewports": []
  },
  "boards": [],
  "cvpcb": { "equivalence_files": [] },
  "erc": { "erc_exclusions": [], "meta": { "version": 0 }, "pin_map": [], "rule_severities": [] },
  "libraries": { "pinned_footprint_libs": [], "pinned_symbol_libs": [] },
  "meta": { "filename": "leo-clock-hat.kicad_pro", "version": 1 },
  "net_settings": { "classes": [ { "bus_width": 12, "clearance": 0.2, "diff_pair_gap": 0.25, "diff_pair_via_gap": 0.25, "diff_pair_width": 0.2, "line_style": 0, "microvia_diameter": 0.3, "microvia_drill": 0.1, "name": "Default", "pcb_color": "rgba(0, 0, 0, 0.000)", "schematic_color": "rgba(0, 0, 0, 0.000)", "track_width": 0.25, "via_diameter": 0.8, "via_drill": 0.4, "wire_width": 6, "bus_width": 12 } ], "meta": { "version": 3 }, "net_colors": null, "netclass_assignments": null, "netclass_patterns": [] },
  "pcbnew": { "last_paths": {}, "page_layout_descr_file": "" },
  "schematic": { "annotate_start_num": 0, "drawing": { "annotation_arrow_length": 1.524, "default_bus_thickness": 12, "default_junction_size": 40, "default_line_thickness": 6, "default_net_thickness": 15, "default_text_size": 50, "field_names": [], "intersheets_ref_own_page": false, "intersheets_ref_prefix": "", "intersheets_ref_short": false, "intersheets_ref_show": false, "intersheets_ref_suffix": "", "junction_size_choice": 3, "label_size_ratio": 0.375, "op_value_scale_factor": 1.0, "overbar_offset_ratio": 1.23, "pin_symbol_size": 25, "text_offset_ratio": 0.15 }, "legacy_lib_dir": "", "legacy_lib_list": [] },
  "sheets": [ [ "root_uuid", "" ] ],
  "text_variables": {}
}
"""

# ---------------------------------------------------------------------------

if __name__ == "__main__":
    sch_path = os.path.join(OUT_DIR, "leo-clock-hat.kicad_sch")
    pro_path = os.path.join(OUT_DIR, "leo-clock-hat.kicad_pro")

    with open(sch_path, "w") as f:
        f.write(build_schematic())
    print(f"Written: {sch_path}")

    with open(pro_path, "w") as f:
        f.write(build_project())
    print(f"Written: {pro_path}")
