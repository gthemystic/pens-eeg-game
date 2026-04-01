# 📖 The Hipster Changelog

### Wednesday Apr 1, 2026
## ☕ The Great Redis Awakening & The Death of the Sync Glitch

**What we did:**
- 🗄️ Completely ripped out the Firebase dependency and integrated **Upstash Redis**.
- 🔒 Added atomic queue locking so when 40 serverless instances all try to close the question round at the exact same millisecond, they don't trample each other.
- 🎨 Added **Alohe CDN portraits**! You now get beautifully curated, unique avatars (from memo, vibrent, notion, teams, and toon packs) with emoji fallbacks.
- 🚦 Enforced **unique avatars per lobby**. No more doppelgängers. If your avatar is taken, the bouncer tells you to pick another face.
- 💅 Polished the `AnswerButton` UI. When you lock in your answer, the others immediately gray out and desaturate, while yours gets a crisp selection ring.
- 🎛️ **Admin Console Auto-Resume**: Migrated host credentials to `localStorage`. If you accidentally close the tab or refresh, it automatically logs you back in and resumes control of the `pens_latest_room`.
- 🚀 Handled the Vercel production deployment and injected the sensitive KV tokens using the CLI without committing them to the repo.
- 🏆 **Amazing Ending Experience**: Implemented a dramatic, staggered reveal sequence for the final podium (3rd -> 2nd -> Champion) with dual-cannon high-density gold confetti and celebratory background transitions.
- 🎢 **Ending Playground**: Added a `/playground` route so the host can test and preview the final podium animations without running a 20-minute quiz.
- 📖 **Git Init & GitHub Sync**: Initialized the repository and successfully pushed to `gthemystic/pens-eeg-game`.

**Reflections:**
Man, what a session. We started with an ambition to finally ditch Firebase for this live quiz flow because it was giving us weird ghosting across Vercel’s serverless functions. It felt pretty magical when the whole Next.js app suddenly stopped randomly reverting back to the "Connecting..." screen after question 2. The race condition was a classic "thundering herd" problem—everyone's phone realizing the timer hit zero and flooding the DB. By relying purely on the host/projector tick and caching the last good frame on the clients, the UX feels incredibly stable now. It's coming together beautifully.

**What remains TODO:**
- We need to add some sound effects to really sell the Kahoot vibe.
- A dedicated QR code on the projector screen for ultra-fast joining.
