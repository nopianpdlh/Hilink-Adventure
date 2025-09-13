# Hilink Adventure - Travel & Adventure Platform 🌍

A modern full-stack web application for travel and adventure booking built with Next.js 15, Supabase, and TypeScript.

## ✨ Features

### 🎯 Core Features
- **Trip Booking System** - Browse and book adventure trips
- **Equipment Rental** - Rent outdoor equipment for adventures  
- **User Dashboard** - Manage bookings and profile
- **Admin Panel** - Complete admin management system
- **Email Notifications** - Automated booking confirmations
- **Photo Gallery** - Showcase trip destinations

### 🛡️ Admin Features  
- **User Management** - View, edit, and manage user accounts
- **Trip Management** - Create and manage adventure trips
- **Equipment Management** - Manage rental equipment inventory
- **Booking Analytics** - View booking statistics and reports
- **Role Management** - Assign admin/tour guide roles

### 📱 User Experience
- **Responsive Design** - Works on all devices
- **Modern UI** - Built with Tailwind CSS and Radix UI
- **Dark Mode** - Support for dark/light themes
- **Fast Loading** - Optimized performance with Next.js 15

## 🚀 Tech Stack

- **Framework:** Next.js 15.5.2 (App Router)
- **Language:** TypeScript 5
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI
- **Email:** Resend + React Email
- **Icons:** Lucide React
- **Charts:** Recharts

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nopianpdlh/Hilink-Adventure.git
   cd hilink-adventure
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Set up Supabase database**
   - Create tables for profiles, trips, bookings, equipment
   - Set up Row Level Security policies
   - Configure authentication settings

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── ...
├── components/            # Reusable components
│   └── ui/               # UI component library
├── lib/                  # Utility functions
│   └── supabase/         # Supabase clients
├── middleware/           # Auth middleware
└── emails/               # Email templates
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Key Technologies
- **Next.js 15** with App Router for modern React development
- **Supabase** for backend-as-a-service with real-time features
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for rapid UI development
- **Radix UI** for accessible component primitives

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (recommended)
   - Connect your GitHub repository
   - Set environment variables
   - Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Novian Fadhilah**
- GitHub: [@nopianpdlh](https://github.com/nopianpdlh)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure  
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Radix UI](https://www.radix-ui.com/) for accessible components
