# Vandalism Radar 🛡️

Real-time vandalism detection dashboard for Wikipedia — monitors the global edit firehose using the Wikimedia EventStreams API, automatically flagging massive text deletions and suspicious anonymous IP edits so anti-vandalism patrollers can catch and revert them instantly.

🔗 **Toolforge:** Deployment in progress

## Why This Exists

Wikipedia receives thousands of edits every minute. Most are constructive, but a significant number are vandalism — blanking entire articles, inserting gibberish, or removing critical content. Current anti-vandalism tools like [Huggle](https://en.wikipedia.org/wiki/Wikipedia:Huggle) and [ORES](https://www.mediawiki.org/wiki/ORES) are powerful but require desktop installation or complex setup.

**Vandalism Radar** provides a lightweight, zero-setup, browser-based alternative. Open the page, and you're immediately watching every suspicious edit happening across all Wikipedias worldwide in real-time. No login, no installation, no configuration.

Inspired by air traffic control radar screens, the dashboard uses a dark mission-control aesthetic to reduce eye strain during long patrolling sessions, with color-coded alerts and audio cues so patrollers never miss a potentially harmful edit.

## Features

### Detection
- **Real-time EventStreams Connection** — Persistent SSE connection to the Wikimedia firehose, processing every edit as it happens
- **Massive Deletion Detection** — Flags edits that remove more than 500 characters of content (a strong vandalism signal)
- **Anonymous IP Flagging** — Highlights edits from unregistered IP addresses, which are statistically more likely to be vandalism
- **Multi-Wikipedia Coverage** — Monitors all `*.wikipedia.org` projects simultaneously (English, Hindi, Spanish, etc.)

### Interface
- **Live Statistics Panel** — Real-time counters for total edits analyzed, anonymous edits, and suspicious edits detected
- **Suspicious Edit Feed** — Scrolling feed showing flagged edits with user, article, timestamp, and flags
- **One-Click Diff View** — Each flagged edit links directly to the Wikipedia diff page for instant review and revert
- **Raw Data Stream** — Terminal-style log showing all incoming edits in real-time for full transparency
- **Audio Alerts** — Distinct beep sounds for suspicious edits (higher pitch alert tone for large deletions)
- **Connection Indicator** — Live pulsing dot showing active EventStreams connection status

### Design
- **Mission Control Aesthetic** — Dark theme with neon accents, designed for extended monitoring sessions
- **Monospace Typography** — Share Tech Mono font for data readability
- **Grid Background** — Subtle scanline effect for radar-screen authenticity
- **Slide-in Animations** — New suspicious edits animate in with a red flash for immediate visual attention

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Shreya71703/Vandalism-Radar.git
cd Vandalism-Radar

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open `http://localhost:5173`. The dashboard will immediately connect to the Wikimedia EventStreams API and begin monitoring edits in real-time. No API keys or configuration needed.

### Build for Production

```bash
npm run build
npm run preview
```

The production-ready files will be in the `dist/` directory.

## Architecture

```
┌───────────────────────────────────────────────────────┐
│              Wikimedia EventStreams API                 │
│    stream.wikimedia.org/v2/stream/recentchange         │
│    (Server-Sent Events — all Wikimedia edits)          │
└──────────────────────┬────────────────────────────────┘
                       │ SSE Connection
                       │
┌──────────────────────▼────────────────────────────────┐
│                  Filter Pipeline                       │
│                                                        │
│  1. Type Check    → Only 'edit' events                 │
│  2. Namespace     → Only article namespace (ns: 0)     │
│  3. Project       → Only *.wikipedia.org               │
│  4. Anon Check    → Flag anonymous/IP-based edits      │
│  5. Deletion Size → Flag if >500 chars removed         │
└──────────┬───────────────────┬────────────────────────┘
           │                   │
    ┌──────▼──────┐    ┌──────▼──────┐
    │  All Edits  │    │ Suspicious  │
    │  Terminal   │    │ Edits Feed  │
    │  Log View   │    │ + Audio     │
    └─────────────┘    └──────┬──────┘
                              │
                    ┌─────────▼─────────┐
                    │   Diff Link →     │
                    │   Wikipedia       │
                    │   (one-click      │
                    │    revert)        │
                    └───────────────────┘
```

## How Detection Works

| Signal | Threshold | Why It Matters |
|--------|-----------|----------------|
| **Anonymous Edit** | `data.anon === true` | IP-based edits are ~5x more likely to be vandalism than registered user edits |
| **Large Deletion** | `> 500 characters removed` | Blanking or gutting articles is the most common form of vandalism |
| **Combined Flags** | Both anonymous + large deletion | Highest confidence vandalism signal — highlighted with distinct audio alert |

## APIs Used

| API | Purpose | Docs |
|-----|---------|------|
| Wikimedia EventStreams | Real-time edit stream via Server-Sent Events | [Docs](https://stream.wikimedia.org/?doc) |
| Web Audio API | Alert sounds for suspicious edits | [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) |

## Tech Stack

- **HTML5 / CSS3 / JavaScript (ES Modules)** — Zero-framework, lightweight frontend
- **Vite** — Development server and production build tool
- **Wikimedia EventStreams API** — Real-time edit stream via Server-Sent Events (SSE)
- **Web Audio API** — Procedurally generated alert sounds (no audio files needed)
- **Google Fonts** — Share Tech Mono for the monospace dashboard aesthetic

## Project Structure

```
Vandalism-Radar/
├── index.html          # Main dashboard page
├── main.js             # Core application logic
│                       #   - EventStreams SSE connection
│                       #   - Edit filtering & flagging
│                       #   - Audio alert system
│                       #   - DOM rendering
├── style.css           # Complete design system
│                       #   - CSS custom properties (theme)
│                       #   - Grid layouts
│                       #   - Animations (pulse, slideIn)
│                       #   - Scrollbar styling
├── package.json        # Project config (Vite dev server)
├── .gitignore          # Standard Node.js ignores
├── LICENSE             # MIT License
└── README.md           # This file
```

## Deployment

This tool is designed for deployment on [Wikimedia Toolforge](https://toolforge.org/) to make it freely available to the wider Wikimedia anti-vandalism community. Toolforge provides free hosting for tools that benefit Wikimedia projects.

## Future Improvements

- [ ] Integration with [ORES](https://www.mediawiki.org/wiki/ORES) scores for ML-based vandalism confidence
- [ ] User-configurable deletion thresholds
- [ ] Per-language Wikipedia filtering
- [ ] Revert button (requires Wikimedia OAuth authentication)
- [ ] Historical statistics and vandalism trend charts
- [ ] Browser push notifications for high-confidence vandalism

## Acknowledgements

- [Wikimedia EventStreams](https://stream.wikimedia.org/?doc) — Real-time edit stream powering the entire dashboard
- [Huggle](https://en.wikipedia.org/wiki/Wikipedia:Huggle) — Inspiration for anti-vandalism tooling

## License

MIT

## Author

**Shreyapedia** — [Wikimedia User Page](https://www.mediawiki.org/wiki/User:Shreyapedia) · [GitHub](https://github.com/Shreya71703)
