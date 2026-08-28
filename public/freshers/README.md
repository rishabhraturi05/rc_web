# Robotics Club NIT Warangal — Freshers Event Asset Guide

This directory holds graphic assets, fonts, media, and Among Us sprites for the **Among Us / Skeld Spaceship themed Freshers event**.

---

## Directory Structure

```
public/freshers/
├── among-us/
│   ├── crewmates/                 # PNG sprites (red.png, blue.png, cyan.png, yellow.png, green.png, purple.png)
│   ├── intro/                     # Shhh intro sprites (shhh-crewmate.png, shhh-hand.png)
│   ├── impostor/                  # Impostor sprites (impostor.png, kill-frame.png)
│   ├── running/                   # Running sprites (red-run.png, cyan-run.png)
│   ├── vents/                     # Vent graphics (vent-closed.png, vent-open.png)
│   ├── ui/                        # Custom task buttons & HUD overlays
│   └── effects/                   # Scanline & vent kill frames
│
├── fonts/
│   └── VCR_OSD_MONO_1.001.ttf     # Custom retro CRT monospace font
│
└── map/
    └── nitw-skeld-floorplan.svg   # Custom venue floorplan vector graphic
```

---

## Font Configuration

The supplied retro font `VCR_OSD_MONO_1.001.ttf` is loaded locally via `@font-face` in `src/app/freshers/styles/freshers.css`.

- **Font Family**: `"VCR OSD Mono"`
- **Usage**: Used across titles, terminal fields, registration, rules, HUD elements, map labels, and receipt text.

---

## Centralized Asset Registry

All Among Us sprite paths are registered in:
`src/app/freshers/data/amongUsAssets.js`

All crewmates, intro spinners, floating particles, and venue floorplans feature zero-dependency vector SVG and CSS fallbacks. The website will function out-of-the-box even before custom PNG images are placed into `public/freshers/among-us/`.

---

## Event Content Configuration

To update event dates, venue, rules, or contact details, edit:
- `src/app/freshers/data/freshersConfig.js`
- `src/app/freshers/data/rooms.js`
- `src/app/freshers/data/organizers.js`
