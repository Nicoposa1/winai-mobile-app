# 🍷 WinAI Mobile App - Architecture Documentation

## 📊 System Overview

WinAI is a React Native mobile application for wine enthusiasts, built with Expo, featuring AI-powered wine analysis, biometric authentication, and comprehensive wine collection management.

## 🏗️ Architecture Diagrams

### System Architecture
```mermaid
graph TB
    %% === ARCHITECTURE OVERVIEW ===
    subgraph "🔐 Authentication Layer"
        A1[👤 User Login]
        A2[📧 Email/Password]
        A3[🔑 Google OAuth]
        A4[🏢 Supabase Auth]
        A5[👥 User Profile]
    end
    
    subgraph "💾 Data Layer"
        D1[(🗄️ Supabase Database)]
        D2[📋 Profiles Table]
        D3[🍷 Wines Table]
        D4[⚙️ User Preferences]
        D5[🖼️ Storage Bucket]
    end
    
    subgraph "🔄 State Management"
        S1[🏪 Redux Store]
        S2[🍷 Wine State]
        S3[👤 Auth Context]
        S4[🔒 Secure Store]
        S5[💾 AsyncStorage]
    end
    
    subgraph "📱 Mobile App Screens"
        M1[🏠 Home Screen]
        M2[➕ Add Wine Screen]
        M3[🏛️ Cellar Screen]
        M4[❤️ Favorites Screen]
        M5[👤 Profile Screen]
        M6[⚙️ Settings Screen]
        M7[🔐 Security Screen]
    end
    
    subgraph "🤖 AI & External Services"
        E1[🧠 Google Gemini AI]
        E2[📸 Camera/Gallery]
        E3[🔐 Biometric Auth]
        E4[📤 Data Export]
        E5[🌐 Google OAuth API]
    end
    
    %% Connections
    A1 --> A2
    A1 --> A3
    A2 --> A4
    A3 --> A4
    A4 --> A5
    A5 --> S3
    
    D1 --> D2
    D1 --> D3
    D1 --> D4
    D1 --> D5
    
    S3 --> S1
    S1 --> S2
    S1 --> S4
    S1 --> S5
    
    S1 --> M1
    S1 --> M2
    S1 --> M3
    S1 --> M4
    S1 --> M5
    M5 --> M6
    M6 --> M7
    
    M2 --> E2
    E2 --> E1
    M7 --> E3
    M6 --> E4
    A3 --> E5
    
    %% Data Flow
    A4 -.-> D1
    S2 -.-> D3
    E4 -.-> D1
    E3 -.-> S4
    
    %% Styling
    classDef auth fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef data fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef state fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef mobile fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    
    class A1,A2,A3,A4,A5 auth
    class D1,D2,D3,D4,D5 data
    class S1,S2,S3,S4,S5 state
    class M1,M2,M3,M4,M5,M6,M7 mobile
    class E1,E2,E3,E4,E5 external
```

### Database Schema
```mermaid
erDiagram
    USER {
        uuid id PK "🔑 Primary Key"
        string email "📧 Unique Email"
        timestamp created_at "📅 Registration Date"
        string provider "🔐 auth|google"
        json metadata "📋 Additional Info"
    }
    
    PROFILE {
        uuid id PK "🔑 Links to User"
        string first_name "👤 First Name"
        string last_name "👤 Last Name"
        date birth_date "🎂 Birthday"
        text avatar_url "🖼️ Profile Picture"
        timestamp updated_at "⏰ Last Modified"
    }
    
    WINE {
        uuid id PK "🔑 Wine ID"
        uuid user_id FK "👤 Owner"
        string name "🍷 Wine Name"
        string winery "🏭 Producer"
        string region "🌍 Wine Region"
        string country "🏳️ Country"
        integer year "📅 Vintage Year"
        string type "🍷 Red|White|Rosé"
        decimal rating "⭐ 1-5 Stars"
        text notes "📝 Personal Notes"
        boolean is_favorite "❤️ Favorited"
        boolean has_tasted "👅 Tasted"
        text image_url "📸 Wine Photo"
        timestamp created_at "📅 Added Date"
    }
    
    USER_PREFERENCES {
        uuid id PK "🔑 Settings ID"
        uuid user_id FK "👤 User"
        json notifications "🔔 Notification Settings"
        json privacy "🔒 Privacy Settings"
        boolean biometric_enabled "👆 Face/Touch ID"
        timestamp updated_at "⏰ Last Changed"
    }
    
    USER ||--o| PROFILE : "has profile"
    USER ||--o{ WINE : "owns wines"
    USER ||--o| USER_PREFERENCES : "has settings"
```

## 🔧 Technology Stack

### Frontend
- **Framework:** React Native with Expo
- **Navigation:** Expo Router
- **State Management:** Redux Toolkit
- **Authentication:** Supabase Auth + Google OAuth
- **UI Components:** Custom components with Wine theme
- **Animations:** React Native Reanimated

### Backend & Services
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **AI Analysis:** Google Gemini API
- **Authentication:** Supabase Auth
- **Biometrics:** Expo Local Authentication

### Key Features
- 🍷 Wine collection management
- 📸 AI-powered wine analysis from photos
- 🔐 Biometric authentication (Face ID/Touch ID)
- 👤 User profile management
- 📤 Data export functionality
- 🌙 Dark/Light theme support
- 📱 Cross-platform (iOS/Android)

## 📱 Screen Structure

```
app/
├── (tabs)/                 # Main tab navigation
│   ├── index.tsx          # 🏠 Home screen
│   ├── add-wine.tsx       # ➕ Add wine screen
│   ├── cellar.tsx         # 🏛️ Wine cellar
│   ├── favorites.tsx      # ❤️ Favorites
│   └── profile.tsx        # 👤 Profile
├── auth/                  # Authentication screens
│   ├── login.tsx          # 🔐 Login
│   ├── register.tsx       # 📝 Registration
│   └── ...
├── edit-profile.tsx       # ✏️ Edit profile
├── security.tsx           # 🔒 Security settings
└── change-password.tsx    # 🔑 Password change
```

## 🔄 Data Flow

1. **Authentication:** User logs in → Supabase Auth → Profile loaded → Redux updated
2. **Wine Management:** Add wine → AI analysis → Form pre-fill → Save to Redux
3. **Biometric Auth:** Setup → Device check → Secure store → Login enhancement
4. **Data Export:** Collect data → Generate JSON → File system → Share

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Configure Supabase project
4. Run: `npx expo start`

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Documentation](https://reactnative.dev/) 