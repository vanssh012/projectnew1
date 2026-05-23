# Partzyy

**India's platform for discovering and hosting curated college social events.**

A React Native (Expo) mobile app + Next.js website for three event categories:
- **Farewell** — college batch farewell parties (gold #C9A050)
- **Freshers** — welcome parties for new students (teal #5ABFCF)
- **House Party** — themed private house parties (purple #B07AE0)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Supabase account
- Razorpay account

### Installation

```bash
cd partzyy

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your Supabase and Razorpay credentials

# Start the app
npm start
```

### Build

```bash
# Android APK
npx eas build --platform android --profile preview

# iOS TestFlight
npx eas build --platform ios --profile preview

# Website
cd ../partzyy-web
vercel --prod
```

## 📁 Project Structure

```
partzyy/
├── app/
│   ├── (auth)/           # Auth flows
│   ├── (tabs)/           # Main navigation
│   ├── event/            # Event detail
│   └── host/             # Host dashboard
├── components/           # Reusable UI
├── hooks/                # Custom hooks
├── lib/                  # Utilities
├── constants/            # Colors, themes
└── types/                # TypeScript definitions
```

## 🎯 Key Features (MVP)

- [x] Phone OTP authentication
- [ ] Event discovery feed
- [ ] Event creation (3-step flow)
- [ ] Event detail screen
- [ ] Request to join events
- [ ] Host approvals
- [ ] My tickets
- [ ] Push notifications
- [ ] Razorpay payments

## 📱 Tech Stack

- **Mobile**: React Native + Expo + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Payments**: Razorpay
- **Storage**: Cloudinary
- **Notifications**: Expo Notifications + Firebase FCM
- **Website**: Next.js + Tailwind CSS

## 📝 License

Proprietary — Built by vanssh012

---

*Built one component at a time with Copilot* ✨
