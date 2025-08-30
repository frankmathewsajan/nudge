# Nudge - Professional Goal Setting App with AI

A React Native app built with Expo that helps users set and achieve their goals with AI-powered insights. Designed with Google Material Design 3 principles and addictive UX patterns inspired by successful apps like Duolingo.

## ✨ Features

### User Experience
- **Professional Material Design 3 UI** with carefully crafted color theory
- **Addictive onboarding flow** with progressive disclosure and micro-interactions
- **Typography system** optimized for readability and engagement
- **Smooth animations** and transitions for enhanced user experience
- **Responsive design** that works beautifully on all screen sizes

### Functionality
- **Clean, intuitive interface** without distracting emojis
- **Smart goal input** with engaging prompts and validation
- **AI analysis and suggestions** (Gemini API integration ready)
- **Structured response display** with motivation, suggestions, and action steps
- **Progressive enhancement** that keeps users engaged

### Design System
- **Material Design 3 color palette** with psychological color theory
- **Consistent typography hierarchy** using system fonts
- **Elevation and shadows** following Google's guidelines
- **Accessible color contrast** ratios
- **Component-based architecture** for maintainability

## 🎨 Design Philosophy

### Color Theory
- **Primary Blue (#2196F3)**: Trust, reliability, and productivity
- **Secondary Teal (#009688)**: Balance, clarity, and growth
- **Tertiary Orange (#FF9800)**: Energy, motivation, and call-to-action
- **Success Green (#4CAF50)**: Achievement and progress
- **Error Red (#F44336)**: Clear error communication

### Typography
- **System fonts** for optimal readability across platforms
- **Material Design 3 type scale** with proper hierarchy
- **Optimized line heights** and letter spacing
- **Accessible font sizes** following WCAG guidelines

### UX Patterns
- **Progressive onboarding** that educates and engages
- **Micro-interactions** that provide feedback and delight
- **Clear visual hierarchy** that guides user attention
- **Consistent interaction patterns** that feel familiar

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI
- Android Studio/iOS Simulator or physical device

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Open the app on your device using the Expo Go app or run on simulator

## 🤖 Gemini API Integration

To enable AI-powered goal analysis, follow these steps:

### 1. Get your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key for later use

### 2. Update the API Configuration

1. Open `config/index.ts`
2. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key
3. Set `mockMode: false` to enable real API calls

### 3. Customize the AI Prompt

The app includes a sophisticated prompt template in the config that you can customize:

```typescript
promptTemplate: (goals: string) => 
  `You are a helpful life coach AI. Analyze the following goals and provide:
  1. Motivational message (2-3 sentences)
  2. 3-4 practical suggestions for achieving these goals
  3. 3-4 specific action steps to get started
  
  Goals: ${goals}`
```

## 📱 App Architecture

```
app/
├── index.tsx              # Main app screen with enhanced UX
├── _layout.tsx            # Root layout with Tamagui provider
components/
├── ui/
│   ├── StyledComponents.tsx   # Material Design 3 components
│   └── OnboardingFlow.tsx     # Addictive onboarding experience
config/
├── index.ts               # App configuration
theme/
├── materialTheme.ts       # Complete Material Design 3 theme
utils/
├── geminiAPI.ts           # API integration utilities
```

## 🛠 Technology Stack

- **React Native** with Expo for cross-platform development
- **TypeScript** for type safety and better development experience
- **Material Design 3** principles for professional UI
- **Custom component library** optimized for performance
- **Gemini AI API** for intelligent goal analysis
- **Modern React patterns** with hooks and functional components

## 🎯 Design Comparisons

### Inspired by Best Practices
- **Duolingo**: Addictive onboarding and progress visualization
- **Google Material You**: Dynamic color system and typography
- **Apple Human Interface**: Smooth animations and micro-interactions
- **Headspace**: Calming color palette and clear hierarchy

### Key Differentiators
- **No emoji clutter**: Clean, professional appearance
- **AI-first design**: Built around intelligent content generation
- **Goal-focused UX**: Every interaction supports goal achievement
- **Enterprise-ready**: Professional enough for workplace use

## 📊 Performance Considerations

- **Optimized bundle size** with code splitting
- **Efficient re-renders** with React.memo and proper dependencies
- **Smooth 60fps animations** using native drivers
- **Minimal API calls** with smart caching strategies

## 🔮 Future Enhancements

- **Dark mode** support with automatic theme switching
- **Analytics integration** for user behavior insights
- **Push notifications** for goal reminders
- **Social sharing** of achievements
- **Advanced AI features** like goal tracking and progress analysis

## 📄 License

This project is private and proprietary.