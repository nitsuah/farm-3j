# Farm 3J - Interactive Farm Website & Tycoon Game

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/austin-hardys-projects/v0-farm-contact-website)
[![Production Status](https://img.shields.io/badge/Status-Phase%202%20In%20Progress-blue?style=for-the-badge)](#development-status)

## Overview

Farm 3J is an interactive farm website featuring:

- **Animated Homepage**: Dynamic farm scene with weather effects, day/night cycle, animated crops, trees, mountains, and wildlife
- **Farm Tycoon Game** (`/farm`): Isometric farm simulation with animal lifecycle, resource management, and building placement [**Phase 2 in progress**]
- **Contact-to-Market Path**: Server-validated contact form with webhook delivery integration
- **Responsive Design**: Optimized for mobile and desktop with adaptive layouts
- **Dark Mode**: Theme toggle integrated into the animated sun

## Features

### Homepage Animations

- Rain cycles with storm clouds and lightning
- Growing crops with tractor harvesting
- Moving clouds and flying birds
- Dense forest with trees and bushes
- Mountain ranges with depth
- Interactive sun theme toggle

### Farm Tycoon Game (`/farm`)

- Grid-based isometric rendering
- Animal management (cows, chickens, pigs, sheep)
- Resource production and economy
- Building placement (fences, troughs)
- Day/night cycle
- Tutorial system and keyboard shortcuts

See `docs/FARM-TYCOON-PHASE1-SUMMARY.md` for complete game documentation.

## Development Status

**Current Phase:** Q2 2026 - Farm Tycoon Phase 2 Core Completion  
**Latest Status:** Phase 2a-2f isometric foundation complete; phase 2 gameplay mechanics (animal lifecycle, feeding, fence placement, save/load) in active development.

**Progress:**
- [x] Phase 1 MVP (basic isometric grid, animal sprites, building blocks)
- [x] Phase 2a-2f: Isometric rendering and grid foundation
- [ ] Phase 2: Core gameplay (animal needs, hunger/happiness lifecycle, feeding mechanics, fence tooling, save/load)

See [TASKS.md](TASKS.md) and [ROADMAP.md](ROADMAP.md) for detailed tracking.

## Getting Started

### Docker (Recommended)

```bash
# Build the Docker image
docker build -t farm-dev .

# Run the development server on http://localhost:3000
docker run -it --rm -p 3000:3000 farm-dev npm run dev

# Run the full build and tests
docker run --rm farm-dev npm run build
docker run --rm farm-dev npm test
```

### Local Development

Requires Node.js ≥ 20 and pnpm.

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test
```

The app will start on `http://localhost:3000`.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **State Management**: React Context + useReducer
- **Animation**: CSS + requestAnimationFrame
- **Testing**: Vitest
- **Container**: Docker with multi-stage builds

## Features

### Homepage

- Animated day/night cycle with dynamic sun toggle
- Weather system (rain, storms, lightning)
- Growing crops with tractor harvesting sequences
- Fauna: clouds, birds, wildlife
- Responsive on mobile and desktop

### Farm Tycoon Game (`/farm`)

**Phase 1 (Complete):**
- Isometric grid-based rendering
- Animal sprites (cows, chickens, pigs, sheep) with idle animations
- Basic building placement (fences, water troughs)
- Resource display and economy foundation

**Phase 2 (In Progress):**
- Animal needs system (hunger, thirst, happiness)
- Feeding mechanics and inventory interactions
- Fence placement and terrain editing workflows
- Save/load game state across sessions
- Full gameplay loop validation

See `docs/FARM-TYCOON-PHASE1-SUMMARY.md` for complete game documentation.

## Deployment

The project is live on Vercel: **[farm-contact-website](https://vercel.com/austin-hardys-projects/v0-farm-contact-website)**

To deploy changes:

```bash
# Push to main branch; Vercel auto-deploys
git push origin main
```

Review deployments at: https://vercel.com/austin-hardys-projects/v0-farm-contact-website/deployments

## Configuration

### Contact Form Webhook (Optional)

Set `FARM_CONTACT_WEBHOOK_URL` to forward contact submissions:

```bash
# In .env.local or deployment environment
FARM_CONTACT_WEBHOOK_URL=https://your-webhook-endpoint.com/contact
```

When the webhook is not configured, submissions are logged locally with a success response so the UI remains functional in development.

## Contributing

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Develop in Docker or locally
3. Run tests: `npm test` or `docker run --rm farm-dev npm test`
4. Commit with clear messages: `git commit -m "feat: description"`
5. Push and create a PR for review

## References

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vercel Deployment](https://vercel.com)
- Game design docs: [FARM-TYCOON-PHASE1-SUMMARY.md](docs/FARM-TYCOON-PHASE1-SUMMARY.md)
