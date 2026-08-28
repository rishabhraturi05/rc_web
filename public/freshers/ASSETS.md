# Freshers Event Asset Registry & Technical Specifications

| Asset Filename | Purpose | Dimensions | Format | Transparency | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `public/VCR_OSD_MONO_1.001.ttf` | Main Event Font | N/A | TTF | N/A | **INSTALLED** |
| `public/freshers/fonts/VCR_OSD_MONO_1.001.ttf` | Local Font Fallback | N/A | TTF | N/A | **INSTALLED** |
| `public/freshers/sprites/crewmates/red.png` | Red Crewmate Sprite | 128x160 | PNG / WebP | Yes | SVG Fallback Active |
| `public/freshers/sprites/crewmates/blue.png` | Blue Crewmate Sprite | 128x160 | PNG / WebP | Yes | SVG Fallback Active |
| `public/freshers/sprites/crewmates/cyan.png` | Cyan Crewmate Sprite | 128x160 | PNG / WebP | Yes | SVG Fallback Active |
| `public/freshers/sprites/crewmates/yellow.png` | Yellow Crewmate Sprite | 128x160 | PNG / WebP | Yes | SVG Fallback Active |
| `public/freshers/sprites/impostor/impostor.png` | Impostor Sprite | 128x160 | PNG / WebP | Yes | SVG Fallback Active |
| `public/freshers/sprites/intro/shhh-hand.png` | Shhh Hand Gesture | 128x128 | PNG / WebP | Yes | Emoji/SVG Active |
| `public/freshers/posters/event-poster.webp` | PR Event Poster | 1080x1350 | WebP / PNG | No | Placeholder Active |
| `public/freshers/trailers/event-trailer.mp4` | PR Event Video | 1080p | MP4 / WebM | No | Placeholder Active |

---

## SVG/CSS Render Guarantee

All crewmates, intro radar spinners, security cameras, floating particles, and interactive venue floorplans feature zero-dependency vector SVG and CSS fallbacks. The website will function out-of-the-box even before custom PNG images are added.
