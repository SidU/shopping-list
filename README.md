# Smart Shopping List

A fun, feature-rich shopping list PWA that organizes items by store sections. Built with Next.js 16, React 19, and Firebase.

## Features

### Core Functionality
- **Multiple Stores** - Create and manage shopping lists for different stores
- **Section-Based Organization** - Items automatically grouped by store sections (Produce, Dairy, Bakery, etc.)
- **Smart Learning** - App remembers which section you assign items to and suggests them next time
- **Real-Time Sync** - Lists sync across devices via Firebase
- **Shareable Lists** - Share stores with family members for collaborative shopping

### Fun & Delightful
- **Auto-Emojis** - Items automatically display relevant emojis (milk gets a glass of milk, bread gets a loaf, etc.)
- **Confetti Celebration** - Burst of confetti and victory message when you check off all items
- **Witty Empty States** - Fun messages when your list is empty ("Your cart is as empty as my promises to eat healthy")
- **Random Loading Messages** - Entertaining messages while loading ("Consulting the grocery gods...")
- **Sound Effects** - Satisfying audio feedback for check, uncheck, add, and delete actions
- **Haptic Feedback** - Tactile vibration on mobile devices

### Themes
- **Default Theme** - Clean, modern light/dark mode
- **Retro-Futuristic Theme** - Neon colors, CRT scanlines, glow effects, and cyberpunk vibes

### Mobile-First Design
- **PWA Support** - Install as an app on your phone
- **Touch Optimized** - Large touch targets and smooth interactions
- **Offline Ready** - Works without internet connection

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, Tailwind CSS 4, shadcn/ui components
- **Backend**: Firebase (Firestore, Authentication)
- **Audio**: Web Audio API (no audio files needed)
- **Fonts**: Geist (default), Orbitron & Share Tech Mono (retro theme)

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SidU/shopping-list.git
cd shopping-list
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Firebase configuration in `.env.local`.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login)
│   ├── (main)/            # Main app pages
│   └── api/               # API routes
├── components/
│   ├── fun/               # Confetti, celebrations
│   ├── items/             # Item input, cards, suggestions
│   ├── shared/            # Header, loading spinner
│   ├── shopping/          # Shopping list, sections
│   ├── stores/            # Store cards
│   └── ui/                # shadcn/ui components
└── lib/
    ├── contexts/          # Theme and Sound providers
    ├── hooks/             # Custom React hooks
    ├── services/          # Firebase services
    └── utils/             # Emojis, fun messages, helpers
```

## License

MIT
