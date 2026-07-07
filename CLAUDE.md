# CLAUDE.md

## Project Overview

Birth announcement website for [name]. A single static page with advanced CSS animations, intended to be linked from the physical birth announcement card. The goal is to avoid using a third-party baby list platform — this is our own branded page.

## Tech Stack

- **Vite** — build tool and dev server (vanilla HTML/CSS/JS, no framework)
- **Vanilla CSS** — advanced animations and transitions, no CSS framework
- **Vanilla JS** — minimal interactivity, no library needed

## Design

The design is based on the physical birth announcement card. Details TBD — will be provided later.

## Commands

- `npm run dev` — start dev server
- `npm run build` — build for production (outputs to `dist/`)
- `npm run preview` — preview production build locally

## Deployment

Static site — deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.).

## Key Decisions

- No React/Vue/framework — a single page doesn't need one
- No photo gallery or milestone tracker — purely a birth announcement
- Focus on polish: typography, layout, and CSS animations matching the card design
