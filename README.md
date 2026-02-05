# Umwero Learning Platform

A revolutionary web application for learning the Umwero alphabet - an African script created by Kwizera Mugisha in 2019 to decolonize and preserve Kinyarwanda sounds.

## 🌍 About Umwero

The Umwero alphabet is a groundbreaking African script designed specifically for Kinyarwanda, representing a cultural renaissance and decolonization of African languages. Created by Kwizera Mugisha, Umwero provides a unique way to write and preserve the authentic sounds of Kinyarwanda.

## ✨ Features

### 🎓 Interactive Learning
- **Progressive Lessons**: Step-by-step learning modules from beginner to advanced
- **Interactive Drawing Practice**: AI-powered character recognition and feedback
- **Gamified Experience**: Learn through engaging games and quizzes
- **Progress Tracking**: Monitor your learning journey and achievements

### 🌐 Multi-Language Support
- **English**: Global accessibility
- **Kinyarwanda**: Native language support
- **Umwero**: Full script conversion with custom font rendering

### 🎨 Cultural Preservation
- **Cultural Stories**: Learn the meaning behind each character
- **Historical Context**: Understand the significance of the Umwero movement
- **Community Features**: Connect with fellow learners and cultural enthusiasts

### 🛠️ Advanced Tools
- **Translation Engine**: Convert between Latin and Umwero scripts
- **Virtual Keyboard**: Type in Umwero characters
- **PDF Worksheets**: Downloadable practice materials
- **Certificate Generation**: Earn certificates for completed courses

### 💰 Community Support
- **Donation System**: Support the Umwero movement
- **E-commerce Integration**: Purchase cultural items and materials
- **Funding Transparency**: Track how contributions help the project

## 🚀 Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Umwero Font Integration
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based auth system
- **AI Integration**: TensorFlow.js for drawing recognition
- **Deployment**: Vercel-ready configuration

## 🏗️ Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── contexts/          # React contexts (Auth, Language, Cart)
│   └── components/        # App-specific components
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── lessons/          # Learning components
│   ├── games/            # Interactive games
│   └── fund/             # Donation components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── prisma/               # Database schema and migrations
├── public/               # Static assets including Umwero fonts
└── styles/               # CSS and styling files
```

## 🎯 Key Components

### Translation System
- **useTranslation Hook**: Manages multi-language content
- **Umwero Converter**: Transforms Kinyarwanda text to Umwero script
- **Dynamic Font Loading**: Seamless font switching based on language

### Learning Engine
- **Lesson Progress Tracking**: Database-backed progress system
- **AI Drawing Validation**: Real-time feedback on character drawing
- **Adaptive Learning Path**: Personalized learning experience

### Cultural Integration
- **Character Stories**: Each Umwero character comes with cultural context
- **Historical Timeline**: Learn about the development of the script
- **Community Features**: Discussion forums and progress sharing

## 🌟 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd umwero-learning-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

4. **Set up the database**
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secure-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Schema
The application uses a comprehensive schema including:
- User management with role-based access
- Lesson progress tracking
- Drawing validation results
- Community features (discussions, comments)
- E-commerce functionality
- Achievement system

## 🎨 Design Philosophy

### Cultural Authenticity
- Respectful representation of Kinyarwanda culture
- Authentic color schemes inspired by Rwandan heritage
- Traditional patterns and motifs integration

### User Experience
- Intuitive navigation for all skill levels
- Responsive design for mobile and desktop
- Accessibility features for inclusive learning

### Educational Excellence
- Pedagogically sound learning progression
- Multiple learning modalities (visual, kinesthetic, auditory)
- Immediate feedback and encouragement

## 🤝 Contributing

We welcome contributions to the Umwero Learning Platform! Please read our contributing guidelines and code of conduct.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Kwizera Mugisha**: Creator of the Umwero alphabet
- **The Umwero Movement**: Cultural preservation initiative
- **Contributors**: All developers and cultural consultants
- **Community**: Learners and supporters worldwide

## 📞 Contact

- **Website**: [Your website URL]
- **Twitter**: [@Mugisha1837](https://twitter.com/Mugisha1837)
- **YouTube**: [Umwero Channel](https://www.youtube.com/@Umwero)
- **Facebook**: [Kwizera Mugisha](https://www.facebook.com/KwizeraMugisha)

---

**Join the cultural renaissance. Learn Umwero. Preserve Kinyarwanda.**
