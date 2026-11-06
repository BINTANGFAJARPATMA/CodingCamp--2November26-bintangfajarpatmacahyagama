# Project Steering: Personal Dashboard

## Project Overview
A client-side personal dashboard web app built for CodingCamp (November 2026).

## Tech Stack
- **HTML5** — structure only, semantic elements
- **CSS3** — single file: `css/style.css`; use CSS custom properties for theming
- **Vanilla JavaScript** — single file: `js/app.js`; no frameworks, no build tools
- **localStorage** — all persistence; no backend

## Folder Rules
- Only ONE file inside `css/` → `style.css`
- Only ONE file inside `js/` → `app.js`
- Keep code clean, readable, and well-commented

## Features
- Greeting with live clock and time-of-day phrase
- Focus Timer (configurable Pomodoro, default 25 min)
- To-Do List (add / edit / done / delete, localStorage)
- Quick Links (add / delete, localStorage)

## Challenges Implemented
1. Light / Dark mode toggle (persisted in localStorage)
2. Custom name in greeting (persisted in localStorage)
3. Change Pomodoro time (custom minutes input)
4. Prevent duplicate tasks (case-insensitive)
5. Sort tasks (default / A→Z / Z→A / done-last)

## Code Style
- `'use strict'` at top of JS file
- camelCase for variables and functions
- Descriptive variable names
- Group related logic with section comments (`/* ─── SECTION ─── */`)
- No inline styles except minor dynamic overrides
- ARIA labels on interactive elements for accessibility
